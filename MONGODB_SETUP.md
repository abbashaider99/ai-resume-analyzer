# MongoDB + Puter Integration Setup Guide

## 🎯 Overview
This setup syncs Puter user data with your MongoDB database, enabling:
- ✅ User management and authentication tracking
- ✅ Plan management (Free/Pro/Enterprise)
- ✅ Usage tracking and limits
- ✅ Resume history storage
- ✅ User profile data accessible on your website

---

## 📦 Installation

### 1. Install Server Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web server framework
- `mongoose` - MongoDB ODM
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables

### 2. Install Frontend Dependencies

```bash
# In root directory
npm install
```

---

## ⚙️ Configuration

### 1. Create `.env` file in `server/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer

# Server Port
PORT=3000
```

### 2. Create `.env` file in root directory:

```env
# API URL (points to your backend server)
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Running the Application

### Option 1: Development (Local)

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### Option 2: Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm start
```

---

## 🔄 How It Works

### User Authentication Flow:

1. **User signs in with Puter**
   - Puter provides: `uuid`, `username`

2. **Automatic sync to MongoDB**
   ```typescript
   // In your auth handler
   const userData = await syncUserToMongoDB(puterUser);
   ```

3. **User data stored in MongoDB:**
   ```javascript
   {
     puterId: "puter-uuid-123",
     username: "john_doe",
     plan: "free",
     usageCount: 3,
     maxUsage: 5,
     resumes: [ObjectId...],
     createdAt: Date,
     updatedAt: Date
   }
   ```

### Resume Analysis Flow:

1. **Check usage limit before analysis:**
   ```typescript
   const { canAnalyze, currentUsage } = await checkUsageLimit(puterId);
   if (!canAnalyze) {
     // Show upgrade modal
   }
   ```

2. **After successful analysis:**
   ```typescript
   // Increment usage count in MongoDB
   await incrementUsageCount(puterId);
   
   // Save resume data
   await saveResumeToMongoDB({
     id: uuid,
     puterId: user.uuid,
     resumePath,
     imagePath,
     feedback,
     ...
   });
   ```

---

## 📊 API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/sync` | Sync Puter user to MongoDB |
| GET | `/api/users/:puterId` | Get user by Puter ID |
| PATCH | `/api/users/:puterId/plan` | Update user plan |
| POST | `/api/users/:puterId/usage` | Increment usage count |
| GET | `/api/users/:puterId/usage-limit` | Check if user can analyze |

### Resume Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes` | Save resume data |
| GET | `/api/resumes/user/:puterId` | Get user's resumes |
| GET | `/api/resumes/:id` | Get single resume |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/stats` | Get platform statistics |

---

## 💻 Integration Code Examples

### 1. Update Puter Store (app/lib/puter.ts)

Add sync on authentication:

```typescript
import { syncUserToMongoDB, getUserFromMongoDB } from './db';

const checkAuthStatus = async (): Promise<boolean> => {
    // ... existing code ...
    
    if (isSignedIn) {
        const user = await puter.auth.getUser();
        
        // Sync to MongoDB
        await syncUserToMongoDB(user);
        
        set({
            auth: {
                user,
                isAuthenticated: true,
                // ... rest
            },
            isLoading: false,
        });
        return true;
    }
    
    // ... rest
};
```

### 2. Update Upload Component (app/routes/hirelens/upload.tsx)

Replace Puter KV with MongoDB:

```typescript
import { 
    checkUsageLimit, 
    incrementUsageCount, 
    saveResumeToMongoDB 
} from '~/lib/db';

// Check usage on mount
useEffect(() => {
    const checkUsage = async () => {
        if (!auth.isAuthenticated || !auth.user) return;
        
        const { currentUsage, maxUsage, canAnalyze } = 
            await checkUsageLimit(auth.user.uuid);
        
        setUsageCount(currentUsage);
        setMaxUsage(maxUsage);
    };
    
    checkUsage();
}, [auth.isAuthenticated, auth.user]);

// Before analysis
const handleAnalyze = async (...) => {
    // Check MongoDB instead of Puter KV
    const { canAnalyze } = await checkUsageLimit(auth.user.uuid);
    
    if (!canAnalyze) {
        setShowUpgradeModal(true);
        return;
    }
    
    // ... analyze ...
    
    // After successful analysis
    await incrementUsageCount(auth.user.uuid);
    await saveResumeToMongoDB({
        id: uuid,
        puterId: auth.user.uuid,
        companyName,
        jobTitle,
        jobDescription,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        feedback: parsedFeedback,
    });
};
```

### 3. Display User Info on Website

```typescript
import { getUserFromMongoDB } from '~/lib/db';

// In any component
const [userData, setUserData] = useState(null);

useEffect(() => {
    const loadUserData = async () => {
        if (!auth.user) return;
        
        const data = await getUserFromMongoDB(auth.user.uuid);
        setUserData(data);
    };
    
    loadUserData();
}, [auth.user]);

// Display
<div>
    <h2>Welcome, {userData?.username}!</h2>
    <p>Plan: {userData?.plan}</p>
    <p>Analyses: {userData?.usageCount}/{userData?.maxUsage}</p>
</div>
```

---

## 🔐 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  puterId: String (indexed, unique),
  username: String,
  email: String,
  plan: String ('free' | 'pro' | 'enterprise'),
  usageCount: Number,
  maxUsage: Number,
  resumes: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Collection
```javascript
{
  _id: ObjectId,
  id: String (unique),
  userId: ObjectId (ref: User),
  puterId: String (indexed),
  companyName: String,
  jobTitle: String,
  jobDescription: String,
  resumePath: String,
  imagePath: String,
  feedback: Mixed,
  createdAt: Date
}
```

---

## 🎯 Plan Limits

| Plan | Max Analyses | MongoDB Value |
|------|--------------|---------------|
| Free | 5 | `maxUsage: 5` |
| Pro | Unlimited | `maxUsage: -1` |
| Enterprise | Unlimited | `maxUsage: -1` |

---

## 📈 Admin Dashboard Example

Create an admin page to view stats:

```typescript
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        fetch('http://localhost:3000/api/admin/stats')
            .then(res => res.json())
            .then(setStats);
    }, []);
    
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Total Users: {stats?.totalUsers}</p>
            <p>Free Users: {stats?.freeUsers}</p>
            <p>Pro Users: {stats?.proUsers}</p>
            <p>Total Resumes: {stats?.totalResumes}</p>
        </div>
    );
};
```

---

## 🚨 Important Notes

1. **Dual Storage**: Puter stores files, MongoDB stores metadata
2. **Sync on Sign-in**: Always sync user data when they authenticate
3. **Error Handling**: Backend API has fallbacks if MongoDB is down
4. **CORS**: Configured to allow frontend requests
5. **Indexes**: User `puterId` is indexed for fast queries

---

## 🔧 Deployment

### MongoDB Atlas (Recommended)
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### Backend Hosting Options
- **Vercel** (Serverless)
- **Heroku** (Container)
- **Railway** (Container)
- **DigitalOcean** (VPS)

---

## ✅ Testing

Test the integration:

```bash
# 1. Start both servers
cd server && npm run dev
# In another terminal
npm run dev

# 2. Sign in with Puter
# 3. Check MongoDB:
# - User should be created automatically
# - Upload a resume
# - Check resume is saved in MongoDB
```

---

## 📞 Support

If you need help:
1. Check MongoDB connection string
2. Ensure both servers are running
3. Check browser console for errors
4. Check server logs for API errors

---

## 🎉 Benefits

✅ **User Profiles**: Store and display user data on your website  
✅ **Plan Management**: Easy upgrade/downgrade system  
✅ **Usage Tracking**: Monitor and enforce limits  
✅ **Resume History**: Users can view all their past analyses  
✅ **Analytics**: Track platform usage and growth  
✅ **Independence**: Not solely relying on Puter's KV store  
✅ **Scalability**: MongoDB handles millions of records  

This setup gives you full control over user data while still using Puter for file storage and AI processing!
