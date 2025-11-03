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
  Badge,
  IconButton,
} from '@mui/material';
import { 
  School, 
  Work, 
  Person, 
  Notifications, 
  ExitToApp,
  Assignment,
  FileUpload,
  Dashboard as DashboardIcon
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

const StudentDashboard = () => {
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
    { title: 'Applications Submitted', value: '2', icon: <Assignment color="primary" /> },
    { title: 'Admissions Received', value: '1', icon: <School color="success" /> },
    { title: 'Job Applications', value: '0', icon: <Work color="info" /> },
    { title: 'Profile Completion', value: '85%', icon: <Person color="warning" /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
            {userData?.name?.charAt(0) || currentUser?.displayName?.charAt(0) || 'S'}
          </Avatar>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData?.name || currentUser?.displayName || 'Student'}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Typography variant="h4" gutterBottom>
          Welcome back, {userData?.name || currentUser?.displayName || 'Student'}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Here's your academic journey overview
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
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="student dashboard tabs">
              <Tab label="Dashboard" />
              <Tab label="Browse Institutions" />
              <Tab label="My Applications" />
              <Tab label="Job Opportunities" />
              <Tab label="Documents" />
              <Tab label="Profile" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Recent Applications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Application to National University of Lesotho - Computer Science
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Application to Limkokwing University - Business Administration
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      Admission Updates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Accepted to National University of Lesotho
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Pending: Limkokwing University
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Available Institutions & Courses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse through available institutions and their offered courses.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              View All Institutions
            </Button>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              My Course Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your course application status and manage applications.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">National University of Lesotho</Typography>
                    <Typography variant="body2" color="text.secondary">Computer Science</Typography>
                    <Typography variant="body2" color="success.main">Status: Accepted</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">Limkokwing University</Typography>
                    <Typography variant="body2" color="text.secondary">Business Administration</Typography>
                    <Typography variant="body2" color="warning.main">Status: Pending</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Job Opportunities
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find job opportunities that match your qualifications.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Browse Jobs
            </Button>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Document Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload and manage your academic documents and certificates.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <FileUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Upload Transcripts
                    </Typography>
                    <Button variant="contained" size="small">
                      Upload Files
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <FileUpload sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Upload Certificates
                    </Typography>
                    <Button variant="contained" size="small">
                      Upload Files
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your personal information and preferences.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Edit Profile
            </Button>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default StudentDashboard;