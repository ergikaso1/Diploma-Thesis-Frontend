import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import "../styles/AddExercise.css"; // Import your CSS

const AddExercise = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reps, setReps] = useState(0); // Set reps to 0 by default
  const [duration, setDuration] = useState(0);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
        } else {
          const userCookie = Cookies.get("userID");
          if (!userCookie) {
            alert("Please Login");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const getIdToken = async () => {
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
        throw new Error("Failed to get ID token");
      }
    } else {
      throw new Error("User not authenticated");
    }
  };

  const generateRoute = (exerciseName) => {
    return exerciseName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getIdToken();
      const formData = new FormData();

      const exerciseRoute = generateRoute(name);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("reps", reps); // Send reps as 0 by default
      formData.append("duration", duration);
      formData.append("route", exerciseRoute); // Add the generated route
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(
        "http://localhost:8080/exercises/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Exercise added successfully!");
        setName("");
        setDescription("");
        setDuration(0);
        setImage(null);
        setReps(0); // Reset reps to 0
      } else {
        setError("Failed to add exercise.");
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      setError("An error occurred while adding the exercise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="add-exercise-container">
      <Typography variant="h4" className="header-text">
        Add New Exercise
      </Typography>
      <Box component="form" onSubmit={handleSubmit} className="add-exercise-form">
        <label>Exercise Name</label>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          variant="outlined"
          className="input-field"
        />
        
        <label>Description</label>
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          rows={4}
          variant="outlined"
          className="input-field"
        />

        <label>Reps</label>
        <TextField
          value={reps}
          InputProps={{ readOnly: true }} // Make the reps field read-only
          variant="outlined"
          className="input-field"
        />

        <label>Duration (in seconds)</label>
        <TextField
          type="number"
          value={duration}
          InputProps={{ readOnly: true }}
          required
          variant="outlined"
          className="input-field"
        />

        <label>Upload Image</label>
        <Button variant="contained" component="label" className="upload-button">
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Button>
        {image && <Typography variant="body2">Selected: {image.name}</Typography>}

        <Button type="submit" variant="contained" className="submit-button">
          {loading ? <CircularProgress size={24} /> : "Add Exercise"}
        </Button>
        {error && <Typography color="error">{error}</Typography>}
        {successMessage && <Typography color="success">{successMessage}</Typography>}
      </Box>
    </Container>
  );
};

export default AddExercise;

