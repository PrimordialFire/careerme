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
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
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

const StudentDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [institutionDialogOpen, setInstitutionDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    institutionName: '',
    course: '',
    level: 'Undergraduate',
    previousEducation: ''
  });
  const [documentForm, setDocumentForm] = useState({
    type: 'Transcript',
    name: '',
    description: ''
  });

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

  // Load institutions and jobs
  useEffect(() => {
    loadInstitutionsAndJobs();
  }, []);

  const loadInstitutionsAndJobs = async () => {
    try {
      const [institutionsSnap, jobsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'jobs'))
      ]);
      
      const instList = institutionsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'institute');
      
      const jobsList = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setInstitutions(instList);
      setJobs(jobsList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleApplicationSubmit = async () => {
    try {
      const applicationData = {
        ...applicationForm,
        studentId: currentUser.uid,
        studentName: userData?.name,
        studentEmail: currentUser.email,
        appliedAt: new Date(),
        status: 'pending'
      };
      
      await addDoc(collection(db, 'applications'), applicationData);
      
      setSnackbarMessage('Application submitted successfully!');
      setSnackbarOpen(true);
      setInstitutionDialogOpen(false);
      setApplicationForm({
        institutionName: '',
        course: '',
        level: 'Undergraduate',
        previousEducation: ''
      });
    } catch (error) {
      setSnackbarMessage('Error submitting application. Please try again.');
      setSnackbarOpen(true);
      console.error('Error submitting application:', error);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const documentData = {
        ...documentForm,
        studentId: currentUser.uid,
        studentName: userData?.name,
        uploadedAt: new Date(),
        status: 'uploaded'
      };
      
      await addDoc(collection(db, 'documents'), documentData);
      
      setSnackbarMessage('Document uploaded successfully!');
      setSnackbarOpen(true);
      setDocumentDialogOpen(false);
      setDocumentForm({
        type: 'Transcript',
        name: '',
        description: ''
      });
    } catch (error) {
      setSnackbarMessage('Error uploading document. Please try again.');
      setSnackbarOpen(true);
      console.error('Error uploading document:', error);
    }
  };

  const handleJobApplication = async (job) => {
    try {
      const jobApplicationData = {
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        studentId: currentUser.uid,
        studentName: userData?.name,
        studentEmail: currentUser.email,
        appliedAt: new Date(),
        status: 'pending'
      };
      
      await addDoc(collection(db, 'jobApplications'), jobApplicationData);
      
      setSnackbarMessage('Job application submitted successfully!');
      setSnackbarOpen(true);
      setJobDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Error applying for job. Please try again.');
      setSnackbarOpen(true);
      console.error('Error applying for job:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        education: userData.education
      });
      
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setProfileDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Error updating profile. Please try again.');
      setSnackbarOpen(true);
      console.error('Error updating profile:', error);
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
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
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
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Recent Activity
            </Typography>
            
            {/* Recent Applications Table */}
            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3, mb: 2 }}>
              Recent Applications
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Institution</strong></TableCell>
                    <TableCell><strong>Program</strong></TableCell>
                    <TableCell><strong>Date Applied</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>National University of Lesotho</TableCell>
                    <TableCell>Computer Science</TableCell>
                    <TableCell>Oct 15, 2025</TableCell>
                    <TableCell>
                      <Chip label="Under Review" color="warning" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Limkokwing University</TableCell>
                    <TableCell>Business Administration</TableCell>
                    <TableCell>Oct 20, 2025</TableCell>
                    <TableCell>
                      <Chip label="Pending" color="default" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Admission Updates Table */}
            <Typography variant="h6" gutterBottom color="success.main" sx={{ mt: 4, mb: 2 }}>
              Admission Updates
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Institution</strong></TableCell>
                    <TableCell><strong>Program</strong></TableCell>
                    <TableCell><strong>Decision Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>National University of Lesotho</TableCell>
                    <TableCell>Computer Science</TableCell>
                    <TableCell>Nov 1, 2025</TableCell>
                    <TableCell>
                      <Chip label="Accepted" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Limkokwing University</TableCell>
                    <TableCell>Business Administration</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Chip label="Pending" color="warning" size="small" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Available Institutions & Courses
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse through available institutions and their offered courses.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => setInstitutionDialogOpen(true)}
            >
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
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => setJobDialogOpen(true)}
            >
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
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => {
                        setDocumentForm({ ...documentForm, type: 'Transcript' });
                        setDocumentDialogOpen(true);
                      }}
                    >
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
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => {
                        setDocumentForm({ ...documentForm, type: 'Certificate' });
                        setDocumentDialogOpen(true);
                      }}
                    >
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
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => setProfileDialogOpen(true)}
            >
              Edit Profile
            </Button>
          </TabPanel>
        </Card>
      </Container>

      {/* Institution Application Dialog */}
      <Dialog open={institutionDialogOpen} onClose={() => setInstitutionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply to Institution</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Institution</InputLabel>
                <Select
                  value={applicationForm.institutionName}
                  label="Select Institution"
                  onChange={(e) => setApplicationForm({ ...applicationForm, institutionName: e.target.value })}
                >
                  {institutions.map((inst) => (
                    <MenuItem key={inst.id} value={inst.institutionName || inst.name}>
                      {inst.institutionName || inst.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course/Program"
                value={applicationForm.course}
                onChange={(e) => setApplicationForm({ ...applicationForm, course: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={applicationForm.level}
                  label="Level"
                  onChange={(e) => setApplicationForm({ ...applicationForm, level: e.target.value })}
                >
                  <MenuItem value="Certificate">Certificate</MenuItem>
                  <MenuItem value="Diploma">Diploma</MenuItem>
                  <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                  <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Previous Education"
                placeholder="Describe your previous education and qualifications"
                value={applicationForm.previousEducation}
                onChange={(e) => setApplicationForm({ ...applicationForm, previousEducation: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstitutionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApplicationSubmit} variant="contained">Submit Application</Button>
        </DialogActions>
      </Dialog>

      {/* Job Browser Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Available Job Opportunities</DialogTitle>
        <DialogContent>
          <List>
            {jobs.length === 0 ? (
              <Typography color="text.secondary">No jobs available at the moment.</Typography>
            ) : (
              jobs.map((job) => (
                <ListItem
                  key={job.id}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 2,
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.companyName}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{job.location}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={job.type} size="small" sx={{ mr: 1 }} />
                        <Chip label={job.experience} size="small" color="primary" />
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => handleJobApplication(job)}
                    >
                      Apply Now
                    </Button>
                  </Box>
                  {job.description && (
                    <Typography variant="body2" sx={{ mt: 2 }}>{job.description}</Typography>
                  )}
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentForm.type}
                  label="Document Type"
                  onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                >
                  <MenuItem value="Transcript">Transcript</MenuItem>
                  <MenuItem value="Certificate">Certificate</MenuItem>
                  <MenuItem value="ID">ID Document</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                placeholder="e.g., High School Certificate"
                value={documentForm.name}
                onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={documentForm.description}
                onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Note: In production, this would include actual file upload functionality.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDocumentUpload} variant="contained">Upload Document</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={userData?.name || ''}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userData?.phone || ''}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={userData?.address || ''}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Education Background"
                value={userData?.education || ''}
                onChange={(e) => setUserData({ ...userData, education: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">Save Changes</Button>
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

export default StudentDashboard;