# OCR Marketing AI Agent - Setup Script

Write-Host "🚀 Starting OCR Marketing AI Agent Setup..." -ForegroundColor Cyan

# 1. Backend Setup
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Set-Location backend
    npm install
    
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  .env file not found in backend. Creating one..." -ForegroundColor Magenta
        $apiKey = Read-Host "Enter your Qwen AI API Key"
        $dbUrl = Read-Host "Enter your PostgreSQL URL (e.g., postgres://user:pass@localhost:5432/db_name)"
        
        $envContent = "AI_API_KEY=$apiKey`nAI_BASE_URL=https://api.ollama.com/v1`nDATABASE_URL=$dbUrl`nPORT=3001"
        $envContent | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "✅ .env created successfully." -ForegroundColor Green
    }
    Set-Location ..
}

# 2. Frontend Setup
Write-Host "`n📦 Setting up Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Set-Location frontend
    npm install
    Set-Location ..
}

# 3. Database Check (Optional but helpful)
Write-Host "`n🗄️ Checking Database Configuration..." -ForegroundColor Yellow
Write-Host "Please ensure you have run the 'backend/schema.sql' script in your PostgreSQL database!" -ForegroundColor Cyan

# 4. Final Instructions
Write-Host "`n✨ Setup Complete! ✨" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "To start the application, open two terminals and run:" -ForegroundColor White
Write-Host "`nTerminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "cd backend; node server.js" -ForegroundColor White
Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "cd frontend; npm run dev" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Open http://localhost:5173 to see your Glassmorphism UI!" -ForegroundColor Green
