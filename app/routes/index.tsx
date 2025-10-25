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
    icon: "📄",
    path: "/hirelens",
    color: "from-brand-primary to-brand-secondary",
    status: "live",
    tags: ["AI", "Resume", "Career"],
  },
  {
    id: "coming-soon-1",
    name: "More Tools",
    description: "More amazing tools are coming soon. Stay tuned!",
    icon: "🚀",
    path: "#",
    color: "from-gray-400 to-gray-500",
    status: "coming-soon",
    tags: ["Coming Soon"],
  },
];

// --- Components ---
const Hero = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-32 px-4 sm:px-6 lg:px-8">
    {/* Background Decoration */}
    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-200 to-transparent rounded-full opacity-30 blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-pink-200 to-transparent rounded-full opacity-30 blur-3xl"></div>

    <div className="max-w-5xl mx-auto text-center relative z-10">
      <div className="inline-block mb-6">
        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
          Welcome to Abbas Logic
        </span>
      </div>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
        Powerful Tools for
        <span className="block bg-gradient-to-r from-brand-primary via-brand-secondary to-purple-600 bg-clip-text text-transparent">
          Modern Professionals
        </span>
      </h1>
      <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
        A collection of AI-powered tools designed to boost your productivity and help you achieve more.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#tools"
          className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Explore Tools
        </a>
        <a
          href="#about"
          className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-slate-700 font-semibold rounded-full shadow-lg border-2 border-gray-200 transition-all duration-300"
        >
          Learn More
        </a>
      </div>
    </div>
  </div>
);

const ToolCard = ({ tool }: { tool: Tool }) => {
  const isComingSoon = tool.status === "coming-soon";

  if (isComingSoon) {
    return (
      <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 opacity-75 cursor-not-allowed">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            Coming Soon
          </span>
        </div>

        {/* Gradient Header */}
        <div className={`h-32 bg-gradient-to-br ${tool.color} relative`}>
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Icon */}
        <div className="absolute top-20 left-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl border-4 border-white">
            {tool.icon}
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 p-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed min-h-[60px]">
            {tool.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
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
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
    >
      {/* Status Badge */}
      {isComingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-6 translate-y-6"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Icon */}
      <div className="absolute top-20 left-6">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl border-4 border-white">
          {tool.icon}
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-slate-600 mb-4 leading-relaxed min-h-[60px]">
          {tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center text-brand-primary font-semibold group-hover:text-brand-secondary transition-colors">
          <span>Explore Tool</span>
          <svg
            className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
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
  <section id="tools" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Explore Our Tools
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Carefully crafted tools to help you work smarter, not harder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  </section>
);

const AboutSection = () => (
  <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-purple-50">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          About Abbas Logic
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Abbas Logic is a collection of powerful, AI-driven tools designed to solve real-world problems and enhance productivity for modern professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: "🎯",
            title: "Purpose-Built",
            description: "Each tool is carefully designed to solve specific challenges and deliver real value.",
          },
          {
            icon: "🤖",
            title: "AI-Powered",
            description: "Leveraging cutting-edge AI technology to provide intelligent insights and automation.",
          },
          {
            icon: "🔒",
            title: "Privacy First",
            description: "Your data security and privacy are our top priorities in every tool we build.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-secondary to-purple-700">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
    </div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 shadow-2xl">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold !text-white mb-6 leading-tight">
        Ready to Get Started?
      </h2>
      <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto">
        Choose a tool and start improving your workflow today. Join thousands of professionals already using our platform.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#tools"
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-primary font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          Browse Tools
          <svg
            className="w-5 h-5 ml-2"
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
        </a>
        <a
          href="/about"
          className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-brand-primary transition-all duration-300"
        >
          Learn More About Us
        </a>
      </div>
    </div>
  </section>
);

const MainFooter = () => (
  <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Abbas Logic
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Building powerful tools to help you achieve more.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#tools" className="text-slate-400 hover:text-white transition-colors">
                Tools
              </a>
            </li>
            <li>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                About
              </a>
            </li>
            <li>
              <Link to="/hirelens" className="text-slate-400 hover:text-white transition-colors">
                HireLens
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Connect</h4>
          <div className="flex gap-4">
            <a
              href="https://github.com/abbashaider99"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 text-center">
        <p className="text-slate-400">
          © {new Date().getFullYear()} Abbas Logic. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// --- Main Component ---
export function meta() {
  return [
    { title: "Abbas Logic - Powerful Tools for Modern Professionals" },
    {
      name: "description",
      content: "A collection of AI-powered tools designed to boost your productivity and help you achieve more.",
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
      <CTASection />
    </div>
  );
}
