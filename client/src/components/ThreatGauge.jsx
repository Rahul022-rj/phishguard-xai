import React from 'react';
import { motion } from 'framer-motion';

export default function ThreatGauge({ score = 0, level = 'Low' }) {
  // Color configuration according to threat tier
  const getColors = () => {
    if (score >= 80) return { stroke: '#FF0055', text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (score >= 50) return { stroke: '#EF4444', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (score >= 25) return { stroke: '#F59E0B', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { stroke: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const config = getColors();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">Scam Threat Index</h3>
      
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-slate-800"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={config.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-4xl font-extrabold font-mono ${config.text}`}
          >
            {score}%
          </motion.span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mt-1">RISK SCORE</span>
        </div>
      </div>

      <div className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-bold font-mono tracking-wider uppercase ${config.bg} ${config.border} ${config.text}`}>
        {level} RISK
      </div>
    </div>
  );
}