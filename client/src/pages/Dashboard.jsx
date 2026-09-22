import React, { useState } from 'react';
import ScannerUpload from '../components/ScannerUpload';
import ThreatGauge from '../components/ThreatGauge';
import RiskRadar from '../components/RiskRadar';
import RedFlagCard from '../components/RedFlagCard';
import HighlightedText from '../components/HighlightedText';
import SafetyTips from '../components/SafetyTips';
import ChatDrawer from '../components/ChatDrawer';
import { analyzeOfferLetter } from '../services/api';
import { MessageSquare, RefreshCw, Building2, Mail, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAnalyze = async (payload) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await analyzeOfferLetter(payload);
      setScanResult(result);
    } catch (err) {
      console.error('Scan Error:', err);
      const message = err.response?.data?.error || err.response?.data?.details || 'Failed to analyze offer letter. Please check backend API server connection.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-200 text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs uppercase font-mono px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {!scanResult ? (
        <ScannerUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Scan Assessment Result</span>
                <span className="text-xs font-mono font-normal text-slate-400">ID: #{scanResult.scan_id}</span>
              </h2>
              <p className="text-xs text-slate-400">Analysis powered by Google Gemini XAI and PhishGuard Threat Engine.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF] hover:bg-cyan-500/20 text-xs font-medium transition-all shadow-neon-blue"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>New Scan</span>
              </button>
            </div>
          </div>

          {/* Key Extracted Data Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-[#00F0FF]" />
              <div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Company</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{scanResult.company || 'Unknown'}</p>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
              <Mail className="w-5 h-5 text-[#00F0FF]" />
              <div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">HR Email</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{scanResult.hr_email || 'Not Specified'}</p>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-[#00F0FF]" />
              <div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Salary</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{scanResult.salary || 'Unstated'}</p>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#00F0FF]" />
              <div>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Joining Date</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{scanResult.joining_date || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Visual Threat Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ThreatGauge score={scanResult.risk_score} level={scanResult.risk_level} />
            <RiskRadar breakdown={scanResult.breakdown} />
            <RedFlagCard redFlags={scanResult.red_flags} />
          </div>

          {/* Explainable Text Context + Safety Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HighlightedText text={scanResult.raw_text} highlightedSentences={scanResult.highlighted_sentences} />
            </div>
            <SafetyTips tips={scanResult.safety_tips} />
          </div>
        </div>
      )}

      {/* Chat Assistant */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        scanId={scanResult?.scan_id}
      />
    </div>
  );
}