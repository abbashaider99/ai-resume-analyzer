import { Link } from "react-router";
import Navbar from "~/components/Navbar";

// --- Tool Interface ---
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  status: "live" | "coming-soon";
  tags: string[];
}

const tools: Tool[] = [
  {
    id: "hirelens",
    name: "HireLens",
    description: "AI-powered resume analyzer that helps you optimize your resume for ATS systems and get hired faster.",
    icon: "document",
    path: "/hirelens",
    color: "from-brand-primary to-brand-secondary",
    status: "live",
    tags: ["AI", "Resume", "Career"],
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index and get AI-powered personalized health improvement tips and recommendations.",
    icon: "heart",
    path: "/bmi-calculator",
    color: "from-green-500 to-emerald-600",
    status: "live",
    tags: ["AI", "Health", "Fitness"],
  },
  {
    id: "website-checker",
    name: "Website Checker",
    description: "Check if a website is safe and legitimate using AI-powered security analysis with trust scores and safety tips.",
    icon: "shield",
    path: "/website-checker",
    color: "from-blue-500 to-cyan-600",
    status: "live",
    tags: ["AI", "Security", "Safety"],
  },
  {
    id: "coming-soon-1",
    name: "More Tools",
    description: "More amazing tools are coming soon. Stay tuned!",
    icon: "sparkles",
    path: "#",
    color: "from-gray-400 to-gray-500",
    status: "coming-soon",
    tags: ["Coming Soon"],
  },
];

// --- Components ---
const getToolIcon = (iconName: string) => {
  switch (iconName) {
    case 'document':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return null;
  }
};

const Hero = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20 px-4 sm:px-6 lg:px-8 mt-16">
    {/* Floating 3D Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orb - top right */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float"></div>
      
      {/* Medium gradient orb - bottom left */}
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-2xl animate-float-delay-1"></div>
      
      {/* Small gradient orb - middle */}
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-2xl animate-float-delay-2"></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-32 left-20 w-16 h-16 border-2 border-purple-300/30 rounded-lg rotate-12 animate-spin-slow"></div>
      <div className="absolute bottom-32 right-32 w-20 h-20 border-2 border-pink-300/30 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-purple-200/40 to-transparent rounded-lg rotate-45 animate-float-delay-1"></div>
    </div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      {/* Badge */}
      <div className="inline-block mb-6">
        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold backdrop-blur-sm">
          Welcome to Abbas Logic
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
        Helpful tools for work
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        Simple, useful tools to save time and get things done.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <a
          href="#tools"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          Explore Tools →
        </a>
        <a
          href="#about"
          className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-full shadow-md border border-slate-200 hover:border-purple-300 transition-all duration-200"
        >
          Learn More
        </a>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {[
          { number: '3+', label: 'AI Tools' },
          { number: '100%', label: 'Free' },
          { number: '24/7', label: 'Available' },
          { number: '∞', label: 'Possibilities' }
        ].map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              {stat.number}
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ToolCard = ({ tool }: { tool: Tool }) => {
  const isComingSoon = tool.status === "coming-soon";

  if (isComingSoon) {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden opacity-70 hover:shadow-xl transition-shadow duration-300">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-semibold rounded-full shadow-sm">
            Coming Soon
          </span>
        </div>

        {/* Modern Gradient Header with Pattern */}
        <div className={`h-40 bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Floating Icon */}
        <div className="absolute top-32 left-6">
          <div className="w-16 h-16 bg-white rounded-xl shadow-xl flex items-center justify-center text-white border-2 border-white">
            {getToolIcon(tool.icon)}
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-6 pb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {tool.name}
          </h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed min-h-[48px]">
            {tool.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={tool.path}
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Modern Gradient Header with Pattern */}
      <div className={`h-40 bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
        {/* Animated decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full transition-transform duration-500 group-hover:scale-110"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full transition-transform duration-500 group-hover:scale-110"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full transition-transform duration-500 group-hover:scale-150"></div>
      </div>

      {/* Floating Icon with better shadow */}
      <div className="absolute top-32 left-6 transition-transform duration-300 group-hover:scale-110">
        <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl shadow-xl flex items-center justify-center text-white border-2 border-white group-hover:shadow-2xl group-hover:shadow-purple-500/30`}>
          {getToolIcon(tool.icon)}
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-6 pb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
          {tool.name}
        </h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed min-h-[48px]">
          {tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-100/50 group-hover:bg-purple-100 group-hover:border-purple-200 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA with better animation */}
        <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-pink-600 transition-colors duration-200">
          <span>Explore Tool</span>
          <svg
            className="w-4 h-4 ml-1 transform group-hover:translate-x-2 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

const ToolsSection = () => (
  <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white mt-8">
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-3">
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            ✨ Our Tools
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Explore our tools
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Carefully crafted tools to help you work smarter, enhance security, and achieve your professional goals.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Features Grid */}
      <div className="mt-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Why use these?
          </h3>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            They are fast, simple and free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Lightning Fast",
              description: "Instant results powered by advanced AI algorithms"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Secure & Private",
              description: "Your data is encrypted and never stored permanently"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "100% Free",
              description: "All tools are completely free with no hidden costs"
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: "AI-Powered",
              description: "Leveraging cutting-edge AI for intelligent insights"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                {feature.icon}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const AboutSection = () => (
  <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 text-white">
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-3">
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-purple-300 rounded-full text-sm font-semibold">
            About Us
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-white">Empowering Professionals with</span>
          <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
            Innovative AI Solutions
          </span>
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Abbas Logic is dedicated to creating powerful, AI-driven tools that solve real-world problems and enhance productivity for modern professionals worldwide.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: "Purpose-Built",
            description: "Each tool is meticulously designed to solve specific challenges and deliver measurable value to your workflow."
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: "AI-Powered",
            description: "Leveraging cutting-edge artificial intelligence to provide intelligent insights, automation, and analysis."
          },
          {
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ),
            title: "Privacy First",
            description: "Your data security and privacy are our top priorities. We never store your sensitive information permanently."
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
            <p className="text-slate-300 leading-relaxed text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-2xl font-bold mb-3 text-white">Our Mission</h3>
          <p className="text-base text-slate-300 leading-relaxed">
            To democratize access to powerful AI tools that help professionals save time, make better decisions, and achieve their goals—all while maintaining the highest standards of privacy and security.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// --- Main Component ---
export function meta() {
  return [
    { title: "Abbas Logic - Powerful AI-Powered Tools for Modern Professionals" },
    {
      name: "description",
      content: "Unlock your potential with AI-powered tools for resume analysis, website security checks, and more. 100% free and secure.",
    },
  ];
}

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ToolsSection />
      <AboutSection />
    </div>
  );
}
