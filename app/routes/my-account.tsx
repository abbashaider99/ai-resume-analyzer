import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { getUserFromMongoDB } from "~/lib/db";
import { usePuterStore } from "~/lib/puter";

const MyAccount = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.isAuthenticated || !auth.user) {
            navigate('/hirelens/auth?next=/my-account');
            return;
        }

        const fetchUserData = async () => {
            try {
                const user = await getUserFromMongoDB(auth.user!.uuid);
                setUserData(user);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [auth.isAuthenticated, auth.user, navigate]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navbar />
            
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">My Account</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                            {auth.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">{auth.user?.username}</h2>
                            <p className="text-slate-600">{userData?.email || 'No email provided'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">User ID</p>
                            <p className="font-mono text-sm text-slate-900">{auth.user?.uuid}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Member Since</p>
                            <p className="font-semibold text-slate-900">
                                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                }) : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Subscription Details</h3>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                            <p className="text-3xl font-bold text-slate-900 capitalize">{userData?.plan || 'Free'}</p>
                        </div>
                        {userData?.plan === 'free' && (
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                            >
                                Upgrade to Pro
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Analyses Used</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {userData?.usageCount || 0} / {userData?.maxUsage === -1 ? '∞' : userData?.maxUsage || 5}
                            </p>
                            {userData?.maxUsage !== -1 && (
                                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(((userData?.usageCount || 0) / (userData?.maxUsage || 5)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Remaining Analyses</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {userData?.maxUsage === -1 ? '∞' : Math.max((userData?.maxUsage || 5) - (userData?.usageCount || 0), 0)}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                {userData?.plan === 'free' ? 'Upgrade for unlimited' : 'Unlimited analyses'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900">View Dashboard</p>
                                <p className="text-xs text-slate-600">See your analytics</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/hirelens/upload')}
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left"
                        >
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900">Analyze Resume</p>
                                <p className="text-xs text-slate-600">Upload new resume</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/change-password')}
                            className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl hover:border-orange-300 transition-all text-left"
                        >
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-slate-900">Change Password</p>
                                <p className="text-xs text-slate-600">Update security</p>
                            </div>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default MyAccount;
