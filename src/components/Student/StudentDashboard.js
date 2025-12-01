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
import { matchJobsToStudent } from '../../utils/validation';
import { waitingListService } from '../../services/firebaseService';
import Footer from '../Common/Footer';

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
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
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
  const [myApplications, setMyApplications] = useState([]);
  const [admittedApplications, setAdmittedApplications] = useState([]);
  const [institutionSelectionDialogOpen, setInstitutionSelectionDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');

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
    loadMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]); // Reload when userData changes to apply job filtering

  const loadInstitutionsAndJobs = async () => {
    try {
      const [institutionsSnap, jobsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'jobs'))
      ]);
      
      const instList = institutionsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'institute');
      
      const allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter jobs based on student qualifications
      if (userData) {
        // Create student profile for job matching
        const studentProfile = {
          gpa: userData.gpa || 0,
          fieldOfStudy: userData.fieldOfStudy || userData.education || '',
          skills: userData.skills || [],
          experience: userData.experience || 0
        };
        
        // Use matching algorithm to filter qualified jobs
        const qualifiedJobs = matchJobsToStudent(studentProfile, allJobs);
        setJobs(qualifiedJobs);
      } else {
        // If no user data yet, show all jobs (will be filtered on next load)
        setJobs(allJobs);
      }
      
      setInstitutions(instList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const loadMyApplications = async () => {
    try {
      const applicationsSnap = await getDocs(collection(db, 'applications'));
      const myApps = applicationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(app => app.studentId === currentUser?.uid);
      
      setMyApplications(myApps);
      
      // Filter admitted applications
      const admitted = myApps.filter(app => app.status === 'admitted');
      setAdmittedApplications(admitted);
      
      // If student has multiple admissions, they need to choose one
      if (admitted.length > 1 && !admitted.some(app => app.confirmed)) {
        setInstitutionSelectionDialogOpen(true);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };
  
  const handleInstitutionSelection = async () => {
    try {
      if (!selectedInstitution) {
        setSnackbarMessage('Please select an institution to confirm!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Mark selected application as confirmed
      const selectedApp = admittedApplications.find(app => app.id === selectedInstitution);
      await updateDoc(doc(db, 'applications', selectedInstitution), {
        confirmed: true,
        confirmedAt: new Date()
      });
      
      // Reject other admissions and promote from waiting list
      const otherAdmissions = admittedApplications.filter(app => app.id !== selectedInstitution);
      for (const app of otherAdmissions) {
        // Update this application to declined
        await updateDoc(doc(db, 'applications', app.id), {
          status: 'declined',
          declinedAt: new Date()
        });
        
        // Promote next student from waiting list for this institution/course
        try {
          const promoted = await waitingListService.promoteFromWaitingList(
            app.institutionId || currentUser.uid,
            app.courseId,
            app.course
          );
          
          if (promoted) {
            console.log(`Promoted student from waiting list for ${app.course} at ${app.institutionName}`);
          }
        } catch (error) {
          console.error('Error promoting from waiting list:', error);
          // Continue with the process even if promotion fails
        }
      }
      
      setSnackbarMessage(`Confirmed admission to ${selectedApp.institutionName}! Other admissions have been declined and waiting list students have been promoted.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setInstitutionSelectionDialogOpen(false);
      loadMyApplications();
    } catch (error) {
      setSnackbarMessage('Error confirming institution. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Error confirming institution:', error);
    }
  };

  const handleApplicationSubmit = async () => {
    try {
      // Enhanced validation of required fields
      if (!applicationForm.institutionName) {
        setSnackbarMessage('Please select an institution!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      if (!applicationForm.course || applicationForm.course.trim() === '') {
        setSnackbarMessage('Please enter the course name!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      if (!applicationForm.previousEducation || applicationForm.previousEducation.trim() === '') {
        setSnackbarMessage('Please specify your previous education!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Validate course name length
      if (applicationForm.course.length < 3) {
        setSnackbarMessage('Course name must be at least 3 characters long!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Check how many applications this student has for the selected institution
      const existingApplicationsSnap = await getDocs(collection(db, 'applications'));
      const existingApplications = existingApplicationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(app => 
          app.studentId === currentUser.uid && 
          app.institutionName === applicationForm.institutionName &&
          app.status !== 'declined' && 
          app.status !== 'rejected'
        );
      
      // Enforce 2 applications per institution limit
      if (existingApplications.length >= 2) {
        setSnackbarMessage('Error: You can only apply to 2 courses per institution! You already have ' + existingApplications.length + ' active application(s) at this institution.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Check if student already applied for this exact course at this institution
      const duplicateApplication = existingApplications.find(app => 
        app.course === applicationForm.course && 
        app.level === applicationForm.level
      );
      
      if (duplicateApplication) {
        setSnackbarMessage('Error: You have already applied for this course!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Enhanced qualification requirements check based on level
      const requiredEducation = {
        'Certificate': ['High School', 'Secondary', 'O-Level', 'A-Level', 'Grade 12', 'Form E'],
        'Diploma': ['High School', 'Secondary', 'O-Level', 'A-Level', 'Certificate', 'Grade 12', 'Form E'],
        'Undergraduate': ['High School', 'Secondary', 'O-Level', 'A-Level', 'Diploma', 'Grade 12', 'Form E'],
        'Postgraduate': ['Bachelor', 'Undergraduate', 'Degree', 'BSc', 'BA', 'BEd'],
        'Masters': ['Bachelor', 'Undergraduate', 'Degree', 'BSc', 'BA', 'BEd'],
        'PhD': ['Masters', 'Graduate', 'MSc', 'MA', 'MBA', 'MEd']
      };
      
      const level = applicationForm.level;
      const previousEd = applicationForm.previousEducation.toLowerCase();
      
      // Check if student meets minimum education requirement
      if (requiredEducation[level]) {
        const meetsRequirement = requiredEducation[level].some(req => 
          previousEd.includes(req.toLowerCase())
        );
        
        if (!meetsRequirement) {
          setSnackbarMessage(
            `Qualification Error: ${level} programs require one of the following: ${requiredEducation[level].join(', ')}. Your education: ${applicationForm.previousEducation}`
          );
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }
      
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
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setInstitutionDialogOpen(false);
      setApplicationForm({
        institutionName: '',
        course: '',
        level: 'Undergraduate',
        previousEducation: ''
      });
      
      // Reload applications to update UI
      loadMyApplications();
    } catch (error) {
      setSnackbarMessage('Error submitting application. Please try again.');
      setSnackbarSeverity('error');
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
      setSnackbarSeverity('success');
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
      setSnackbarSeverity('success');
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
      setSnackbarSeverity('success');
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

  // Calculate real-time statistics
  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    const fields = ['name', 'email', 'phone', 'address', 'dateOfBirth', 'gender', 'nationality', 'highSchool', 'graduationYear'];
    const completed = fields.filter(field => userData[field]).length;
    return Math.round((completed / fields.length) * 100);
  };

  const stats = [
    { 
      title: 'Applications Submitted', 
      value: myApplications.length || 0, 
      icon: <Assignment color="primary" /> 
    },
    { 
      title: 'Admissions Received', 
      value: myApplications.filter(app => app.status === 'admitted').length || 0, 
      icon: <School color="success" /> 
    },
    { 
      title: 'Qualified Jobs', 
      value: jobs.length || 0, 
      icon: <Work color="info" /> 
    },
    { 
      title: 'Profile Completion', 
      value: `${calculateProfileCompletion()}%`, 
      icon: <Person color="warning" /> 
    }
  ];

  return (
    <>
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Student Dashboard
            </Typography>
          </Box>
          <IconButton color="inherit" sx={{ mr: 1 }} onClick={() => setNotificationDialogOpen(true)}>
            <Badge badgeContent={admittedApplications.length} color="error">
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
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Welcome back, {userData?.name || currentUser?.displayName || 'Student'}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Here's your academic journey overview
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" component="div" gutterBottom fontWeight="bold">
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Track your course application status and manage applications.
            </Typography>
            
            {myApplications.length === 0 ? (
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't submitted any applications yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setActiveTab(1)}
                  >
                    Browse Institutions
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Institution</strong></TableCell>
                        <TableCell><strong>Course</strong></TableCell>
                        <TableCell><strong>Level</strong></TableCell>
                        <TableCell><strong>Applied Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.institutionName}</TableCell>
                          <TableCell>{app.course}</TableCell>
                          <TableCell>{app.level}</TableCell>
                          <TableCell>
                            {app.appliedAt?.toDate ? 
                              new Date(app.appliedAt.toDate()).toLocaleDateString() : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={app.confirmed ? 'Confirmed' : app.status || 'Pending'} 
                              color={
                                app.confirmed ? 'success' :
                                app.status === 'admitted' ? 'success' : 
                                app.status === 'rejected' ? 'error' :
                                app.status === 'declined' ? 'default' :
                                app.status === 'waiting' ? 'info' :
                                'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {admittedApplications.length > 0 && (
                  <Card variant="outlined" sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🎉 Congratulations! You have {admittedApplications.length} admission(s)
                      </Typography>
                      {admittedApplications.map(app => (
                        <Typography key={app.id} variant="body2" sx={{ mb: 1 }}>
                          • {app.institutionName} - {app.course} ({app.level})
                          {app.confirmed && <strong> [CONFIRMED]</strong>}
                        </Typography>
                      ))}
                      {admittedApplications.length > 1 && !admittedApplications.some(app => app.confirmed) && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={() => setInstitutionSelectionDialogOpen(true)}
                        >
                          Choose Your Institution
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
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
        <DialogTitle>Available Job Opportunities (Matched to Your Profile)</DialogTitle>
        <DialogContent>
          {jobs.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                No qualified job opportunities available at the moment. 
                Jobs are filtered based on your qualifications, experience, and skills.
                Update your profile to receive more job matches.
              </Typography>
            </Alert>
          ) : (
            <List>
              {jobs.map((job) => (
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
                        <Chip label={job.experience} size="small" color="primary" sx={{ mr: 1 }} />
                        {job.matchScore && (
                          <Chip 
                            label={`${job.matchScore}% Match`} 
                            size="small" 
                            color={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'warning' : 'default'}
                          />
                        )}
                      </Box>
                      {job.matchReasons && job.matchReasons.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="success.main">
                            ✓ {job.matchReasons.join(' • ')}
                          </Typography>
                        </Box>
                      )}
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
              ))}
            </List>
          )}
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

      {/* Institution Selection Dialog - For multiple admissions */}
      <Dialog 
        open={institutionSelectionDialogOpen} 
        onClose={() => {}} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Choose Your Institution</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Congratulations! You have been admitted to multiple institutions. 
            Please select one institution to confirm your enrollment.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Institution</InputLabel>
            <Select
              value={selectedInstitution}
              label="Select Institution"
              onChange={(e) => setSelectedInstitution(e.target.value)}
            >
              {admittedApplications.map((app) => (
                <MenuItem key={app.id} value={app.id}>
                  {app.institutionName} - {app.course} ({app.level})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Once you confirm your choice, other admissions will be automatically declined.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleInstitutionSelection} 
            variant="contained"
            disabled={!selectedInstitution}
          >
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Notification Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Notifications sx={{ mr: 1 }} />
            Admission Notifications
          </Box>
        </DialogTitle>
        <DialogContent>
          {admittedApplications.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Congratulations! You have been admitted ({admittedApplications.length})
              </Typography>
              <List>
                {admittedApplications.map((app) => (
                  <ListItem key={app.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1"><strong>{app.courseName}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">{app.institutionName}</Typography>
                      <Chip label="Admitted" color="success" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography color="text.secondary">No new notifications</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
    <Footer />
    </>
  );
};

export default StudentDashboard;