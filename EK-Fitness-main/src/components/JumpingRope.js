import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import angleBetweenThreePoints from "./angle"; // Make sure this utility is suitable for jump rope detection
import { Button } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import imgURL from "../assets/images/jumpingRope.gif"; // Replace with an appropriate jumping rope GIF
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import Cookies from "js-cookie";

let count = 0;

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

const JumpingRope = () => {
  const navigate = useNavigate();
  if (!Cookies.get("userID")) {
    alert("Please Login");
    navigate("/");
  }
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const countTextbox = useRef(null);
  let camera = null;

  let dir = 0; // 0 means starting position (both feet on the ground), 1 means jump position (both feet off the ground)

  useEffect(() => {
    const startTime = new Date();
    const startTimeSec = startTime.getSeconds();

    localStorage.setItem("jumpingRopeStartTime", startTimeSec);
    console.log(startTime);
  }, []);

  function onResult(results) {
    if (results.poseLandmarks) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      // Indices for left and right ankles
      const leftAnkle = { x: position[27].x * width, y: position[27].y * height };
      const rightAnkle = { x: position[28].x * width, y: position[28].y * height };

      // Indices for left and right knees
      const leftKnee = { x: position[25].x * width, y: position[25].y * height };
      const rightKnee = { x: position[26].x * width, y: position[26].y * height };

      const leftFoot = { x: position[31].x * width, y: position[31].y * height };
      const rightFoot = { x: position[32].x * width, y: position[32].y * height };

      const leftLegAngle = Math.round(angleBetweenThreePoints([leftKnee, leftAnkle, leftFoot]));
      const rightLegAngle = Math.round(angleBetweenThreePoints([rightKnee, rightAnkle, rightFoot]));

      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw lines for left and right legs
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

      // Condition to detect jumping (both ankles above a certain threshold, indicating feet are off the ground)
      const isJumping = leftAnkle.y < height * 0.7 && rightAnkle.y < height * 0.7;

      drawLine(leftKnee, leftAnkle, isJumping ? "green" : "red");
      drawLine(leftAnkle, leftFoot, isJumping ? "green" : "red");
      drawLine(rightKnee, rightAnkle, isJumping ? "green" : "red");
      drawLine(rightAnkle, rightFoot, isJumping ? "green" : "red");

      drawCircle(leftAnkle, "#AAFF00");
      drawCircle(rightAnkle, "#AAFF00");

      if (isJumping) {
        if (dir === 0) {
          count++;
          speak(count);
          dir = 1;
        }
      } else {
        dir = 0;
      }

      canvasCtx.font = "30px Arial";
      canvasCtx.fillText(leftLegAngle, leftKnee.x + 20, leftKnee.y + 20);
      canvasCtx.fillText(rightLegAngle, rightKnee.x + 20, rightKnee.y + 20);

      canvasCtx.restore();
    }
  }

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
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
    const docRef = doc(db, `user/${ID}/jumpingRope`, uuidv4());
    const startTimeStamp = localStorage.getItem("jumpingRopeStartTime");
    const endTimeVar = new Date();
    const endTimeStamp = endTimeVar.getSeconds();
    const timeSpent = endTimeStamp - startTimeStamp;

    setDoc(docRef, {
      reps: count,
      exerciseName: "Jumping Rope",
      startTimeStamp: startTimeStamp,
      endTimeStamp: endTimeStamp,
      timeSpent: Math.abs(timeSpent),
      uid: ID,
    });
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
            Jumping Rope
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
            <img src={imgURL} width="100%" alt="Jumping Rope"></img>
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
              <Button variant="contained" color="primary" onClick={handleClick}>
                Save
              </Button>
            </Box>
            <br></br>
            <Link to="/jumpingRopeHistory">View Jumping Rope History</Link>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default JumpingRope;
