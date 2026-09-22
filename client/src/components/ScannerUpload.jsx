import React, { useState } from 'react';
import { Upload, FileText, Link, Shield, AlertTriangle, Sparkles } from 'lucide-react';

export default function ScannerUpload({ onAnalyze, isLoading }) {
  const [activeTab, setActiveTab] = useState('url'); // 'file', 'text', or 'url'
  const [file, setFile] = useState(null);
  const [plainText, setPlainText] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'file' && file) {
      const formData = new FormData();
      formData.append('file', file);
      onAnalyze(formData);
    } else if (activeTab === 'text' && plainText.trim()) {
      onAnalyze({ type: 'text', content: plainText });
    } else if (activeTab === 'url' && jobUrl.trim()) {
      onAnalyze({ type: 'url', content: jobUrl });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border border-cyber-border shadow-2xl relative overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          Inspect & Validate <span className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">Job Offers & URLs</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Upload PDF offer letters, document screenshots, job posting URLs, or raw text for instant XAI scam assessment.
        </p>
      </div>

      {/* Input Selection Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${activeTab === 'file'
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Upload className="w-4 h-4" />
            <span>PDF / Screenshot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${activeTab === 'text'
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Plain Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${activeTab === 'url'
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40 shadow-neon-blue'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Link className="w-4 h-4" />
            <span>Job URL</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Input */}
        {activeTab === 'file' && (
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 text-center bg-slate-900/30 transition-all">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-3">
              <Upload className="w-10 h-10 text-[#00F0FF] animate-bounce" />
              <span className="text-sm font-medium text-slate-300">
                {file ? file.name : 'Drop your PDF offer letter or screenshot here, or browse'}
              </span>
              <span className="text-xs text-slate-500 font-mono">Supports PDF, PNG, JPG, JPEG (Max 10MB)</span>
            </label>
          </div>
        )}

        {/* Text Area */}
        {activeTab === 'text' && (
          <div>
            <textarea
              rows={6}
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Paste the offer letter text, recruiter email, or message here..."
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-[#00F0FF] rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF] font-mono transition-all"
            />
          </div>
        )}

        {/* URL Input */}
        {activeTab === 'url' && (
          <div className="relative">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="[https://company-careers-portal.com/job/12345](https://company-careers-portal.com/job/12345)"
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-[#00F0FF] rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF] font-mono transition-all"
            />
            <Link className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (activeTab === 'file' && !file) || (activeTab === 'text' && !plainText.trim()) || (activeTab === 'url' && !jobUrl.trim())}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-neon-blue"
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Executing XAI Scan...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Run XAI Security Scan</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}