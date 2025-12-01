# Testing Guide - Email Verification & Company Approval

## Quick Test Scenarios

### Scenario 1: Student Registration with Email Verification

**Steps:**
1. Go to `/register`
2. Select "Student" role
3. Fill in registration form
4. Click "Register"
5. **Expected**: Success message "Please check your email to verify your account"
6. Check email inbox for verification link
7. Click verification link
8. Go to `/login`
9. Enter credentials
10. **Expected**: Login successful, redirects to `/dashboard`

**Without Email Verification:**
- Try logging in before clicking verification link
- **Expected**: Error "Please verify your email before logging in"
- **Expected**: "Resend Verification Email" button appears

### Scenario 2: Company Registration with Approval Workflow

**Steps:**
1. Go to `/register`
2. Select "Company" role
3. Fill in company information
4. Click "Register"
5. **Expected**: Success message "Please verify your email and wait for admin approval"
6. Check email and verify email address
7. Go to `/login` and try to login
8. **Expected**: Error "Your account is pending approval. Please wait for admin approval."
9. Login as admin (use demo admin account)
10. Navigate to "Company Management" tab
11. **Expected**: See company with "pending" status (orange highlight)
12. Click "Approve" (green checkmark icon)
13. **Expected**: Success message, status changes to "active"
14. Logout and login as company
15. **Expected**: Login successful, access granted

### Scenario 3: Admin Company Management

**Steps:**
1. Login as admin (admin@demo.com / demo123)
2. **Expected**: Notification badge shows pending approval count
3. Click "Company Management" tab
4. Review companies in table

**Test Actions:**

**A. Approve Pending Company:**
- Click green checkmark on pending company
- **Expected**: Status → "active"
- **Expected**: Company can now login

**B. Reject Company:**
- Click red X on pending company
- **Expected**: Status → "rejected"
- **Expected**: Company cannot login (error message)

**C. Suspend Active Company:**
- Click "Suspend" button on active company
- **Expected**: Status → "suspended"
- Try logging in as that company
- **Expected**: Error "Your account has been suspended"

**D. Reactivate Suspended Company:**
- Click "Reactivate" button on suspended company
- **Expected**: Status → "active"
- Try logging in as that company
- **Expected**: Login successful

### Scenario 4: Email Verification Resend

**Steps:**
1. Register any user type
2. Don't verify email
3. Try to login
4. **Expected**: Error message + "Resend Verification Email" button appears
5. Click "Resend Verification Email"
6. **Expected**: Toast notification "Verification email sent!"
7. Check email for new verification link

## Testing Checklist

### Email Verification
- [ ] Verification email sent on registration
- [ ] Cannot login without verified email
- [ ] Can login after email verification
- [ ] Resend verification button works
- [ ] Proper error messages displayed

### Company Approval
- [ ] Company status set to "pending" on registration
- [ ] Cannot login while pending
- [ ] Admin sees pending companies in dashboard
- [ ] Approve button changes status to "active"
- [ ] Can login after approval
- [ ] Reject button prevents login
- [ ] Suspend button blocks active companies
- [ ] Reactivate restores access

### Admin Dashboard
- [ ] Notification badge shows correct count
- [ ] Pending companies highlighted in table
- [ ] All company details displayed correctly
- [ ] Action buttons work properly
- [ ] Status chips show correct colors
- [ ] Success messages appear on actions

## Demo Accounts

Use these accounts for testing (from demo-accounts.md):

**Admin:**
- Email: admin@demo.com
- Password: demo123

**Student:**
- Email: student@demo.com
- Password: demo123

**Institute:**
- Email: institute@demo.com
- Password: demo123

**Company:**
- Email: company@demo.com
- Password: demo123

⚠️ **Note**: Existing demo accounts may not have email verification enabled. Create new accounts to test the verification flow.

## Expected Behavior Summary

| User Type | Email Verification | Admin Approval | Can Login After Verification |
|-----------|-------------------|----------------|------------------------------|
| Student   | Required          | Not Required   | Yes                          |
| Institute | Required          | Not Required   | Yes                          |
| Company   | Required          | Required       | Only after admin approves    |
| Admin     | Required          | Pre-approved   | Yes                          |

## Troubleshooting

### Issue: Not receiving verification emails
**Solution**: 
- Check spam folder
- Check Firebase Console → Authentication → Templates
- Ensure email provider is configured in Firebase

### Issue: Admin cannot see pending companies
**Solution**:
- Ensure companies are registered with 'company' role
- Check Firestore rules are deployed
- Refresh admin dashboard

### Issue: Company can login without approval
**Solution**:
- Check company status in Firestore (should be 'pending')
- Verify AuthContext login logic
- Clear browser cache and try again

### Issue: Email already verified but still blocked
**Solution**:
- Check user.emailVerified status in Firebase Authentication
- Check userData.emailVerified in Firestore
- May need to update Firestore manually

## Manual Testing Commands

### Check User Status in Browser Console:
```javascript
// Get current user
auth.currentUser

// Check email verification
auth.currentUser.emailVerified

// Get user data from Firestore
db.collection('users').doc(auth.currentUser.uid).get()
```

### Firebase CLI Commands:
```bash
# Deploy rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log

# Check hosting
firebase hosting:sites:list
```

## Automated Testing Script (Optional)

Create test accounts programmatically:
```javascript
// Test script to create accounts
const testUsers = [
  { email: 'teststudent@test.com', role: 'student' },
  { email: 'testcompany@test.com', role: 'company' },
  { email: 'testinstitute@test.com', role: 'institute' }
];

// Register each and verify behavior
```

## Success Criteria

✅ All registration types send verification email
✅ Login blocked without email verification
✅ Companies require admin approval
✅ Admin can approve/reject/suspend companies
✅ Proper error messages for all scenarios
✅ Status changes reflected immediately
✅ Security rules prevent unauthorized access
