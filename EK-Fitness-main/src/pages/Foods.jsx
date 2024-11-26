import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import "../styles/Foods.css"; // Import your CSS file for styling

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]); // To store user roles
  const [imageURLs, setImageURLs] = useState({});
  const [foodAmounts, setFoodAmounts] = useState({}); // State for food amounts (keyed by food ID)
  const [selectedDietId, setSelectedDietId] = useState(null); // State for selected diet
  const [diets, setDiets] = useState([]); // State to hold diet list
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        await fetchUserRoles(currentUser.uid); // Fetch user roles once authenticated
      } else {
        const userCookie = Cookies.get("userID");
        if (!userCookie) {
          alert("Please Login");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      alert("An error occurred while checking authentication");
      navigate("/login");
    } finally {
      setLoading(false);
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

  const fetchUserRoles = async (uid) => {
    try {
      const token = await getIdToken();
      const response = await axios.get(`http://localhost:8080/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const userData = response.data;
      setRoles(userData.roles); // Store the user's roles
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const hasRole = (roleName) => roles.some(role => role.role.name === roleName);

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

  const fetchFoods = async () => {
    try {
      await checkAuth();
      if (user) {
        const token = await getIdToken();
        const response = await axios.get('http://localhost:8080/foods/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFoods(response.data);

        // Fetch images with authorization header
        const newImageURLs = {};
        for (let food of response.data) {
          if (food.image) {
            const imageURL = await fetchImageWithAuth(food.image);
            newImageURLs[food.id] = imageURL;
          }
        }
        setImageURLs(newImageURLs);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
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
      setDiets(response.data); // Set the list of diets
    } catch (err) {
      console.error('Error fetching diets:', err);
    }
  };

  const addFoodToDiet = async (foodId) => {
    try {
      const token = await getIdToken();
      if (!selectedDietId) {
        alert("Please select a diet to add food.");
        return;
      }

      // Check if a valid amount is entered for the selected food
      const amount = foodAmounts[foodId];
      if (!amount) {
        alert("Please enter a valid amount for the food.");
        return;
      }
  
      await axios.post(`http://localhost:8080/diet/addFood`, {
        food: { id: foodId },     // Include the selected food's id
        diet: { id: selectedDietId }, // Include the selected diet's id
        food_amount: amount   // Include the food amount for the selected food
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      alert('Food added to diet!');
    } catch (error) {
      console.error('Error adding food to diet:', error);
      alert('Failed to add food to diet.');
    }
  };

  const handleAmountChange = (foodId, amount) => {
    setFoodAmounts(prevAmounts => ({
      ...prevAmounts,
      [foodId]: amount // Update the amount for the specific food
    }));
  };

  const deleteFood = async (foodId) => {
    try {
      const token = await getIdToken();
      await axios.delete(`http://localhost:8080/foods/${foodId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Food deleted successfully');
      fetchFoods(); // Refetch the food list after deletion
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete food');
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchDiets(); // Fetch diets when the component mounts
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching foods.</p>;

  return (
    <div className="foods-container">
      <h1>Foods List</h1>

      {/* Conditionally show the Add Foods button if the user has the 'trainner' role */}
      {hasRole('trainner') && <button onClick={() => navigate("/addFoods")}>Add Foods</button>}

      {/* Dropdown to select diet */}
      <div className="diet-selector">
        <label htmlFor="diet">Select Diet:</label>
        <select 
          id="diet" 
          value={selectedDietId || ''} 
          onChange={(e) => setSelectedDietId(e.target.value)}
        >
          <option value="">--Select Diet--</option>
          {diets.map(diet => (
            <option key={diet.id} value={diet.id}>
              {diet.goal} (Calories: {diet.noCalories})
            </option>
          ))}
        </select>
      </div>

      {foods.length === 0 ? (
        <div className="no-foods">
          <p>No foods available. Please add some!</p>
        </div>
      ) : (
        <ul className="foods-list">
          {foods.map((food, index) => (
            <li key={food.id || index} className="food-item">
              <h2>{food.name}</h2>
              <p>{food.description}</p>
              <p>Protein: {food.proteinCount}g</p>
              <p>Fat: {food.fatCount}g</p>
              <p>Fiber: {food.fiberCount}g</p>
              <p>Calories (per 100g): {food.caloriesPer100G}</p>
              {food.image && imageURLs[food.id] && (
                <img src={imageURLs[food.id]} alt={food.name} className="food-image" />
              )}

              {/* Input for food amount */}
              <label htmlFor={`foodAmount-${food.id}`}>Food Amount (grams):</label>
              <input 
                type="number" 
                id={`foodAmount-${food.id}`} 
                value={foodAmounts[food.id] || ''} // Use the amount specific to this food
                onChange={(e) => handleAmountChange(food.id, e.target.value)}
              />

              {/* Conditionally show the Add to Diet and Delete buttons if the user has the 'trainner' role */}
              {hasRole('trainner') && (
                <>
                  <button onClick={() => addFoodToDiet(food.id)}>Add to Diet</button>
                  {food.id && <button onClick={() => deleteFood(food.id)}>Delete</button>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Foods;

