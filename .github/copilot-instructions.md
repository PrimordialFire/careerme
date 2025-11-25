# Career Guidance Platform - AI Coding Agent Instructions

## Architecture Overview

This is a **React + Firebase** multi-tenant career guidance platform connecting students, educational institutions, companies, and administrators in Lesotho. The architecture follows a role-based dashboard pattern with Firebase as the backend.

### Core User Roles
- `admin` - Platform oversight, user management, system reports
- `institute` - Manage faculties, courses, review/process applications
- `student` - Browse institutions, apply to courses (max 2 per institution), job matching
- `company` - Post jobs, view auto-filtered qualified candidates

Role-based routing and data access are enforced via `AuthContext` and Firestore security rules.

## Critical Data Flows

### Application Lifecycle (Key Business Rules)

**Student Application Rules:**
1. **2-Course Limit**: Students can apply to **maximum 2 courses per institution**
2. **Qualification Validation**: Students can ONLY apply for courses they qualify for based on education level:
   - Undergraduate: Requires High School/Secondary/O-Level/A-Level
   - Masters: Requires Bachelor/Undergraduate/Degree
   - PhD: Requires Masters/Graduate
3. **No Duplicate Applications**: Students cannot apply twice for the same course at same institution

**Institution Admission Rules:**
1. **Single Program per Institution**: Institutions cannot admit the same student to multiple programs at their institution
2. **Waiting List System**: Institutions can place students on waiting list (status: 'waiting')
3. **Validation Check**: Before admitting, system checks if student already admitted to another course at same institution

**Multiple Admission Handling:**
When a student is admitted to multiple institutions:
1. Student MUST select one institution to confirm (forced choice dialog)
2. Upon selection:
   - Selected application → marked as 'confirmed'
   - Other admissions → auto-declined (status: 'declined')
   - **Automatic Promotion**: First student from waiting list promoted to 'admitted' for each declined spot
3. Logic: `handleInstitutionSelection()` in StudentDashboard.js, `waitingListService.promoteFromWaitingList()` in firebaseService.js

### Job Matching Algorithm
**Automatic Qualification Filtering**: Students only see jobs they qualify for
- Uses `matchJobsToStudent()` from `src/utils/validation.js`
- **60% threshold** for qualification score (jobs below 60% hidden)
- Weighted scoring: GPA (40%), Certifications (30%), Experience (20%), Skills (10%)
- Job dialog shows match percentage and match reasons
- Empty state message explains jobs are filtered by qualifications

## Firebase Integration

### Collections Structure
```
users/ - uid, email, name, role, status (all roles share this)
institutions/ - name, type, address, status
courses/ - institutionId, name, faculty, requirements
faculties/ - instituteId, name, description
applications/ - studentId, institutionId, courseId, status (pending|admitted|rejected|waiting|declined|confirmed)
  - pending: Initial application state
  - admitted: Accepted by institution
  - waiting: On waiting list
  - declined: Student declined this admission (chose another institution)
  - confirmed: Student confirmed this admission (when choosing from multiple)
  - rejected: Institution rejected application
jobs/ - companyId, title, requirements (minimumGPA, fieldOfStudy, skills, experience)
documents/ - studentId, type, name (transcript/certificates)
```

### Authentication Pattern
- Registration: `AuthContext.register(email, password, userData, role)` → creates user + Firestore doc
- **Email verification enabled**: users must verify email before login (sendEmailVerification)
- **Company approval required**: companies set to 'pending' status, require admin approval before access
- Login: checks email verification → checks account status → redirects to role-specific dashboard
- Account statuses: 'active' (can login), 'pending' (awaiting approval), 'suspended' (blocked), 'rejected' (denied)

### Firestore Security Rules (`firestore.rules`)
- Users read/write their own docs
- Admins can update any user's status/role (approval workflow)
- Courses/Faculties: institutes manage their own (filter by `instituteId == request.auth.uid`)
- Applications: students create, both student & institution can read/update
- Jobs: public read, companies manage their own (`companyId == request.auth.uid`)
- Reports: admin-only access (read/write restricted to admin role)

## Component Patterns

### Dashboard Components
Each role has a `<RoleDashboard>` component (e.g., `StudentDashboard.js`) with:
- Material-UI `Tabs` for navigation (common pattern across all dashboards)
- `TabPanel` wrapper component for content
- Dialog-based forms for create/edit operations
- Snackbar notifications via react-toastify

Example pattern from `StudentDashboard.js`:
```javascript
const [activeTab, setActiveTab] = useState(0);
const [institutionDialogOpen, setInstitutionDialogOpen] = useState(false);
// ... multiple dialog state variables for modals
```

### Protected Routes
`src/components/Common/ProtectedRoute.js`:
```javascript
<ProtectedRoute requiredRole={USER_ROLES.INSTITUTE}>
  <InstituteDashboard />
</ProtectedRoute>
```
Shows loading spinner while checking auth, redirects to `/login` if unauthenticated, to `/dashboard` if wrong role.

### Service Layer
`src/services/firebaseService.js` - organized by domain:
- `userService` - getUser, updateUserProfile, getUsersByRole
- `institutionService` - CRUD operations
- `courseService` - getCoursesByInstitution, getAllCourses
- `applicationService` - (implied pattern, follow existing structure)

## Development Workflow

### Running Locally
```powershell
npm start  # Starts dev server on localhost:3000
```

### Testing with Demo Accounts
See `demo-accounts.md`:
- Admin: admin@demo.com / demo123
- Institute: institute@demo.com / demo123  
- Student: student@demo.com / demo123
- Company: company@demo.com / demo123

### Deployment
```powershell
npm run build
firebase deploy  # Deploys to Firebase Hosting
```
Current production: https://career-guide-73a47.web.app/

## Project-Specific Conventions

1. **No TypeScript** - Pure JavaScript React (CRA v5)
2. **Material-UI v7** - Use `@mui/material` for all UI components
3. **Form State** - Local state with controlled inputs (no form libraries except react-hook-form in package.json but not actively used in codebase)
4. **Error Handling** - Toast notifications via `react-toastify` (not console.error for user-facing errors)
5. **Firestore Queries** - Always filter by user ID for role-specific data:
   ```javascript
   query(collection(db, 'courses'), where('instituteId', '==', currentUser.uid))
   ```
6. **Date Handling** - Use `new Date()` directly, format with `formatDate()` utility
7. **Loading States** - Material-UI `CircularProgress` in centered Box

## Common Pitfalls

- **Firestore Rules**: When adding new collections, update `firestore.rules` with appropriate access controls
- **Role Validation**: Always check `userRole` from `useAuth()` before rendering role-specific content
- **Application Limits**: Enforce 2-course-per-institution limit client-side AND in validation logic
- **Firebase Config**: Never commit real credentials (already exposed in `src/config/firebase.js` - consider env vars for new deployments)
- **Async Operations**: Use try-catch with toast.error() for Firebase operations

## Key Files Reference

- `src/context/AuthContext.js` - Auth state, login/register/logout, USER_ROLES constant
- `src/utils/validation.js` - Business logic for applications, job matching, file uploads
- `src/services/firebaseService.js` - Firebase CRUD operations by domain
- `src/App.js` - Route definitions, theme configuration, role-based navigation
- `firestore.rules` - Security rules (must match client-side patterns)

## When Adding Features

1. **New User Action**: Add to appropriate `<RoleDashboard>` component as new Tab or Dialog
2. **New Collection**: Update `firestore.rules` + create service in `firebaseService.js`
3. **Business Logic**: Add validation functions to `src/utils/validation.js`
4. **Navigation**: Update `App.js` Routes if adding new pages beyond dashboards
