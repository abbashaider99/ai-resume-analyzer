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
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            Secure Sign In
                        </h1>
                        <p className="text-base text-slate-600">
                            Sign in to continue with your resume analysis
                        </p>
                    </div>

                    {/* Security Features */}
                    <div className="mb-8 space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-green-900">End-to-End Encryption</p>
                                <p className="text-xs text-green-700 mt-0.5">Your data is encrypted and secure</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900">Privacy Protected</p>
                                <p className="text-xs text-blue-700 mt-0.5">Only you can access your files</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-purple-900">No Data Sharing</p>
                                <p className="text-xs text-purple-700 mt-0.5">We never sell or share your information</p>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <button 
                                disabled
                                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg opacity-75 flex items-center justify-center gap-3"
                            >
                                <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                                <span>Signing you in...</span>
                            </button>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <button 
                                        onClick={auth.signOut}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={auth.signIn}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign In with Puter</span>
                                    </button>
                                )}
                            </>
                        )}

                        {/* Info Text */}
                        <div className="text-center pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                By signing in, you agree to our secure authentication powered by{" "}
                                <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold">
                                    Puter
                                </a>
                                . Your credentials are never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Security Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        <svg className="w-4 h-4 inline-block mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">256-bit SSL encryption</span> protects all data transfers
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Auth
