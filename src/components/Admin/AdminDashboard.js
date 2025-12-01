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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
  Report,
  Check,
  Close,
  Edit,
  Delete
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
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

const AdminDashboard = () => {
  const { currentUser, logout, getUserData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [institutionDialogOpen, setInstitutionDialogOpen] = useState(false);
  const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // Institution form state
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    type: '', // University, College, Technical Institute
    description: ''
  });

  // Faculty form state
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    institutionId: '',
    institutionName: '',
    description: '',
    head: '',
    departments: ''
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    institutionId: '',
    facultyId: '',
    facultyName: '',
    description: '',
    credits: '',
    level: 'Undergraduate',
    duration: '',
    requirements: ''
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

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
    loadInstitutions();
    loadCompanies();
    loadFaculties();
    loadCourses();
    loadApplications();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };
  
  const loadInstitutions = async () => {
    try {
      const institutionsSnapshot = await getDocs(collection(db, 'institutions'));
      const institutionsList = institutionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInstitutions(institutionsList);
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };
  
  const loadCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(collection(db, 'users'));
      const companiesList = companiesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'company');
      setCompanies(companiesList);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadFaculties = async () => {
    try {
      const facultiesSnapshot = await getDocs(collection(db, 'faculties'));
      const facultiesList = facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFaculties(facultiesList);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesList);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applicationsList = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsList);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };
  
  const handleInstitutionDialogOpen = (institution = null) => {
    if (institution) {
      setEditingInstitution(institution);
      setInstitutionForm({
        name: institution.name || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        website: institution.website || '',
        type: institution.type || '',
        description: institution.description || ''
      });
    } else {
      setEditingInstitution(null);
      setInstitutionForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        type: '',
        description: ''
      });
    }
    setInstitutionDialogOpen(true);
  };
  
  const handleInstitutionSubmit = async () => {
    try {
      // Validation
      if (!institutionForm.name || !institutionForm.email || !institutionForm.phone || !institutionForm.type) {
        setSnackbarMessage('Please fill in all required fields.');
        setSnackbarOpen(true);
        return;
      }

      // Email validation
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(institutionForm.email.trim())) {
        setSnackbarMessage('Please enter a valid email address.');
        setSnackbarOpen(true);
        return;
      }

      if (editingInstitution) {
        // Update existing institution
        await updateDoc(doc(db, 'institutions', editingInstitution.id), {
          ...institutionForm,
          email: institutionForm.email.trim(),
          updatedAt: new Date()
        });
        setSnackbarMessage('Institution updated successfully!');
      } else {
        // Add new institution
        await addDoc(collection(db, 'institutions'), {
          ...institutionForm,
          email: institutionForm.email.trim(),
          status: 'active',
          createdAt: new Date()
        });
        setSnackbarMessage('Institution added successfully!');
      }
      
      setSnackbarOpen(true);
      setInstitutionDialogOpen(false);
      loadInstitutions();
    } catch (error) {
      setSnackbarMessage(`Error saving institution: ${error.message}`);
      setSnackbarOpen(true);
      console.error('Error saving institution:', error);
    }
  };
  
  const handleDeleteInstitution = async (institutionId) => {
    if (window.confirm('Are you sure you want to delete this institution? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'institutions', institutionId));
        setSnackbarMessage('Institution deleted successfully!');
        setSnackbarOpen(true);
        loadInstitutions();
      } catch (error) {
        setSnackbarMessage('Error deleting institution. Please try again.');
        setSnackbarOpen(true);
        console.error('Error deleting institution:', error);
      }
    }
  };

  // Faculty Management Functions
  const handleFacultyDialogOpen = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFacultyForm({
        name: faculty.name || '',
        institutionId: faculty.institutionId || '',
        institutionName: faculty.institutionName || '',
        description: faculty.description || '',
        head: faculty.head || '',
        departments: faculty.departments || ''
      });
    } else {
      setEditingFaculty(null);
      setFacultyForm({
        name: '',
        institutionId: '',
        institutionName: '',
        description: '',
        head: '',
        departments: ''
      });
    }
    setFacultyDialogOpen(true);
  };

  const handleFacultySubmit = async () => {
    try {
      if (!facultyForm.institutionId || !facultyForm.name) {
        setSnackbarMessage('Please fill in all required fields!');
        setSnackbarOpen(true);
        return;
      }

      const selectedInstitution = institutions.find(inst => inst.id === facultyForm.institutionId);
      
      if (editingFaculty) {
        await updateDoc(doc(db, 'faculties', editingFaculty.id), {
          ...facultyForm,
          institutionName: selectedInstitution?.name || facultyForm.institutionName,
          updatedAt: new Date()
        });
        setSnackbarMessage('Faculty updated successfully!');
      } else {
        await addDoc(collection(db, 'faculties'), {
          ...facultyForm,
          institutionName: selectedInstitution?.name || '',
          createdAt: new Date(),
          status: 'active'
        });
        setSnackbarMessage('Faculty added successfully!');
      }
      
      setSnackbarOpen(true);
      setFacultyDialogOpen(false);
      loadFaculties();
    } catch (error) {
      setSnackbarMessage('Error saving faculty. Please try again.');
      setSnackbarOpen(true);
      console.error('Error saving faculty:', error);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'faculties', facultyId));
        setSnackbarMessage('Faculty deleted successfully!');
        setSnackbarOpen(true);
        loadFaculties();
      } catch (error) {
        setSnackbarMessage('Error deleting faculty. Please try again.');
        setSnackbarOpen(true);
        console.error('Error deleting faculty:', error);
      }
    }
  };

  // Course Management Functions
  const handleCourseDialogOpen = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        name: course.name || '',
        code: course.code || '',
        institutionId: course.institutionId || '',
        facultyId: course.facultyId || '',
        facultyName: course.facultyName || '',
        description: course.description || '',
        credits: course.credits || '',
        level: course.level || 'Undergraduate',
        duration: course.duration || '',
        requirements: course.requirements || ''
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        name: '',
        code: '',
        institutionId: '',
        facultyId: '',
        facultyName: '',
        description: '',
        credits: '',
        level: 'Undergraduate',
        duration: '',
        requirements: ''
      });
    }
    setCourseDialogOpen(true);
  };

  const handleCourseSubmit = async () => {
    try {
      if (!courseForm.name || !courseForm.institutionId) {
        setSnackbarMessage('Please fill in all required fields!');
        setSnackbarOpen(true);
        return;
      }

      const selectedFaculty = faculties.find(fac => fac.id === courseForm.facultyId);
      const selectedInstitution = institutions.find(inst => inst.id === courseForm.institutionId);
      
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          ...courseForm,
          facultyName: selectedFaculty?.name || courseForm.facultyName,
          institutionName: selectedInstitution?.name || '',
          updatedAt: new Date()
        });
        setSnackbarMessage('Course updated successfully!');
      } else {
        await addDoc(collection(db, 'courses'), {
          ...courseForm,
          facultyName: selectedFaculty?.name || '',
          institutionName: selectedInstitution?.name || '',
          createdAt: new Date(),
          status: 'active'
        });
        setSnackbarMessage('Course added successfully!');
      }
      
      setSnackbarOpen(true);
      setCourseDialogOpen(false);
      loadCourses();
    } catch (error) {
      setSnackbarMessage('Error saving course. Please try again.');
      setSnackbarOpen(true);
      console.error('Error saving course:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        setSnackbarMessage('Course deleted successfully!');
        setSnackbarOpen(true);
        loadCourses();
      } catch (error) {
        setSnackbarMessage('Error deleting course. Please try again.');
        setSnackbarOpen(true);
        console.error('Error deleting course:', error);
      }
    }
  };

  // Admission Publishing Function
  const handlePublishAdmissions = async () => {
    try {
      const pendingApplications = applications.filter(app => app.status === 'admitted' && !app.published);
      
      for (const app of pendingApplications) {
        await updateDoc(doc(db, 'applications', app.id), {
          published: true,
          publishedAt: new Date()
        });
      }
      
      setSnackbarMessage(`Published ${pendingApplications.length} admission(s) successfully!`);
      setSnackbarOpen(true);
      setAdmissionDialogOpen(false);
      loadApplications();
    } catch (error) {
      setSnackbarMessage('Error publishing admissions. Please try again.');
      setSnackbarOpen(true);
      console.error('Error publishing admissions:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active'
      });
      
      setSnackbarMessage('User approved successfully!');
      setSnackbarOpen(true);
      loadUsers(); // Reload users
    } catch (error) {
      setSnackbarMessage('Error approving user. Please try again.');
      setSnackbarOpen(true);
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected'
      });
      
      setSnackbarMessage('User rejected successfully!');
      setSnackbarOpen(true);
      loadUsers(); // Reload users
    } catch (error) {
      setSnackbarMessage('Error rejecting user. Please try again.');
      setSnackbarOpen(true);
      console.error('Error rejecting user:', error);
    }
  };

  const generateReport = async () => {
    try {
      const reportData = {
        totalUsers: users.length,
        institutions: users.filter(u => u.role === 'institute').length,
        companies: users.filter(u => u.role === 'company').length,
        students: users.filter(u => u.role === 'student').length,
        pendingApprovals: users.filter(u => u.status === 'pending').length,
        generatedAt: new Date(),
        generatedBy: currentUser.uid
      };
      
      await addDoc(collection(db, 'reports'), reportData);
      
      setSnackbarMessage('Report generated successfully!');
      setSnackbarOpen(true);
      setReportDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Error generating report. Please try again.');
      setSnackbarOpen(true);
      console.error('Error generating report:', error);
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
      title: 'Total Institutions', 
      value: institutions.length || 0, 
      icon: <School color="primary" /> 
    },
    { 
      title: 'Registered Companies', 
      value: companies.length || 0, 
      icon: <Business color="success" /> 
    },
    { 
      title: 'Active Students', 
      value: users.filter(u => u.role === 'student').length || 0, 
      icon: <People color="info" /> 
    },
    { 
      title: 'Pending Approvals', 
      value: users.filter(u => u.status === 'pending').length + companies.filter(c => c.status === 'pending').length || 0, 
      icon: <AdminPanelSettings color="warning" /> 
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
              Admin Dashboard
            </Typography>
          </Box>
          <IconButton color="inherit" sx={{ mr: 1 }} onClick={() => setNotificationDialogOpen(true)}>
            <Badge badgeContent={users.filter(u => u.status === 'pending').length + companies.filter(c => c.status === 'pending').length} color="error">
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
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          System Administration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Manage the entire Career Guidance Platform ecosystem
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
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" />
              <Tab label="Institutions" />
              <Tab label="Faculties" />
              <Tab label="Courses" />
              <Tab label="Admissions" />
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
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => handleInstitutionDialogOpen()}
              >
                Add Institution
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {institutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell>{institution.name}</TableCell>
                      <TableCell>{institution.type}</TableCell>
                      <TableCell>{institution.email}</TableCell>
                      <TableCell>{institution.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={institution.status || 'active'} 
                          color={institution.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleInstitutionDialogOpen(institution)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteInstitution(institution.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Faculty Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => handleFacultyDialogOpen()}
              >
                Add Faculty
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Head</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>{faculty.name}</TableCell>
                      <TableCell>{faculty.institutionName}</TableCell>
                      <TableCell>{faculty.head}</TableCell>
                      <TableCell>{faculty.description}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleFacultyDialogOpen(faculty)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteFaculty(faculty.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Course Management
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => handleCourseDialogOpen()}
              >
                Add Course
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Faculty</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.institutionName}</TableCell>
                      <TableCell>{course.facultyName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={course.level} 
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleCourseDialogOpen(course)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Admission Management
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<Check />}
                onClick={() => setAdmissionDialogOpen(true)}
              >
                Publish Admissions
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.studentName}</TableCell>
                      <TableCell>{app.institutionName}</TableCell>
                      <TableCell>{app.courseName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={app.status} 
                          color={app.status === 'admitted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={app.published ? 'Yes' : 'No'} 
                          color={app.published ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{app.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Company Management
              </Typography>
              <Chip 
                label={`${companies.filter(c => c.status === 'pending').length} Pending Approval`} 
                color="warning" 
                icon={<Notifications />}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage company registrations. Companies require admin approval before they can access the platform.
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Industry</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registered Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">No companies registered yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.id} sx={{ backgroundColor: company.status === 'pending' ? 'rgba(255, 152, 0, 0.08)' : 'transparent' }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={company.status === 'pending' ? 'bold' : 'normal'}>
                            {company.companyName || company.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.industry || 'N/A'}</TableCell>
                        <TableCell>{company.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={company.status || 'pending'} 
                            color={
                              company.status === 'active' ? 'success' : 
                              company.status === 'suspended' ? 'error' : 
                              company.status === 'rejected' ? 'error' :
                              'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {company.createdAt ? new Date(company.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {company.status === 'pending' && (
                            <>
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => approveUser(company.id)}
                                title="Approve Company"
                              >
                                <Check />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => rejectUser(company.id)}
                                title="Reject Company"
                              >
                                <Close />
                              </IconButton>
                            </>
                          )}
                          {company.status === 'active' && (
                            <Button 
                              size="small" 
                              color="warning"
                              variant="outlined"
                              onClick={() => updateDoc(doc(db, 'users', company.id), { status: 'suspended' }).then(() => { loadCompanies(); setSnackbarMessage('Company suspended successfully'); setSnackbarOpen(true); })}
                            >
                              Suspend
                            </Button>
                          )}
                          {company.status === 'suspended' && (
                            <Button 
                              size="small" 
                              color="success"
                              variant="outlined"
                              onClick={() => updateDoc(doc(db, 'users', company.id), { status: 'active' }).then(() => { loadCompanies(); setSnackbarMessage('Company reactivated successfully'); setSnackbarOpen(true); })}
                            >
                              Reactivate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                User Management
              </Typography>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 10).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'admin' ? 'error' :
                            user.role === 'institute' ? 'primary' :
                            user.role === 'company' ? 'success' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || 'pending'} 
                          color={user.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.status !== 'active' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => approveUser(user.id)}
                            >
                              <Check />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => rejectUser(user.id)}
                            >
                              <Close />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                System Reports
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Report />}
                onClick={() => setReportDialogOpen(true)}
              >
                Generate Report
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              View and generate comprehensive system reports and analytics.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={8}>
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

      {/* Institution Dialog */}
      <Dialog open={institutionDialogOpen} onClose={() => setInstitutionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInstitution ? 'Edit Institution' : 'Add New Institution'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institution Name"
                  value={institutionForm.name}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={institutionForm.type}
                    label="Type"
                    onChange={(e) => setInstitutionForm({ ...institutionForm, type: e.target.value })}
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
                  value={institutionForm.email}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={institutionForm.phone}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={institutionForm.address}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={institutionForm.website}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={institutionForm.description}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstitutionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleInstitutionSubmit} 
            variant="contained"
            disabled={!institutionForm.name || !institutionForm.email || !institutionForm.type}
          >
            {editingInstitution ? 'Update' : 'Add'} Institution
          </Button>
        </DialogActions>
      </Dialog>

      {/* Faculty Dialog */}
      <Dialog open={facultyDialogOpen} onClose={() => setFacultyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Institution</InputLabel>
                  <Select
                    value={facultyForm.institutionId}
                    label="Institution"
                    onChange={(e) => setFacultyForm({ ...facultyForm, institutionId: e.target.value })}
                  >
                    {institutions.map((inst) => (
                      <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Faculty Name"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Head of Faculty"
                  value={facultyForm.head}
                  onChange={(e) => setFacultyForm({ ...facultyForm, head: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={facultyForm.description}
                  onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Departments (comma-separated)"
                  value={facultyForm.departments}
                  onChange={(e) => setFacultyForm({ ...facultyForm, departments: e.target.value })}
                  helperText="e.g., Computer Science, Information Systems, Software Engineering"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFacultyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFacultySubmit} variant="contained">
            {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Institution</InputLabel>
                  <Select
                    value={courseForm.institutionId}
                    label="Institution"
                    onChange={(e) => setCourseForm({ ...courseForm, institutionId: e.target.value })}
                  >
                    {institutions.map((inst) => (
                      <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Faculty</InputLabel>
                  <Select
                    value={courseForm.facultyId}
                    label="Faculty"
                    onChange={(e) => setCourseForm({ ...courseForm, facultyId: e.target.value })}
                    disabled={!courseForm.institutionId}
                  >
                    {faculties
                      .filter(fac => fac.institutionId === courseForm.institutionId)
                      .map((fac) => (
                        <MenuItem key={fac.id} value={fac.id}>{fac.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={courseForm.level}
                    label="Level"
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                    <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                    <MenuItem value="Diploma">Diploma</MenuItem>
                    <MenuItem value="Certificate">Certificate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Credits"
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="e.g., 4 years"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Entry Requirements"
                  value={courseForm.requirements}
                  onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                  multiline
                  rows={2}
                  helperText="e.g., Minimum C in Mathematics, B in English"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCourseSubmit} variant="contained">
            {editingCourse ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admission Publishing Dialog */}
      <Dialog open={admissionDialogOpen} onClose={() => setAdmissionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Publish Admissions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to publish all pending admission decisions?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This action will:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Make admission decisions visible to students</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Send notifications to admitted students</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>• Mark all admissions as published</Typography>
          <Alert severity="info">
            {applications.filter(app => app.status === 'admitted' && !app.published).length} admission(s) will be published
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdmissionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePublishAdmissions} variant="contained" color="success">
            Publish Admissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate System Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This will generate a comprehensive report including:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Total users by role</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• Pending approvals</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>• System activity statistics</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>• Platform usage metrics</Typography>
          
          <Typography variant="body2" color="text.secondary">
            Report will be saved to the database with timestamp.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={generateReport} variant="contained">Generate Report</Button>
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
            Pending Approvals
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Pending Users ({users.filter(u => u.status === 'pending').length})
          </Typography>
          {users.filter(u => u.status === 'pending').length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(u => u.status === 'pending').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            approveUser(user.id);
                            setNotificationDialogOpen(false);
                          }}
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            rejectUser(user.id);
                            setNotificationDialogOpen(false);
                          }}
                        >
                          <Close />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 3 }}>No pending users</Typography>
          )}

          <Typography variant="h6" gutterBottom>
            Pending Companies ({companies.filter(c => c.status === 'pending').length})
          </Typography>
          {companies.filter(c => c.status === 'pending').length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Company</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Industry</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.filter(c => c.status === 'pending').map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            approveUser(company.id);
                            setNotificationDialogOpen(false);
                          }}
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            rejectUser(company.id);
                            setNotificationDialogOpen(false);
                          }}
                        >
                          <Close />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary">No pending companies</Typography>
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

export default AdminDashboard;