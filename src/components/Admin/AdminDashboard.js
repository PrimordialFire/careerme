import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  Button,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  AdminPanelSettings,
  Business,
  School,
  People,
  Notifications,
  ExitToApp,
  Add,
  Settings,
  Report,
  Check,
  Close
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const AdminDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
      }
    };
    fetchUserData();
  }, [currentUser, getUserData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active'
      });
      
      setSnackbarMessage('User approved successfully!');
      setSnackbarOpen(true);
      loadUsers(); // Reload users
    } catch (error) {
      setSnackbarMessage('Error approving user. Please try again.');
      setSnackbarOpen(true);
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected'
      });
      
      setSnackbarMessage('User rejected successfully!');
      setSnackbarOpen(true);
      loadUsers(); // Reload users
    } catch (error) {
      setSnackbarMessage('Error rejecting user. Please try again.');
      setSnackbarOpen(true);
      console.error('Error rejecting user:', error);
    }
  };

  const generateReport = async () => {
    try {
      const reportData = {
        totalUsers: users.length,
        institutions: users.filter(u => u.role === 'institute').length,
        companies: users.filter(u => u.role === 'company').length,
        students: users.filter(u => u.role === 'student').length,
        pendingApprovals: users.filter(u => u.status === 'pending').length,
        generatedAt: new Date(),
        generatedBy: currentUser.uid
      };
      
      await addDoc(collection(db, 'reports'), reportData);
      
      setSnackbarMessage('Report generated successfully!');
      setSnackbarOpen(true);
      setReportDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Error generating report. Please try again.');
      setSnackbarOpen(true);
      console.error('Error generating report:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is already handled in AuthContext with toast
    }
  };

  const stats = [
    { title: 'Total Institutions', value: '12', icon: <School color="primary" /> },
    { title: 'Registered Companies', value: '28', icon: <Business color="success" /> },
    { title: 'Active Students', value: '1,234', icon: <People color="info" /> },
    { title: 'Pending Approvals', value: '15', icon: <AdminPanelSettings color="warning" /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={15} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
            {userData?.name?.charAt(0) || 'A'}
          </Avatar>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData?.name || 'Administrator'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Administration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage the entire Career Guidance Platform ecosystem
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Institutions" />
              <Tab label="Companies" />
              <Tab label="Users" />
              <Tab label="Reports" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Recent Activities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • New institution registration: Limkokwing University
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Company approved: Tech Solutions Ltd
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 45 new student registrations today
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      Pending Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 8 institution registrations need approval
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 7 company accounts pending review
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 3 system reports need attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                User Management
              </Typography>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 10).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'admin' ? 'error' :
                            user.role === 'institute' ? 'primary' :
                            user.role === 'company' ? 'success' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || 'pending'} 
                          color={user.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.status !== 'active' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => approveUser(user.id)}
                            >
                              <Check />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => rejectUser(user.id)}
                            >
                              <Close />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Company Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Approve, suspend, or delete company accounts and monitor their activities.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor registered users across all categories and manage their accounts.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                System Reports
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Report />}
                onClick={() => setReportDialogOpen(true)}
              >
                Generate Report
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              View and generate comprehensive system reports and analytics.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure system-wide settings and parameters.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} startIcon={<Settings />}>
              System Configuration
            </Button>
          </TabPanel>
        </Card>
      </Container>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate System Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This will generate a comprehensive report including:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Total users by role</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Pending approvals</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• System activity statistics</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>• Platform usage metrics</Typography>
          
          <Typography variant="body2" color="text.secondary">
            Report will be saved to the database with timestamp.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={generateReport} variant="contained">Generate Report</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;