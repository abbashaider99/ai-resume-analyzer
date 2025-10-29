// MongoDB Connection and Models (Server-side only)
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-resume-analyzer';

// Track connection state
let isConnected = false;

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
    maxUsage: { type: Number, default: 5 }, // Free plan: 5, Pro: -1 (unlimited)
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

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

// Create models (only once)
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

/**
 * Connect to MongoDB
 */
export async function connectToDatabase() {
    if (isConnected) {
        console.log('✅ Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = db.connection.readyState === 1;
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase() {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('👋 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ MongoDB disconnection error:', error);
    }
}
