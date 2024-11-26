import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "../styles/Diet.css";

const Diet = () => {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [imageURLs, setImageURLs] = useState({}); // State to store image URLs
  const navigate = useNavigate();

  const checkAuth = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  };

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

  const fetchImageWithAuth = async (imageName) => {
    try {
      const token = await getIdToken();
      const encodedImageName = encodeURIComponent(imageName); // encode spaces and special characters
      const response = await axios.get(`http://localhost:8080/images/${encodedImageName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const imageURL = URL.createObjectURL(response.data);
      return imageURL;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const fetchDiets = async () => {
    try {
      const token = await getIdToken();
      const response = await axios.get('http://localhost:8080/diet/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const dietData = response.data;
      setDiets(dietData);

      // Fetch images for all foods in each diet
      const newImageURLs = {};
      for (let diet of dietData) {
        for (let foodItem of diet.foods) {
          if (foodItem.food.image) {
            const imageURL = await fetchImageWithAuth(foodItem.food.image);
            newImageURLs[foodItem.food.id] = imageURL;
          }
        }
      }
      setImageURLs(newImageURLs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDiets();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching diets: {error.message}</p>;

  const handleCreateDiet = () => {
    navigate('/create-diet');
  };

  return (
    <div className="diet-container">
      <h1>Diets</h1>
      {diets.length === 0 ? (
        <>
          <p>There are no diets currently available.</p>
          <div className="button-container">
            <button onClick={handleCreateDiet} className="create-diet-btn">Create a Diet</button>
          </div>
        </>
      ) : (
        <>
          <ul>
            {diets.map(diet => (
              <li key={diet.id}>
                <h2>{diet.goal}</h2>
                <p>{diet.benefits}</p>
                <p>Calories: {diet.noCalories}</p>
                <h3>Foods in this diet:</h3>
                <ul>
                  {diet.foods.map(foodItem => (
                    <li key={foodItem.food.id}>
                      <h4>{foodItem.food.name}</h4>
                      <p>{foodItem.food.description}</p>
                      <p>Amount: {foodItem.food_amount}g</p>
                      <p>Calories (per 100g): {foodItem.food.caloriesPer100G}</p>
                      {imageURLs[foodItem.food.id] && (
                        <img
                          src={imageURLs[foodItem.food.id]}
                          alt={foodItem.food.name}
                          className="food-image"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="button-container">
            <button onClick={handleCreateDiet} className="create-diet-btn">Add a Diet</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Diet;
