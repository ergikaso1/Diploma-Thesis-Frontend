import React, { useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "../styles/AddFoods.css"; // Import your CSS file for styling

const AddFoods = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [proteinCount, setProteinCount] = useState('');
  const [fatCount, setFatCount] = useState('');
  const [fiberCount, setFiberCount] = useState('');
  const [caloriesPer100G, setCaloriesPer100G] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Add success state
  const navigate = useNavigate(); // For navigation

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const getIdToken = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        return await currentUser.getIdToken();
      } catch (error) {
        console.error("Error getting ID token:", error);
        throw new Error('Failed to get ID token');
      }
    } else {
      throw new Error('User not authenticated');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(''); // Clear success message before submission

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('proteinCount', proteinCount);
    formData.append('fatCount', fatCount);
    formData.append('fiberCount', fiberCount);
    formData.append('caloriesPer100G', caloriesPer100G);
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = await getIdToken();
      await axios.post('http://localhost:8080/foods/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      // Handle success
      setSuccess('Food data was added successfully!'); // Set success message
      setTimeout(() => {
        navigate('/foods'); // Redirect to /foods after 2 seconds
      }, 2000);
    } catch (err) {
      console.error("Error adding food:", err);
      setError('Failed to add food');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-foods-container">
      <h1>Add New Food</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required  maxLength={255}/>

        <label>Protein Count (g):</label>
        <input type="number" value={proteinCount} onChange={(e) => setProteinCount(e.target.value)} required />

        <label>Fat Count (g):</label>
        <input type="number" value={fatCount} onChange={(e) => setFatCount(e.target.value)} required />

        <label>Fiber Count (g):</label>
        <input type="number" value={fiberCount} onChange={(e) => setFiberCount(e.target.value)} required />

        <label>Calories (per 100g):</label>
        <input type="number" value={caloriesPer100G} onChange={(e) => setCaloriesPer100G(e.target.value)} required />

        <label>Image:</label>
        <input type="file" onChange={handleImageChange} />

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Food'}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>} {/* Display success message */}
      </form>
    </div>
  );
};

export default AddFoods;
