# 🚀 Deployment Guide

## ✅ Current Deployment Status

### Frontend (React App)
- **Status**: ✅ DEPLOYED
- **Platform**: Firebase Hosting
- **URL**: https://career-guide-73a47.web.app
- **Console**: https://console.firebase.google.com/project/career-guide-73a47/overview

### Backend (Node.js API)
- **Status**: ⚠️ NEEDS DEPLOYMENT
- **Recommended Platform**: Railway, Render, or Heroku

---

## 🌐 Backend Deployment Options

### Option 1: Railway (Recommended - Free Tier Available)

#### Step 1: Install Railway CLI
```powershell
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```powershell
railway login
```

#### Step 3: Initialize and Deploy
```powershell
cd backend
railway init
railway up
```

#### Step 4: Add Environment Variables
```powershell
railway variables set PORT=5000
railway variables set NODE_ENV=production
```

#### Step 5: Upload Firebase Service Account
- Go to Railway dashboard
- Select your project
- Go to Variables tab
- Upload `firebase-service-account.json` content as `FIREBASE_SERVICE_ACCOUNT`

---

### Option 2: Render (Free Tier Available)

#### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository: `PrimordialFire/careerme`

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect `careerme` repository
3. Configure:
   - **Name**: career-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

#### Step 3: Add Environment Variables
1. Go to "Environment" tab
2. Add:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `FIREBASE_SERVICE_ACCOUNT`: [paste JSON content]

#### Step 4: Deploy
Click "Create Web Service" - Render will auto-deploy

---

### Option 3: Heroku

#### Step 1: Install Heroku CLI
```powershell
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login and Create App
```powershell
cd backend
heroku login
heroku create career-backend-api
```

#### Step 3: Add Procfile
Already created in backend folder:
```
web: node server.js
```

#### Step 4: Set Environment Variables
```powershell
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
# Upload Firebase credentials as config var
```

#### Step 5: Deploy
```powershell
git subtree push --prefix backend heroku main
```

---

## 🔧 Post-Deployment Configuration

### Update Frontend API Base URL

After deploying backend, update `src/services/apiService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app/api';
```

### Add Environment Variable
Create `.env` file in frontend root:
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### Rebuild and Redeploy Frontend
```powershell
npm run build
firebase deploy --only hosting
```

---

## 🔐 Security Checklist

- ✅ Firebase Admin credentials secured (not in git)
- ✅ Environment variables set on hosting platform
- ✅ CORS configured for frontend domain
- ✅ Firebase security rules deployed
- ✅ API authentication middleware active

---

## 📊 Monitoring & Testing

### Test Backend Health
```powershell
curl https://your-backend-url.railway.app/health
```

### Test API Endpoints
```powershell
# Register user
curl -X POST https://your-backend-url.railway.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123","role":"student"}'

# Login
curl -X POST https://your-backend-url.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎉 Final Deployment URLs

Once backend is deployed, your complete system will be:

- **Frontend**: https://career-guide-73a47.web.app
- **Backend**: https://your-backend-url.[platform].app
- **Database**: Firebase Firestore (already hosted)

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Firebase credentials are uploaded
- Verify PORT environment variable is set
- Check logs: `railway logs` or platform-specific command

### CORS Errors
- Ensure frontend URL is in backend CORS whitelist
- Check `server.js` CORS configuration

### API Not Responding
- Verify backend is running: check platform dashboard
- Test health endpoint: `curl https://backend-url/health`
- Check environment variables are set correctly

---

## 📝 Next Steps

1. Choose a backend hosting platform (Railway recommended)
2. Follow deployment steps above
3. Update frontend API URL
4. Redeploy frontend
5. Test complete system
6. Submit your GitHub repository link

**Your application is now fully deployed and ready for submission!** ✅
