import React from 'react';
import { Eye } from 'lucide-react';

export default function HighlightedText({ text = '', highlightedSentences = [] }) {
  if (!text) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-slate-500 text-xs italic">
        No offer letter snippet available for highlight review.
      </div>
    );
  }

  // Highlight matches
  const renderHighlightedText = () => {
    if (!highlightedSentences || highlightedSentences.length === 0) {
      return text;
    }

    let result = text;
    highlightedSentences.forEach((suspiciousStr) => {
      if (suspiciousStr && suspiciousStr.length > 3) {
        const regex = new RegExp(`(${suspiciousStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        result = result.replace(
          regex,
          '<mark class="bg-rose-500/30 text-rose-200 border-b-2 border-rose-500 px-1 rounded-sm">$1</mark>'
        );
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="w-4 h-4 text-[#00F0FF]" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Explainable Context Viewer</h3>
      </div>
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
        {renderHighlightedText()}
      </div>
    </div>
  );
}