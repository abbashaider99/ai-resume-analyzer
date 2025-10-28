import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";

export const meta = () => [
  { title: "About | HireLens - AI Resume Analyzer by Abbas Haider" },
  {
    name: "description",
    content: "Learn about HireLens and Abbas Haider, a passionate MERN Stack Developer building innovative AI-powered tools for job seekers.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              About the Creator
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Meet{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Abbas Haider
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              MERN Stack Developer passionate about building AI-powered tools that help people achieve their career goals
            </p>
          </div>

          {/* Profile Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-12">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <img
                  src="https://media.licdn.com/dms/image/v2/D5603AQFaxyPAi48gLQ/profile-displayphoto-scale_400_400/B56ZkizQFRI8Ag-/0/1757225485853?e=1762992000&v=beta&t=1RgWEfK8vZygwiTWcglhx44pb1XcCIchVC69QxtdaE8"
                  alt="Abbas Haider - MERN Stack Developer"
                  className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Abbas Haider
              </h2>
              <p className="text-xl text-purple-600 font-semibold mb-4">
                Full-Stack Developer • MERN Specialist
              </p>
              <p className="text-base text-slate-600 leading-relaxed mb-6">
                Building dynamic, scalable, and user-focused web applications with modern technologies. 
                Creator of HireLens, an AI-powered resume analyzer helping job seekers land their dream jobs.
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="https://www.linkedin.com/in/abbashaider14"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/abbashaider99"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://www.instagram.com/abbashaiderbaqri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Professional Journey */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              My Professional{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              From education administration to full-stack development—building innovative solutions that make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Background */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Where I Started</h3>
              <p className="text-slate-700 leading-relaxed">
                My career began as an <strong>Education Administrator</strong>, where I developed essential skills in 
                communication, problem-solving, and helping others achieve their goals. This experience taught me the 
                importance of understanding user needs and delivering solutions that truly matter.
              </p>
            </div>

            {/* Transition */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">The Transition</h3>
              <p className="text-slate-700 leading-relaxed">
                Following my passion for technology, I transitioned into <strong>full-stack development</strong>. 
                I immersed myself in the MERN stack, completed certifications in Google Cloud, SQL, and Data Science, 
                and started building real-world applications that solve meaningful problems.
              </p>
            </div>
          </div>

          {/* HireLens Card */}
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Why I Built HireLens</h3>
            </div>
            <p className="text-white/90 leading-relaxed text-lg">
              HireLens was born from my own experience navigating the job market. I saw talented individuals struggle to 
              present their skills effectively. By combining AI with my development expertise, I created a tool that provides 
              instant, personalized feedback—helping job seekers optimize their resumes and increase their chances of landing 
              their dream jobs. It's my way of using technology to help others achieve their career goals, just like I once 
              helped students achieve their academic goals.
            </p>
          </div>
        </div>
      </section>

      {/* My Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 text-center">What Drives Me</h2>
          
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            <p>
              As a <strong className="text-purple-600">MERN Stack Developer</strong>, I specialize in building dynamic, 
              scalable, and user-focused web applications. My expertise spans <strong className="text-purple-600">JavaScript, 
              React, Node.js, MongoDB</strong>, and API-driven architecture.
            </p>
            
            <p>
              What sets me apart is my ability to combine technical skills with real-world problem-solving. I don't just 
              write code—I build solutions that address genuine challenges people face. Whether it's improving system 
              performance, enhancing UI/UX, or creating secure backend systems, I focus on delivering value.
            </p>
            
            <p>
              I'm a firm believer in <strong>continuous learning and growth</strong>. Beyond development, I've completed 
              certifications in Google Cloud, SQL, Data Science Math Skills, Digital Marketing, and Communication Foundations. 
              This well-rounded knowledge helps me approach problems from multiple angles and build more thoughtful, 
              user-centric products.
            </p>
            
            <p>
              I love turning ideas into meaningful digital experiences. Every project I work on is an opportunity to 
              learn something new, push my boundaries, and create something that makes a positive impact. I'm always 
              excited to take on innovative challenges that help me grow as a developer and as a problem solver.
            </p>
          </div>
        </div>
      </section>

      {/* Skills & Tech Stack */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
            Skills & Technologies
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { category: "Frontend", skills: ["React.js", "TypeScript", "Tailwind CSS", "HTML5/CSS3"], icon: "🎨" },
              { category: "Backend", skills: ["Node.js", "Express.js", "RESTful APIs", "Authentication"], icon: "⚙️" },
              { category: "Database", skills: ["MongoDB", "SQL", "Data Modeling", "Query Optimization"], icon: "💾" },
              { category: "Tools & Platforms", skills: ["Git/GitHub", "VS Code", "Vite", "Docker"], icon: "🛠️" },
              { category: "Cloud & DevOps", skills: ["Google Cloud", "Deployment", "CI/CD", "Monitoring"], icon: "☁️" },
              { category: "AI & Modern Tech", skills: ["AI Integration", "API Development", "Modern Frameworks", "Web Performance"], icon: "🤖" },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.category}</h3>
                <ul className="space-y-2">
                  {item.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Goal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-6">🎯</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Career Goal</h2>
          <p className="text-xl text-white leading-relaxed mb-8">
            To contribute to impactful products as a <strong>Full-Stack Developer</strong> while continuously 
            advancing my expertise in cloud technologies, AI-powered development, and product-driven design. 
            I aim to build solutions that make a real difference in people's lives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
              Innovation
            </div>
            <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
              User-Centric Design
            </div>
            <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
              Continuous Learning
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Let's Connect</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Interested in collaborating, have questions about HireLens, or just want to chat about tech? 
            I'd love to hear from you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Get in Touch
            </a>
            <a
              href="/hirelens"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-purple-600 font-semibold rounded-full shadow-lg border-2 border-purple-600 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Try HireLens
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
