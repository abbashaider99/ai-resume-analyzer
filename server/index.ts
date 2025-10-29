// MongoDB + Express Backend Server
// This file contains the complete backend API for syncing Puter data with MongoDB

import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-resume-analyzer';

// CORS Configuration for production and development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://abbaslogic.com',
    'https://www.abbaslogic.com',
    'https://api.abbaslogic.com'
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Admin Schema (defined before connection)
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // Hashed with bcrypt
    email: { type: String },
    role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String }, // Username of creator
});

const Admin = mongoose.model('Admin', adminSchema);

// Initialize default admin (only if no admins exist)
const initializeDefaultAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash('admin@abbaslogic2025', 10);
            const defaultAdmin = new Admin({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                role: 'super_admin',
                createdBy: 'system',
            });
            await defaultAdmin.save();
            console.log('✅ Default admin created: admin / admin@abbaslogic2025');
        }
    } catch (error) {
        console.error('Error initializing default admin:', error);
    }
};

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await initializeDefaultAdmin();
    })
    .catch((err: Error) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    puterId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    email: { type: String },
    plan: { 
        type: String, 
        enum: ['free', 'pro', 'enterprise'], 
        default: 'free' 
    },
    usageCount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 5 }, // Free plan: 5, Pro: unlimited
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    puterId: { type: String, required: true, index: true },
    companyName: { type: String },
    jobTitle: { type: String },
    jobDescription: { type: String },
    resumePath: { type: String, required: true },
    imagePath: { type: String, required: true },
    feedback: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model('Resume', resumeSchema);

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Sync user from Puter to MongoDB
app.post('/api/users/sync', async (req: Request, res: Response) => {
    try {
        const { puterId, username, email } = req.body;

        if (!puterId || !username) {
            return res.status(400).json({ error: 'puterId and username are required' });
        }

        // Find or create user
        let user = await User.findOne({ puterId });

        if (!user) {
            // Create new user
            user = new User({
                puterId,
                username,
                email,
                plan: 'free',
                usageCount: 0,
                maxUsage: 5,
            });
            await user.save();
            console.log(`✅ New user created: ${username} (${puterId})`);
        } else {
            // Update existing user
            user.username = username;
            if (email) user.email = email;
            user.updatedAt = new Date();
            await user.save();
            console.log(`✅ User updated: ${username} (${puterId})`);
        }

        res.json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

// Get user by Puter ID
app.get('/api/users/:puterId', async (req, res) => {
    try {
        const { puterId } = req.params;

        const user = await User.findOne({ puterId }).populate('resumes');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user plan
app.patch('/api/users/:puterId/plan', async (req, res) => {
    try {
        const { puterId } = req.params;
        const { plan } = req.body;

        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        const user = await User.findOne({ puterId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.plan = plan;
        user.maxUsage = plan === 'free' ? 5 : -1; // -1 means unlimited
        user.updatedAt = new Date();
        await user.save();

        console.log(`✅ User plan updated: ${user.username} -> ${plan}`);
        res.json(user);
    } catch (error) {
        console.error('Error updating user plan:', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// Update user usage limit
app.patch('/api/users/:puterId/limit', async (req, res) => {
    try {
        const { puterId } = req.params;
        const { maxUsage } = req.body;

        if (typeof maxUsage !== 'number' || maxUsage < 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }

        const user = await User.findOne({ puterId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.maxUsage = maxUsage;
        user.updatedAt = new Date();
        await user.save();

        console.log(`✅ User limit updated: ${user.username} -> ${maxUsage}`);
        res.json(user);
    } catch (error) {
        console.error('Error updating user limit:', error);
        res.status(500).json({ error: 'Failed to update limit' });
    }
});

// Increment usage count
app.post('/api/users/:puterId/usage', async (req, res) => {
    try {
        const { puterId } = req.params;

        const user = await User.findOne({ puterId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.usageCount += 1;
        user.updatedAt = new Date();
        await user.save();

        console.log(`✅ Usage incremented: ${user.username} (${user.usageCount}/${user.maxUsage})`);
        res.json({ usageCount: user.usageCount, maxUsage: user.maxUsage });
    } catch (error) {
        console.error('Error incrementing usage:', error);
        res.status(500).json({ error: 'Failed to increment usage' });
    }
});

// Check usage limit
app.get('/api/users/:puterId/usage-limit', async (req, res) => {
    try {
        const { puterId } = req.params;

        const user = await User.findOne({ puterId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const canAnalyze = user.plan === 'pro' || user.plan === 'enterprise' 
            ? true 
            : user.usageCount < user.maxUsage;

        res.json({
            canAnalyze,
            currentUsage: user.usageCount,
            maxUsage: user.maxUsage,
            plan: user.plan,
        });
    } catch (error) {
        console.error('Error checking usage limit:', error);
        res.status(500).json({ error: 'Failed to check usage limit' });
    }
});

// Save resume
app.post('/api/resumes', async (req, res) => {
    try {
        const { id, puterId, companyName, jobTitle, jobDescription, resumePath, imagePath, feedback } = req.body;

        if (!id || !puterId || !resumePath || !imagePath) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findOne({ puterId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if resume already exists
        let resume = await Resume.findOne({ id });

        if (resume) {
            // Update existing resume
            resume.companyName = companyName;
            resume.jobTitle = jobTitle;
            resume.jobDescription = jobDescription;
            resume.feedback = feedback;
            await resume.save();
        } else {
            // Create new resume
            resume = new Resume({
                id,
                userId: user._id,
                puterId,
                companyName,
                jobTitle,
                jobDescription,
                resumePath,
                imagePath,
                feedback,
            });
            await resume.save();

            // Add resume to user's resumes array
            user.resumes.push(resume._id);
            await user.save();
        }

        console.log(`✅ Resume saved: ${id} for ${user.username}`);
        res.json(resume);
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ error: 'Failed to save resume' });
    }
});

// Get user's resumes
app.get('/api/resumes/user/:puterId', async (req, res) => {
    try {
        const { puterId } = req.params;

        const resumes = await Resume.find({ puterId }).sort({ createdAt: -1 });

        res.json(resumes);
    } catch (error) {
        console.error('Error getting resumes:', error);
        res.status(500).json({ error: 'Failed to get resumes' });
    }
});

// Get single resume
app.get('/api/resumes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findOne({ id }).populate('userId');

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.json(resume);
    } catch (error) {
        console.error('Error getting resume:', error);
        res.status(500).json({ error: 'Failed to get resume' });
    }
});

// Get all users (admin endpoint)
app.get('/api/admin/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find().populate('resumes').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Delete user (Admin endpoint)
app.delete('/api/users/:puterId', async (req: Request, res: Response) => {
    try {
        const { puterId } = req.params;
        
        // Delete user's resumes first
        await Resume.deleteMany({ puterId });
        
        // Delete user
        const result = await User.findOneAndDelete({ puterId });
        
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get stats (admin endpoint)
app.get('/api/admin/stats', async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const freeUsers = await User.countDocuments({ plan: 'free' });
        const proUsers = await User.countDocuments({ plan: 'pro' });
        const enterpriseUsers = await User.countDocuments({ plan: 'enterprise' });
        const totalResumes = await Resume.countDocuments();

        res.json({
            totalUsers,
            freeUsers,
            proUsers,
            enterpriseUsers,
            totalResumes,
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// ==================== ADMIN MANAGEMENT ROUTES ====================

// Admin login
app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        const isHashed = admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$') || admin.password.startsWith('$2y$');
        
        let isPasswordValid = false;
        
        if (isHashed) {
            // Compare password with bcrypt
            isPasswordValid = await bcrypt.compare(password, admin.password);
        } else {
            // Legacy plaintext password - check directly and then hash it
            if (admin.password === password) {
                isPasswordValid = true;
                // Automatically upgrade to hashed password
                admin.password = await bcrypt.hash(password, 10);
                admin.updatedAt = new Date();
                await admin.save();
                console.log(`🔒 Upgraded password to bcrypt hash for admin: ${username}`);
            }
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`✅ Admin logged in: ${username}`);
        res.json({
            success: true,
            admin: {
                username: admin.username,
                email: admin.email,
                role: admin.role,
            }
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all admins
app.get('/api/admin/admins', async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        console.error('Error getting admins:', error);
        res.status(500).json({ error: 'Failed to get admins' });
    }
});

// Create new admin
app.post('/api/admin/admins', async (req: Request, res: Response) => {
    try {
        const { username, password, email, role, createdBy } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(409).json({ error: 'Admin with this username already exists' });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            email,
            role: role || 'admin',
            createdBy: createdBy || 'unknown',
        });

        await newAdmin.save();
        console.log(`✅ New admin created: ${username}`);

        // Return without password
        const adminResponse = newAdmin.toObject();
        delete adminResponse.password;
        res.status(201).json(adminResponse);
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Update admin
app.patch('/api/admin/admins/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { username, password, email, role } = req.body;

        const admin = await Admin.findById(id);

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Update fields
        if (username) admin.username = username;
        if (password) admin.password = password; // Should be hashed in production
        if (email) admin.email = email;
        if (role) admin.role = role;
        admin.updatedAt = new Date();

        await admin.save();
        console.log(`✅ Admin updated: ${admin.username}`);

        // Return without password
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        res.json(adminResponse);
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ error: 'Failed to update admin' });
    }
});

// Delete admin
app.delete('/api/admin/admins/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findById(id);

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Prevent deleting the last super admin
        if (admin.role === 'super_admin') {
            const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
            if (superAdminCount <= 1) {
                return res.status(403).json({ error: 'Cannot delete the last super admin' });
            }
        }

        await Admin.findByIdAndDelete(id);
        console.log(`✅ Admin deleted: ${admin.username}`);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

// Change admin password
app.post('/api/admin/change-password', async (req: Request, res: Response) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        if (!username || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare old password with bcrypt
        const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Hash new password with bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        admin.updatedAt = new Date();
        await admin.save();

        console.log(`✅ Password changed for admin: ${username}`);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
