import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { getAuth } from "firebase/auth";
import axios from "axios";
import "../../styles/Admin/Users.css";

const Users = ({ roles }) => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const response = await fetch("http://localhost:8080/users/all", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                setUsers(result);
            } else {
                console.error("Failed to fetch users:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddRole = async (userId, roleId) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            // Create the userRole object to match your backend model
            const userRole = {
                user: { id: userId },
                role: { id: roleId }
            };

            // Send the correct data to the backend
            await axios.post(
                `http://localhost:8080/users/addRole/${userId}`,
                userRole,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Role added successfully!");
            fetchUsers(); // Re-fetch the users after adding a role
        } catch (error) {
            console.error("Error adding role:", error);
        }
    };

    const handleRemoveRole = async (userId, roleId) => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            // Assuming roleId refers to the user's role relationship ID
            await axios.delete(`http://localhost:8080/users/removeRole/${roleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Role removed successfully!");
            fetchUsers(); // Re-fetch the users after removing a role
        } catch (error) {
            console.error("Error removing role:", error);
        }
    };

    const roleTemplate = (rowData) => {
        // Filter out the super_admin role from available roles for adding
        const availableRoles = roles.filter(role => 
            role.name !== 'super_admin' && 
            !rowData.roles.some(userRole => userRole.role.name === role.name) // Access nested role.name
        );
    
        return (
            <div>
                
                {rowData.roles.map((role) => (
                    <div 
                        key={role.role.id} // Access nested role.id
                        style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', backgroundColor: '#f8d7da', padding: '5px', borderRadius: '5px' }}
                    >
                        <span style={{ flexGrow: 1, color: '#721c24' }}>
                           
                        </span>
                        {role.role.name !== 'super_admin' && (
                            <Button
                                icon="pi pi-times"
                                label={`Remove ${role.role.name}`}
                                className="p-button-danger p-button-sm"
                                style={{ marginLeft: '10px' }}
                                onClick={() => handleRemoveRole(rowData.id, role.role.id)}
                            />
                        )}
                    </div>
                ))}
    
                {/* Display the roles the user does not have with green buttons to add */}
                <div style={{ marginTop: '10px' }}>
                    {availableRoles.map((role) => (
                        <Button
                            key={role.id}
                            label={`Grant ${role.name}`}
                            className="p-button-success p-button-sm"
                            style={{ marginTop: '5px', display: 'block' }}
                            onClick={() => handleAddRole(rowData.id, role.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };
    

    return (
        <div className="users">
            <h2 className="all-white-heading">All Users</h2>
            <DataTable value={users} paginator className="p-datatable-gridlines" rows={10}
                dataKey="id" responsiveLayout="scroll" style={{ backgroundColor: '#f5f5f5', color: '#333' }}>
                <Column field="id" header="ID" sortable></Column>
                <Column field="name" header="Name" sortable></Column>
                <Column field="surname" header="Surname" sortable></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column field="age" header="Age" sortable></Column>
                <Column field="birthday" header="Birthday"></Column>

                <Column header="Roles & Actions" body={roleTemplate}></Column>
            </DataTable>
        </div>
    );
};

export default Users;
