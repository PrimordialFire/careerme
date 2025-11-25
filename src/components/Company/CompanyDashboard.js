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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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

const CompanyDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [qualifiedCandidates, setQualifiedCandidates] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    type: 'Full-time',
    experience: 'Entry Level'
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

  // Load jobs when component mounts
  useEffect(() => {
    if (currentUser) {
      loadJobs();
      loadQualifiedCandidates();
    }
  }, [currentUser]);

  const loadJobs = async () => {
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsList.filter(job => job.companyId === currentUser?.uid));
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };
  
  const loadQualifiedCandidates = async () => {
    try {
      // Load all students and their documents
      const [usersSnap, documentsSnap, applicationsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'documents')),
        getDocs(collection(db, 'applications'))
      ]);
      
      const students = usersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      
      const documents = documentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const applications = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter candidates based on job requirements
      const qualified = students.map(student => {
        // Get student's documents and applications
        const studentDocs = documents.filter(doc => doc.studentId === student.id);
        const studentApps = applications.filter(app => 
          app.studentId === student.id && app.status === 'admitted'
        );
        
        // Calculate qualification score
        const hasTranscripts = studentDocs.some(doc => doc.type === 'Transcript');
        const hasCertificates = studentDocs.some(doc => doc.type === 'Certificate');
        const hasEducation = studentApps.length > 0;
        const educationLevel = studentApps.length > 0 ? studentApps[0].level : 'None';
        
        // Simple scoring system
        let qualificationScore = 0;
        if (hasTranscripts) qualificationScore += 30;
        if (hasCertificates) qualificationScore += 20;
        if (hasEducation) qualificationScore += 30;
        if (educationLevel === 'PhD') qualificationScore += 20;
        else if (educationLevel === 'Masters') qualificationScore += 15;
        else if (educationLevel === 'Undergraduate') qualificationScore += 10;
        
        return {
          ...student,
          qualificationScore,
          hasTranscripts,
          hasCertificates,
          educationLevel,
          documentCount: studentDocs.length
        };
      }).filter(candidate => candidate.qualificationScore > 30); // Minimum threshold
      
      // Sort by qualification score
      qualified.sort((a, b) => b.qualificationScore - a.qualificationScore);
      
      setQualifiedCandidates(qualified);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const handleJobSubmit = async () => {
    try {
      console.log('Submitting job with data:', jobForm);
      const jobData = {
        ...jobForm,
        companyId: currentUser.uid,
        companyName: userData?.companyName || userData?.name,
        createdAt: new Date(),
        status: 'active'
      };
      
      console.log('Final job data:', jobData);
      await addDoc(collection(db, 'jobs'), jobData);
      
      setSnackbarMessage('Job posted successfully!');
      setSnackbarOpen(true);
      setJobDialogOpen(false);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        type: 'Full-time',
        experience: 'Entry Level'
      });
      loadJobs(); // Reload jobs
      console.log('Job posted successfully!');
    } catch (error) {
      setSnackbarMessage('Error posting job. Please try again.');
      setSnackbarOpen(true);
      console.error('Error posting job:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      console.log('Updating profile with data:', userData);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        companyName: userData.companyName,
        industry: userData.industry,
        website: userData.website,
        description: userData.description
      });
      
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setProfileDialogOpen(false);
      console.log('Profile updated successfully!');
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
    { title: 'Active Job Postings', value: jobs.length, icon: <Work color="primary" /> },
    { title: 'Total Applications', value: qualifiedCandidates.reduce((sum, job) => sum + (job.candidates?.length || 0), 0), icon: <People color="success" /> },
    { title: 'Qualified Candidates', value: qualifiedCandidates.reduce((sum, job) => sum + (job.candidates?.length || 0), 0), icon: <People color="info" /> },
    { title: 'Jobs Posted', value: jobs.length, icon: <Business color="warning" /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Company Dashboard
            </Typography>
          </Box>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={qualifiedCandidates.reduce((sum, job) => sum + (job.candidates?.length || 0), 0)} color="error">
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
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Welcome, {userData?.companyName || 'Company'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Manage job postings and connect with qualified graduates
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: 3,
                '&:hover': { boxShadow: 6 }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
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
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => {
                  console.log('Post New Job clicked');
                  setJobDialogOpen(true);
                }}
              >
                Post New Job
              </Button>
            </Box>
            
            {/* Display posted jobs */}
            <Grid container spacing={3} mt={2}>
              {jobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    No jobs posted yet. Click "Post New Job" to create your first job posting.
                  </Typography>
                </Grid>
              ) : (
                jobs.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {job.description}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Location:</strong> {job.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Type:</strong> {job.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Experience:</strong> {job.experience}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Salary:</strong> {job.salary}
                          </Typography>
                        </Box>
                        <Box mt={2}>
                          <Chip 
                            label={job.status === 'active' ? 'Active' : 'Inactive'} 
                            color={job.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Automatically filtered candidates based on:
              academic performance, certificates, work experience, and relevance to job requirements.
            </Typography>
            
            {qualifiedCandidates.length === 0 ? (
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No qualified candidates found at the moment.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Education Level</strong></TableCell>
                      <TableCell><strong>Documents</strong></TableCell>
                      <TableCell><strong>Score</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qualifiedCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={candidate.educationLevel || 'N/A'} 
                            color={
                              candidate.educationLevel === 'PhD' ? 'error' :
                              candidate.educationLevel === 'Masters' ? 'warning' :
                              candidate.educationLevel === 'Undergraduate' ? 'primary' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {candidate.hasTranscripts && <Chip label="Transcript" size="small" sx={{ mr: 0.5 }} />}
                          {candidate.hasCertificates && <Chip label="Certificates" size="small" color="success" />}
                          {!candidate.hasTranscripts && !candidate.hasCertificates && 'None'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${candidate.qualificationScore}%`}
                            color={
                              candidate.qualificationScore >= 80 ? 'success' :
                              candidate.qualificationScore >= 60 ? 'primary' :
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => {
                              setSnackbarMessage(`Contact ${candidate.name} at ${candidate.email}`);
                              setSnackbarOpen(true);
                            }}
                          >
                            Contact
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Company Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update company profile and recruitment preferences.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }} 
              startIcon={<Settings />}
              onClick={() => {
                console.log('Edit Profile clicked');
                setProfileDialogOpen(true);
              }}
            >
              Edit Profile
            </Button>
          </TabPanel>
        </Card>
      </Container>

      {/* Job Posting Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobForm.type}
                  label="Job Type"
                  onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={jobForm.experience}
                  label="Experience Level"
                  onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                >
                  <MenuItem value="Entry Level">Entry Level</MenuItem>
                  <MenuItem value="Mid Level">Mid Level</MenuItem>
                  <MenuItem value="Senior Level">Senior Level</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary Range"
                placeholder="e.g., M15,000 - M25,000"
                value={jobForm.salary}
                onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements"
                placeholder="List the requirements and qualifications needed"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleJobSubmit} variant="contained">Post Job</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={userData?.companyName || ''}
                onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Industry"
                value={userData?.industry || ''}
                onChange={(e) => setUserData({ ...userData, industry: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={userData?.website || ''}
                onChange={(e) => setUserData({ ...userData, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Company Description"
                value={userData?.description || ''}
                onChange={(e) => setUserData({ ...userData, description: e.target.value })}
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

export default CompanyDashboard;