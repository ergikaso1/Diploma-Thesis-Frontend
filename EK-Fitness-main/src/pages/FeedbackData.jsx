import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import "../styles/FeedbackData.css";

const FeedbackData = () => {
  const [averageRating, setAverageRating] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [user, setUser] = useState(null);

  // Function to get the Firebase ID token
  const getIdToken = async () => {
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error('Error getting ID token:', error);
        throw new Error('Failed to get ID token');
      }
    } else {
      throw new Error('User not authenticated');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        setUser(currentUser);
      } else {
        console.error('User not logged in');
      }
    };

    fetchUser();
  }, []);

  // Fetch the average rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const idToken = await getIdToken();

        const response = await axios.get('http://localhost:8080/feedback/average-rating', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        setAverageRating(response.data);
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    if (user) {
      fetchAverageRating();
    }
  }, [user, getIdToken]);

  // Fetch all feedback
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const idToken = await getIdToken();

        const response = await axios.get('http://localhost:8080/feedback/all', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

  return (
    <div className="feedback-container">  
      {averageRating !== null && (
        <div className="average-rating">
          <h2>Average Rating: {averageRating.toFixed(2)} / 5</h2>
        </div>
      )}

      {feedbacks.length > 0 && (
        <div className="feedback-table">
          <h2>All Feedbacks</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td>{feedback.name}</td>
                  <td>{feedback.email}</td>
                  <td>{feedback.comment}</td>
                  <td>{new Date(feedback.date).toLocaleDateString()}</td>
                  <td>{feedback.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackData;

