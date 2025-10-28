import { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: { resume: Resume, onDelete?: (id: string) => void }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            // Delete files from storage
            if (resumePath) await fs.delete(resumePath);
            if (imagePath) await fs.delete(imagePath);
            
            // Call parent's delete handler
            if (onDelete) {
                onDelete(id);
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume. Please try again.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-purple-300">
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete resume"
            >
                {isDeleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>

            <Link 
                to={`/hirelens/resume/${id}`} 
                className="flex flex-col flex-1"
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
        </div>
    )
}
export default ResumeCard
