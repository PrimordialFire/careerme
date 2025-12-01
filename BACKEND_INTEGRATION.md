# Backend Integration Guide

## Overview

This guide explains how to integrate the Node.js backend with your existing React frontend.

## Architecture

```
Frontend (React)  →  Backend API (Node.js/Express)  →  Firebase (Firestore)
     Port 3000              Port 5000                    Cloud Database
```

## Quick Start

### 1. Setup Backend

Run the setup script:

```powershell
.\setup-backend.ps1
```

Or manually:

```powershell
cd backend
npm install
cp .env.example .env
```

### 2. Configure Firebase Admin

Download your Firebase Admin SDK service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `backend/firebase-service-account.json`

### 3. Update Environment Variables

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 4. Start Backend Server

```powershell
cd backend
npm run dev
```

Server will start on `http://localhost:5000`

### 5. Update Frontend Configuration

Add to your `career/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Using the API Service

### Import and Use

The API service (`src/services/apiService.js`) provides methods for all backend endpoints:

```javascript
import { apiService } from '../services/apiService';

// Example: Get all institutions
const institutions = await apiService.institutions.getAll();

// Example: Submit application
await apiService.applications.submit({
  institutionId: 'inst123',
  courseId: 'course456',
  course: 'Computer Science',
  level: 'Undergraduate',
  previousEducation: 'High School'
});
```

### Migration Strategy

You can migrate your components gradually:

#### Option 1: Keep Direct Firebase (Current)
No changes needed. Your app works as is.

#### Option 2: Hybrid Approach
Use backend API for new features, keep Firebase for existing ones.

#### Option 3: Full Migration (Recommended)
Replace all Firebase calls with API calls for better security and control.

## Example Migration

### Before (Direct Firebase):

```javascript
// StudentDashboard.js - OLD
const loadInstitutions = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  const instList = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(user => user.role === 'institute');
  setInstitutions(instList);
};
```

### After (Using Backend API):

```javascript
// StudentDashboard.js - NEW
import { apiService } from '../../services/apiService';

const loadInstitutions = async () => {
  try {
    const instList = await apiService.institutions.getAll();
    setInstitutions(instList);
  } catch (error) {
    console.error('Error loading institutions:', error);
    setSnackbarMessage('Failed to load institutions');
    setSnackbarOpen(true);
  }
};
```

## Key Benefits

### 1. **Security**
- Firebase Admin SDK credentials never exposed to frontend
- Server-side validation and business logic
- Role-based access control enforced on backend

### 2. **Performance**
- Backend can cache frequently requested data
- Complex queries processed server-side
- Reduced client-side bundle size

### 3. **Maintainability**
- Centralized business logic
- Easier to test and debug
- API versioning support

### 4. **Scalability**
- Add background jobs (email notifications, reports)
- Integrate third-party services (payment, SMS)
- Implement rate limiting and monitoring

## API Endpoints Reference

### Authentication
```javascript
// Register
await apiService.auth.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  role: 'student'
});

// Get current user
const user = await apiService.auth.getCurrentUser();
```

### Institutions
```javascript
// Get all institutions
const institutions = await apiService.institutions.getAll();

// Create institution (admin only)
await apiService.institutions.create({
  name: 'National University of Lesotho',
  email: 'info@nul.ac.ls',
  type: 'University'
});

// Add faculty
await apiService.institutions.addFaculty(institutionId, {
  name: 'Faculty of Science',
  description: 'Natural and Applied Sciences'
});
```

### Courses
```javascript
// Get courses by institution
const courses = await apiService.courses.getByInstitution(institutionId);

// Create course
await apiService.courses.create({
  name: 'Computer Science',
  code: 'CS101',
  institutionId: 'inst123',
  facultyId: 'fac456',
  level: 'Undergraduate'
});
```

### Applications
```javascript
// Submit application
await apiService.applications.submit({
  institutionId: 'inst123',
  courseId: 'course456',
  course: 'Computer Science',
  level: 'Undergraduate',
  previousEducation: 'High School'
});

// Update status (institute/admin)
await apiService.applications.updateStatus(appId, 'admitted');

// Select institution (student with multiple admissions)
await apiService.applications.selectInstitution(selectedAppId);
```

### Jobs
```javascript
// Get qualified jobs (auto-filtered for students)
const jobs = await apiService.jobs.getAll();

// Post job (company)
await apiService.jobs.create({
  title: 'Software Developer',
  description: 'Full stack development position',
  requirements: {
    minimumGPA: 3.0,
    fieldOfStudy: ['Computer Science', 'Software Engineering'],
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: 1
  },
  location: 'Maseru',
  salary: 'Competitive'
});

// Get qualified candidates (company)
const candidates = await apiService.jobs.getCandidates(jobId);

// Apply for job (student)
await apiService.jobs.apply(jobId);
```

### Admin
```javascript
// Get dashboard statistics
const stats = await apiService.admin.getStats();

// Approve/suspend company
await apiService.admin.updateCompanyStatus(companyId, 'active');

// Get system reports
const reports = await apiService.admin.getReports();
```

## Error Handling

The API service automatically handles authentication and common errors:

```javascript
try {
  const result = await apiService.applications.submit(data);
  setSnackbarMessage('Application submitted successfully');
} catch (error) {
  // Error is automatically logged
  setSnackbarMessage(error.message || 'Operation failed');
  setSnackbarOpen(true);
}
```

## Testing

### Test Backend Endpoints

```powershell
# Health check
curl http://localhost:5000/health

# Register user (no auth required)
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }'
```

### Test with Frontend

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd career && npm start`
3. Login and test features
4. Check browser console for API calls
5. Check backend terminal for request logs

## Deployment

### Backend Deployment

**Option 1: Heroku**
```powershell
cd backend
heroku create career-guidance-api
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com
# Upload Firebase credentials as config var
heroku config:set FIREBASE_CONFIG="$(cat firebase-service-account.json)"
git push heroku main
```

**Option 2: Railway/Render**
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

**Option 3: AWS EC2/DigitalOcean**
- Install Node.js on server
- Use PM2 for process management
- Configure nginx as reverse proxy
- Set up SSL with Let's Encrypt

### Frontend Deployment

Update `REACT_APP_API_URL` in production:

```env
# Production .env
REACT_APP_API_URL=https://your-backend-api.com/api
```

## Troubleshooting

### Backend won't start
- Check `firebase-service-account.json` exists
- Verify `.env` configuration
- Check port 5000 is available
- Review console errors

### CORS errors
- Update `FRONTEND_URL` in backend `.env`
- Restart backend server
- Clear browser cache

### Authentication fails
- Verify Firebase token is valid
- Check Authorization header format
- Ensure user exists in Firestore
- Check Firebase Admin SDK initialization

### API returns 403 Forbidden
- Verify user role in Firestore
- Check endpoint requires correct role
- Ensure token hasn't expired

## Best Practices

1. **Always use environment variables** for sensitive data
2. **Implement proper error handling** in components
3. **Add loading states** during API calls
4. **Cache responses** when appropriate
5. **Use API service** instead of direct fetch calls
6. **Log errors** for debugging
7. **Test endpoints** before deploying

## Next Steps

1. ✅ Backend API created and documented
2. ⏭️ Install backend dependencies
3. ⏭️ Configure Firebase Admin credentials
4. ⏭️ Start backend server
5. ⏭️ Test API endpoints
6. ⏭️ Optionally migrate frontend to use API
7. ⏭️ Deploy both frontend and backend

## Support

- Backend README: `backend/README.md`
- API Documentation: See endpoint reference above
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Express.js Docs: https://expressjs.com/
