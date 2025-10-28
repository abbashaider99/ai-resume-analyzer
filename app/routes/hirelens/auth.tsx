import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: 'HireLens | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect(() => {
        if(auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next])

    return (
        <main className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    {/* Left Side - Branding & Info */}
                    <div className="hidden lg:block space-y-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold text-purple-700">Secure Authentication</span>
                            </div>
                            <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight">
                                Welcome to<br />
                                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                                    HireLens
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                AI-powered resume analysis to help you land your dream job. Sign in to continue your journey.
                            </p>
                        </div>

                        {/* Security Features */}
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">End-to-End Encryption</p>
                                    <p className="text-xs text-slate-500">Your data is always protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Complete Privacy</p>
                                    <p className="text-xs text-slate-500">Only you can access your files</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">No Data Sharing</p>
                                    <p className="text-xs text-slate-500">We never sell your information</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Sign In Form */}
                    <div className="w-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
                            {/* Mobile Header - Only visible on small screens */}
                            <div className="lg:hidden text-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
                                <p className="text-sm text-slate-600">Sign in to continue</p>
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden lg:block mb-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Sign In</h2>
                                <p className="text-sm text-slate-600">Access your account securely</p>
                            </div>

                            {/* Security Badges - Mobile Only */}
                            <div className="lg:hidden mb-5 flex justify-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs font-semibold text-green-700">Secure</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs font-semibold text-blue-700">Private</span>
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    <button 
                                        disabled
                                        className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg opacity-75 flex items-center justify-center gap-2"
                                    >
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Signing in...</span>
                                    </button>
                                ) : (
                                    <>
                                        {auth.isAuthenticated ? (
                                            <button 
                                                onClick={auth.signOut}
                                                className="w-full px-6 py-3.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Sign Out</span>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={auth.signIn}
                                                className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group"
                                            >
                                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Sign In with Puter</span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Info Text */}
                                <div className="text-center pt-3 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        Secured by{" "}
                                        <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold underline decoration-purple-200 hover:decoration-purple-400 transition-colors">
                                            Puter
                                        </a>
                                        {" "}• 256-bit SSL encryption
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Auth
