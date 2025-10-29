# 🚀 Quick Start Guide

## ✅ What's Been Fixed

### 1. **MongoDB Over HTTP Error - FIXED** ✅
- ❌ Before: MongoDB accessed over HTTP (wrong port)
- ✅ Now: Separate Express server with native MongoDB driver

### 2. **Upgrade UI - IMPLEMENTED** ✅
- ❌ Before: Modal popup for upgrade
- ✅ Now: **Entire upload form replaced** with upgrade card when limit reached

---

## 📦 Installation

### Step 1: Install Server Dependencies

```powershell
cd server
npm install
```

This installs in the `server` folder:
- `express` - Web server
- `mongoose` - MongoDB
- `cors` - Cross-origin support
- `dotenv` - Environment variables

### Step 2: Install MongoDB

Download: https://www.mongodb.com/try/download/community

After installation, MongoDB runs automatically as a Windows service.

**Check if running:**
```powershell
mongosh
```

---

## 🎬 Running the Application

### Option 1: Automatic (Recommended)

Double-click: **`start-all.bat`**

This will:
1. ✅ Check/start MongoDB
2. ✅ Start backend server (port 3000)
3. ✅ Start frontend client (port 5173)

### Option 2: Manual

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

---

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **MongoDB**: localhost:27017

---

## ✨ New Features

### 1. **Usage Limit Enforcement**

When user reaches 5 analyses:
- ❌ Upload form **disappears**
- ✅ Full upgrade card **appears** with:
  - Pro plan features
  - Pricing ($9.99/mo)
  - Call-to-action button
  - Money-back guarantee

### 2. **Separate Server Architecture**

```
Client (React Router)  →  Server (Express)  →  MongoDB
Port 5173             →  Port 3000         →  Port 27017
```

Benefits:
- ✅ No more "MongoDB over HTTP" errors
- ✅ Native driver connection
- ✅ Independent scaling
- ✅ Better error handling

### 3. **Usage Counter Badge**

Shows on upload page:
- `3 / 5 Free Analyses Used`
- `10 / ∞ Pro Analyses`
- Dynamic based on user plan

---

## 🔍 Testing

### 1. Test Backend
```powershell
# Open in browser
http://localhost:3000/api/health

# Should see:
{"status":"ok","message":"API is running"}
```

### 2. Test User Sync
1. Go to http://localhost:5173
2. Sign in with Puter
3. Check MongoDB:

```powershell
mongosh
use ai-resume-analyzer
db.users.find().pretty()
```

### 3. Test Upgrade UI
1. Upload 5 resumes
2. Try to upload 6th resume
3. ✅ Should see upgrade card instead of form

---

## 📁 File Changes Summary

### Created:
- ✅ `server/.env` - Environment variables
- ✅ `SERVER_SETUP.md` - Detailed documentation
- ✅ `start-server.bat` - Backend quick start
- ✅ `start-all.bat` - Full stack quick start
- ✅ `QUICKSTART.md` - This file

### Modified:
- ✅ `app/lib/db.ts` - Points to `http://localhost:3000/api`
- ✅ `app/routes/hirelens/upload.tsx` - Replaced form with upgrade card when limit reached
- ✅ `server/index.ts` - Added dotenv, fixed types

---

## 🐛 Troubleshooting

### MongoDB not starting
```powershell
net start MongoDB
```

### Port 3000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Failed to fetch" errors
1. Check backend is running: http://localhost:3000/api/health
2. Check CORS is enabled in `server/index.ts`
3. Check `app/lib/db.ts` has: `API_BASE_URL = 'http://localhost:3000/api'`

---

## 📊 Architecture Diagram

```
┌─────────────────┐
│  Browser        │
│  localhost:5173 │
└────────┬────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────┐
│  React Router   │
│  Frontend       │
│  (Vite Dev)     │
└────────┬────────┘
         │
         │ API Calls
         │ http://localhost:3000/api
         ▼
┌─────────────────┐
│  Express Server │
│  Backend        │
│  Port 3000      │
└────────┬────────┘
         │
         │ Mongoose
         ▼
┌─────────────────┐
│  MongoDB        │
│  localhost:27017│
│  Database       │
└─────────────────┘
```

---

## ✅ Verification Checklist

Before using the app, verify:

- [ ] MongoDB installed and running
- [ ] Server dependencies installed (`cd server && npm install`)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Health check returns `{"status":"ok"}`
- [ ] Can sign in with Puter
- [ ] User syncs to MongoDB
- [ ] Upload form shows initially
- [ ] After 5 uploads, upgrade card replaces form

---

## 🎉 You're Ready!

Everything is set up. Just run:

```powershell
start-all.bat
```

And visit: http://localhost:5173

Happy analyzing! 🚀
