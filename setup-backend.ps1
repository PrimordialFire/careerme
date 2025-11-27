# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Green
cd backend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Backend dependencies installed successfully!" -ForegroundColor Green
    
    # Check if .env exists
    if (-not (Test-Path ".env")) {
        Write-Host "`n⚠️  Creating .env file from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please update it with your configuration." -ForegroundColor Green
    }
    
    # Check for Firebase service account
    if (-not (Test-Path "firebase-service-account.json")) {
        Write-Host "`n⚠️  WARNING: firebase-service-account.json not found!" -ForegroundColor Red
        Write-Host "Please download your Firebase Admin SDK service account key:" -ForegroundColor Yellow
        Write-Host "1. Go to Firebase Console → Project Settings → Service Accounts" -ForegroundColor Yellow
        Write-Host "2. Click 'Generate New Private Key'" -ForegroundColor Yellow
        Write-Host "3. Save the JSON file as 'firebase-service-account.json' in the backend folder`n" -ForegroundColor Yellow
    }
    
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update backend/.env with your configuration" -ForegroundColor White
    Write-Host "2. Add Firebase service account key (firebase-service-account.json)" -ForegroundColor White
    Write-Host "3. Run 'npm run dev' to start the backend server`n" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Failed to install dependencies!" -ForegroundColor Red
}

cd ..
