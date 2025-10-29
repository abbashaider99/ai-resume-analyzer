import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { getUserFromMongoDB, getUserResumes } from "~/lib/db";
import { usePuterStore } from "~/lib/puter";

const Dashboard = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.isAuthenticated || !auth.user) {
            navigate('/hirelens/auth?next=/dashboard');
            return;
        }

        const fetchUserData = async () => {
            try {
                const user = await getUserFromMongoDB(auth.user!.uuid);
                setUserData(user);

                const userResumes = await getUserResumes(auth.user!.uuid);
                setResumes(userResumes);
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
            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{auth.user?.username}</span>! 👋
                    </h1>
                    <p className="text-lg text-slate-600">Here's your resume analysis dashboard</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Plan Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Current Plan</p>
                                <p className="text-2xl font-bold text-slate-900 capitalize">{userData?.plan || 'Free'}</p>
                            </div>
                        </div>
                        {userData?.plan !== 'free' && (
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                                {userData?.plan.toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Usage Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Analyses Used</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {userData?.usageCount || 0} / {userData?.maxUsage === -1 ? '∞' : userData?.maxUsage || 5}
                                </p>
                            </div>
                        </div>
                        {userData?.maxUsage !== -1 && (
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(((userData?.usageCount || 0) / (userData?.maxUsage || 5)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Resumes Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Resumes</p>
                                <p className="text-2xl font-bold text-slate-900">{resumes.length}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Analyzed resumes saved</p>
                    </div>
                </div>

                {/* Recent Resumes */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Resume Analyses</h2>
                    
                    {resumes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-600 mb-4">No resumes analyzed yet</p>
                            <button
                                onClick={() => navigate('/hirelens/upload')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                            >
                                Analyze Your First Resume
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resumes.slice(0, 5).map((resume) => (
                                <div key={resume.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                                            {resume.jobTitle?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{resume.jobTitle || 'Resume Analysis'}</h3>
                                            <p className="text-sm text-slate-600">{resume.companyName || 'No company'} • {new Date(resume.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/hirelens/resume/${resume.id}`)}
                                        className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Dashboard;
