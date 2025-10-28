import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";

// --- Reusable Components ---
const Hero = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    {/* Background Decor */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-3xl"></div>
    
    {/* Floating Elements */}
    <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/10 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-700"></div>

    <div className="max-w-5xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        AI-Powered Resume Analysis
      </div>
      
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
        Will Your Resume Pass the{" "}
        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          ATS Test?
        </span>
      </h1>
      
      <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
        Get instant AI-powered feedback, ATS score, and actionable tips to land your dream job—
        <span className="font-semibold text-purple-600"> 100% Free!</span>
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <Link
          to="/hirelens/upload"
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span>Upload Resume Now</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        
        <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-md hover:shadow-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
          See How It Works
        </button>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600">
        
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Instant Results</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>100% Private</span>
        </div>
      </div>
    </div>
  </div>
);

const HowItWorks = () => (
  <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
          Simple Process
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Get professional resume feedback in 3 simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connection Lines */}
        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200"></div>
        
        {[
          {
            step: "01",
            title: "Upload Your Resume",
            desc: "Simply drag & drop your PDF or browse to select. Optionally add job details for tailored feedback.",
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ),
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
          },
          {
            step: "02",
            title: "AI Analysis",
            desc: "Our advanced AI instantly scans for ATS compatibility, keywords, formatting, and improvement areas.",
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            color: "from-pink-500 to-pink-600",
            bgColor: "bg-pink-50",
            borderColor: "border-pink-200"
          },
          {
            step: "03",
            title: "Get Actionable Feedback",
            desc: "Receive detailed scores, personalized suggestions, and expert tips to optimize your resume.",
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
          },
        ].map((item, i) => (
          <div
            key={i}
            className="relative bg-white p-8 rounded-2xl shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 group"
          >
            {/* Step Number */}
            <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {item.step}
            </div>
            
            {/* Icon */}
            <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-purple-600">
                {item.icon}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-slate-900">{item.title}</h3>
            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center mt-16">
        <Link
          to="/hirelens/upload"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 gap-2"
        >
          <span>Start Your Free Analysis</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
);

const PrivacyBox = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-slate-900 mb-3">Your Privacy is Our Priority</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                We take your data security seriously. All analysis happens securely in memory and is deleted immediately after processing. 
                <span className="font-semibold text-purple-600"> Zero data retention, 100% privacy guaranteed.</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                title: "No Data Storage",
                desc: "Your resume is never permanently stored on our servers",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )
              },
              {
                title: "Secure Processing",
                desc: "Military-grade encryption for all data in transit",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Zero Tracking",
                desc: "No personal information collected or tracked",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )
              },
              {
                title: "GDPR Compliant",
                desc: "Fully compliant with international privacy laws",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <div className="text-purple-600">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800">
              <span className="font-semibold">Trusted by thousands of job seekers.</span> Your resume is analyzed and immediately deleted—no exceptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ResumeGrid = ({ resumes, loading, onDelete }: { resumes: Resume[]; loading: boolean; onDelete: (id: string) => void }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-primary border-solid"></div>
        <p className="mt-6 text-slate-600 text-lg">Analyzing your past uploads...</p>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl">
        <div className="flex justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7m2-2h10V7m-2 2a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-3">No Resumes Yet</h3>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          Upload your first resume to start getting AI feedback and improve your chances of landing your dream job.
        </p>
        <Link
          to="/hirelens/upload"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-full shadow transition-colors"
        >
          Upload Your Resume
        </Link>
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10 text-center">Your Recent Resumes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Component ---
export function meta() {
  return [
    { title: "HireLens - AI Resume Analyzer" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      // Only load resumes if authenticated
      if (!auth.isAuthenticated) {
        setResumes([]);
        return;
      }

      setLoadingResumes(true);
      try {
        const resumes = (await kv.list("resume:*", true)) as KVItem[];
        const parsedResumes = resumes?.map(
          (resume) => JSON.parse(resume.value) as Resume
        );
        setResumes(parsedResumes || []);
      } catch (error) {
        console.error("Error loading resumes:", error);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [auth.isAuthenticated]);

  const handleDeleteResume = async (id: string) => {
    try {
      // Check if kv is available
      if (!kv || typeof kv.delete !== 'function') {
        console.error("KV store not available or delete method missing");
        // Still update UI even if KV fails
        setResumes(prevResumes => prevResumes.filter(resume => resume.id !== id));
        return;
      }
      
      // Delete from KV store
      await kv.delete(`resume:${id}`);
      
      // Update local state
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== id));
    } catch (error) {
      console.error("Error deleting resume from KV store:", error);
      // Still update UI even if KV fails
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== id));
    }
  };

  return (
    // Apply bg-white to the root element to cover the navbar area too
    <div className="min-h-screen bg-white">
      <Navbar />
        <Hero />
        <ResumeGrid resumes={resumes} loading={loadingResumes} onDelete={handleDeleteResume} />
        <HowItWorks />
        <PrivacyBox />
    </div>
  );
}