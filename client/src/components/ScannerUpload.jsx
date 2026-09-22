import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Link as LinkIcon, AlignLeft, UploadCloud, AlertCircle, Sparkles } from 'lucide-react';

export default function ScannerUpload({ onAnalyze, isLoading }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file', 'text', 'url'
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'file' && selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'file');
      onAnalyze(formData);
    } else if (activeTab === 'text' && inputText.trim()) {
      onAnalyze({ type: 'text', content: inputText });
    } else if (activeTab === 'url' && inputUrl.trim()) {
      onAnalyze({ type: 'url', content: inputUrl });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden border border-cyan-500/20 shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600"></div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Inspect & Validate <span className="bg-gradient-to-r from-[#00F0FF] to-purple-400 bg-clip-text text-transparent">Job Offers</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Upload PDF offer letters, document screenshots, job posting URLs, or raw text for instant explainable scam assessment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'file' 
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>PDF / Screenshot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'text' 
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
            <span>Plain Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'url' 
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Job URL</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'file' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-[#00F0FF] bg-cyan-500/10' 
                : selectedFile 
                  ? 'border-indigo-500/60 bg-slate-900/40' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-3">
              {selectedFile ? (
                <>
                  <FileText className="w-12 h-12 text-[#00F0FF] animate-bounce" />
                  <span className="font-semibold text-slate-200 text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  <p className="text-xs text-cyan-400">Click or drag another file to replace</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    Drop your PDF offer letter or screenshot here, or <span className="text-[#00F0FF]">browse</span>
                  </div>
                  <p className="text-xs text-slate-500">Supports PDF, PNG, JPG, JPEG (Max 10MB)</p>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious offer letter text, email contents, or interview invitation details..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all font-mono"
            />
          </div>
        )}

        {activeTab === 'url' && (
          <div>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://company-careers-portal.com/offer/view?id=8492"
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (activeTab === 'file' && !selectedFile) || (activeTab === 'text' && !inputText.trim()) || (activeTab === 'url' && !inputUrl.trim())}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-[#00F0FF] via-cyan-400 to-indigo-400 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-neon-blue"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Threat Signals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Run XAI Security Scan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}