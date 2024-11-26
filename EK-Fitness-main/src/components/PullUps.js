import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "./angle";
import { Button } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import imgURL from "../assets/images/pull-up.gif"; 
import Cookies from "js-cookie";
import { useState } from "react";
import { getAuth} from "firebase/auth";
import axios from "axios";

let count = 0;
let dir = 0;

const speech = window.speechSynthesis;
const speak = (count) => {
  const object = new SpeechSynthesisUtterance(count);
  object.lang = "en-US";
  if (count === 0) {
    speech.speak(new SpeechSynthesisUtterance("Please Start Again"));
  } else {
    speech.speak(object);
  }
};

const PullUps = () => {
  const [firebaseId, setFirebaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  let camera = null;

  const navigate = useNavigate();


  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const countTextbox = useRef(null);
  const cameraRef = useRef(null); // Use useRef to store camera instance

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          const token = await currentUser.getIdToken();
          setFirebaseId(currentUser.uid);

          // Fetch user data from backend using Firebase ID and token
          const response = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserId(response.data.id); // Set user ID from backend
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
        throw new Error("Failed to get ID token");
      }
    } else {
      throw new Error("User not authenticated");
    }
  };

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1624666670/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    if (webcamRef.current) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          countTextbox.current.value = count;
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);


    function onResult(results) {
      if (results.poseLandmarks) {
        const position = results.poseLandmarks;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        
        canvasElement.width = webcamRef.current.video.videoWidth;
        canvasElement.height = webcamRef.current.video.videoHeight;
  
        const width = canvasElement.width;
        const height = canvasElement.height;
  
        // Indices for shoulders, elbows, and hands
        const leftShoulder = { x: position[11].x * width, y: position[11].y * height };
        const rightShoulder = { x: position[12].x * width, y: position[12].y * height };
        const leftElbow = { x: position[13].x * width, y: position[13].y * height };
        const rightElbow = { x: position[14].x * width, y: position[14].y * height };
        const leftHand = { x: position[15].x * width, y: position[15].y * height };
        const rightHand = { x: position[16].x * width, y: position[16].y * height };
  
        const leftArmAngle = Math.round(angleBetweenThreePoints([leftShoulder, leftElbow, leftHand]));
        const rightArmAngle = Math.round(angleBetweenThreePoints([rightShoulder, rightElbow, rightHand]));
  
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
        // Draw lines and circles
        const drawLine = (point1, point2, color) => {
          canvasCtx.beginPath();
          canvasCtx.moveTo(point1.x, point1.y);
          canvasCtx.lineTo(point2.x, point2.y);
          canvasCtx.strokeStyle = color;
          canvasCtx.lineWidth = 8;
          canvasCtx.stroke();
        };
  
        const drawCircle = (point, color) => {
          canvasCtx.beginPath();
          canvasCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
          canvasCtx.fillStyle = color;
          canvasCtx.fill();
        };
  
        const isInRange = (angle, range) => angle >= range[0] && angle <= range[1];
  
        const armsInRange = isInRange(leftArmAngle, [160, 180]) && isInRange(rightArmAngle, [160, 180]);
  
        drawLine(leftShoulder, leftElbow, armsInRange ? "green" : "red");
        drawLine(leftElbow, leftHand, armsInRange ? "green" : "red");
        drawLine(rightShoulder, rightElbow, armsInRange ? "green" : "red");
        drawLine(rightElbow, rightHand, armsInRange ? "green" : "red");
  
        drawCircle(leftShoulder, "#AAFF00");
        drawCircle(leftElbow, "#AAFF00");
        drawCircle(leftHand, "#AAFF00");
        drawCircle(rightShoulder, "#AAFF00");
        drawCircle(rightElbow, "#AAFF00");
        drawCircle(rightHand, "#AAFF00");
  
        if (armsInRange) {
          if (dir === 0) {
            count++;
            speak(count);
            dir = 1;
          }
        } else {
          dir = 0;
        }
  
        canvasCtx.font = "30px Arial";
        canvasCtx.fillText(leftArmAngle, leftElbow.x + 20, leftElbow.y + 20);
        canvasCtx.fillText(rightArmAngle, rightElbow.x + 20, rightElbow.y + 20);
  
        canvasCtx.restore();
      }
    }

    const handleFinishClick = async () => {
      const startTimeStamp = localStorage.getItem("pullUpStartTime");
      const endTimeVar = new Date();
      const endTimeStamp = endTimeVar.getSeconds();
      const totalDuration = Math.abs(endTimeStamp - startTimeStamp);
  
      try {
        const token = await getIdToken();
        await axios.post('http://localhost:8080/userExercise/add', {
          user: {
            id: userId // Using the backend user ID
          },
          exercise: {
            id: 4 // Assuming exercise ID for push-ups is 1
          },
          total_reps: count,
          total_duration: totalDuration,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Exercise data saved successfully in user_exercise_relate');
      } catch (error) {
        console.error('Error saving exercise data:', error);
      }
    };
  
    const resetCount = () => {
      console.log("clicked");
      count = 0;
    };
    
  return (
    <>
      <Container
        maxWidth="100%"
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          marginTop: "2rem",
          flexDirection: { lg: "row", xs: "column" },
          gap: "2rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            position: "relative",
            borderRadius: "2rem",
            width: "100%",
          }}
        >
          <Webcam ref={webcamRef} className="full-width" />
          <canvas
            ref={canvasRef}
            className="full-width"
            style={{
              position: "absolute",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffff",
            borderRadius: "2rem",
            width: { lg: "40%", xs: "100%" },
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            style={{ textTransform: "capitalize" }}
          >
            PullUps
          </Typography>
          <Box
            sx={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={imgURL} width="100%" alt="Pull-Ups"></img>
          </Box>
          <br></br>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              ref={countTextbox}
              type="text"
              style={{ width: "5rem", textAlign: "center", fontSize: "2rem" }}
              disabled
            />
            <br></br>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
              }}
            >
              <Button variant="contained" color="primary" onClick={resetCount}>
                Reset
              </Button>
              <Button
  size="large"
  variant="contained"
  color="secondary"
  onClick={handleFinishClick}
>
  Finish
</Button>
              
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default PullUps;
