"use client"
import * as React from 'react'
import { UploadCloudIcon, FileIcon, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface UploadedFile {
  name: string;
  path?: string;
  size?: number;
  timestamp: number;
}

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'application/pdf');
    
    input.addEventListener('change', async (event) => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        
        if (file) {
          setIsUploading(true);
          setUploadStatus('idle');
          
          try {
            const formData = new FormData();
            formData.append('pdf', file);
            
            const response = await fetch("http://localhost:8000/upload/pdf", {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Upload failed');
            }
            
            const result = await response.json();
            console.log('File uploaded successfully:', result);
            
            // Add the uploaded file to our state
            setUploadedFiles(prev => [
              ...prev, 
              {
                name: file.name,
                path: result.file?.path,
                size: file.size,
                timestamp: Date.now()
              }
            ]);
            
            setUploadStatus('success');
          } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('error');
          } finally {
            setIsUploading(false);
            
            // Reset status after 3 seconds
            setTimeout(() => {
              setUploadStatus('idle');
            }, 3000);
          }
        }
      }
    });
    
    input.click();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Upload button */}
      <div 
        onClick={handleUpload} 
        className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed
          w-96 rounded-2xl hover:bg-white/50 transition-all cursor-pointer
          ${isUploading ? 'bg-gray-100 opacity-75' : ''}
          ${uploadStatus === 'success' ? 'border-green-400' : ''}
          ${uploadStatus === 'error' ? 'border-red-400' : ''}
        `}
      >
        <pre className="text-2xl font-medium mb-3">File Upload</pre>
        
        {isUploading ? (
          <Loader2 size={50} className="animate-spin text-blue-500" />
        ) : uploadStatus === 'success' ? (
          <CheckCircle size={50} className="text-green-500" />
        ) : uploadStatus === 'error' ? (
          <XCircle size={50} className="text-red-500" />
        ) : (
          <UploadCloudIcon size={50} className="text-blue-500" />
        )}
        
        <pre className="mt-2 text-sm text-gray-500">
          {isUploading ? 'Uploading...' : 
           uploadStatus === 'success' ? 'Upload successful!' : 
           uploadStatus === 'error' ? 'Upload failed. Try again.' : 
           'Click to upload PDF files'}
        </pre>
      </div>

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="w-96 mt-4">
          <pre className="text-lg font-medium mb-3">Uploaded PDFs</pre>
          <div className="grid grid-cols-2 gap-3">
            {uploadedFiles.map((file, index) => (
              <div 
                key={file.timestamp} 
                className="bg-white rounded-lg shadow-md p-3 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-28 bg-gray-100 rounded-md flex items-center justify-center mb-2 relative">
                  <FileIcon size={30} className="text-red-500" />
                  <pre className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs py-1 text-center">
                    PDF
                  </pre>
                </div>
                <pre className="text-xs text-center font-medium truncate w-full">
                  {file.name}
                </pre>
                <pre className="text-xs text-gray-400">
                  {file.size ? `${Math.round(file.size / 1024)} KB` : ''}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload