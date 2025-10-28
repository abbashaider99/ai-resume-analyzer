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
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                                HireLens
                            </span>
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600">
                            Sign in to access AI-powered resume analysis
                        </p>
                    </div>

                    {/* Security Features */}
                    <div className="mb-6 space-y-2.5 bg-slate-50 rounded-xl p-4">
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
        </main>
    )
}

export default Auth
