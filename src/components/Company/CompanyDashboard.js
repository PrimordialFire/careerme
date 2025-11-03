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
  Work,
  People,
  Business,
  Notifications,
  ExitToApp,
  Add,
  Settings
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

const CompanyDashboard = () => {
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
    { title: 'Active Job Postings', value: '8', icon: <Work color="primary" /> },
    { title: 'Total Applications', value: '45', icon: <People color="success" /> },
    { title: 'Qualified Candidates', value: '23', icon: <People color="info" /> },
    { title: 'Interviews Scheduled', value: '12', icon: <Business color="warning" /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Company Dashboard
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={7} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
            {userData?.companyName?.charAt(0) || 'C'}
          </Avatar>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData?.companyName || 'Company'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userData?.companyName || 'Company'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage job postings and connect with qualified graduates
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
              <Tab label="Job Postings" />
              <Tab label="Applications" />
              <Tab label="Candidates" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Company Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of your recruitment activities and candidate pipeline.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Job Postings Management
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Post New Job
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Create and manage your job postings with specific qualifications.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Job Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review applications from qualified candidates based on your requirements.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Qualified Candidates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View candidates that match your job requirements based on:
              <br />• Academic performance
              <br />• Extra certificates
              <br />• Work experience
              <br />• Relevance to job post
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Company Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update company profile and recruitment preferences.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} startIcon={<Settings />}>
              Edit Profile
            </Button>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default CompanyDashboard;