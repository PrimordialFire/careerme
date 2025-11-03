# Career Guidance and Employment Integration Platform

A comprehensive web application for connecting students, educational institutions, and employers in Lesotho. Built with React.js, Firebase, and Material-UI.

## 📋 Project Overview

This platform facilitates:
- **Students**: Discover institutions, apply for courses, and find job opportunities
- **Institutions**: Manage courses, review applications, and publish admissions
- **Companies**: Post jobs and connect with qualified graduates
- **Administrators**: Oversee the entire platform ecosystem

## 🚀 Features

### Student Module
- Browse higher learning institutions and courses
- Apply for up to 2 courses per institution
- View admission results and manage applications
- Upload transcripts and certificates
- Receive job notifications matching qualifications
- Apply for job opportunities

### Institution Module
- Manage faculties and courses
- Review and process student applications
- Publish admission results
- Track student enrollment
- Update institution profile

### Company Module
- Post job opportunities with specific requirements
- View automatically filtered qualified candidates
- Manage recruitment pipeline
- Connect with graduates based on:
  - Academic performance
  - Extra certificates
  - Work experience
  - Job relevance

### Admin Module
- Manage institutions and companies
- Approve/suspend user accounts
- Generate system reports
- Monitor platform activities
- System configuration

## 🛠️ Technology Stack

- **Frontend**: React.js 19.2.0
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Framework**: Material-UI (@mui/material)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **State Management**: React Context API
- **Notifications**: React Toastify
- **Hosting**: Firebase Hosting / Vercel

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### 1. Clone & Install Dependencies
```bash
git clone [your-repository-url]
cd career
npm install
```

### 2. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Hosting

#### Step 2: Configure Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Configure email verification settings

#### Step 3: Setup Firestore Database
1. Create Firestore database in production mode
2. Set up the following collections:

```javascript
// Firestore Collections Structure

// users collection
{
  uid: "string",
  email: "string",
  name: "string",
  role: "admin|institute|student|company",
  status: "active|pending|suspended",
  createdAt: "timestamp",
  emailVerified: "boolean",
  // Role-specific fields...
}

// institutions collection
{
  name: "string",
  type: "university|college|technical|vocational",
  address: "string",
  website: "string",
  status: "active|inactive",
  createdAt: "timestamp"
}

// courses collection
{
  institutionId: "string",
  name: "string",
  faculty: "string",
  duration: "string",
  requirements: {
    minimumGrade: "number",
    requiredSubjects: ["string"],
    minimumAge: "number"
  },
  status: "active|inactive"
}

// applications collection
{
  studentId: "string",
  institutionId: "string",
  courseId: "string",
  status: "pending|accepted|rejected|waiting",
  createdAt: "timestamp",
  documents: ["string"]
}

// jobs collection
{
  companyId: "string",
  title: "string",
  description: "string",
  requirements: {
    minimumGPA: "number",
    fieldOfStudy: ["string"],
    skills: ["string"],
    experience: "number"
  },
  status: "active|closed"
}
```

#### Step 4: Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all user data
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read access to institutions and courses
    match /institutions/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /courses/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Applications - students can create, institutions/admins can read/update
    match /applications/{document} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'institute']
      );
    }
    
    // Jobs - public read, companies can write their own
    match /jobs/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        resource.data.companyId == request.auth.uid;
    }
  }
}
```

#### Step 5: Update Firebase Configuration
1. In Firebase Console → Project Settings → General
2. Copy your Firebase configuration
3. Update `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Environment Variables
Create `.env` file in root directory:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
cd career
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Build for Production
```bash
npm run build
```

## 🚀 Deployment

### Deploy to Firebase Hosting
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

### Deploy to Vercel
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

## 📁 Project Structure

```
career/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminDashboard.js
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Common/
│   │   │   ├── Landing.js
│   │   │   └── ProtectedRoute.js
│   │   ├── Company/
│   │   │   └── CompanyDashboard.js
│   │   ├── Institute/
│   │   │   └── InstituteDashboard.js
│   │   └── Student/
│   │       └── StudentDashboard.js
│   ├── config/
│   │   └── firebase.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── firebaseService.js
│   ├── utils/
│   │   └── validation.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🎯 Business Logic Implementation

### Key Features Implemented:
- ✅ Multi-role authentication system
- ✅ Protected routes by user role
- ✅ Responsive Material-UI interface
- ✅ Firebase integration setup
- ✅ Application validation rules
- ✅ Job matching algorithm
- ✅ Automatic candidate filtering

### Validation Rules:
- Students can apply for maximum 2 courses per institution
- Qualification requirements are checked before applications
- Only qualified students receive job notifications
- Multiple admission handling with waiting list promotion

## 🔧 Development Guidelines

### Adding New Features:
1. Create component in appropriate module folder
2. Add route in App.js
3. Update Firebase service functions
4. Add validation rules in utils/validation.js
5. Test with different user roles

### Code Style:
- Use functional components with hooks
- Follow Material-UI design patterns
- Implement proper error handling
- Add loading states for async operations

## 🧪 Testing

### Running Tests:
```bash
npm test
```

### Test Coverage:
- Authentication flows
- Route protection
- Form validations
- Firebase operations

## 📝 Documentation

### API Documentation:
- Firebase services are documented in `src/services/`
- Validation utilities in `src/utils/`
- Component props documented in JSDoc format

### User Guides:
- Student registration and application process
- Institution course management
- Company job posting procedures
- Admin system management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Group Size**: 3 students per group
- **Submission**: GitHub repository link via Google Classroom
- **Course**: B/DIWA2110 Web Application Development

## 🆘 Troubleshooting

### Common Issues:
1. **Firebase connection errors**: Check configuration in firebase.js
2. **Authentication issues**: Verify email verification is enabled
3. **Route problems**: Ensure user role is properly set
4. **Build errors**: Clear node_modules and reinstall dependencies

### Support:
For technical issues, check the Firebase documentation or create an issue in the repository.

---

**Note**: Remember to replace placeholder Firebase configuration with your actual project credentials before deployment.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
