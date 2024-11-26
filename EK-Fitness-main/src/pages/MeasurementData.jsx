import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom"; // Assuming you use react-router for navigation
import Cookies from "js-cookie";

export const MeasurementData = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // For navigation in case of login redirection

  const getIdToken = async (currentUser) => {
    try {
      return await currentUser.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw new Error("Failed to get ID token");
    }
  };

  useEffect(() => {
    const fetchMeasurements = async (currentUser) => {
      try {
        const token = await getIdToken(currentUser);
        const response = await axios.get(`http://localhost:8080/bmi/all/${currentUser.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMeasurements(response.data);
      } catch (error) {
        console.error("Error fetching measurements:", error);
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
          fetchMeasurements(currentUser); // Fetch measurements once user is authenticated
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
        All Your Measurements Over Time
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={measurements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageBmi" label={{ value: "Age", position: "insideBottomRight", offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="weightGoal" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Container>
  );
};

export default MeasurementData;
