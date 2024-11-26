import React, { useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { useRef } from "react";
import angleBetweenThreePoints from "./angle";
import { Button } from "@material-ui/core";

import { Link, useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import imgURL from "../assets/images/squat.gif";
import Cookies from "js-cookie";
import axios from "axios";
import { useState } from "react";
import { getAuth } from "firebase/auth";


let count = 0;
let dir = 0;
const speech = window.speechSynthesis;
const speak = (count) => {
  const object = new SpeechSynthesisUtterance(count);
  object.lang = "en-US";
  speech.speak(object);
};

const Squats = () => {

  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const countTextbox = useRef(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [firebaseId, setFirebaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  let camera = null;

  // Check for authentication and get user data
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
    const startTime = new Date();
    const startTimeSec = startTime.getSeconds();
    localStorage.setItem("pushUpStartTime", startTimeSec);
    console.log(startTime);
  }, []);

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
      // console.log (position);
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      const leftHand = [];
      const rightHand = [];

      const righthip = [];
      const lefthip = [];
      const hiparr = [11, 12, 23, 24, 25, 26];


      for (let i = 23; i < 29; i++) {
        let obj = {};
        obj["x"] = position[i].x * width;
        obj["y"] = position[i].y * height;
        if (i % 2 === 0) {
          rightHand.push(obj);
        } else {
          leftHand.push(obj);
        }
      }

      for (let i = 0; i < 6; i++) {
        let p = hiparr[i];
        let obj = {};
        obj["x"] = position[p].x * width;
        obj["y"] = position[p].y * height;
        if (p % 2 === 0) {
          righthip.push(obj);
        } else {
          lefthip.push(obj);
        }
      }

      const leftHandAngle = Math.round(angleBetweenThreePoints(leftHand));
      const rightHandAngle = Math.round(angleBetweenThreePoints(rightHand));

      const rightHipAngle = Math.round(angleBetweenThreePoints(righthip));
      const leftHipAngle = Math.round(angleBetweenThreePoints(lefthip));

      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

      let inRangeRightHand;
      if (rightHandAngle <= 20) {
        inRangeRightHand = true;
      } else {
        inRangeRightHand = false;
      }

      let inRangeLeftHand;
      if (leftHandAngle <= 20) {
        inRangeLeftHand = true;
      } else {
        inRangeLeftHand = false;
      }

      let inRangeRightHip;
      if (rightHipAngle >= 170 && rightHipAngle <= 180) {
        inRangeRightHip = true;
      } else {
        inRangeRightHip = false;
      }

      let inRangeLeftHip;
      if (leftHipAngle >= 170 && leftHipAngle <= 180) {
        inRangeLeftHip = true;
      } else {
        inRangeLeftHip = false;
      }

      for (let i = 0; i < 2; i++) {
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;

        //right hand
        canvasCtx.moveTo(rightHand[i].x, rightHand[i].y);
        canvasCtx.lineTo(rightHand[i + 1].x, rightHand[i + 1].y);
        if (inRangeRightHand) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();

        //lefthand
        canvasCtx.beginPath();
        canvasCtx.moveTo(leftHand[i].x, leftHand[i].y);
        canvasCtx.lineTo(leftHand[i + 1].x, leftHand[i + 1].y);
        if (inRangeLeftHand) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();

        //right hip
        canvasCtx.beginPath();
        canvasCtx.moveTo(righthip[i].x, righthip[i].y);
        canvasCtx.lineTo(righthip[i + 1].x, righthip[i + 1].y);
        if (inRangeRightHip) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();

        //left hip
        canvasCtx.beginPath();
        canvasCtx.moveTo(lefthip[i].x, lefthip[i].y);
        canvasCtx.lineTo(lefthip[i + 1].x, lefthip[i + 1].y);
        if (inRangeLeftHip) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        canvasCtx.beginPath();
        //right hand
        canvasCtx.arc(rightHand[i].x, rightHand[i].y, 8, 0, Math.PI * 2);
        //left hand
        canvasCtx.arc(leftHand[i].x, leftHand[i].y, 8, 0, Math.PI * 2);

        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();

        canvasCtx.beginPath();
        //right hip
        canvasCtx.arc(righthip[i].x, righthip[i].y, 8, 0, Math.PI * 2);
        //left hip
        canvasCtx.arc(lefthip[i].x, lefthip[i].y, 8, 0, Math.PI * 2);

        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();
      }

      if (
        inRangeLeftHand === true &&
        inRangeRightHand === true &&
        inRangeRightHip === true &&
        inRangeLeftHip === true
      ) {
        if (dir === 0) {
          count = count + 1;
          speak(count);
          dir = 1;
          console.log(count);
        }
      }

      if (
        !(
          inRangeLeftHand === true &&
          inRangeRightHand === true &&
          inRangeRightHip === true &&
          inRangeLeftHip === true
        )
      ) {
        dir = 0;
      }

      canvasCtx.font = "30px aerial";
      canvasCtx.fillText(leftHandAngle, leftHand[1].x + 20, leftHand[1].y + 20);
      canvasCtx.fillText(
        rightHandAngle,
        rightHand[1].x - 120,
        rightHand[1].y + 20
      );

      canvasCtx.fillText(leftHipAngle, lefthip[1].x + 20, lefthip[1].y + 20);
      canvasCtx.fillText(leftHipAngle, lefthip[1].x - 120, lefthip[1].y + 20);

      canvasCtx.restore();
    }
  }

  const handleFinishClick = async () => {
    const startTimeStamp = localStorage.getItem("squatStartTime");
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
          id: 5 // Assuming exercise ID for push-ups is 1
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
            backgroundColor: "#fff",
            borderRadius: "2rem",
            width: { lg: "40%", xs: "100%" },
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            style={{ textTransform: "capitalize" }}
          >
            Squats
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
            <img src={imgURL} width="100%" alt="Squats"></img>
          </Box>
          <br></br>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
              padding: "1rem",
            }}
          >
            <Box
              sx={{
                display: "flex",

                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                padding: "1rem",
              }}
            >
              <Typography variant="h6" color="secondary">
                Count
              </Typography>
              <input
                variant="filled"
                ref={countTextbox}
                value={count}
                textAlign="center"
                style={{
                  height: 50,
                  fontSize: 20,
                  width: 80,
                  padding: "1rem",
                  border: "2px solid orange",
                  borderRadius: "10px",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                borderRadius: "2rem",
              }}
            >
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={resetCount}
              >
                Reset Counter
              </Button>
              <Link
                to="/workout"
                style={{ textDecoration: "none", color: "white" }}
              >
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={handleFinishClick}
                >
                  Finish
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Squats;
