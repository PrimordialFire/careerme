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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Footer from '../Common/Footer';

const Register = () => {
  const { register: registerUser, USER_ROLES } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [userRole, setUserRole] = useState('');
  
  const { control, register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const steps = ['Select Role', 'Basic Information', 'Additional Details'];
  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      // Validate email format with proper regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email.trim())) {
        setError('Please enter a valid email address (e.g., user@example.com)');
        setLoading(false);
        return;
      }
      
      // Validate password
      if (!data.password || data.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      const userData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        ...(userRole === USER_ROLES.INSTITUTE && {
          institutionName: data.institutionName,
          institutionType: data.institutionType,
          website: data.website
        }),
        ...(userRole === USER_ROLES.STUDENT && {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          nationality: data.nationality,
          highSchool: data.highSchool,
          graduationYear: data.graduationYear
        }),
        ...(userRole === USER_ROLES.COMPANY && {
          companyName: data.companyName,
          industry: data.industry,
          companySize: data.companySize,
          website: data.website,
          description: data.description
        }),
        ...(userRole === USER_ROLES.ADMIN && {
          department: data.department,
          employeeId: data.employeeId
        })
      };
      
      await registerUser(data.email.trim(), data.password, userData, userRole);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format. Please enter a valid email address (e.g., user@example.com).');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderRoleSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Your Role
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>User Type</InputLabel>
        <Select
          value={userRole}
          label="User Type"
          onChange={(e) => setUserRole(e.target.value)}
        >
          <MenuItem value={USER_ROLES.STUDENT}>Student</MenuItem>
          <MenuItem value={USER_ROLES.INSTITUTE}>Educational Institution</MenuItem>
          <MenuItem value={USER_ROLES.COMPANY}>Company/Employer</MenuItem>
          <MenuItem value={USER_ROLES.ADMIN}>Administrator</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={handleNext}
        disabled={!userRole}
        fullWidth
        sx={{ mt: 2 }}
      >
        Continue
      </Button>
    </Box>
  );

  const renderBasicInformation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address (e.g., user@example.com)'
              }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            placeholder="example@email.com"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Password"
            type="password"
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
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value =>
                value === watchPassword || 'Passwords do not match'
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^[+]?[0-9\-()s]{8,15}$/,
                message: 'Please enter a valid phone number (8-15 digits)'
              }
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            {...register('address', { required: 'Address is required' })}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleNext}>
          Continue
        </Button>
      </Box>
    </Box>
  );

  const renderAdditionalDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Additional Details
      </Typography>
      
      {userRole === USER_ROLES.STUDENT && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select {...field} label="Gender">
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nationality"
              {...register('nationality', { required: 'Nationality is required' })}
              error={!!errors.nationality}
              helperText={errors.nationality?.message}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="High School"
              {...register('highSchool', { required: 'High school is required' })}
              error={!!errors.highSchool}
              helperText={errors.highSchool?.message}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Graduation Year"
              type="number"
              {...register('graduationYear', { 
                required: 'Graduation year is required',
                min: { value: 1990, message: 'Year must be 1990 or later' },
                max: { value: new Date().getFullYear() + 5, message: `Year cannot be more than ${new Date().getFullYear() + 5}` },
                validate: {
                  isInteger: value => Number.isInteger(Number(value)) || 'Please enter a valid year'
                }
              })}
              error={!!errors.graduationYear}
              helperText={errors.graduationYear?.message}
            />
          </Grid>
        </Grid>
      )}

      {userRole === USER_ROLES.INSTITUTE && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution Name"
              {...register('institutionName', { required: 'Institution name is required' })}
              error={!!errors.institutionName}
              helperText={errors.institutionName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="institutionType"
              control={control}
              rules={{ required: 'Institution type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.institutionType}>
                  <InputLabel>Institution Type</InputLabel>
                  <Select {...field} label="Institution Type">
                    <MenuItem value="university">University</MenuItem>
                    <MenuItem value="college">College</MenuItem>
                    <MenuItem value="technical">Technical Institute</MenuItem>
                    <MenuItem value="vocational">Vocational School</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website (Optional)"
              {...register('website')}
            />
          </Grid>
        </Grid>
      )}

      {userRole === USER_ROLES.COMPANY && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              {...register('companyName', { required: 'Company name is required' })}
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Industry"
              {...register('industry', { required: 'Industry is required' })}
              error={!!errors.industry}
              helperText={errors.industry?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="companySize"
              control={control}
              rules={{ required: 'Company size is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.companySize}>
                  <InputLabel>Company Size</InputLabel>
                  <Select {...field} label="Company Size">
                    <MenuItem value="1-10">1-10 employees</MenuItem>
                    <MenuItem value="11-50">11-50 employees</MenuItem>
                    <MenuItem value="51-200">51-200 employees</MenuItem>
                    <MenuItem value="201-1000">201-1000 employees</MenuItem>
                    <MenuItem value="1000+">1000+ employees</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website (Optional)"
              {...register('website')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Description"
              multiline
              rows={3}
              {...register('description', { required: 'Company description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
        </Grid>
      )}

      {userRole === USER_ROLES.ADMIN && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Department"
              {...register('department')}
              placeholder="e.g., System Administration"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Employee ID (Optional)"
              {...register('employeeId')}
            />
          </Grid>
          <Grid item xs={12}>
            <Alert severity="warning">
              Administrator accounts have full system access. Please use responsibly.
            </Alert>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleBack}>Back</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderRoleSelection();
      case 1:
        return renderBasicInformation();
      case 2:
        return renderAdditionalDetails();
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}
          </Box>
          
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in here
            </Link>
          </Box>
          
          <Box textAlign="center" sx={{ mt: 1 }}>
            <Link component={RouterLink} to="/" variant="body2">
              Back to Home
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
    <Footer />
    </>
  );
};

export default Register;