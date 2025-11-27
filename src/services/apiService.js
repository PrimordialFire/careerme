// API Service for connecting React frontend to Node.js backend
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get authentication header
const getAuthHeader = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth header:', error);
    throw error;
  }
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API Service
export const apiService = {
  // Authentication
  auth: {
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    },
    
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return response.json();
    },
    
    getCurrentUser: async () => {
      return apiRequest('/auth/me');
    }
  },

  // Users
  users: {
    getAll: async (role = null) => {
      const query = role ? `?role=${role}` : '';
      return apiRequest(`/users${query}`);
    },
    
    getById: async (id) => {
      return apiRequest(`/users/${id}`);
    },
    
    update: async (id, userData) => {
      return apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },
    
    uploadDocument: async (documentData) => {
      return apiRequest('/users/documents', {
        method: 'POST',
        body: JSON.stringify(documentData)
      });
    },
    
    getDocuments: async (userId) => {
      return apiRequest(`/users/${userId}/documents`);
    }
  },

  // Institutions
  institutions: {
    getAll: async () => {
      return apiRequest('/institutions');
    },
    
    getById: async (id) => {
      return apiRequest(`/institutions/${id}`);
    },
    
    create: async (institutionData) => {
      return apiRequest('/institutions', {
        method: 'POST',
        body: JSON.stringify(institutionData)
      });
    },
    
    update: async (id, institutionData) => {
      return apiRequest(`/institutions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(institutionData)
      });
    },
    
    delete: async (id) => {
      return apiRequest(`/institutions/${id}`, {
        method: 'DELETE'
      });
    },
    
    getFaculties: async (id) => {
      return apiRequest(`/institutions/${id}/faculties`);
    },
    
    addFaculty: async (institutionId, facultyData) => {
      return apiRequest(`/institutions/${institutionId}/faculties`, {
        method: 'POST',
        body: JSON.stringify(facultyData)
      });
    },
    
    updateFaculty: async (institutionId, facultyId, facultyData) => {
      return apiRequest(`/institutions/${institutionId}/faculties/${facultyId}`, {
        method: 'PUT',
        body: JSON.stringify(facultyData)
      });
    },
    
    deleteFaculty: async (institutionId, facultyId) => {
      return apiRequest(`/institutions/${institutionId}/faculties/${facultyId}`, {
        method: 'DELETE'
      });
    }
  },

  // Courses
  courses: {
    getAll: async () => {
      return apiRequest('/courses');
    },
    
    getById: async (id) => {
      return apiRequest(`/courses/${id}`);
    },
    
    getByInstitution: async (institutionId) => {
      return apiRequest(`/courses/institution/${institutionId}`);
    },
    
    create: async (courseData) => {
      return apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
    },
    
    update: async (id, courseData) => {
      return apiRequest(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
      });
    },
    
    delete: async (id) => {
      return apiRequest(`/courses/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Applications
  applications: {
    getAll: async () => {
      return apiRequest('/applications');
    },
    
    getById: async (id) => {
      return apiRequest(`/applications/${id}`);
    },
    
    submit: async (applicationData) => {
      return apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData)
      });
    },
    
    updateStatus: async (id, status) => {
      return apiRequest(`/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    
    selectInstitution: async (selectedApplicationId) => {
      return apiRequest('/applications/select-institution', {
        method: 'POST',
        body: JSON.stringify({ selectedApplicationId })
      });
    }
  },

  // Jobs
  jobs: {
    getAll: async () => {
      return apiRequest('/jobs');
    },
    
    getById: async (id) => {
      return apiRequest(`/jobs/${id}`);
    },
    
    create: async (jobData) => {
      return apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
    },
    
    update: async (id, jobData) => {
      return apiRequest(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData)
      });
    },
    
    delete: async (id) => {
      return apiRequest(`/jobs/${id}`, {
        method: 'DELETE'
      });
    },
    
    getCandidates: async (id) => {
      return apiRequest(`/jobs/${id}/candidates`);
    },
    
    apply: async (id, applicationData = {}) => {
      return apiRequest(`/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify(applicationData)
      });
    }
  },

  // Admin
  admin: {
    getStats: async () => {
      return apiRequest('/admin/stats');
    },
    
    updateCompanyStatus: async (id, status) => {
      return apiRequest(`/admin/companies/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    
    getReports: async () => {
      return apiRequest('/admin/reports');
    },
    
    publishAdmissions: async (institutionId, courses) => {
      return apiRequest('/admin/admissions/publish', {
        method: 'POST',
        body: JSON.stringify({ institutionId, courses })
      });
    }
  }
};

export default apiService;
