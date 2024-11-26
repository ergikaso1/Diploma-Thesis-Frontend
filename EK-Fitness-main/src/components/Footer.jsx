import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../assets/images/Logo-icon.png'; // Update the path to your logo image

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        width: '100%',
        backgroundColor: '#000', // Set background color to make it distinguishable
        color: '#fff',
        mt: 'auto', // Pushes footer to the bottom in flex container
        flexShrink: 0, // Prevents it from shrinking
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="logo" style={{ width: '100px', height: 'auto' }} />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: '100',
          fontSize: { lg: '1rem', sm: '1rem', xs: '0.8rem' },
          textAlign: 'center',
        }}
      >
        © 2024{' '}
        <a href="/" className="link-secondary" style={{ textDecoration: 'none', color: '#F15C26' }}>
          Ergi Fitness
        </a>{' '}
        All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

