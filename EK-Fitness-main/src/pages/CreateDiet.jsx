import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router for navigation
import { getAuth } from 'firebase/auth';

const CreateDiet = () => {
  const [goal, setGoal] = useState('');
  const [benefits, setBenefits] = useState('');
  const [noCalories, setNoCalories] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minAge, setMinAge] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getIdToken = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        return await currentUser.getIdToken();
      } catch (error) {
        console.error('Error getting ID token:', error);
        throw new Error('Failed to get ID token');
      }
    } else {
      throw new Error('User not authenticated');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getIdToken();
      await axios.post(
        'http://localhost:8080/diet/add',
        {
          goal,
          benefits,
          noCalories,
          minAge,
          maxAge,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/diets');
    } catch (err) {
      setError('Error creating diet. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Create a Diet</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Goal:</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Benefits:</label>
          <input
            type="text"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Calories:</label>
          <input
            type="number"
            value={noCalories}
            onChange={(e) => setNoCalories(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Min Age:</label>
          <input
            type="number"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Max Age:</label>
          <input
            type="number"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Diet</button>
      </form>
    </div>
  );
};

export default CreateDiet;
