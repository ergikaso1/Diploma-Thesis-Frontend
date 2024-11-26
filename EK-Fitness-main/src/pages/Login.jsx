import { useState, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; 
import "../styles/Login.css";
import axios from 'axios'; // Import axios for API requests

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Function to fetch user data from your backend
    const fetchUserData = async (uid) => {
        try {
            const currentUser = getAuth().currentUser;
    
            if (currentUser) {
                // Get the Firebase ID token
                const token = await currentUser.getIdToken();
                
                // Make the GET request to your backend with the Authorization header
                const response = await axios.get(`http://localhost:8080/users/${uid}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Add the token to the Authorization header
                    }
                });
                
                const userData = response.data;
    
                // Check if the user is a super_admin
                const isSuperAdmin = userData.roles.some(role => role.role.name === "super_admin");
    
                if (isSuperAdmin) {
                    navigate("/super-admin-dashboard"); // Redirect to the super admin dashboard
                } else {
                    navigate("/home"); // Redirect to the regular home page
                }
            } else {
                console.error("No authenticated user found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setErrorMessage("Failed to fetch user data");
        }
    };
    

    useEffect(() => {
        const auth = getAuth(); 
        let isMounted = true;
    
        const fetchAuthState = async () => {
            onAuthStateChanged(auth, async (user) => {
                if (user && isMounted) {
                    const userID = user.uid;
    
                    // Store user data in localStorage
                    localStorage.setItem('userID', userID);
    
                    // Fetch user data and check their role
                    await fetchUserData(userID);
                }
            });
        };
    
        fetchAuthState();
    
        return () => {
            // Cleanup function to avoid updating unmounted component
            isMounted = false;
        };
    }, [navigate]);
    

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Login failed: Invalid credentials or server error');
        }
    };

    return (
        <div className="form-box login">
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className="input-box">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaUser className="icon" />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FaLock className="icon" />
                </div>

                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" />
                        Remember me
                    </label>
                    <a href="#">Forgot password?</a>
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <button type="submit">Login</button>

                <div className="register-link">
                    <p>
                        Don't have an account?{' '}
                        <a className="goToRegister" href="/register" onClick={() => navigate('/register')}>
                            Register
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;
