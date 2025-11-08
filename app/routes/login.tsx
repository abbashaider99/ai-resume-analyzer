import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Toast from "~/components/Toast";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
  { title: "Login" },
  { name: "description", content: "Sign in to your account" },
]);

// Login page using the previous HireLens design, with generic text
const Login = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split('next=')[1] || '/';
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && !signingIn) {
      navigate(next);
    }
  }, [auth.isAuthenticated, next, navigate, signingIn]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await auth.signIn();
      setToastMessage('Successfully signed in!');
      setShowToast(true);
      setTimeout(() => {
        navigate(next);
      }, 1000);
    } catch (error) {
      setSigningIn(false);
      setToastMessage('Sign in failed. Please try again.');
      setShowToast(true);
    }
  };

  return (
    <main className="bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Login
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Sign in to continue
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
                <p className="text-xs text-slate-500">Your data is protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Private</p>
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
                <p className="text-xs text-slate-500">We never sell your info</p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            {isLoading || signingIn ? (
              <button 
                disabled
                className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg opacity-75 flex items-center justify-center gap-2"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Signing in...</span>
              </button>
            ) : (
              <button 
                onClick={handleSignIn}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In with Puter</span>
              </button>
            )}

            {/* Info Text */}
            <div className="text-center pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Secured by <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold underline decoration-purple-200 hover:decoration-purple-400 transition-colors">Puter</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </main>
  );
}

export default Login;
