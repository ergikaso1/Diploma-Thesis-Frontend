import React, { useState, useEffect } from "react";
import initialImgURL from "../assets/images/initialIMG.svg";
import { getAuth } from 'firebase/auth';
import axios from "axios";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import Toastify from "../components/Toastify";
import { useNavigate } from "react-router-dom";

const BodyMeasurements = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [bmiGoal, setBmiGoal] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const token = await currentUser.getIdToken();
          const response = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserId(response.data.id);
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
        alert("An error occurred while checking authentication");
        navigate("/login");
      } finally {
        setLoading(false);
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
        throw new Error('Failed to get ID token');
      }
    } else {
      throw new Error('User not authenticated');
    }
  };

  const handleChange = (event) => {
    setBodyType(event.target.value);
  };

  const bmiVar = weight && height ? weight / ((height / 100) ** 2) : 0;

  const initialMeasurement = async () => {
    try {
      const token = await getIdToken();
      const data = {
        weight,
        height,
        bmi: bmiVar,
        ageBmi: Number(age),  // Convert age to a number
        weightGoal,
        bodyType:
          bmiVar > 30
            ? "obese"
            : bmiVar >= 20 && bmiVar <= 25
            ? "Healthy"
            : bmiVar >= 18.5 && bmiVar <= 20
            ? "Fit"
            : bmiVar < 18.5
            ? "Underweight"
            : "Overweight",
        user : {
          id : userId
        }
      };

      await axios.post('http://localhost:8080/bmi/add', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStatus("success");
      setMessage("Your details were noted");
    } catch (error) {
      console.error("Error saving BMI data:", error);
      setStatus("error");
      setMessage("Error saving BMI data");
    }
  };

  const handleClick = () => {
    if (
      weight === "" ||
      height === "" ||
      weightGoal === "" ||
      age === "" ||
      bmiGoal === ""
    ) {
      setStatus("error");
      setMessage("Please fill all the fields");
    } else {
      initialMeasurement();
      setStatus("success");
      setMessage("Your details were noted");
      navigate("/home");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {status !== "" ? <Toastify status={status} message={message} /> : null}
      <Container
        sx={{
          display: "flex",
          justifyContent: { lg: "space-around", xs: "center" },
          height: { lg: "100vh" },
          alignItems: "center",
          flexDirection: { lg: "row", sm: "row", xs: "column" },
          padding: "2rem",
          position: "relative",
        }}
        maxWidth="false"
        className="gradient__bg_white"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: { lg: "40%", sm: "50%", xs: "100%" },
          }}
        >
          <img src={initialImgURL} alt="Let's Go" width="50%" />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              color="secondary"
              sx={{ fontSize: { lg: "2.5rem", sm: "2rem", xs: "1.5rem" } }}
            >
              Let's Begin with Basics
            </Typography>
            <Typography variant="h6" color="#fff">
              Enter your body measurements
            </Typography>
          </Box>
          {/* Height */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <TextField
              label="Height(CM)"
              variant="outlined"
              type="number"
              color="secondary"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
              onChange={(e) => {
                console.log('Height input changed:', e.target.value); // Log the input value
                setHeight(e.target.value);
              }}
            />
            <TextField
              label="Age"
              variant="outlined"
              type="number"
              color="secondary"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
              onChange={(e) => {
                console.log('Age input changed:', e.target.value); // Log the input value
                setAge(e.target.value);
              }}
            />
          </Box>
          {/* Weight */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <TextField
              label="Weight(KG)"
              type="number"
              variant="outlined"
              color="secondary"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
              onChange={(e) => {
                console.log('Weight input changed:', e.target.value); // Log the input value
                setWeight(e.target.value);
              }}
            />
            <TextField
              label="Weight Goal(KG)"
              variant="outlined"
              type="number"
              color="secondary"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
              onChange={(e) => {
                console.log('Weight Goal input changed:', e.target.value); // Log the input value
                setWeightGoal(e.target.value);
              }}
            />
          </Box>
          {/* BMI */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <TextField
              label="BMI"
              value={bmiVar ? bmiVar.toFixed(2) : "Enter Weight and Height"}
              variant="standard"
              color="success"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
            />
            <TextField
              label="BMI GOAL"
              variant="outlined"
              color="secondary"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
              onChange={(e) => {
                console.log('BMI Goal input changed:', e.target.value); // Log the input value
                setBmiGoal(e.target.value);
              }}
            />
          </Box>
          {/* Body Type */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <TextField
              label="Body Type"
              value={
                bmiVar > 30
                  ? "obese"
                  : bmiVar >= 20 && bmiVar <= 25
                  ? "Healthy"
                  : bmiVar >= 18.5 && bmiVar <= 20
                  ? "Fit"
                  : bmiVar < 18.5
                  ? "Underweight"
                  : "Overweight"
              }
              variant="standard"
              color="success"
              className="placeholder"
              sx={{ input: { color: "#fff" }, label: { color: "#000000" } }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                flexDirection: { lg: "row", sm: "row", xs: "column" },
              }}
            >
            </Box>
          </Box>

          <Button variant="contained" color="secondary" onClick={handleClick}>
            Submit
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default BodyMeasurements;
