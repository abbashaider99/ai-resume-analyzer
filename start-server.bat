@echo off
echo.
echo ================================
echo  AI Resume Analyzer Server
echo ================================
echo.
echo [1/2] Checking MongoDB...
mongosh --eval "db.version()" --quiet >nul 2>&1
if errorlevel 1 (
    echo [X] MongoDB is not running!
    echo.
    echo Starting MongoDB...
    net start MongoDB
    timeout /t 2 >nul
)
echo [OK] MongoDB is running
echo.

echo [2/2] Starting Express Server...
cd server
npm run dev
