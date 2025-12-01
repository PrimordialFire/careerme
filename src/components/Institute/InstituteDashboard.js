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
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  School,
  People,
  Assignment,
  Notifications,
  ExitToApp,
  Add,
  Settings,
  Check,
  Close,
  HourglassEmpty
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
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

const InstituteDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    description: '',
    head: '',
    departments: ''
  });
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    faculty: '',
    level: 'Undergraduate'
  });
  
  const [profileForm, setProfileForm] = useState({
    institutionName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    institutionType: ''
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

  const loadFaculties = async () => {
    try {
      const facultiesSnapshot = await getDocs(collection(db, 'faculties'));
      const facultiesList = facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFaculties(facultiesList.filter(faculty => faculty.instituteId === currentUser?.uid));
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesList.filter(course => course.instituteId === currentUser?.uid));
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applicationsList = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsList.filter(app => app.institutionName === userData?.institutionName));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };
  
  const handleApplicationStatus = async (applicationId, status) => {
    try {
      // Check if student already has an admission from this institution
      if (status === 'admitted') {
        const application = applications.find(app => app.id === applicationId);
        
        // Get all applications for this institution
        const allApplicationsSnapshot = await getDocs(collection(db, 'applications'));
        const allApplications = allApplicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Check if student already has an admission to ANY course at this institution
        const existingAdmissions = allApplications.filter(
          app => app.studentId === application.studentId && 
          app.status === 'admitted' && 
          app.id !== applicationId &&
          (app.institutionName === application.institutionName || 
           app.institutionId === application.institutionId ||
           app.institutionId === currentUser.uid)
        );
        
        if (existingAdmissions.length > 0) {
          setSnackbarMessage(`Error: ${application.studentName || 'Student'} already admitted to ${existingAdmissions[0].course} at this institution!`);
          setSnackbarOpen(true);
          return;
        }
      }
      
      await updateDoc(doc(db, 'applications', applicationId), {
        status: status,
        processedAt: new Date()
      });
      
      const statusMessages = {
        'admitted': 'Student admitted successfully!',
        'rejected': 'Application rejected.',
        'waiting': 'Student added to waiting list.',
        'pending': 'Application marked as pending.'
      };
      
      setSnackbarMessage(statusMessages[status] || 'Status updated!');
      setSnackbarOpen(true);
      loadApplications();
    } catch (error) {
      setSnackbarMessage('Error updating application status. Please try again.');
      setSnackbarOpen(true);
      console.error('Error updating application:', error);
    }
  };

  React.useEffect(() => {
    if (currentUser) {
      loadFaculties();
      loadCourses();
      loadApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFacultySubmit = async () => {
    try {
      const facultyData = {
        ...facultyForm,
        instituteId: currentUser.uid,
        instituteName: userData?.institutionName || userData?.name,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'faculties'), facultyData);
      
      setSnackbarMessage('Faculty added successfully!');
      setSnackbarOpen(true);
      setFacultyDialogOpen(false);
      setFacultyForm({ name: '', description: '', head: '', departments: '' });
      loadFaculties(); // Reload faculties
    } catch (error) {
      setSnackbarMessage('Error adding faculty. Please try again.');
      setSnackbarOpen(true);
      console.error('Error adding faculty:', error);
    }
  };

  const handleCourseSubmit = async () => {
    try {
      const courseData = {
        ...courseForm,
        instituteId: currentUser.uid,
        instituteName: userData?.institutionName || userData?.name,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'courses'), courseData);
      
      setSnackbarMessage('Course added successfully!');
      setSnackbarOpen(true);
      setCourseDialogOpen(false);
      setCourseForm({
        name: '',
        code: '',
        description: '',
        credits: '',
        faculty: '',
        level: 'Undergraduate'
      });
      loadCourses(); // Reload courses
    } catch (error) {
      setSnackbarMessage('Error adding course. Please try again.');
      setSnackbarOpen(true);
      console.error('Error adding course:', error);
    }
  };

  const handlePublishAdmissions = async () => {
    try {
      const admittedApplications = applications.filter(
        app => app.status === 'admitted' && !app.published
      );
      
      if (admittedApplications.length === 0) {
        setSnackbarMessage('No new admissions to publish!');
        setSnackbarOpen(true);
        setPublishDialogOpen(false);
        return;
      }
      
      // Publish all admitted applications
      for (const app of admittedApplications) {
        await updateDoc(doc(db, 'applications', app.id), {
          published: true,
          publishedAt: new Date(),
          publishedBy: currentUser.uid
        });
      }
      
      setSnackbarMessage(`Successfully published ${admittedApplications.length} admission(s)!`);
      setSnackbarOpen(true);
      setPublishDialogOpen(false);
      loadApplications();
    } catch (error) {
      setSnackbarMessage('Error publishing admissions. Please try again.');
      setSnackbarOpen(true);
      console.error('Error publishing admissions:', error);
    }
  };

  const handleProfileDialogOpen = () => {
    // Pre-fill form with current data
    setProfileForm({
      institutionName: userData?.institutionName || '',
      email: userData?.email || currentUser?.email || '',
      phone: userData?.phone || '',
      address: userData?.address || '',
      website: userData?.website || '',
      institutionType: userData?.institutionType || ''
    });
    setProfileDialogOpen(true);
  };

  const handleProfileUpdate = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...profileForm,
        updatedAt: new Date()
      });
      
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarOpen(true);
      setProfileDialogOpen(false);
      
      // Refresh user data
      const updatedData = await getUserData(currentUser.uid);
      setUserData(updatedData);
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
  const stats = [
    { 
      title: 'Total Faculties', 
      value: faculties.length || 0, 
      icon: <School color="primary" /> 
    },
    { 
      title: 'Active Courses', 
      value: courses.length || 0, 
      icon: <Assignment color="success" /> 
    },
    { 
      title: 'Student Applications', 
      value: applications.length || 0, 
      icon: <People color="info" /> 
    },
    { 
      title: 'Admitted Students', 
      value: applications.filter(app => app.status === 'admitted').length || 0, 
      icon: <People color="warning" /> 
    }
  ];

  return (
    <>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Institution Dashboard
            </Typography>
          </Box>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={applications.filter(app => app.status === 'pending').length} color="error">
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Welcome, {userData?.institutionName || 'Institution'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Manage your institution, courses, and student applications
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
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setFacultyDialogOpen(true)}
              >
                Add Faculty
              </Button>
            </Box>
            
            {faculties.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                No faculties added yet. Click "Add Faculty" to create your first faculty.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Faculty Name</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Head</strong></TableCell>
                      <TableCell><strong>Departments</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faculties.map((faculty) => (
                      <TableRow key={faculty.id}>
                        <TableCell>{faculty.name}</TableCell>
                        <TableCell>{faculty.description}</TableCell>
                        <TableCell>{faculty.head}</TableCell>
                        <TableCell>{faculty.departments}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Course Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setCourseDialogOpen(true)}
              >
                Add Course
              </Button>
            </Box>
            
            {courses.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                No courses added yet. Click "Add Course" to create your first course.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Course Code</strong></TableCell>
                      <TableCell><strong>Course Name</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Credits</strong></TableCell>
                      <TableCell><strong>Faculty</strong></TableCell>
                      <TableCell><strong>Level</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.description}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.faculty}</TableCell>
                        <TableCell>
                          <Chip 
                            label={course.level} 
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Student Applications
            </Typography>
            
            {applications.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                No student applications received yet.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Student Name</strong></TableCell>
                      <TableCell><strong>Course</strong></TableCell>
                      <TableCell><strong>Level</strong></TableCell>
                      <TableCell><strong>Previous Education</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>{application.studentName}</TableCell>
                        <TableCell>{application.course}</TableCell>
                        <TableCell>{application.level}</TableCell>
                        <TableCell>{application.previousEducation}</TableCell>
                        <TableCell>
                          {application.appliedAt?.toDate ? 
                            new Date(application.appliedAt.toDate()).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={application.status || 'Pending'} 
                            color={
                              application.status === 'admitted' ? 'success' : 
                              application.status === 'rejected' ? 'error' : 
                              application.status === 'waiting' ? 'info' :
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {application.status !== 'admitted' && (
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleApplicationStatus(application.id, 'admitted')}
                              title="Admit"
                            >
                              <Check />
                            </IconButton>
                          )}
                          {application.status !== 'waiting' && application.status !== 'admitted' && (
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleApplicationStatus(application.id, 'waiting')}
                              title="Add to Waiting List"
                            >
                              <HourglassEmpty />
                            </IconButton>
                          )}
                          {application.status !== 'rejected' && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleApplicationStatus(application.id, 'rejected')}
                              title="Reject"
                            >
                              <Close />
                            </IconButton>
                          )}
                          {application.status !== 'pending' && (
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleApplicationStatus(application.id, 'pending')}
                              title="Mark as Pending"
                            >
                              <HourglassEmpty />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Admissions Management
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<Check />}
                onClick={() => setPublishDialogOpen(true)}
                disabled={applications.filter(app => app.status === 'admitted' && !app.published).length === 0}
              >
                Publish Admissions
              </Button>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Review and publish admission results to make them visible to students.
            </Typography>

            {applications.filter(app => app.status === 'admitted').length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                No admitted students yet. Process applications in the Applications tab.
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Student Name</strong></TableCell>
                      <TableCell><strong>Course</strong></TableCell>
                      <TableCell><strong>Level</strong></TableCell>
                      <TableCell><strong>Admission Date</strong></TableCell>
                      <TableCell><strong>Published</strong></TableCell>
                      <TableCell><strong>Published Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications
                      .filter(app => app.status === 'admitted')
                      .map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.studentName}</TableCell>
                          <TableCell>{application.course}</TableCell>
                          <TableCell>{application.level}</TableCell>
                          <TableCell>
                            {application.processedAt?.toDate ? 
                              new Date(application.processedAt.toDate()).toLocaleDateString() : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={application.published ? 'Published' : 'Pending'} 
                              color={application.published ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {application.publishedAt?.toDate ? 
                              new Date(application.publishedAt.toDate()).toLocaleDateString() : 
                              '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Typography variant="h6" gutterBottom>
              Institution Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Update institution profile and settings.
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Profile Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Institution Name</Typography>
                    <Typography variant="body1">{userData?.institutionName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body1">{userData?.institutionType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{userData?.email || currentUser?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{userData?.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Website</Typography>
                    <Typography variant="body1">{userData?.website || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{userData?.address || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Button 
              variant="contained" 
              startIcon={<Settings />}
              onClick={handleProfileDialogOpen}
            >
              Edit Profile
            </Button>
          </TabPanel>
        </Card>
      </Container>

      {/* Faculty Dialog */}
      <Dialog open={facultyDialogOpen} onClose={() => setFacultyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Faculty</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Faculty Name"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Faculty Head"
                value={facultyForm.head}
                onChange={(e) => setFacultyForm({ ...facultyForm, head: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={facultyForm.description}
                onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Departments"
                placeholder="List departments separated by commas"
                value={facultyForm.departments}
                onChange={(e) => setFacultyForm({ ...facultyForm, departments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFacultyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFacultySubmit} variant="contained">Add Faculty</Button>
        </DialogActions>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Code"
                placeholder="e.g., CS101"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={courseForm.level}
                  label="Level"
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
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
                label="Faculty"
                value={courseForm.faculty}
                onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Course Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCourseSubmit} variant="contained">Add Course</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Update Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Institution Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Institution Name"
                value={profileForm.institutionName}
                onChange={(e) => setProfileForm({ ...profileForm, institutionName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Institution Type</InputLabel>
                <Select
                  value={profileForm.institutionType}
                  label="Institution Type"
                  onChange={(e) => setProfileForm({ ...profileForm, institutionType: e.target.value })}
                >
                  <MenuItem value="University">University</MenuItem>
                  <MenuItem value="College">College</MenuItem>
                  <MenuItem value="Technical Institute">Technical Institute</MenuItem>
                  <MenuItem value="Vocational School">Vocational School</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">Update Profile</Button>
        </DialogActions>
      </Dialog>

      {/* Publish Admissions Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Publish Admissions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to publish all pending admission decisions?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This action will:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Make admission decisions visible to students
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Send notifications to admitted students
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • Mark admissions as published
          </Typography>
          <Alert severity="info">
            {applications.filter(app => app.status === 'admitted' && !app.published).length} admission(s) will be published
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePublishAdmissions} variant="contained" color="success">
            Publish Admissions
          </Button>
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
    <Footer />
    </>
  );
};

export default InstituteDashboard;