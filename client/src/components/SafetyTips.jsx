import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function SafetyTips({ tips = [] }) {
  const defaultTips = [
    "Verify offer authenticity via official company career portal.",
    "Legitimate employers never demand payment for laptops, training, or security deposits.",
    "Cross-reference the HR sender email domain with official records."
  ];

  const activeTips = tips.length > 0 ? tips : defaultTips;

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">AI Safety Recommendations</h3>
      </div>
      <div className="space-y-2.5">
        {activeTips.map((tip, idx) => (
          <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}