'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import useAppStore from '../lib/store';
import { processFileData } from '../lib/fileUtils';
import LoadingSpinner from './LoadingSpinner';
import geminiService from '../lib/geminiService';

export default function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setFileData, setCurrentStep, setAnalyzing, setAiAnalysis, setAnalysisError } = useAppStore();
  const handleFile = async (file) => {
    setLoading(true);
    setError('');
    
    try {
      // Process the file first
      const data = await processFileData(file);
      setFileData(data, file.name);
      
      // Start AI analysis
      setAnalyzing(true);
      try {
        const analysis = await geminiService.analyzeDataStructure(data, file.name);
        setAiAnalysis(analysis);
        
        // Generate insights if we have chart configs (will be empty initially)
        const insights = await geminiService.generateInsights(data, []);
        // We'll set insights later when we have chart configurations
        
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
        setAnalysisError('AI analysis unavailable, using basic analysis');
      } finally {
        setAnalyzing(false);
      }
      
      setCurrentStep('configure');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Dashboard Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            Transform your data into stunning, interactive dashboards in seconds
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group ${
              dragActive
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 scale-105 shadow-lg'
                : 'border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-25 hover:to-blue-25 hover:shadow-md'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
              disabled={loading}
            />            {loading ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" text="Processing your file..." />
                <p className="text-gray-500 mt-4 text-sm">This won't take long</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload your data file
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-md">
                  Drag and drop your CSV or Excel file here, or click to browse your files
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>Supports .csv, .xlsx, .xls files</span>
                </div>
              </div>
            )}
          </div>          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center animate-shake">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">Upload failed</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Your data is processed entirely in your browser. No files are uploaded to any server.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
