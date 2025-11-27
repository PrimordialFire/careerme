# Backend Deployment Script
# This script helps you deploy the backend to various platforms

Write-Host "`n=== BACKEND DEPLOYMENT WIZARD ===" -ForegroundColor Cyan
Write-Host "`nYour backend is ready to deploy. Choose a platform:`n"

Write-Host "1. Render (Recommended - Free, Easy)" -ForegroundColor Green
Write-Host "   - Free tier available"
Write-Host "   - Auto-deploys from GitHub"
Write-Host "   - Simple web interface"
Write-Host ""
Write-Host "2. Railway (Developer Friendly)" -ForegroundColor Yellow
Write-Host "   - Free tier available"
Write-Host "   - CLI deployment"
Write-Host "   - GitHub integration"
Write-Host ""
Write-Host "3. Heroku (Classic Option)" -ForegroundColor Blue
Write-Host "   - Established platform"
Write-Host "   - Free tier available"
Write-Host "   - CLI deployment"
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n=== RENDER DEPLOYMENT ===" -ForegroundColor Green
        Write-Host "`nSteps to deploy on Render:"
        Write-Host "1. Go to https://render.com" -ForegroundColor White
        Write-Host "2. Sign up with GitHub" -ForegroundColor White
        Write-Host "3. Click 'New +' -> 'Web Service'" -ForegroundColor White
        Write-Host "4. Connect repository: PrimordialFire/careerme" -ForegroundColor White
        Write-Host "5. Configure:" -ForegroundColor White
        Write-Host "   - Name: career-backend" -ForegroundColor Cyan
        Write-Host "   - Root Directory: backend" -ForegroundColor Cyan
        Write-Host "   - Environment: Node" -ForegroundColor Cyan
        Write-Host "   - Build Command: npm install" -ForegroundColor Cyan
        Write-Host "   - Start Command: npm start" -ForegroundColor Cyan
        Write-Host "   - Instance Type: Free" -ForegroundColor Cyan
        Write-Host "6. Add Environment Variable:" -ForegroundColor White
        Write-Host "   - Key: NODE_ENV, Value: production" -ForegroundColor Cyan
        Write-Host "   - Key: PORT, Value: 5000" -ForegroundColor Cyan
        Write-Host "7. Click 'Create Web Service'" -ForegroundColor White
        Write-Host "`nOpening Render in browser..." -ForegroundColor Yellow
        Start-Process "https://render.com"
    }
    "2" {
        Write-Host "`n=== RAILWAY DEPLOYMENT ===" -ForegroundColor Yellow
        Write-Host "`nInstalling Railway CLI..."
        npm install -g @railway/cli
        
        Write-Host "`nSteps to deploy on Railway:" -ForegroundColor White
        Write-Host "1. Run: railway login" -ForegroundColor Cyan
        Write-Host "2. Run: cd backend" -ForegroundColor Cyan
        Write-Host "3. Run: railway init" -ForegroundColor Cyan
        Write-Host "4. Run: railway up" -ForegroundColor Cyan
        Write-Host "5. Set variables: railway variables set NODE_ENV=production" -ForegroundColor Cyan
        Write-Host "`nOpening Railway in browser..." -ForegroundColor Yellow
        Start-Process "https://railway.app"
        
        Write-Host "`nRun these commands in backend folder:" -ForegroundColor Green
        Write-Host "cd backend" -ForegroundColor Cyan
        Write-Host "railway login" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "`n=== HEROKU DEPLOYMENT ===" -ForegroundColor Blue
        Write-Host "`nSteps to deploy on Heroku:"
        Write-Host "1. Download Heroku CLI from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor White
        Write-Host "2. Run: heroku login" -ForegroundColor Cyan
        Write-Host "3. Run: heroku create career-backend-api" -ForegroundColor Cyan
        Write-Host "4. Run: cd backend && git init" -ForegroundColor Cyan
        Write-Host "5. Run: heroku git:remote -a career-backend-api" -ForegroundColor Cyan
        Write-Host "6. Run: git add . && git commit -m 'Deploy'" -ForegroundColor Cyan
        Write-Host "7. Run: git push heroku main" -ForegroundColor Cyan
        Write-Host "`nOpening Heroku in browser..." -ForegroundColor Yellow
        Start-Process "https://www.heroku.com"
    }
    default {
        Write-Host "`nInvalid choice. Please run the script again." -ForegroundColor Red
        exit
    }
}

Write-Host "`n=== IMPORTANT: FIREBASE CREDENTIALS ===" -ForegroundColor Red
Write-Host "After deployment, you MUST add Firebase Admin credentials:" -ForegroundColor Yellow
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/project/career-guide-73a47/settings/serviceaccounts" -ForegroundColor White
Write-Host "2. Click 'Generate new private key'" -ForegroundColor White
Write-Host "3. Download the JSON file" -ForegroundColor White
Write-Host "4. Add it to your hosting platform as environment variable" -ForegroundColor White
Write-Host ""

$openFirebase = Read-Host "Open Firebase Console now? (y/n)"
if ($openFirebase -eq "y") {
    Start-Process "https://console.firebase.google.com/project/career-guide-73a47/settings/serviceaccounts"
}

Write-Host "`n=== AFTER BACKEND DEPLOYS ===" -ForegroundColor Cyan
Write-Host "1. Copy your backend URL" -ForegroundColor White
Write-Host "2. Create .env file in project root with:" -ForegroundColor White
Write-Host "   REACT_APP_API_URL=https://your-backend-url.com/api" -ForegroundColor Cyan
Write-Host "3. Run: npm run build" -ForegroundColor Cyan
Write-Host "4. Run: firebase deploy --only hosting" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Deployment guide complete!" -ForegroundColor Green
Write-Host "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md`n" -ForegroundColor White
