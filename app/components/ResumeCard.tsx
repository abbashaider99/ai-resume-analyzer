import { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: { resume: Resume, onDelete?: (id: string) => void }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setShowDeleteModal(false);
        
        try {
            // Try to delete files from storage (non-critical if they fail)
            try {
                if (resumePath) {
                    console.log("🗑️ Deleting resume file:", resumePath);
                    await fs.delete(resumePath);
                }
                if (imagePath) {
                    console.log("🗑️ Deleting image file:", imagePath);
                    await fs.delete(imagePath);
                }
            } catch (fileError) {
                console.warn("⚠️ Error deleting files (continuing anyway):", fileError);
                // Don't throw - files might not exist or already be deleted
            }
            
            // Show success message briefly
            setShowSuccess(true);
            
            // Call parent's delete handler (this will delete from KV store)
            setTimeout(() => {
                if (onDelete) {
                    onDelete(id);
                }
            }, 800);
        } catch (error) {
            console.error('❌ Error deleting resume:', error);
            setIsDeleting(false);
            alert('Failed to delete resume. Please try again.');
        }
    };

    return (
        <>
            <div className={`group relative flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-purple-300 ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
                {/* Success Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-green-500/90 z-50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <svg className="w-16 h-16 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="font-semibold text-lg">Deleted!</p>
                        </div>
                    </div>
                )}

                {/* Delete Button - More visible on mobile */}
                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 z-10 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 sm:group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
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

                {/* On mobile, show delete in footer instead */}
                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="sm:hidden absolute bottom-4 right-4 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md disabled:opacity-50"
                    title="Delete resume"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                            Delete Resume?
                        </h3>
                        <p className="text-slate-600 text-center mb-6">
                            Are you sure you want to delete this resume analysis? This action cannot be undone.
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default ResumeCard

