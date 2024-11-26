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
import imgURL from "../assets/images/Triceps-Dips.gif"; 
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import Cookies from "js-cookie";

let count = 0;
let dir = 0;
const speech = window.speechSynthesis;
const speak = (count) => {
  const object = new SpeechSynthesisUtterance(count);
  object.lang = "en-US";
  speech.speak(object);
};

const Dips = () => {
  const navigate = useNavigate();
  if (!Cookies.get("userID")) {
    alert("Please Login");
    navigate("/");
  }

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let camera = null;
  const countTextbox = useRef(null);

  // Get Time
  useEffect(() => {
    const startTime = new Date();
    const startTimeSec = startTime.getSeconds();
    localStorage.setItem("dipsStartTime", startTimeSec);
    console.log(startTime);
  }, []);

  function onResult(results) {
    if (results.poseLandmarks) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      const leftArm = [];
      const rightArm = [];
      const hipPositions = [];

      const armIndices = [11, 13, 15, 12, 14, 16]; // Indices for arms
      const hipIndices = [23, 24]; // Indices for hips

      // Arm and hip landmarks
      armIndices.forEach((index, i) => {
        let point = { x: position[index].x * width, y: position[index].y * height };
        if (i % 2 === 0) {
          leftArm.push(point);
        } else {
          rightArm.push(point);
        }
      });

      hipIndices.forEach((index) => {
        let point = { x: position[index].x * width, y: position[index].y * height };
        hipPositions.push(point);
      });

      const leftArmAngle = Math.round(angleBetweenThreePoints(leftArm));
      const rightArmAngle = Math.round(angleBetweenThreePoints(rightArm));
      const hipAngle = Math.round(angleBetweenThreePoints(hipPositions));

      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Check if arms and hips are in the correct position
      let inRangeLeftArm = leftArmAngle <= 90 && leftArmAngle >= 60;
      let inRangeRightArm = rightArmAngle <= 90 && rightArmAngle >= 60;
      let inRangeHip = hipAngle >= 160 && hipAngle <= 180;

      // Draw arms and hips on the canvas
      [leftArm, rightArm].forEach((arm, i) => {
        arm.slice(0, 2).forEach((point, j) => {
          canvasCtx.beginPath();
          canvasCtx.moveTo(arm[j].x, arm[j].y);
          canvasCtx.lineTo(arm[j + 1].x, arm[j + 1].y);
          canvasCtx.strokeStyle = i === 0 ? (inRangeLeftArm ? "green" : "red") : (inRangeRightArm ? "green" : "red");
          canvasCtx.stroke();
        });
      });

      // Draw hip
      canvasCtx.beginPath();
      canvasCtx.moveTo(hipPositions[0].x, hipPositions[0].y);
      canvasCtx.lineTo(hipPositions[1].x, hipPositions[1].y);
      canvasCtx.strokeStyle = inRangeHip ? "green" : "red";
      canvasCtx.stroke();

      // Draw circles on joints
      [...leftArm, ...rightArm, ...hipPositions].forEach((point) => {
        canvasCtx.beginPath();
        canvasCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();
      });

      if (inRangeLeftArm && inRangeRightArm && inRangeHip) {
        if (dir === 0) {
          count += 1;
          speak(count);
          dir = 1;
          console.log(count);
        }
      }

      if (!(inRangeLeftArm && inRangeRightArm && inRangeHip)) {
        dir = 0;
      }

      canvasCtx.font = "30px Arial";
      canvasCtx.fillText(leftArmAngle, leftArm[1].x + 20, leftArm[1].y + 20);
      canvasCtx.fillText(rightArmAngle, rightArm[1].x - 120, rightArm[1].y + 20);
      canvasCtx.fillText(hipAngle, hipPositions[1].x - 60, hipPositions[1].y + 20);

      canvasCtx.restore();
    }
  }

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

    if (webcamRef.current && webcamRef.current.video) {
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
  });

  function resetCount() {
    console.log("clicked");
    count = 0;
  }

  const handleClick = () => {
    const ID = Cookies.get("userID");
    const docRef = doc(db, `user/${ID}/dips`, uuidv4());
    const startTimeStamp = localStorage.getItem("dipsStartTime");
    const endTimeVar = new Date();
    const endTimeStamp = endTimeVar.getSeconds();
    const timeSpent = endTimeStamp - startTimeStamp;
    const repsCounter = setDoc(docRef, {
      reps: count,
      startTimeStamp: startTimeStamp,
      endTimeStamp: endTimeStamp,
      timeSpent: Math.abs(timeSpent),
      exerciseName: "Dips",
      uid: ID,
    });
    console.log(repsCounter);
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
            Dips
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
            <img src={imgURL} width="100%" alt="dips"></img>
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
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <Typography
                variant="h6"
                color="primary"
                style={{ textTransform: "capitalize" }}
              >
                Count
              </Typography>
              <input
                className="full-width"
                ref={countTextbox}
                value={count}
                style={{ textAlign: "center" }}
              />
            </Box>
            <Button
              className="button"
              onClick={resetCount}
              variant="contained"
              color="primary"
            >
              Reset Count
            </Button>
            <Link to="/finish">
              <Button
                className="button"
                onClick={handleClick}
                variant="contained"
                color="primary"
              >
                Finish
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Dips;
