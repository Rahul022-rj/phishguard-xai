import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RedFlagCard({ redFlags = [] }) {
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Detected Anomalies & Red Flags</h3>
        <span className="text-xs text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          {redFlags.length} ISSUES
        </span>
      </div>

      {redFlags.length === 0 ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400 text-sm">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>No critical phishing or fraud markers detected in this offer letter.</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {redFlags.map((flag, index) => (
            <div 
              key={index} 
              className="p-3 bg-slate-900/60 border border-rose-500/30 rounded-xl flex items-start space-x-3"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-rose-200">{flag.title || flag.category || 'Security Flag'}</p>
                <p className="text-slate-400 mt-0.5 leading-relaxed">{flag.description || flag}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}