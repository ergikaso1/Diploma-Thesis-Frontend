import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import Users from "./Users" // Import the Users component
import "../../styles/Admin/Home.css";

const SuperAdminDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [roles, setRoles] = useState([]); // Add roles state
    const navigate = useNavigate();


    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const token = await currentUser.getIdToken();
                    const response = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setUserData(response.data);

                    // Fetch roles
                    const rolesResponse = await axios.get("http://localhost:8080/roles/all", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRoles(rolesResponse.data); // Set the roles
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching super admin data:", error);
                setErrorMessage("Failed to load admin data.");
            }
        };

        fetchAdminData();
    }, [navigate]);

    if (!userData || roles.length === 0) return <div>Loading...</div>;

    return (
        <div className="super-admin-dashboard">
            <h1>Welcome, Super Admin</h1>
            <div className="admin-info">
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> Super Admin</p>
            </div>
            
            {/* Pass the roles as props to the Users component */}
            <Users roles={roles} />

            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    );
};

export default SuperAdminDashboard;

