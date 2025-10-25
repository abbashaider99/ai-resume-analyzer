import Navbar from "~/components/Navbar";

export const meta = () => [
  { title: "About Me - Abbas Haider | MERN Stack Developer" },
  {
    name: "description",
    content: "Passionate MERN Stack Developer building scalable web applications with React, Node.js, and MongoDB.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Photo */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-200 to-transparent rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-pink-200 to-transparent rounded-full opacity-30 blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl blur-2xl opacity-30"></div>
                <img
                  src="https://media.licdn.com/dms/image/v2/D5603AQFaxyPAi48gLQ/profile-displayphoto-scale_400_400/B56ZkizQFRI8Ag-/0/1757225485853?e=1762992000&v=beta&t=1RgWEfK8vZygwiTWcglhx44pb1XcCIchVC69QxtdaE8"
                  alt="Abbas Haider - MERN Stack Developer"
                  className="relative w-64 h-64 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center md:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-purple-600 bg-clip-text text-transparent">
                  Abbas Haider
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl text-slate-600 font-medium mb-6">
                MERN Stack Developer
              </p>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Building dynamic, scalable, and user-focused web applications with modern technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-16">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              I am a passionate <strong>MERN Stack Developer</strong> with strong experience in building dynamic, scalable, and user-focused web applications. Over the past few years, I've contributed to software development projects that improved system performance, enhanced UI/UX, and delivered full-stack solutions with modern technologies.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              I specialize in <strong>JavaScript, React, Node.js, MongoDB</strong>, and API-driven architecture. My work includes developing responsive web applications, improving frontend speed and interactivity, and creating secure backend systems for real-world use cases.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              I began my journey as an <strong>Education Administrator</strong>, where I developed strong communication and problem-solving skills. Later, I followed my passion for technology and transitioned into full-time software development—successfully delivering projects that combine creativity, logic, and business value.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              I strongly believe in <strong>continuous learning and professional growth</strong>. I have completed multiple industry certifications in Google Cloud, SQL, Data Science Math Skills, Digital Marketing, and Communication Foundations, helping me develop a well-rounded technical and strategic mindset.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              I enjoy turning ideas into meaningful digital experiences—and I'm always excited to work on innovative projects that challenge me to grow further.
            </p>
          </div>

          {/* Key Highlights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 mb-16 border border-purple-100">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-brand-primary mr-3 tex-white"></span>
              Key Highlights
            </h2>
            <ul className="space-y-4">
              {[
                "MERN stack development for scalable and modern web apps",
                "Experience with real project deployment and optimization",
                "Strong UI focus with clean, impactful user experience",
                "Problem-solver with excellent communication skills",
                "Certified in Web Development, Cloud, SQL, Data Science & Marketing",
                "Passionate about learning, building, and helping others through tech",
              ].map((highlight, index) => (
                <li key={index} className="flex items-start gap-3 text-lg text-slate-700">
                  <svg
                    className="w-6 h-6 text-brand-primary flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Goal */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center !text-white">
              <span className="mr-3">🎯</span>
              Career Goal
            </h2>
            <p className="text-lg leading-relaxed text-white">
              To contribute to impactful products as a <strong>Full-Stack Developer</strong> while continuously advancing my expertise in cloud technologies, AI-powered development, and product-driven design.
            </p>
          </div>

          {/* Connect */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Let's Connect</h3>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.linkedin.com/in/abbashaider14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/abbashaider99"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
              >
                GitHub
              </a>
              <a
                href="https://www.instagram.com/abbashaiderbaqri"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
