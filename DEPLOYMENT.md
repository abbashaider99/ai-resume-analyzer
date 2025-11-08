# Deployment Guide for abbaslogic.com

## Production Configuration

### ✅ Database Configuration
- **MongoDB Atlas**: Connected to production database
- **Database Name**: `abbaslogicdb`
- **Connection String**: Already configured in `.env.production` files

### ✅ Domain Configuration
- **Primary Domain**: `abbaslogic.com`
- **API Endpoint**: `https://api.abbaslogic.com/api`
- **CORS**: Configured for production domain + wildcard subdomains (`*.abbaslogic.com`) and extendable via `CORS_ORIGIN`

---

## Deployment Steps

### 1. Frontend Deployment (React App)

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from root directory
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_BASE_URL=https://api.abbaslogic.com/api
```

**Option B: Netlify**
```bash
# Build the app
npm run build

# Deploy dist folder to Netlify
# Set environment variable:
# VITE_API_BASE_URL=https://api.abbaslogic.com/api
```

### 2. Backend Deployment (Express Server)

**Option A: Railway.app**
1. Create new project on Railway
2. Connect GitHub repository
3. Select `/server` folder as root
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://dailylifetech23:G0sg67UnyQg4vyK6@cluster0.7daxcbm.mongodb.net/abbaslogicdb?retryWrites=true&w=majority&appName=Cluster0
   PORT=3000
   NODE_ENV=production
   ```
5. Deploy

**Option B: Render.com**
1. Create new Web Service
2. Connect GitHub repository
3. Root Directory: `server`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables (same as above)

**Option C: DigitalOcean/VPS**
```bash
# SSH into server
ssh root@your-server-ip

# Clone repository
git clone https://github.com/abbashaider99/ai-resume-analyzer.git
cd ai-resume-analyzer/server

# Install dependencies
npm install

# Create .env file with production values
nano .env
# Paste production MongoDB URI

# Build TypeScript
npm run build

# Install PM2 for process management
npm install -g pm2

# Start server with PM2
pm2 start dist/index.js --name "ai-resume-api"
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/api.abbaslogic.com
```

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name api.abbaslogic.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. DNS Configuration

Add these records to your domain (abbaslogic.com):

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | Your frontend IP         |
| CNAME | www  | abbaslogic.com           |
| A/CNAME | api  | Your backend server IP   |

### 4. SSL Certificate

**Using Certbot (Let's Encrypt):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d abbaslogic.com -d www.abbaslogic.com -d api.abbaslogic.com
```

---

## Environment Variables Summary

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.abbaslogic.com/api
```

### Backend (server/.env.production)
```env
MONGODB_URI=mongodb+srv://dailylifetech23:G0sg67UnyQg4vyK6@cluster0.7daxcbm.mongodb.net/abbaslogicdb?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
NODE_ENV=production
CORS_ORIGIN= # optional extra origins comma-separated
```

---

## Default Admin Credentials

After first deployment, use these credentials to access admin panel:

- **URL**: `https://abbaslogic.com/admin/login`
- **Username**: `admin`
- **Password**: `admin@abbaslogic2025`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible at `https://abbaslogic.com`
- [ ] Backend API running at `https://api.abbaslogic.com`
- [ ] MongoDB connected successfully
- [ ] Admin panel accessible at `/admin/login`
- [ ] Admin password changed from default
- [ ] SSL certificates installed and working
- [ ] CORS configured correctly
- [ ] Test user registration and resume analysis
- [ ] Monitor server logs for errors

---

## Monitoring & Maintenance

### Check Server Status
```bash
# If using PM2
pm2 status
pm2 logs ai-resume-api

# Check MongoDB connection
curl https://api.abbaslogic.com/api/users
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
cd server
npm run build
pm2 restart ai-resume-api
```

---

## Troubleshooting

### Common Issues:

1. **CORS Error**
   - Confirm origin appears in `allowedOrigins` or matches wildcard `*.abbaslogic.com`
   - Set `CORS_ORIGIN` in environment if adding non-standard origin(s)
   - Ensure preflight (OPTIONS) returns 200 (already configured)

2. **MongoDB Connection Failed**
   - Verify connection string in environment variables
   - Check MongoDB Atlas whitelist (allow all IPs: 0.0.0.0/0)

3. **API Endpoint Not Found**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check Nginx/reverse proxy configuration

4. **Admin Login Failed**
   - Check if default admin was created (check server logs)
   - Try resetting admin password via MongoDB directly

---

## Support

For issues or questions:
- Email: admin@abbaslogic.com
- GitHub Issues: https://github.com/abbashaider99/ai-resume-analyzer/issues
