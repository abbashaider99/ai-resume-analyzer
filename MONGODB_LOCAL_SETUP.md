# MongoDB Setup Guide - Local Installation

## 🎯 What This Does

Integrates MongoDB with your React Router app (no separate backend needed!):
- ✅ MongoDB running on localhost:27017
- ✅ API routes built into React Router
- ✅ User data synced from Puter to MongoDB
- ✅ Plan management (Free/Pro/Enterprise)
- ✅ Usage tracking

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `mongoose` - MongoDB ODM
- `cors` - CORS support (if needed)

---

## 🗄️ Step 2: Install & Start MongoDB

### Windows:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Download Windows MSI installer
   - Run installer (use default settings)

2. **Start MongoDB**
   ```bash
   # MongoDB should start automatically as a service
   # Check if running:
   mongosh
   ```

   If not running:
   ```bash
   # Start MongoDB service
   net start MongoDB
   ```

### Alternative: MongoDB in WSL (if you have WSL)

```bash
# In WSL terminal
sudo apt update
sudo apt install mongodb-org
sudo systemctl start mongod
sudo systemctl status mongod
```

---

## ⚙️ Step 3: Configure Environment

The `.env` file is already created with:
```env
MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer
```

This connects to:
- Host: localhost
- Port: 27017 (MongoDB default)
- Database: ai-resume-analyzer

---

## 🚀 Step 4: Start the Application

```bash
npm run dev
```

The app will:
1. Start React Router dev server
2. Auto-connect to MongoDB on first API call
3. Create database and collections automatically

---

## ✅ Step 5: Test the Integration

1. **Open the app**: http://localhost:5173
2. **Sign in with Puter**
3. **Upload a resume**

### Verify in MongoDB:

```bash
# Open MongoDB shell
mongosh

# Switch to database
use ai-resume-analyzer

# View users
db.users.find().pretty()

# View resumes
db.resumes.find().pretty()

# Check specific user
db.users.findOne({username: "your-username"})
```

---

## 📊 API Routes Available

All routes are built into React Router (no separate server!):

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/users/sync` | Sync Puter user to MongoDB |
| GET | `/api/users/:puterId` | Get user data |
| GET | `/api/users/:puterId/usage-limit` | Check if user can analyze |
| POST | `/api/users/:puterId/usage` | Increment usage count |
| PATCH | `/api/users/:puterId/plan` | Update user plan |
| POST | `/api/resumes` | Save resume |
| GET | `/api/resumes/user/:puterId` | Get user's resumes |

---

## 🔄 How It Works

### On User Sign In:
```
User signs in → Puter Auth → Sync to MongoDB
                                    ↓
                        Creates/Updates user record
```

### On Resume Upload:
```
Upload resume → Check MongoDB usage → If allowed:
                                          ↓
                                    Analyze with AI
                                          ↓
                                    Save to Puter (files)
                                          ↓
                                    Save to MongoDB (metadata)
                                          ↓
                                    Increment usage count
```

---

## 📁 File Structure

```
app/
├── lib/
│   ├── db.ts                    # Client-side MongoDB API calls
│   └── mongodb.server.ts        # Server-side MongoDB connection
├── routes/
│   ├── api.users.sync.ts               # POST /api/users/sync
│   ├── api.users.$puterId.ts            # GET /api/users/:puterId
│   ├── api.users.$puterId.usage-limit.ts # GET usage limit
│   ├── api.users.$puterId.usage.ts      # POST increment usage
│   ├── api.users.$puterId.plan.ts       # PATCH update plan
│   ├── api.resumes.ts                   # POST save resume
│   └── api.resumes.user.$puterId.ts     # GET user resumes
└── routes/
    └── hirelens/
        └── upload.tsx           # Updated with MongoDB integration
```

---

## 🎯 Features

### 1. **Automatic User Sync**
When user authenticates with Puter, they're automatically synced to MongoDB

### 2. **Plan System**
- **Free Plan**: 5 analyses max
- **Pro Plan**: Unlimited analyses
- **Enterprise Plan**: Unlimited analyses

### 3. **Usage Counter**
Shows: `3 / 5 Free Analyses Used` or `10 / ∞ Pro Analyses`

### 4. **Smart Upgrade Prompt**
After reaching limit, beautiful modal prompts upgrade

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

**Check if MongoDB is running:**
```bash
# Windows
net start MongoDB

# Or check status
mongosh
```

**Check connection string:**
- Ensure `.env` has: `MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer`

### "Module 'mongoose' not found"

```bash
npm install
```

### MongoDB won't start

**Windows:**
```bash
# Check MongoDB service
services.msc
# Find "MongoDB" and start it
```

**Alternative: Use MongoDB Atlas (Cloud)**
1. Go to mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-resume-analyzer
   ```

---

## 📊 View Your Data

### Using MongoDB Shell:
```bash
mongosh

use ai-resume-analyzer

# View all users
db.users.find()

# View all resumes
db.resumes.find()

# Count users by plan
db.users.aggregate([
  { $group: { _id: "$plan", count: { $sum: 1 } } }
])

# Get user with most analyses
db.users.find().sort({ usageCount: -1 }).limit(1)
```

### Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. View `ai-resume-analyzer` database

---

## 🎉 That's It!

Your app now has:
- ✅ MongoDB integration (localhost:27017)
- ✅ User management
- ✅ Plan system (Free/Pro/Enterprise)
- ✅ Usage tracking
- ✅ Resume history
- ✅ No separate backend server needed!

All running within React Router! 🚀
