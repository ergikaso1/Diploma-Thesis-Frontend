import React, { useState } from "react";
import "../styles/Register.css";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaBirthdayCake, FaBaby } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [birthday, setBirthday] = useState("");
    const [age, setAge] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState(""); // New state for gender

    const handleRegister = async (e) => {
        e.preventDefault(); 
    
        try {
            const userData = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = userData['_tokenResponse'].idToken;
    
            const user = {
                name,
                surname,
                birthday,
                age,
                email,
                phone,
                gender, // Include gender in user data
                password,
            };
    
            const response = await fetch("http://localhost:8080/users/addUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + idToken
                },
                body: JSON.stringify(user),
            });
    
            // Save user data locally
            localStorage.setItem("userData", JSON.stringify(user));
    
            // Navigate to login page after successful registration
            navigateToLoginPage();
        } catch (error) {
            console.error("Error during registration:", error);
        }
    };
    
    const navigateToLoginPage = () => {
        navigate('/login');
    };

    return (
        <div className="form-box register">
            <form onSubmit={handleRegister}>
                <h1>Registration</h1>
                <div className="input-box">
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input type="date" placeholder="Birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                    <FaBirthdayCake className="icon" />
                </div>
                <div className="input-box">
                    <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
                    <FaBaby className="icon" />
                </div>
                <div className="input-box">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <FaEnvelope className="icon" />
                </div>
                <div className="input-box">
                    <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <FaPhone className="icon" />
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <FaLock className="icon" />
                </div>
                <div className="input-box">
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <FaUser className="icon" /> {/* You might want to use a different icon here */}
                </div>
                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" required /> I agree to the terms & conditions
                    </label>
                </div>
                <button type="submit">Register</button>
                <div className="register-link">
                    <p>Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></p>
                </div>
            </form>
        </div>
    );
}

export default Register;
