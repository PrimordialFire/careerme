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
  School,
  People,
  Assignment,
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

const InstituteDashboard = () => {
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
    { title: 'Total Faculties', value: '5', icon: <School color="primary" /> },
    { title: 'Active Courses', value: '24', icon: <Assignment color="success" /> },
    { title: 'Student Applications', value: '156', icon: <People color="info" /> },
    { title: 'Admitted Students', value: '89', icon: <People color="warning" /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Institution Dashboard
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={5} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
            {userData?.institutionName?.charAt(0) || 'I'}
          </Avatar>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData?.institutionName || 'Institution'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userData?.institutionName || 'Institution'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your institution, courses, and student applications
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
              <Tab label="Faculties" />
              <Tab label="Courses" />
              <Tab label="Applications" />
              <Tab label="Admissions" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Institution Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of your institution's activities and performance.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Faculties Management
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Add Faculty
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage your institution's faculties and departments.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Course Management
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Add Course
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Add and manage courses offered by your institution.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Student Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and process student applications for admission.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Admissions Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Publish admission results and manage student enrollment.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              Institution Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update institution profile and settings.
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

export default InstituteDashboard;