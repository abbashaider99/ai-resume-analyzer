# Separate Server Setup Guide

## 🎯 Overview

Your project now has **two separate parts**:
1. **Client** (React Router app on port 5173)
2. **Server** (Express + MongoDB on port 3000)

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── app/                    # React Router Client (Frontend)
├── server/                 # Express Backend (Separate & Independent)
│   ├── index.ts           # Express server with API routes
│   ├── package.json       # Server dependencies (separate from client)
│   ├── tsconfig.json      # Server TypeScript config
│   └── .env               # Server environment variables
└── package.json           # Client dependencies
```

---

## 🚀 Setup Instructions

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**Check if MongoDB is running:**
```powershell
mongosh
```

If not running:
```powershell
net start MongoDB
```

---

### Step 2: Install Server Dependencies

Open a terminal in the **server folder**:

```powershell
cd server
npm install
```

This installs:
- `express` - Web server framework
- `mongoose` - MongoDB ODM
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables

---

### Step 3: Configure Server Environment

The `.env` file is already created in `server/` folder with:
```env
MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=3000
```

---

### Step 4: Start the Server

In the **server folder**:

```powershell
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
```

---

### Step 5: Start the Client

In a **new terminal**, go back to the root folder and start the client:

```powershell
cd ..
npm run dev
```

The client will run on: http://localhost:5173

---

## ✅ Testing the Integration

### 1. Check Server Health
Open: http://localhost:3000/api/health

You should see:
```json
{"status":"ok","message":"API is running"}
```

### 2. Test the App
1. Open: http://localhost:5173
2. Sign in with Puter
3. Upload a resume
4. Check MongoDB:

```powershell
mongosh
use ai-resume-analyzer
db.users.find().pretty()
db.resumes.find().pretty()
```

---

## 🔄 How It Works

### Client → Server Communication

```
React App (localhost:5173)
        ↓
    HTTP Request
        ↓
Express Server (localhost:3000)
        ↓
    MongoDB (localhost:27017)
```

### API Endpoints

All available at `http://localhost:3000/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| POST | `/users/sync` | Sync Puter user to MongoDB |
| GET | `/users/:puterId` | Get user data |
| PATCH | `/users/:puterId/plan` | Update user plan |
| POST | `/users/:puterId/usage` | Increment usage count |
| GET | `/users/:puterId/usage-limit` | Check usage limit |
| POST | `/resumes` | Save resume |
| GET | `/resumes/user/:puterId` | Get user's resumes |
| GET | `/resumes/:id` | Get specific resume |
| GET | `/admin/users` | Get all users (admin) |
| GET | `/admin/stats` | Get statistics (admin) |

---

## 📊 New Features

### 1. **Usage Limit UI Replacement**

When users reach the 5-analysis limit, they now see:
- ❌ Upload form is **replaced** with upgrade card
- ✅ Full-screen upgrade promotion with:
  - Pro plan features list
  - Pricing ($9.99/mo)
  - Clear CTA button
  - Money-back guarantee notice

### 2. **Independent Server Architecture**

- ✅ Server runs independently on port 3000
- ✅ Client runs on port 5173
- ✅ CORS enabled for cross-origin requests
- ✅ Separate package.json and dependencies
- ✅ No MongoDB over HTTP error (using native driver)

---

## 🛠️ Development Workflow

### Running Both Together

**Terminal 1 (Server):**
```powershell
cd server
npm run dev
```

**Terminal 2 (Client):**
```powershell
npm run dev
```

### Building for Production

**Server:**
```powershell
cd server
npm run build  # Compiles TypeScript
npm start      # Runs compiled JS
```

**Client:**
```powershell
npm run build
npm start
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

**Solution:**
```powershell
net start MongoDB
```

### "EADDRINUSE: Port 3000 already in use"

**Solution:**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Failed to fetch" in browser console

**Check:**
1. Server is running: http://localhost:3000/api/health
2. CORS is enabled in `server/index.ts`
3. Client is using correct URL: `http://localhost:3000/api` (check `app/lib/db.ts`)

### Client can't reach server

**Check `app/lib/db.ts`:**
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

Make sure it's NOT `/api` (relative path).

---

## 🎉 Summary

### Before (Integrated):
- ❌ MongoDB over HTTP errors
- ❌ React Router API routes (limited)
- ❌ Confusing architecture

### After (Separated):
- ✅ Independent Express server
- ✅ Native MongoDB driver (no HTTP errors)
- ✅ Full REST API capabilities
- ✅ Professional architecture
- ✅ Upgrade UI replaces form when limit reached
- ✅ Clear separation of concerns

---

## 📈 Next Steps

1. **Start both servers** (client + server)
2. **Test user sync** by signing in
3. **Upload 5 resumes** to test the limit
4. **See the upgrade card** replace the upload form
5. **Check MongoDB** to verify data persistence

Everything is ready! 🚀
