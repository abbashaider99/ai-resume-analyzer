@echo off
echo.
echo ========================================
echo  AI Resume Analyzer - Full Stack Start
echo ========================================
echo.

REM Start MongoDB if not running
echo [1/3] Checking MongoDB...
mongosh --eval "db.version()" --quiet >nul 2>&1
if errorlevel 1 (
    echo [X] MongoDB is not running! Starting...
    net start MongoDB
    timeout /t 2 >nul
)
echo [OK] MongoDB is running
echo.

REM Start the backend server in a new window
echo [2/3] Starting Backend Server (Port 3000)...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 >nul
echo [OK] Backend server starting...
echo.

REM Start the frontend client
echo [3/3] Starting Frontend Client (Port 5173)...
echo.
echo ========================================
echo  Servers Starting:
echo  - Backend:  http://localhost:3000
echo  - Frontend: http://localhost:5173
echo ========================================
echo.
npm run dev
