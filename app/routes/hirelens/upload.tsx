import { type FormEvent, useState } from 'react';
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        // Check if user is authenticated before proceeding
        if (!auth.isAuthenticated) {
            navigate(`/hirelens/auth?next=/hirelens/upload`);
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF resume file. We currently only support PDF format for accurate analysis.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Please upload a resume under 10MB.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        try {
            setStatusText('Uploading the file...');
            setProgress(10);
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('Error: Failed to upload file');
                setIsProcessing(false);
                return;
            }

            setStatusText('Converting to image...');
            setProgress(25);
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                setStatusText('Error: Failed to convert PDF to image');
                setIsProcessing(false);
                return;
            }

            setStatusText('Uploading the image...');
            setProgress(40);
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setStatusText('Error: Failed to upload image');
                setIsProcessing(false);
                return;
            }

            setStatusText('Preparing data...');
            setProgress(55);
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing with AI...');
            setProgress(70);

            console.log('Starting AI analysis...');
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            
            console.log('AI feedback received:', feedback);
            
            if (!feedback) {
                setStatusText('Error: AI analysis failed. Please try again.');
                setIsProcessing(false);
                alert('AI analysis failed. Please ensure you uploaded a valid resume PDF and try again.');
                return;
            }

            if (!feedback.message || !feedback.message.content) {
                console.error('Invalid feedback structure:', feedback);
                setStatusText('Error: Invalid AI response format.');
                setIsProcessing(false);
                alert('Received invalid response from AI. Please try again.');
                return;
            }

            setStatusText('Processing results...');
            setProgress(85);
            
            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            console.log('Feedback text:', feedbackText);

            try {
                const parsedFeedback = JSON.parse(feedbackText);
                console.log('Parsed feedback:', parsedFeedback);
                
                // Validate that the feedback has the expected structure
                if (!parsedFeedback.overallScore) {
                    console.error('Invalid feedback structure - missing overallScore');
                    setStatusText('Error: This doesn\'t appear to be a resume.');
                    setIsProcessing(false);
                    alert('The uploaded file doesn\'t appear to be a valid resume. Please upload a professional resume PDF.');
                    return;
                }
                
                data.feedback = parsedFeedback;
            } catch (parseError) {
                console.error('Failed to parse AI feedback:', parseError);
                console.error('Raw feedback text:', feedbackText);
                setStatusText('Error: Invalid AI response format.');
                setIsProcessing(false);
                alert('Failed to process AI response. Please try again or contact support.');
                return;
            }

            setStatusText('Saving results...');
            setProgress(95);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            
            setStatusText('Complete! Redirecting...');
            setProgress(100);
            console.log('Analysis complete. Data:', data);
            
            setTimeout(() => {
                navigate(`/hirelens/resume/${uuid}`);
            }, 800);
        } catch (error) {
            console.error('Error during analysis:', error);
            setStatusText('Error: Something went wrong.');
            setIsProcessing(false);
            alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Navbar />

            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Step 1 of 2
                    </div>
                    
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 sm:mb-8 px-2">
                        Upload Your{" "}
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Resume
                        </span>
                    </h1>
                    
                    {isProcessing ? (
                        <div className="max-w-6xl mx-auto mt-8 sm:mt-12">
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                                {/* Left Side - Progress */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                                        <h2 className="text-2xl text-purple-600 font-semibold">{statusText}</h2>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-slate-700">Processing Progress</span>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {progress}%
                                            </span>
                                        </div>
                                        
                                        {/* Progress Bar Track */}
                                        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <div 
                                                className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-lg relative"
                                                style={{ width: `${progress}%` }}
                                            >
                                                {/* Animated shine effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Steps */}
                                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                            <span className={progress >= 10 ? 'text-purple-600 font-semibold' : ''}>Upload</span>
                                            <span className={progress >= 40 ? 'text-purple-600 font-semibold' : ''}>Convert</span>
                                            <span className={progress >= 70 ? 'text-purple-600 font-semibold' : ''}>Analyze</span>
                                            <span className={progress >= 100 ? 'text-purple-600 font-semibold' : ''}>Complete</span>
                                        </div>
                                    </div>
                                    
                                    {/* Processing Steps Info - Single Card */}
                                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                                        
                                        
                                        <div className="space-y-3">
                                            {/* Step 1 */}
                                            <div className={`flex items-start gap-3 transition-all duration-500 ${progress >= 10 ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${progress >= 40 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} shadow-md`}>
                                                    {progress >= 40 ? (
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : progress >= 10 ? (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">Uploading & Converting</p>
                                                        {progress >= 10 && progress < 40 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex gap-1">
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"></div>
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {progress >= 40 && (
                                                            <span className="text-xs text-green-600 font-medium">✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connecting Line */}
                                            <div className={`ml-4 border-l-2 h-2 transition-colors duration-500 ${progress >= 40 ? 'border-green-500' : progress >= 10 ? 'border-purple-500' : 'border-slate-300'}`}></div>

                                            {/* Step 2 */}
                                            <div className={`flex items-start gap-3 transition-all duration-500 ${progress >= 70 ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${progress >= 90 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} shadow-md`}>
                                                    {progress >= 90 ? (
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : progress >= 70 ? (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">AI Analysis</p>
                                                        {progress >= 70 && progress < 90 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex gap-1">
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce"></div>
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                                    <div className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {progress >= 90 && (
                                                            <span className="text-xs text-green-600 font-medium">✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connecting Line */}
                                            <div className={`ml-4 border-l-2 h-2 transition-colors duration-500 ${progress >= 90 ? 'border-green-500' : progress >= 70 ? 'border-purple-500' : 'border-slate-300'}`}></div>

                                            {/* Step 3 */}
                                            <div className={`flex items-start gap-3 transition-all duration-500 ${progress >= 100 ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 ${progress >= 100 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} shadow-md`}>
                                                    {progress >= 100 ? (
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">Finalizing Results</p>
                                                        {progress >= 100 && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Complete
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Side - Image */}
                                <div className="flex items-center justify-center">
                                    <img 
                                        src="/images/resume-scan.gif" 
                                        alt="Analyzing resume" 
                                        className="w-full max-w-lg rounded-xl sm:rounded-2xl shadow-2xl border-2 border-purple-200"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto px-2">
                            Add your job details and upload your resume for personalized AI-powered feedback
                        </p>
                    )}
                </div>

                {!isProcessing && (
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-8 lg:p-10">
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 w-full">
                            {/* Job Details Section */}
                            <div className="flex flex-col gap-3 sm:gap-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Job Details (Optional)</h3>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full">
                                    <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
                                        <label htmlFor="company-name" className="block text-xs sm:text-sm font-semibold text-slate-700">
                                            Company Name
                                        </label>
                                        <input 
                                            type="text" 
                                            name="company-name" 
                                            placeholder="e.g., Google, Microsoft" 
                                            id="company-name"
                                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
                                        <label htmlFor="job-title" className="block text-xs sm:text-sm font-semibold text-slate-700">
                                            Job Title
                                        </label>
                                        <input 
                                            type="text" 
                                            name="job-title" 
                                            placeholder="e.g., Software Engineer" 
                                            id="job-title"
                                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                                    <label htmlFor="job-description" className="block text-xs sm:text-sm font-semibold text-slate-700">
                                        Job Description
                                    </label>
                                    <textarea 
                                        rows={4} 
                                        name="job-description" 
                                        placeholder="Paste the job description here for more tailored feedback..." 
                                        id="job-description"
                                        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            

                            {/* Resume Upload Section */}
                            <div className="flex flex-col gap-3 sm:gap-4 w-full">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Upload Resume</h3>
                                </div>
                                
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            {/* Submit Button */}
                            <button 
                                className="w-full mt-4 sm:mt-8 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2" 
                                type="submit"
                                disabled={!file}
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>Analyze Resume with AI</span>
                            </button>

                            {/* Privacy & Tips */}
                            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                {/* Privacy Notice - Different message based on auth status */}
                                {!auth.isAuthenticated ? (
                                    <div className="p-3 sm:p-4 bg-purple-50 border-2 border-purple-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs sm:text-sm font-semibold text-purple-900 mb-0.5 sm:mb-1">Secure & Private Analysis</p>
                                            <p className="text-[11px] sm:text-xs text-purple-700 leading-relaxed">You'll be asked to sign in with Puter when analyzing—your data stays encrypted and under your control.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs sm:text-sm font-semibold text-green-900 mb-0.5 sm:mb-1">Your Data is Protected</p>
                                            <p className="text-[11px] sm:text-xs text-green-700 leading-relaxed">All your resume data is encrypted end-to-end and stored securely. Only you have access to your files and analysis results.</p>
                                        </div>
                                    </div>
                                )}

                                
                            </div>
                        </form>
                    </div>
                )}
            </section>
        </main>
    )
}
export default Upload
