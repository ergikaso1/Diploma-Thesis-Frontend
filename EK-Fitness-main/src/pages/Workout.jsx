import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CardActions,
} from "@mui/material";
import "../styles/Workout.css"; // Add your custom styles here

const Workout = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [imageURLs, setImageURLs] = useState({});
  const [isTrainner, setIsTrainner] = useState(false);

  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        fetchUserRole(currentUser.uid); // Fetch user role after setting user
      } else {
        const userCookie = Cookies.get("userID");
        if (!userCookie) {
          alert("Please Login");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      alert("An error occurred while checking authentication");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
        throw new Error('Failed to get ID token');
      }
    } else {
      throw new Error('User not authenticated');
    }
  };

  const fetchUserRole = async (uid) => {
    try {
      const token = await getIdToken();
      const response = await axios.get(`http://localhost:8080/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      const isTrainner = userData.roles.some(role => role.role.name === "trainner");
      setIsTrainner(isTrainner);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchImageWithAuth = async (imageName) => {
    try {
      const token = await getIdToken();
      const response = await axios.get(`http://localhost:8080/images/${imageName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const imageURL = URL.createObjectURL(response.data);
      return imageURL;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const fetchExercises = async () => {
    try {
      await checkAuth();
      if (user) {
        const token = await getIdToken();
        const response = await axios.get('http://localhost:8080/exercises/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExercises(response.data);

        const newImageURLs = {};
        for (let exercise of response.data) {
          if (exercise.image) {
            const imageURL = await fetchImageWithAuth(exercise.image);
            newImageURLs[exercise.id] = imageURL;
          }
        }
        setImageURLs(newImageURLs);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id) => {
    try {
      const token = await getIdToken();
      await axios.delete(`http://localhost:8080/exercises/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExercises(exercises.filter(exercise => exercise.id !== id));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Failed to delete exercise.");
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching exercises.</p>;

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#222",
        color: "#fff",
        height: { lg: "100vh", sm: "100%", xs: "100%" },
        textAlign: "center",
        paddingTop: "4rem",
        paddingBottom: "4rem",
        minHeight: { lg: "100vh", sm: "100%", xs: "100%" },
        gap: "2rem",
      }}
      maxWidth="false"
    >
      <Typography variant="h3" className="text-gradient">
        Workout
      </Typography>

      {exercises.length === 0 ? (
        <div>
          <Typography variant="h5">Currently there are no Exercises</Typography>
        </div>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexWrap: "wrap",
            gap: "1.5rem", 
          }}
        >
          {exercises.map((exercise) => (
            <Link to={`/${exercise.route}`} className="link-primary" key={exercise.id}>
              <Card sx={{ maxWidth: 345, textDecoration: "none", margin: "1rem" }}>
                <CardMedia
                  component="img"
                  alt={exercise.name}
                  sx={{ height: 140 }}
                  image={imageURLs[exercise.id] || ""}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {exercise.name}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ textDecoration: "none" }}>
                    {exercise.description}
                  </Typography>
                </CardContent>
                {isTrainner && (
                  <CardActions>
                    <Button onClick={() => deleteExercise(exercise.id)} color="error">
                      Delete
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Link>
          ))}
        </Box>
      )}

      {isTrainner && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/add-exercise")}
          sx={{ marginTop: "1rem" }}
        >
          Add Exercise
        </Button>
      )}
    </Container>
  );
};

export default Workout;

