import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Counter from "./components/counter";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Foods from "./pages/Foods";
import Weightloss from "./pages/Weightloss.react";
import Weightgain from "./pages/Weightgain.react";
import Healthy from "./pages/Healthy.react";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import BicepCurls from "./components/BicepCurls";
import PushUps from "./components/PushUps";
import Squats from "./components/Squats";
import BodyMeasurements from "./pages/BodyMeasurements.react";
import PullUps from "./components/PullUps";
import Navbar from "./components/Navbar";
import Dips from "./components/Dips";
import FeedbackForm from "./pages/FeedbackForm";
import JumpingRope from "./components/JumpingRope";
import Footer from "./components/Footer";
import AddFoods from "./pages/AddFoods";
import MeasurementData from "./pages/MeasurementData";
import CreateDiet from "./pages/CreateDiet";
import AddExercise from "./pages/AddExercise";
import FeedbackData from "./pages/FeedbackData";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import ExerciseData from "./pages/ExerciseData";
function App() {
  const location = useLocation(); // Use useLocation to get the current path

  useEffect(() => {
    if (location.pathname === "/yoga" || location.pathname === "/bicepcurl") {
      const videoOutput = document.getElementsByClassName("input_video");
      const canvas = document.getElementsByClassName("output_canvas");
      if (videoOutput.length > 0 && canvas.length > 0) {
        videoOutput[0].style.display = "flex";
        canvas[0].style.display = "flex";
      }
    }
  }, [location.pathname]); // Add location.pathname as a dependency

  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 100px)' }}> {/* Adjust the minHeight value as necessary */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bm" element={<BodyMeasurements />} />
          <Route path="/home" element={<Home />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/feedbackData" element={<FeedbackData/>}/>
          <Route path="/foods" element={<Foods />} />
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard/>}/>
          <Route path="/weightloss" element={<Weightloss />} />
          <Route path="/weightgain" element={<Weightgain />} />
          <Route path="/healthy" element={<Healthy />} />
          <Route path="/create-diet" element={<CreateDiet />} />
          <Route path="/bicepcurls" element={<BicepCurls />} />
          <Route path="/squats" element={<Squats />} />
          <Route path="/pushups" element={<PushUps />} />
          <Route path="/pullups" element={<PullUps />} />
          <Route path="/bmiData" element={<MeasurementData />} />
          <Route path="/add-exercise" element={<AddExercise />} />
          <Route path="exerciseHistory" element={<ExerciseData/>}/>
          <Route path="/addFoods" element={<AddFoods />} />
          <Route path="/crunches" element={<Counter exercise={"crunches"} />} />
          <Route path="/dips" element={<Dips />} />
          <Route path="/rope" element={<JumpingRope />} />
          <Route path="/workout" element={<Workout />} />

        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
