import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { changeAdminPassword } from "~/lib/db";

const AdminChangePassword = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Check admin authentication
    const isAdmin = sessionStorage.getItem('adminAuth');
    const adminUsername = sessionStorage.getItem('adminUsername') || 'admin';
    if (!isAdmin) {
        navigate('/admin/login');
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation
        if (newPassword.length < 12) {
            setError('New password must be at least 12 characters long for admin accounts');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        // Check if password contains required complexity
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            setError('Password must contain uppercase, lowercase, numbers, and special characters');
            setLoading(false);
            return;
        }

        try {
            // Change password via API
            const result = await changeAdminPassword(adminUsername, currentPassword, newPassword);
            
            if (result.success) {
                setSuccess('Admin password changed successfully! You will be logged out for security.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                // Logout and redirect after 2 seconds
                setTimeout(() => {
                    sessionStorage.removeItem('adminAuth');
                    sessionStorage.removeItem('adminUsername');
                    sessionStorage.removeItem('adminRole');
                    navigate('/admin/login');
                }, 2000);
            } else {
                setError(result.error || 'Failed to change password. Please check your current password.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-16 pb-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-xl mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Change Admin Password</h1>
                    <p className="text-slate-600 text-sm">Update administrator credentials</p>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                    {/* Security Warning */}
                    <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-red-900 text-sm mb-1">⚠️ High Security Account</p>
                                <p className="text-sm text-red-800">Admin password must be at least 12 characters with uppercase, lowercase, numbers, and special characters.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-red-800 font-semibold text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-green-800 font-semibold text-sm">{success}</p>
                                </div>
                            </div>
                        )}

                        <div className="w-full">
                            <label htmlFor="currentPassword" className="block text-sm font-bold text-slate-700 mb-1.5">
                                Current Admin Password
                            </label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all"
                                    placeholder="Enter current admin password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 mb-1.5">
                                New Admin Password
                            </label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all"
                                    placeholder="Enter new admin password"
                                    required
                                    minLength={12}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">Must be at least 12 characters with uppercase, lowercase, numbers, and special characters</p>
                        </div>

                        <div className="w-full">
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all"
                                    placeholder="Confirm new admin password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-1">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="flex-1 px-6 py-2.5 bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Change Admin Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-semibold text-orange-900 text-sm mb-1">🔐 Admin Security Best Practices</p>
                                <ul className="text-xs text-orange-800 space-y-1">
                                    <li>• Use a unique password not used anywhere else</li>
                                    <li>• Include uppercase, lowercase, numbers, and special characters</li>
                                    <li>• Avoid common words or patterns</li>
                                    <li>• Change password every 90 days</li>
                                    <li>• Never share admin credentials</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChangePassword;
