import { useRef, useState } from "react";
import { Link, useNavigation } from "react-router";
import abbaslogicLogo from "../assets/abbaslogic-logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

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
            <Link
              to="/hirelens"
              className="primary-button w-fit"
            >
              Get Started
            </Link>
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
          <Link
            to="/hirelens"
            className="primary-button w-fit"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Loading Indicator */}
      {isNavigating && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-1">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;