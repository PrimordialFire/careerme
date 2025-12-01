import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [lastEmail, setLastEmail] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setShowResendVerification(false);
    
    try {
      setLastEmail(data.email);
      const result = await login(data.email, data.password);
      console.log('Login result:', result); // Debug log
      if (result) {
        console.log('Navigating to dashboard...'); // Debug log
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        // Login failed, possibly due to email verification
        setShowResendVerification(true);
        setError('Login failed. Please check your email verification or account status.');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const { user } = await signInWithEmailAndPassword(auth, lastEmail, '');
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
      await auth.signOut();
    } catch (err) {
      // If password is wrong, try to send verification anyway
      toast.info('Please enter your password to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Access your Career Guidance Platform account
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {showResendVerification && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Haven't received the verification email? 
              <Button size="small" onClick={handleResendVerification} sx={{ ml: 1 }}>
                Resend Verification Email
              </Button>
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Sign up here
              </Link>
            </Box>
            
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Link component={RouterLink} to="/" variant="body2">
                Back to Home
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;