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
        <main className="bg-gradient-to-br from-purple-50 via-white to-pink-50 min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                            Secure Sign In
                        </h1>
                        <p className="text-sm text-slate-600">
                            Continue with your resume analysis
                        </p>
                    </div>

                    {/* Security Features - Compact Grid */}
                    <div className="mb-6 grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mb-1.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-green-900 leading-tight">Encrypted</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mb-1.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-blue-900 leading-tight">Private</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mb-1.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold text-purple-900 leading-tight">Secure</p>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <div className="space-y-3">
                        {isLoading ? (
                            <button 
                                disabled
                                className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg opacity-75 flex items-center justify-center gap-2"
                            >
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Signing in...</span>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <button 
                                        onClick={auth.signOut}
                                        className="w-full px-5 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={auth.signIn}
                                        className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign In with Puter</span>
                                    </button>
                                )}
                            </>
                        )}

                        {/* Info Text */}
                        <div className="text-center pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Secured by{" "}
                                <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold">
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
