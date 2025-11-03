import React, { useState } from 'react';
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
  Badge
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
  Report
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

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
                Institution Management
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Add Institution
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage higher learning institutions, their faculties, and courses.
            </Typography>
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
              <Button variant="contained" startIcon={<Report />}>
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
    </Box>
  );
};

export default AdminDashboard;