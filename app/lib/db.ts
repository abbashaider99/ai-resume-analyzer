// MongoDB Database Connection and Models
// This will sync Puter user data with your MongoDB database

interface UserData {
    puterId: string;
    username: string;
    email?: string;
    plan: 'free' | 'pro' | 'enterprise';
    usageCount: number;
    maxUsage: number;
    resumes: string[];
    createdAt: Date;
    updatedAt?: Date;
}

interface ResumeData {
    id: string;
    userId: string;
    puterId: string;
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    resumePath: string;
    imagePath: string;
    feedback: any;
    createdAt: Date;
}

// API endpoint URL - pointing to separate Express server
// For production (abbaslogic.com), set VITE_API_BASE_URL=https://api.abbaslogic.com/api
// For local development, it defaults to http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.abbaslogic.com/api';

/**
 * Sync Puter user to MongoDB
 * Call this after user signs in or when you need to sync user data
 */
export async function syncUserToMongoDB(puterUser: PuterUser): Promise<UserData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                puterId: puterUser.uuid,
                username: puterUser.username,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to sync user to MongoDB');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error syncing user to MongoDB:', error);
        return null;
    }
}

/**
 * Get user data from MongoDB
 */
export async function getUserFromMongoDB(puterId: string): Promise<UserData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to get user from MongoDB');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error getting user from MongoDB:', error);
        return null;
    }
}

/**
 * Update user plan
 */
export async function updateUserPlan(
    puterId: string,
    plan: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}/plan`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error updating user plan:', error);
        return false;
    }
}

/**
 * Update user usage limit
 */
export async function updateUserLimit(
    puterId: string,
    maxUsage: number
): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}/limit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maxUsage }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error updating user limit:', error);
        return false;
    }
}

/**
 * Increment user usage count
 */
export async function incrementUsageCount(puterId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}/usage`, {
            method: 'POST',
        });

        return response.ok;
    } catch (error) {
        console.error('Error incrementing usage count:', error);
        return false;
    }
}

/**
 * Save resume data to MongoDB
 */
export async function saveResumeToMongoDB(resumeData: Partial<ResumeData>): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/resumes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resumeData),
        });

        return response.ok;
    } catch (error) {
        console.error('Error saving resume to MongoDB:', error);
        return false;
    }
}

/**
 * Get all user resumes
 */
export async function getUserResumes(puterId: string): Promise<ResumeData[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/resumes/user/${puterId}`);

        if (!response.ok) {
            throw new Error('Failed to get resumes');
        }

        const resumes = await response.json();
        return resumes;
    } catch (error) {
        console.error('Error getting resumes:', error);
        return [];
    }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);

        if (!response.ok) {
            throw new Error('Failed to get all users');
        }

        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(puterId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}`, {
            method: 'DELETE',
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

/**
 * Check if user has reached usage limit
 */
export async function checkUsageLimit(puterId: string): Promise<{
    canAnalyze: boolean;
    currentUsage: number;
    maxUsage: number;
    plan: string;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${puterId}/usage-limit`);

        if (!response.ok) {
            throw new Error('Failed to check usage limit');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return {
            canAnalyze: false,
            currentUsage: 0,
            maxUsage: 0,
            plan: 'free',
        };
    }
}

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

interface AdminData {
    _id: string;
    username: string;
    email?: string;
    role: 'super_admin' | 'admin';
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

/**
 * Admin login
 */
export async function adminLogin(username: string, password: string): Promise<{
    success: boolean;
    admin?: { username: string; email?: string; role: string };
    error?: string;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Login failed' };
        }

        return data;
    } catch (error) {
        console.error('Error during admin login:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<AdminData[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admins`);

        if (!response.ok) {
            throw new Error('Failed to fetch admins');
        }

        const admins = await response.json();
        return admins;
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

/**
 * Create new admin
 */
export async function createAdmin(
    username: string,
    password: string,
    email: string,
    role: 'super_admin' | 'admin',
    createdBy: string
): Promise<{ success: boolean; admin?: AdminData; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email, role, createdBy }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to create admin' };
        }

        return { success: true, admin: data };
    } catch (error) {
        console.error('Error creating admin:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Update admin
 */
export async function updateAdmin(
    id: string,
    updates: { username?: string; password?: string; email?: string; role?: 'super_admin' | 'admin' }
): Promise<{ success: boolean; admin?: AdminData; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to update admin' };
        }

        return { success: true, admin: data };
    } catch (error) {
        console.error('Error updating admin:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Delete admin
 */
export async function deleteAdmin(id: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
            method: 'DELETE',
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting admin:', error);
        return false;
    }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
    username: string,
    oldPassword: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, oldPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to change password' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, error: 'Network error' };
    }
}
