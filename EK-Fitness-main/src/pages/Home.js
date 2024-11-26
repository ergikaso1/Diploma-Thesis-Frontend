import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Typography, Box, Container, Button } from "@mui/material";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { AutoGraphOutlined, DonutLargeOutlined, EmojiEmotionsOutlined } from "@mui/icons-material";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Chart as ChartJS, registerables } from "chart.js";
import motivation from "../assets/images/motivation.svg";
import Avatar from '@mui/material/Avatar';
import maleAvatar from "../assets/images/male-avatar.jpeg";
import femaleAvatar from "../assets/images/female-avatar.png";

ChartJS.register(...registerables);

const Home = () => {
  const navigate = useNavigate();
  const [latestBmi, setLatestBmi] = useState(null);
  const [measurementsExist, setMeasurementsExist] = useState(false);
  const [percentageWeight, setPercentageWeight] = useState(0);
  const [chartData, setChartData] = useState(null); 
  const [firebaseId, setFirebaseId] = useState(null);
  const [name, setName] = useState(null);
  const [gender, setGender] = useState(null);
  const [topExercises, setTopExercises] = useState([]);
  
  const auth = getAuth();
  
  const getIdToken = async (currentUser) => {
    try {
      return await currentUser.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw new Error("Failed to get ID token");
    }
  };

  const prepareChartData = (data) => {
    return {
      labels: ['Weight', 'Goal Weight', 'BMI'], 
      datasets: [
        {
          label: 'Measurements',
          data: [data.weight, data.weightGoal, data.bmi],
          backgroundColor: ['#3e95cd', '#8e5ea2', '#3cba9f'],
          borderColor: '#3e95cd',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const fetchLatestBmi = async (currentUser) => {
    try {
      const token = await getIdToken(currentUser);
      
      const response1 = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const firebaseId = response1.data.firebaseId;
      setFirebaseId(firebaseId); 
      setName(response1.data.name);
      setGender(response1.data.gender);

      if (firebaseId) {
        const response = await axios.get(`http://localhost:8080/bmi/latestBmi/${firebaseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = response.data;
        setLatestBmi(data);
        setMeasurementsExist(true);
  
        const { weight, weightGoal } = data;
        if (weight && weightGoal) {
          const weightDiff = weight - weightGoal;
          const percentage = ((weightDiff / weight) * 100).toFixed(2);
          setPercentageWeight(percentage);
          setChartData(prepareChartData(data));
        } else {
          setMeasurementsExist(false);
        }
      } else {
        console.error("No firebaseId found.");
        setMeasurementsExist(false);
      }
    } catch (error) {
      console.error("Error fetching BMI data:", error);
      setMeasurementsExist(false);
    }
  };

  const fetchTopExercises = async (currentUser) => {
    try {

      const token = await getIdToken(currentUser);
      
      const response1 = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const firebaseId = response1.data.firebaseId;
      setFirebaseId(firebaseId); 
      setName(response1.data.name);
      setGender(response1.data.gender);
      
      const response = await axios.get(`http://localhost:8080/userExercise/get/${currentUser.uid}/top`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopExercises(response.data);
    } catch (error) {
      console.error("Error fetching top exercises:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchLatestBmi(user);
        fetchTopExercises(user);
      } else {
        console.error("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const WelcomeSection = () => {
    const avatarImage = (gender === 'Male') ? maleAvatar : femaleAvatar;
  
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          background: "#fff",
          borderRadius: "24px",
          padding: "1rem",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            color="primary"
            sx={{ fontWeight: "700", fontSize: { lg: "2rem", sm: "1.5rem", xs: "1rem" } }}
          >
            Welcome to Ergi FITNESS {name}!
          </Typography>
          <Typography
            variant="h4"
            color="primary"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              fontSize: { lg: "1.5rem", sm: "1rem", xs: "1rem" },
            }}
          >
            <Avatar
              src={avatarImage}
              sx={{
                width: { lg: "3rem", sm: "2rem", xs: "1.5rem" },
                height: { lg: "3rem", sm: "2rem", xs: "1.5rem" },
              }}
            />
          </Typography>
          <Typography variant="body1" color="primary">
            Staying active is key to a healthy lifestyle, and we're here to support you every step of the way.
          </Typography>
        </Box>
      </Box>
    );
  };

  const MeasurementSection = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem",
        width: "100%",
        borderRadius: "24px",
        background: "#fff",
        padding: "1rem",
      }}
      className="glassmorphism"
    >
      <Typography variant="h5" color="primary">Your Measurements</Typography>
      {latestBmi ? (
        <>
          <Typography variant="body1" color="primary">Weight: {latestBmi.weight} kg</Typography>
          <Typography variant="body1" color="primary">Goal Weight: {latestBmi.weightGoal} kg</Typography>
          <Typography variant="body1" color="primary">Height: {latestBmi.height} cm</Typography>
          <Typography variant="body1" color="primary">BMI: {latestBmi.bmi}</Typography>
          <Typography variant="body1" color="primary">Age: {latestBmi.ageBmi}</Typography>
          {chartData && (
            <Box sx={{ marginTop: "2rem", width: "100%" }}>
              <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } }}} />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" color="primary">No measurements found. Please take your measurements.</Typography>
      )}
      <Link to="/bm" className="link">
        <Button variant="contained" color="secondary">
          {measurementsExist ? "Update Measurements" : "Take Measurements for the first time"}
        </Button>
      </Link>
      <Link to="/bmiData" className="link">
        <Button variant="contained" color="primary">Show All Your Measurements Over Time</Button>
      </Link>
    </Box>
  );

  const renderMotivationImage = () => (
    <Box
      sx={{ width: { lg: "60%", sm: "100%", xs: "100%" }, height: { lg: "60vh", sm: "auto", xs: "auto" }, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}
    >
      <img src={motivation} alt="Motivation" style={{ width: "100%", height: "100%", borderRadius: "24px" }} />
    </Box>
  );

  const InfoCard = ({ title, icon, content, link, buttonText, percentage }) => (
    <Box
      sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", maxWidth: { lg: "300px", sm: "300px", xs: "100%" }, width: "100%", borderRadius: "24px", padding: "1rem" }}
      className="glassmorphism"
    >
      <Typography variant="h6" color="secondary" sx={{ fontWeight: "bold", display: "flex", marginTop: "1rem", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
        {title} {icon}
      </Typography>
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0.5rem" }}>
        <Typography variant="body1" sx={{ color: "#fff", textAlign: "center", paddingBottom: "1rem" }}>{content}</Typography>
        <Link to={link} className="link">
          <Button variant="contained" color="secondary">{buttonText}</Button>
        </Link>
      </Box>
    </Box>
  );

  const ExerciseSection = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem",
        width: "100%",
        borderRadius: "24px",
        background: "#fff",
        padding: "1rem",
      }}
      className="glassmorphism"
    >
     <Typography variant="h5" color="primary">Top Exercises</Typography>
{topExercises.length > 0 ? (
  <>
    {topExercises.map((exercise, index) => (
      <Typography key={index} variant="body1" color="primary">
        {exercise[0]} - Reps: {exercise[1]}, Duration: {exercise[2]}
      </Typography>
    ))}
  </>
) : (
  <Typography variant="body1" color="secondary">No exercises found</Typography>
)}

      <Link to="/exerciseHistory" className="link">
        <Button variant="contained" color="primary">Show All Your Exercises Over Time</Button>
      </Link>
    </Box>
  );

  return (
    <Container sx={{ display: "flex", flexDirection: { lg: "row", sm: "column", xs: "column" }, justifyContent: "space-between", alignItems: "center", gap: "1rem" }} maxWidth="false">
      <WelcomeSection/>
      <MeasurementSection />
      <ExerciseSection/>
      <Box sx={{ display: "flex", flexDirection: { lg: "row", sm: "row", xs: "column" }, justifyContent: "space-between", alignItems: "center", gap: "1rem", width: "100%", flexWrap: "wrap" }}>
        <InfoCard title="Activity" icon={<AutoGraphOutlined />} content={`You are ${percentageWeight}% away from your goal!`} link="/workout" buttonText="Get closer!" />
        <InfoCard title="Tips" icon={<EmojiEmotionsOutlined />} content="Always stretch before starting your workouts! 🧘‍♂️" link="/tips" buttonText="See More Tips" />
      </Box>
      {renderMotivationImage()}
    </Container>
  );
};

export default Home;
