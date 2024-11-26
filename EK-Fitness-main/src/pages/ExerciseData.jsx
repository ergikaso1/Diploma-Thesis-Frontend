import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const ExerciseData = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const getIdToken = async (currentUser) => {
    try {
      return await currentUser.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw new Error("Failed to get ID token");
    }
  };

  useEffect(() => {
    const fetchExercises = async (currentUser) => {
      try {
        const token = await getIdToken(currentUser);
        const response = await axios.get(`http://localhost:8080/userExercise/get/${currentUser.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const token = await currentUser.getIdToken();
          const response = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserId(response.data.id);
          fetchExercises(currentUser);
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

  return (
    <Container sx={{ paddingRight: "2rem", paddingTop: "2rem", paddingBottom: "2rem" }}>
      <Typography variant="h4" color="primary" gutterBottom>
        All Your Exercises Over Time
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={exercises}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: "Exercise", position: "insideBottomRight", offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="duration" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="reps" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Container>
  );
};

export default ExerciseData;
