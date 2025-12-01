# Career Guidance Platform - Backend API

Node.js/Express backend server for the Career Guidance and Employment Integration Platform.

## 📁 Project Structure

```
backend/
├── server.js                 # Main server entry point
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── config/
│   └── firebase.js          # Firebase Admin SDK configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── institutionController.js
│   ├── courseController.js
│   ├── applicationController.js
│   ├── jobController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js
│   ├── institutionRoutes.js
│   ├── courseRoutes.js
│   ├── applicationRoutes.js
│   ├── jobRoutes.js
│   └── adminRoutes.js
└── middleware/
    ├── authMiddleware.js    # JWT verification & role checks
    └── validationMiddleware.js
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Firebase Admin Setup

Download your Firebase Admin SDK service account key:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-service-account.json` in the `backend` folder

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```powershell
cp .env.example .env
```

Update `.env` with your values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 4. Start the Server

**Development mode (with auto-reload):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Send verification email
- `GET /api/auth/me` - Get current user

### Users (`/api/users`)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/documents` - Upload document (Student only)
- `GET /api/users/:id/documents` - Get user documents

### Institutions (`/api/institutions`)
- `GET /api/institutions` - Get all institutions
- `GET /api/institutions/:id` - Get institution by ID
- `POST /api/institutions` - Create institution (Admin only)
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution (Admin only)
- `GET /api/institutions/:id/faculties` - Get faculties
- `POST /api/institutions/:id/faculties` - Add faculty
- `PUT /api/institutions/:institutionId/faculties/:facultyId` - Update faculty
- `DELETE /api/institutions/:institutionId/faculties/:facultyId` - Delete faculty

### Courses (`/api/courses`)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/institution/:institutionId` - Get courses by institution
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Applications (`/api/applications`)
- `GET /api/applications` - Get applications (filtered by role)
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit application (Student only)
- `PUT /api/applications/:id/status` - Update application status
- `POST /api/applications/select-institution` - Select institution

### Jobs (`/api/jobs`)
- `GET /api/jobs` - Get jobs (filtered for students)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Company only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/candidates` - Get qualified candidates
- `POST /api/jobs/:id/apply` - Apply for job (Student only)

### Admin (`/api/admin`)
- `GET /api/admin/stats` - Get dashboard statistics
- `PUT /api/admin/companies/:id/status` - Update company status
- `GET /api/admin/reports` - Get system reports
- `POST /api/admin/admissions/publish` - Publish admissions

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The frontend should obtain this token from Firebase Authentication and include it in API requests.

## 🛡️ Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Institute**: Manage own institution, faculties, courses, and applications
- **Student**: Apply for courses, view jobs, upload documents
- **Company**: Post jobs, view qualified candidates

## 🧪 Testing the API

### Health Check
```powershell
curl http://localhost:5000/health
```

### Example: Register User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "student",
    "phone": "+266 5000 0000",
    "address": "Maseru, Lesotho"
  }'
```

## 📦 Dependencies

- **express**: Web framework
- **firebase-admin**: Firebase Admin SDK
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-validator**: Request validation
- **dotenv**: Environment variables
- **compression**: Response compression
- **body-parser**: Request body parsing

## 🔄 Connecting Frontend

Update your React frontend to use the backend API instead of direct Firebase calls. Create an API service:

```javascript
// src/services/apiService.js
import { getAuth } from 'firebase/auth';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const apiService = {
  async get(endpoint) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    return response.json();
  },
  
  async post(endpoint, data) {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Add PUT, DELETE methods similarly
};
```

## 🌐 Deployment

### Prerequisites
- Node.js 16+ installed on server
- Firebase Admin SDK credentials
- Port 5000 open (or configure different port)

### Deploy to Cloud Platform

**Heroku:**
```powershell
heroku create career-guidance-api
heroku config:set NODE_ENV=production
git push heroku main
```

**AWS/DigitalOcean:**
- Use PM2 for process management
- Set up nginx as reverse proxy
- Configure SSL certificates

## 📝 Notes

- Firebase service account file should never be committed to version control
- Always use environment variables for sensitive data
- Enable CORS only for trusted frontend domains in production
- Implement rate limiting for production deployment
- Add request logging and monitoring

## 🐛 Troubleshooting

**Firebase Admin initialization fails:**
- Verify `firebase-service-account.json` exists and is valid
- Check file permissions
- Ensure Firebase project ID matches

**CORS errors:**
- Update `FRONTEND_URL` in `.env`
- Check frontend is running on correct port

**Authentication errors:**
- Verify Firebase ID token is valid
- Check token is included in Authorization header
- Ensure user exists in Firestore

## 📞 Support

For issues or questions, refer to:
- [Express.js Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- Project documentation in parent folder
