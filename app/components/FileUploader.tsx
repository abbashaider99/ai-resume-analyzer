import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
        noClick: false,
        noKeyboard: false,
    })

    const file = acceptedFiles[0] || null;

    // Manual file input handler for mobile
    const handleManualClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };



    return (
        <div className="w-full gradient-border">
            <div {...getRootProps({ onClick: (e) => e.preventDefault() })}>
                <input {...getInputProps()} ref={fileInputRef} />

                <div className="space-y-4">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                onFileSelect?.(null)
                            }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ): (
                        <div className="text-center cursor-pointer" onClick={handleManualClick}>
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-base sm:text-lg text-gray-700 mb-1 sm:mb-2">
                                <span className="font-semibold text-purple-600">
                                    Click to upload
                                </span>{" "}
                                <span className="text-gray-500 hidden sm:inline">or drag and drop</span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                            
                            {/* Mobile-friendly button */}
                            <button
                                type="button"
                                onClick={handleManualClick}
                                className="mt-3 sm:mt-4 px-6 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Choose PDF File
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader
