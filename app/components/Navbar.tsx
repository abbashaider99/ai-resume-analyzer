import { useRef, useState } from "react";
import { Link, useNavigate, useNavigation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import abbaslogicLogo from "../assets/abbaslogic-logo.png";
import Toast from "./Toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accountDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";
  const { auth } = usePuterStore();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsToolsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsToolsDropdownOpen(false);
    }, 300);
  };

  const tools = [
    {
      name: "HireLens",
      description: "AI Resume Analyzer",
      path: "/hirelens",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "BMI Calculator",
      description: "Health & Fitness Insights",
      path: "/bmi-calculator",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: "Website Checker",
      description: "Security Analysis",
      path: "/website-checker",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      {/* Constrained container matching main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={abbaslogicLogo} 
              alt="Abbas Logic Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Tools Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="text-gray-700 hover:text-brand-primary font-medium text-base px-3 py-2 rounded-md hover:bg-purple-50 transition-colors duration-200 flex items-center gap-1"
              >
                Tools
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isToolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {tools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors duration-200 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-200">
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {tool.description}
                        </div>
                      </div>
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all duration-200 mt-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                  
                  {/* View All Tools Link */}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link
                      to="/#tools"
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-purple-50 transition-colors duration-200"
                    >
                      View All Tools
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link
              to="/about"
              className="text-gray-700 hover:text-brand-primary font-medium text-base px-3 py-2 rounded-md hover:bg-purple-50 transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-brand-primary font-medium text-base px-3 py-2 rounded-md hover:bg-purple-50 transition-colors duration-200"
            >
              Contact
            </Link>
            
            {/* User Account Dropdown or Get Started */}
            {auth.isAuthenticated && auth.user ? (
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (accountDropdownTimeoutRef.current) {
                    clearTimeout(accountDropdownTimeoutRef.current);
                  }
                  setIsAccountDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  accountDropdownTimeoutRef.current = setTimeout(() => {
                    setIsAccountDropdownOpen(false);
                  }, 300);
                }}
              >
                <button
                  className="text-gray-700 hover:text-brand-primary font-medium text-base px-3 py-2 rounded-md hover:bg-purple-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {auth.user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>Hello, {auth.user.username}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Account Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-brand-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      to="/my-account"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-brand-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Account
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={async () => {
                        // Logout functionality
                        setIsAccountDropdownOpen(false);
                        await usePuterStore.getState().auth.signOut();
                        setToastMessage('Successfully logged out!');
                        setShowToast(true);
                        setTimeout(() => {
                          navigate('/');
                        }, 1500);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/hirelens/auth"
                className="primary-button w-fit flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="p-2.5 rounded-md text-gray-700 hover:text-brand-primary hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors duration-200"
              aria-expanded={isMenuOpen ? "true" : "false"}
              aria-label="Toggle navigation menu"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'block max-h-[500px] opacity-100' : 'hidden max-h-0 opacity-0'
        } bg-white border-t border-gray-200 overflow-auto`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
          {/* Tools Expandable Section */}
          <div>
            <button
              onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
            >
              <span>Tools</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isMobileToolsOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mobile Tools Submenu */}
            {isMobileToolsOpen && (
              <div className="mt-2 ml-4 space-y-1">
                {tools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileToolsOpen(false);
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600">
                      {tool.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          {/* Mobile Account Section */}
          {auth.isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/my-account"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-purple-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
              <button
                onClick={async () => {
                  setIsMenuOpen(false);
                  await usePuterStore.getState().auth.signOut();
                  setToastMessage('Successfully logged out!');
                  setShowToast(true);
                  setTimeout(() => {
                    navigate('/');
                  }, 1500);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/hirelens/auth"
              className="primary-button w-fit flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isNavigating && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-1">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;