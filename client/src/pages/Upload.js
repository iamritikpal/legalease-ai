import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Loader,
  FileText,
  Image,
  FileType
} from 'lucide-react';
import { useDocument } from '../context/DocumentContext';
import { useLanguage } from '../context/LanguageContext';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [dragActive, setDragActive] = useState(false);
  
  const { uploadDocument, uploading, uploadProgress, error } = useDocument();
  const { t, getAvailableLanguages } = useLanguage();
  const navigate = useNavigate();

  // File validation
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF, JPEG, PNG, and TXT files are supported' };
    }

    return { valid: true };
  }, []);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        alert('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        alert('Invalid file type. Only PDF, JPEG, PNG, and TXT files are supported.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateFile(file);
      
      if (validation.valid) {
        setSelectedFile(file);
      } else {
        alert(validation.error);
      }
    }
  }, [validateFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadDocument(selectedFile, selectedLanguage);
      if (result) {
        navigate(`/document/${result.id}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') return FileText;
    if (file.type.startsWith('image/')) return Image;
    return FileType;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('uploadTitle', 'Upload Your Document')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('uploadSubtitle', 'Drag and drop your legal document or click to browse')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {!selectedFile ? (
                <>
                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive && !isDragReject
                        ? 'border-blue-400 bg-blue-50'
                        : isDragReject
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    <div className="mb-6">
                      <UploadIcon className={`w-16 h-16 mx-auto ${
                        isDragActive ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="mb-4">
                      {isDragActive ? (
                        <p className="text-lg font-semibold text-blue-600">
                          Drop your file here
                        </p>
                      ) : (
                        <p className="text-lg font-semibold text-gray-700">
                          Drag & drop your document here
                        </p>
                      )}
                      <p className="text-gray-500 mt-2">
                        or click to browse your files
                      </p>
                    </div>
                    
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                      Choose File
                    </button>
                  </div>

                  {/* File Requirements */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-700 mb-2">File Requirements:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {t('supportedFormats', 'Supported formats: PDF, JPEG, PNG, TXT')}</li>
                      <li>• {t('maxFileSize', 'Maximum file size: 10MB')}</li>
                      <li>• Single file upload only</li>
                      <li>• Document text should be clearly readable</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* Selected File Display */}
                  <div className="border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {React.createElement(getFileIcon(selectedFile), {
                          className: "w-10 h-10 text-blue-500"
                        })}
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate max-w-xs">
                            {selectedFile.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                      
                      {!uploading && (
                        <button
                          onClick={removeFile}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            Uploading and processing...
                          </span>
                          <span className="text-sm text-gray-500">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Language Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Globe className="w-4 h-4 inline mr-2" />
                      {t('selectLanguage', 'Select Output Language')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {getAvailableLanguages().map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.code)}
                          disabled={uploading}
                          className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedLanguage === lang.code
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                          {selectedLanguage === lang.code && (
                            <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                      uploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Processing Document...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5 mr-2" />
                        {t('uploadButton', 'Upload & Process')}
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Processing Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What happens next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Text Extraction</h4>
                      <p className="text-sm text-gray-600">AI extracts and analyzes text from your document</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Summarization</h4>
                      <p className="text-sm text-gray-600">Generate plain-language summary and explanations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Risk Analysis</h4>
                      <p className="text-sm text-gray-600">Identify potential risks and red-flag clauses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">
                      Secure & Private
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• End-to-end encryption</li>
                      <li>• No permanent storage</li>
                      <li>• GDPR compliant</li>
                      <li>• Google Cloud security</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Having trouble uploading your document? Check our support resources.
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Help Center →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
