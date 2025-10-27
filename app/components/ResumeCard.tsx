import { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    return (
        <Link 
            to={`/hirelens/resume/${id}`} 
            className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-purple-300"
        >
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                    {companyName && <h2 className="text-lg font-bold text-slate-900 truncate">{companyName}</h2>}
                    {jobTitle && <h3 className="text-sm text-slate-600 truncate mt-1">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="text-lg font-bold text-slate-900">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {/* Resume Preview */}
            {resumeUrl && (
                <div className="relative overflow-hidden bg-slate-50">
                    <img
                        src={resumeUrl}
                        alt="Resume preview"
                        className="w-full h-[280px] object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-center gap-2 text-sm text-purple-700 font-medium">
                    <span>View Analysis</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard
