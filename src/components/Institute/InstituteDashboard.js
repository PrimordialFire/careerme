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
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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

const InstituteDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
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
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              Institution Dashboard
            </Typography>
          </Box>
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userData?.institutionName || 'Institution'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your institution, courses, and student applications
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
                            color={application.status === 'approved' ? 'success' : 'warning'}
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

export default InstituteDashboard;