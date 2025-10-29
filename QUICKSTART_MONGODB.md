# 🚀 Quick Start Guide - MongoDB Integration

## ✅ What You Get

- **User Management**: Automatic sync of Puter users to MongoDB
- **Plan System**: Free (5 analyses), Pro (unlimited), Enterprise (unlimited)
- **Usage Tracking**: Real-time tracking of resume analyses
- **User Profiles**: Display user data on your website
- **Resume History**: Store all analyses in MongoDB
- **Dual Storage**: Puter for files, MongoDB for metadata

---

## 📦 Step 1: Install Dependencies

### Backend Server
```bash
cd server
npm install
```

### Frontend (if needed)
```bash
# In root directory
npm install
```

---

## ⚙️ Step 2: Configure Environment

### Server Environment
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer
PORT=3000
```

### Frontend Environment
```bash
# In root directory
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗄️ Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
# Install MongoDB from mongodb.com
mongod
```

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

---

## 🚀 Step 4: Run the Application

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

Output:
```
🚀 Server running on http://localhost:3000
✅ Connected to MongoDB
```

### Terminal 2 - Frontend
```bash
npm run dev
```

---

## ✨ Features Now Available

### 1. **Automatic User Sync**
When user signs in with Puter → Automatically synced to MongoDB

### 2. **Usage Counter**
Shows: `3 / 5 Free Analyses Used` or `10 / ∞ Pro Analyses`

### 3. **Plan Badges**
- Free users: No badge
- Pro users: Green "PRO" badge
- Limit reached: Purple "Limit Reached" badge

### 4. **Smart Upgrade Prompt**
After 5 analyses → Beautiful upgrade modal

---

## 🧪 Test the Integration

1. **Start both servers** (backend + frontend)
2. **Sign in** with Puter
3. **Upload a resume**
4. **Check MongoDB**:
   - User should be created
   - Usage count should increment
   - Resume should be saved

### MongoDB Commands
```bash
# Connect to MongoDB
mongosh

# Switch to database
use ai-resume-analyzer

# View users
db.users.find().pretty()

# View resumes
db.resumes.find().pretty()

# Check user usage
db.users.findOne({username: "your-username"})
```

---

## 📊 API Endpoints Available

### User Endpoints
- `POST /api/users/sync` - Sync Puter user
- `GET /api/users/:puterId` - Get user data
- `PATCH /api/users/:puterId/plan` - Update plan
- `GET /api/users/:puterId/usage-limit` - Check limits

### Resume Endpoints
- `POST /api/resumes` - Save resume
- `GET /api/resumes/user/:puterId` - Get user's resumes
- `GET /api/resumes/:id` - Get single resume

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Platform statistics

---

## 💡 Common Use Cases

### Show User Profile
```typescript
import { getUserFromMongoDB } from '~/lib/db';

const userData = await getUserFromMongoDB(auth.user.uuid);
console.log(userData.username); // "john_doe"
console.log(userData.plan); // "free"
console.log(userData.usageCount); // 3
```

### Upgrade User Plan
```typescript
import { updateUserPlan } from '~/lib/db';

await updateUserPlan(auth.user.uuid, 'pro');
// User now has unlimited analyses
```

### Get User's Resume History
```typescript
import { getUserResumes } from '~/lib/db';

const resumes = await getUserResumes(auth.user.uuid);
resumes.forEach(r => {
    console.log(r.jobTitle, r.createdAt);
});
```

---

## 🎯 Plan Limits

| Plan | Limit | MongoDB Value |
|------|-------|---------------|
| Free | 5 | `maxUsage: 5` |
| Pro | Unlimited | `maxUsage: -1` |
| Enterprise | Unlimited | `maxUsage: -1` |

---

## 🔄 Data Flow

```
User Signs In
    ↓
Puter Authentication
    ↓
Sync to MongoDB (automatic)
    ↓
User uploads resume
    ↓
Check MongoDB usage limit
    ↓
If allowed → Analyze
    ↓
Increment MongoDB counter
    ↓
Save to both:
  - Puter (files)
  - MongoDB (metadata)
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Check port 3000 is available
- Verify `.env` file exists

### Frontend can't connect
- Check `VITE_API_URL` in `.env`
- Check backend is running
- Check CORS settings

### MongoDB connection failed
- Local: Ensure `mongod` is running
- Atlas: Check connection string
- Check IP whitelist in Atlas

---

## 🎉 What's New

✅ Users automatically synced to MongoDB  
✅ Dynamic usage counter based on plan  
✅ Pro badge for upgraded users  
✅ Unlimited analyses for Pro users  
✅ Resume history in MongoDB  
✅ Fallback to Puter KV if MongoDB fails  

---

## 📈 Next Steps

1. ✅ Set up MongoDB (local or Atlas)
2. ✅ Start backend server
3. ✅ Test user sync
4. 🚀 **Build plan upgrade system**
5. 🚀 **Create admin dashboard**
6. 🚀 **Add payment integration**

---

## 💰 Monetization Ready!

With this setup, you can easily:
- Charge for Pro plans
- Track user analytics
- Manage subscriptions
- Show user stats
- Build admin panel

Full setup complete! 🎊
