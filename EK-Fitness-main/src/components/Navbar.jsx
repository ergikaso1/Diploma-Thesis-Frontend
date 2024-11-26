import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/images/Logo-icon.png";
import { auth, logout } from '../firebase';
import axios from 'axios'; // Axios to fetch user data

const drawerWidth = 240;

const navLinks = [
  { name: "Measurements", path: "/bm" },
  { name: "Diet", path: "/diet" },
  { name: "Workout", path: "/workout" },
  { name: "Feedback", path: "/feedback" },
  {name: "Foods", path: "/foods"},
  { name: "Login", path: "/login" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Add this line

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await axios.get(`http://localhost:8080/users/${currentUser.uid}`, {
            headers: {
              Authorization: "Bearer " + token
            }
          });
          setUser({ userName: response.data.name }); // Ensure the correct key
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null); // Clear user state on logout
    navigate("/"); // Redirect to home page after logout
  };

  const drawer = (
    <Box sx={{ textAlign: "center", padding: 2 }}>
      <img src={Logo} alt="logo" width="50%" style={{ margin: "20px 0" }} />
      <Divider />
      <List>
        {navLinks.map((item, index) => (
          <ListItemButton key={index} onClick={handleDrawerToggle} component={Link} to={item.path}>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Box sx={{ position: "relative", top: 0, left: 0, zIndex: 1000 }}>
        <AppBar component="nav" position="relative" sx={{ boxShadow: "0 0 10px 0 #ffffff64" }}>
          <Toolbar sx={{ display: "flex", justifyContent: { lg: "center", md: "flex-start", sm: "flex-start", xs: "space-between" }, background: "primary" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <Link to="/">
                <Box sx={{ display: { lg: "flex", md: "flex", sm: "flex", xs: "flex" }, justifyContent: { md: "flex-start", sm: "flex-start", xs: "flex-start" }, alignItems: { md: "center", sm: "center", xs: "center" }, width: { lg: "50%", sm: "50%", xs: "80%" } }}>
                  <img src={Logo} alt="logo" width="50%" />
                </Box>
              </Link>
              <Box sx={{ display: { lg: "none", xs: "flex", md: "flex", sm: "flex" } }}>
                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: { lg: "flex", xs: "none", md: "none", sm: "none" }, justifyContent: "center", alignItems: "center", gap: 2, textTransform: "capitalize", color: "#ffffff" }}>
              {navLinks.map((item) => (
                item.name !== "Login" ? (
                  <Link to={item.path} key={item.name} className="link">
                    <Button variant="contained" color="secondary">{item.name}</Button>
                  </Link>
                ) : user ? (
                  <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Link to="/login" key={item.name} className="link">
                    <Button variant="contained" color="secondary">
                      Login
                    </Button>
                  </Link>
                )
              ))}
              {user && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ffffff",
                    fontSize: '1.2rem',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    display: 'inline',
                    marginRight: '16px'
                  }}
                >
                  Hello, {user.userName}
                </Typography>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="nav">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        </Box>
      </Box>
    </>
  );
};

export default Navbar;
