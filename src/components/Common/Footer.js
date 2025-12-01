import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 3, 
        mt: 'auto',
        position: 'relative',
        bottom: 0,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Career Guidance Platform - Lesotho
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Connecting Students, Institutions, and Employers
        </Typography>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="/" color="inherit" sx={{ mx: 1 }}>
            Home
          </Link>
          <Link href="/login" color="inherit" sx={{ mx: 1 }}>
            Login
          </Link>
          <Link href="/register" color="inherit" sx={{ mx: 1 }}>
            Register
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
