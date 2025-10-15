import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/home";

// --- Reusable Components ---
const Hero = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 px-4 sm:px-6 lg:px-8">
    {/* Background Decor */}
    <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-blue-100 to-transparent rounded-full opacity-40 blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full opacity-40 blur-3xl"></div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
        Will Your Resume Pass the ATS?
      </h1>
      <h2 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-6 tracking-tight">
        Find Out—Free!
      </h2>
      <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
        HireLens scans your resume, shows what works, what doesn’t, and helps you get noticed—all for free.
      </p>
      <Link
        to="/upload"
        className="primary-button w-fit"
      >
        📤 Upload Resume Now
      </Link>
    </div>
  </div>
);

const HowItWorks = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get AI-powered resume feedback in minutes — completely free and private.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            title: "Upload Your Resume",
            desc: "Drag & drop your PDF or browse to select. Add job details if available.",
            icon: "📁",
          },
          {
            title: "AI Analysis",
            desc: "Our AI scans for ATS compatibility, keywords, structure, readability, and impact.",
            icon: "🤖",
          },
          {
            title: "Get Actionable Feedback",
            desc: "Receive scores, suggestions, and tips to optimize your resume for recruiters.",
            icon: "📈",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-blue-600">{item.icon}</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-800">{item.title}</h3>
            <p className="text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PrivacyBox = () => (
  <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Privacy is Our Priority</h3>
          <p className="text-slate-600">
            We never store your resume or personal data. All analysis happens securely in memory and is deleted immediately after processing.
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
        {[
          "No data stored permanently",
          "Secure in-memory processing",
          "No personal info collected",
          "GDPR & CCPA compliant"
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const ResumeGrid = ({ resumes, loading }: { resumes: Resume[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
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
          to="/upload"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-full shadow transition-colors"
        >
          📄 Upload Your Resume
        </Link>
      </div>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10 text-center">Your Recent Resumes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Component ---
export function meta({}: Route.MetaArgs) {
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
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
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
  }, []);

  return (
    // Apply bg-white to the root element to cover the navbar area too
    <div className="min-h-screen bg-white">
      <Navbar />
        <Hero />
        <ResumeGrid resumes={resumes} loading={loadingResumes} />
        <HowItWorks />
        <PrivacyBox />
    </div>
  );
}