import abbaslogicLogo from "../assets/abbaslogic-logo-footer.png";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={abbaslogicLogo} 
                alt="Abbas Logic Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              Empowering professionals with intelligent tools for resume analysis, website verification, and career advancement.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/abbashaider14"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-brand-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/abbashaider99"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-brand-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/abbashaiderbaqri"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-700/50 hover:bg-brand-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="font-bold mb-4 text-lg flex items-center">
             
              Our Tools
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/hirelens" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  HireLens - AI Resume Analyzer
                </a>
              </li>
              <li>
                <a href="/website-checker" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Website Trust Checker
                </a>
              </li>
              <li>
                <a href="/ats-checker" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  ATS Score Checker
                </a>
              </li>
              <li>
                <a href="/#tools" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  View All Tools
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="font-bold mb-4 text-lg flex items-center">
             
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-slate-300 hover:text-purple-400 transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover:scale-150 transition-transform"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="font-bold mb-4 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Stay Updated
            </h4>
            <p className="text-slate-300 text-sm mb-4">
              Get the latest updates on new tools and features.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Abbas Logic. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Developed by</span>
              <a
                href="https://techglobiz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-purple-400 transition-colors font-semibold"
              >
                TechGlobiz
              </a>
              <span>•</span>
              <a
                href="https://github.com/abbashaider99"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-purple-400 transition-colors font-semibold"
              >
                Abbas Haider
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;