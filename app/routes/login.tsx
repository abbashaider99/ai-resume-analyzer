import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Toast from "~/components/Toast";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
  { title: "Login" },
  { name: "description", content: "Sign in to your Abbas Logic account" },
]);

// A simple, generic login page replacing /hirelens/auth
const Login = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const next = location.search.split("next=")[1] || "/";
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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
      setToastMessage("Signed in");
      setShowToast(true);
      setTimeout(() => navigate(next), 600);
    } catch (e) {
      setSigningIn(false);
      setToastMessage("Sign in failed");
      setShowToast(true);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Login</h1>
        <p className="text-sm text-slate-600 mb-6 text-center">Sign in to continue.</p>
        {isLoading || signingIn ? (
          <button
            disabled
            className="w-full px-4 py-2 bg-slate-300 text-slate-600 rounded-lg flex items-center justify-center gap-2"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-transparent"></div>
            <span>Signing in...</span>
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Sign in with Puter
          </button>
        )}
        <p className="text-[11px] text-slate-500 mt-4 text-center">Powered by Puter. Your data stays private.</p>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </main>
  );
};

export default Login;
