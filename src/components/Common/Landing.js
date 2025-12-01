import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { School, Business, Work, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const userTypes = [
    {
      title: 'Students',
      description: 'Discover higher learning institutions, apply for courses, and find career opportunities.',
      icon: <School sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      features: [
        'Browse institutions and courses',
        'Apply for up to 2 courses per institution',
        'Upload transcripts and certificates',
        'Find job opportunities',
        'Receive notifications for matching jobs'
      ]
    },
    {
      title: 'Institutions',
      description: 'Manage your institution, courses, and student applications efficiently.',
      icon: <Business sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      features: [
        'Manage faculties and courses',
        'Review student applications',
        'Publish admissions results',
        'Track student enrollment',
        'Update institution profile'
      ]
    },
    {
      title: 'Companies',
      description: 'Post job opportunities and connect with qualified graduates.',
      icon: <Work sx={{ fontSize: 60, color: theme.palette.success.main }} />,
      features: [
        'Post job opportunities',
        'View qualified candidates',
        'Automatic filtering by qualifications',
        'Manage company profile',
        'Connect with qualified graduates'
      ]
    },
    {
      title: 'Administrators',
      description: 'Oversee the entire platform and manage all system components.',
      icon: <AdminPanelSettings sx={{ fontSize: 60, color: theme.palette.warning.main }} />,
      features: [
        'Manage institutions and companies',
        'Oversee system operations',
        'Generate comprehensive reports',
        'Monitor user activities',
        'Configure system settings'
      ]
    }
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Career Guidance Platform
            </Typography>
          </Box>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')}>
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant={isMobile ? 'h3' : 'h2'} component="h1" gutterBottom>
            Career Guidance & Employment Integration Platform
          </Typography>
          <Typography variant={isMobile ? 'h6' : 'h5'} component="h2" gutterBottom>
            Connecting Students, Institutions, and Employers in Lesotho
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem' }}>
            Discover higher learning institutions, apply for courses, and find career opportunities all in one place.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                mr: 2, 
                mb: isMobile ? 2 : 0,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Who Are You?
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6, color: 'text.secondary' }}>
          Choose your role to get started with the platform
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {userTypes.map((userType, index) => (
            <Grid item xs={12} md={6} key={index} sx={{ display: 'flex' }}>
              <Card 
                sx={{ 
                  width: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 2 }}>
                    {userType.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {userType.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {userType.description}
                  </Typography>
                  <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                    {userType.features.map((feature, featureIndex) => (
                      <Typography key={featureIndex} variant="body2" sx={{ mb: 1 }}>
                        • {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/register')}
                  >
                    Register as {userType.title.slice(0, -1)}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="body1" textAlign="center">
            © 2025 Career Guidance Platform. Empowering education and employment in Lesotho.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;