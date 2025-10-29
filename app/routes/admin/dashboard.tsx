import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createAdmin, deleteAdmin, deleteUser, getAllAdmins, getAllUsers, updateUserLimit, updateUserPlan } from "~/lib/db";

interface User {
    _id: string;
    puterId: string;
    username: string;
    email?: string;
    plan: string;
    usageCount: number;
    maxUsage: number;
    createdAt: string;
    resumes: any[];
}

interface Admin {
    _id: string;
    username: string;
    email?: string;
    role: 'super_admin' | 'admin';
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [newPlan, setNewPlan] = useState<string>('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activePage, setActivePage] = useState('overview');
    const [freePlanLimit, setFreePlanLimit] = useState<number>(3);
    const [tempLimit, setTempLimit] = useState<string>('3');
    const [showLimitSaved, setShowLimitSaved] = useState(false);
    
    // Admin management states
    const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
    const [newAdminData, setNewAdminData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'admin' as 'admin' | 'super_admin'
    });
    const [currentAdminUsername, setCurrentAdminUsername] = useState('');
    
    // User usage limit editing
    const [editingUserLimit, setEditingUserLimit] = useState<string | null>(null);
    const [newUserLimit, setNewUserLimit] = useState<string>('');

    useEffect(() => {
        // Check admin authentication
        const isAdmin = sessionStorage.getItem('adminAuth');
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        // Get current admin username
        const adminUsername = sessionStorage.getItem('adminUsername') || 'admin';
        setCurrentAdminUsername(adminUsername);

        // Load saved free plan limit
        const savedLimit = localStorage.getItem('freePlanLimit');
        if (savedLimit) {
            const limit = parseInt(savedLimit);
            setFreePlanLimit(limit);
            setTempLimit(savedLimit);
        }

        fetchUsers();
        fetchAdmins();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const allAdmins = await getAllAdmins();
            setAdmins(allAdmins);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    const handleUpdatePlan = async (puterId: string, plan: string) => {
        try {
            await updateUserPlan(puterId, plan as 'free' | 'pro' | 'enterprise');
            await fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update plan:', error);
            alert('Failed to update user plan');
        }
    };

    const handleDeleteUser = async (puterId: string, username: string) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            try {
                await deleteUser(puterId);
                await fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleSaveLimit = () => {
        const limit = parseInt(tempLimit);
        if (isNaN(limit) || limit < 1) {
            alert('Please enter a valid number greater than 0');
            return;
        }
        setFreePlanLimit(limit);
        localStorage.setItem('freePlanLimit', limit.toString());
        setShowLimitSaved(true);
        setTimeout(() => setShowLimitSaved(false), 3000);
    };

    const handleCreateAdmin = async () => {
        if (!newAdminData.username || !newAdminData.password) {
            alert('Username and password are required');
            return;
        }

        const result = await createAdmin(
            newAdminData.username,
            newAdminData.password,
            newAdminData.email,
            newAdminData.role,
            currentAdminUsername
        );

        if (result.success) {
            await fetchAdmins();
            setShowCreateAdminModal(false);
            setNewAdminData({ username: '', password: '', email: '', role: 'admin' });
        } else {
            alert(result.error || 'Failed to create admin');
        }
    };

    const handleDeleteAdmin = async (id: string, username: string) => {
        if (window.confirm(`Are you sure you want to delete admin "${username}"?`)) {
            const success = await deleteAdmin(id);
            if (success) {
                await fetchAdmins();
            } else {
                alert('Failed to delete admin');
            }
        }
    };

    const handleUpdateUserLimit = async (puterId: string, limit: number) => {
        try {
            const success = await updateUserLimit(puterId, limit);
            if (success) {
                await fetchUsers();
                setEditingUserLimit(null);
            } else {
                alert('Failed to update user limit');
            }
        } catch (error) {
            console.error('Failed to update user limit:', error);
            alert('Failed to update user limit');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.puterId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    const stats = {
        total: users.length,
        free: users.filter(u => u.plan === 'free').length,
        pro: users.filter(u => u.plan === 'pro').length,
        enterprise: users.filter(u => u.plan === 'enterprise').length,
        totalResumes: users.reduce((sum, u) => sum + u.resumes.length, 0),
        totalUsage: users.reduce((sum, u) => sum + u.usageCount, 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl sticky top-0 h-screen`}>
                {/* Logo Section */}
                <div className="p-5 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold">Admin</h2>
                                    <p className="text-xs text-slate-400">Control Panel</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Toggle sidebar"
                            aria-label="Toggle sidebar"
                        >
                            <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => setActivePage('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                            activePage === 'overview' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                                : 'hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
                    </button>

                    <button
                        onClick={() => setActivePage('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                            activePage === 'users' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                                : 'hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">User Management</span>}
                    </button>

                    <button
                        onClick={() => setActivePage('admins')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                            activePage === 'admins' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                                : 'hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Admin Management</span>}
                    </button>

                    <button
                        onClick={() => setActivePage('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                            activePage === 'settings' 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                                : 'hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Settings</span>}
                    </button>

                    <button
                        onClick={() => navigate('/admin/change-password')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm hover:bg-slate-700/50"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Change Password</span>}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm hover:bg-slate-700/50"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Go to Home</span>}
                    </button>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-700/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-all text-sm"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header Bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {activePage === 'overview' ? 'Dashboard Overview' : 
                                 activePage === 'users' ? 'User Management' : 
                                 activePage === 'admins' ? 'Admin Management' : 'System Settings'}
                            </h1>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {activePage === 'overview' ? 'Monitor system metrics and activity' : 
                                 activePage === 'users' ? 'Manage user accounts and permissions' : 
                                 activePage === 'admins' ? 'Manage administrator accounts and roles' : 'Configure system parameters and limits'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-green-700">System Online</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activePage === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-full">Active</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Users</p>
                                    <p className="text-4xl font-extrabold text-slate-900">{stats.total}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-full">{stats.totalResumes}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Resumes</p>
                                    <p className="text-4xl font-extrabold text-slate-900">{stats.totalResumes}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-purple-600 px-3 py-1 bg-purple-50 rounded-full">Premium</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">Pro Users</p>
                                    <p className="text-4xl font-extrabold text-slate-900">{stats.pro}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-orange-600 px-3 py-1 bg-orange-50 rounded-full">Total</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">API Usage</p>
                                    <p className="text-4xl font-extrabold text-slate-900">{stats.totalUsage}</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl mb-8">
                                <h2 className="text-2xl font-extrabold text-white mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setActivePage('users')}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all text-white font-semibold text-left flex items-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Manage Users
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/change-password')}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all text-white font-semibold text-left flex items-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        Security Settings
                                    </button>
                                    <button
                                        onClick={() => fetchUsers()}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all text-white font-semibold text-left flex items-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activePage === 'users' && (
                        <>
                            {/* Filters */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by username, email, or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400"
                                        />
                                    </div>
                                    <select
                                        value={filterPlan}
                                        onChange={(e) => setFilterPlan(e.target.value)}
                                        title="Filter by plan"
                                        className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-semibold text-slate-700"
                                    >
                                        <option value="all">📊 All Plans</option>
                                        <option value="free">🆓 Free Plan</option>
                                        <option value="pro">⭐ Pro Plan</option>
                                        <option value="enterprise">🚀 Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Plan</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Usage</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Resumes</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {filteredUsers.map((user, index) => (
                                                <tr key={user._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-purple-50 transition-colors`}>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-bold text-slate-900">{user.username}</p>
                                                            <p className="text-sm text-slate-500">{user.email || 'No email'}</p>
                                                            <p className="text-xs text-slate-400 font-mono mt-1">{user.puterId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingUser === user._id ? (
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    value={newPlan}
                                                                    onChange={(e) => setNewPlan(e.target.value)}
                                                                    title="Select new plan"
                                                                    className="px-3 py-1.5 border-2 border-purple-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                >
                                                                    <option value="free">Free</option>
                                                                    <option value="pro">Pro</option>
                                                                    <option value="enterprise">Enterprise</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => handleUpdatePlan(user.puterId, newPlan)}
                                                                    className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                                    title="Save changes"
                                                                    aria-label="Save changes"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingUser(null)}
                                                                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                                    title="Cancel editing"
                                                                    aria-label="Cancel editing"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                                user.plan === 'free' ? 'bg-slate-100 text-slate-700' :
                                                                user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                                {user.plan}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingUserLimit === user._id ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={newUserLimit}
                                                                    onChange={(e) => setNewUserLimit(e.target.value)}
                                                                    min="0"
                                                                    className="w-20 px-2 py-1 border-2 border-purple-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    placeholder="Limit"
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateUserLimit(user.puterId, parseInt(newUserLimit))}
                                                                    className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                                    title="Save limit"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingUserLimit(null)}
                                                                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                                    title="Cancel"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                                                                    <div 
                                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                                                                        style={{
                                                                            width: `${Math.min((user.usageCount / user.maxUsage) * 100, 100)}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                                    {user.usageCount}/{user.maxUsage}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingUserLimit(user._id);
                                                                        setNewUserLimit(user.maxUsage.toString());
                                                                    }}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                    title="Edit limit"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span className="text-sm font-bold text-blue-700">{user.resumes.length}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600 font-medium">
                                                            {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(user._id);
                                                                    setNewPlan(user.plan);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit user plan"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.puterId, user.username)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete user"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-slate-500 font-semibold text-lg">No users found</p>
                                        <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activePage === 'settings' && (
                        <>
                            {/* Global Settings Card */}
                            <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl shadow-2xl border-2 border-purple-100 overflow-hidden mb-8">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-extrabold text-white mb-1">System Configuration</h2>
                                            <p className="text-purple-100 text-sm">Manage global application settings and limits</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Free Plan Usage Limit */}
                                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 mb-2">Free Plan Usage Limit</h3>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    Set the maximum number of resume analyses allowed for free tier users. 
                                                    This limit applies globally to all new and existing free plan users.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Current Limit</p>
                                                    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                                        {freePlanLimit}
                                                    </p>
                                                </div>
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                                    <span className="text-3xl font-extrabold text-purple-600">{freePlanLimit}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Free users can analyze up to {freePlanLimit} resume{freePlanLimit !== 1 ? 's' : ''} before upgrading
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <label htmlFor="usage-limit" className="block text-sm font-bold text-slate-700 mb-2">
                                                Set New Limit
                                            </label>
                                            <div className="flex gap-4">
                                                <div className="flex-1 relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        id="usage-limit"
                                                        min="1"
                                                        max="100"
                                                        value={tempLimit}
                                                        onChange={(e) => setTempLimit(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 text-lg font-semibold bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                        placeholder="Enter limit (e.g., 3, 5, 10)"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSaveLimit}
                                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    Save Changes
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Enter a number between 1 and 100. Changes take effect immediately.
                                            </p>
                                        </div>

                                        {showLimitSaved && (
                                            <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-green-800 font-bold text-sm">Settings Saved Successfully!</p>
                                                        <p className="text-green-700 text-sm">The new limit has been applied to all free plan users.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Cards */}
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">Free Users</h4>
                                            <p className="text-2xl font-extrabold text-blue-600 mb-2">{stats.free}</p>
                                            <p className="text-xs text-slate-600">Currently on free plan</p>
                                        </div>

                                        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">Total Usage</h4>
                                            <p className="text-2xl font-extrabold text-purple-600 mb-2">{stats.totalUsage}</p>
                                            <p className="text-xs text-slate-600">API calls across all users</p>
                                        </div>

                                        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">Avg Usage</h4>
                                            <p className="text-2xl font-extrabold text-green-600 mb-2">
                                                {stats.total > 0 ? (stats.totalUsage / stats.total).toFixed(1) : '0'}
                                            </p>
                                            <p className="text-xs text-slate-600">Per user average</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activePage === 'admins' && (
                        <>
                            {/* Create Admin Button */}
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowCreateAdminModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create New Admin
                                </button>
                            </div>

                            {/* Admins Table */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Username</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Created</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Created By</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {admins.map((admin, index) => (
                                                <tr key={admin._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-purple-50 transition-colors`}>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900">{admin.username}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-600">{admin.email || 'No email'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                            admin.role === 'super_admin' 
                                                                ? 'bg-orange-100 text-orange-700' 
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">
                                                            {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">{admin.createdBy || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleDeleteAdmin(admin._id, admin.username)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete admin"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {admins.length === 0 && (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <p className="text-slate-500 font-semibold text-lg">No admins found</p>
                                    </div>
                                )}
                            </div>

                            {/* Create Admin Modal */}
                            {showCreateAdminModal && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                                        <button
                                            onClick={() => setShowCreateAdminModal(false)}
                                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Close modal"
                                            aria-label="Close modal"
                                        >
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Admin</h2>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Username *</label>
                                                <input
                                                    type="text"
                                                    value={newAdminData.username}
                                                    onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter username"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                                                <input
                                                    type="password"
                                                    value={newAdminData.password}
                                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={newAdminData.email}
                                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter email (optional)"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                                <select
                                                    value={newAdminData.role}
                                                    onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value as 'admin' | 'super_admin' })}
                                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    title="Select admin role"
                                                    aria-label="Select admin role"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    onClick={handleCreateAdmin}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                                                >
                                                    Create Admin
                                                </button>
                                                <button
                                                    onClick={() => setShowCreateAdminModal(false)}
                                                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
