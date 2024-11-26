import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import Cookies from "js-cookie";
import '../styles/FeedbackForm.css';
import { Rating } from '@mui/material';

Modal.setAppElement('#root');

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submittedDate, setSubmittedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState(''); // New state for user ID
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
          setUserId(response.data.id);  // Save the user ID from the API response
          setUser(currentUser);
        } else {
          const userCookie = Cookies.get("userID");
          if (!userCookie) {
            alert("Please Login");
            navigate("/login");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        alert("An error occurred while checking authentication");
        navigate("/login");
        return;
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

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setSubmittedDate(currentDate);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const idToken = await getIdToken(); 
      const feedbackData = {
        name,
        email,
        comment: feedback,
        date: submittedDate,
        rating,
        user: { id: userId } // Use the userId obtained from the API
      };

      const response = await axios.post('http://localhost:8080/feedback/add', feedbackData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // Include token in headers
        }
      });

      console.log('Feedback submitted successfully:', response.data);
      openModal();
      setName('');
      setEmail('');
      setFeedback('');
      setSubmittedDate('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="square-container">
      <h1 className="header" style={{ color: 'black' }}>
        Submit Feedback
      </h1>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder="Your Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={255} // Limit the input to 255 characters
          />
          <p>{feedback.length}/255 characters</p>
          <input 
            type="date" 
            value={submittedDate} 
            onChange={(e) => setSubmittedDate(e.target.value)} 
          />
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            max={5}
            precision={0.5}  // Allows half stars if needed
          />
          <button className="button-submit" type="submit">
            Submit Feedback
          </button>
        </form>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Feedback Submission Success Modal"
        className="modal"
      >
        <h2>Feedback Submitted Successfully</h2>
        <p>Thank you for your feedback.</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default FeedbackForm;
