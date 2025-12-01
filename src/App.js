import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './components/Common/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import InstituteDashboard from './components/Institute/InstituteDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import CompanyDashboard from './components/Company/CompanyDashboard';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function AppRouter() {
  const { currentUser, userRole, USER_ROLES } = useAuth();

  // Debug logging
  console.log('AppRouter - currentUser:', currentUser);
  console.log('AppRouter - userRole:', userRole);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!currentUser ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {!userRole && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                  <CircularProgress />
                </Box>
              )}
              {userRole === USER_ROLES.ADMIN && <AdminDashboard />}
              {userRole === USER_ROLES.INSTITUTE && <InstituteDashboard />}
              {userRole === USER_ROLES.STUDENT && <StudentDashboard />}
              {userRole === USER_ROLES.COMPANY && <CompanyDashboard />}
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Institute Routes */}
        <Route 
          path="/institute/*" 
          element={
            <ProtectedRoute requiredRole={USER_ROLES.INSTITUTE}>
              <InstituteDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Company Routes */}
        <Route 
          path="/company/*" 
          element={
            <ProtectedRoute requiredRole={USER_ROLES.COMPANY}>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <div className="App">
            <AppRouter />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
