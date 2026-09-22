import React from 'react';
import { ShieldAlert, Terminal, Cpu, ExternalLink } from 'lucide-react';

export default function Navbar({ onReset }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyber-border bg-[#0A0D14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          onClick={onReset}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:border-[#00F0FF] transition-all shadow-neon-blue">
            <ShieldAlert className="w-6 h-6 text-[#00F0FF] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-[#00F0FF] via-indigo-400 to-[#8A2BE2] bg-clip-text text-transparent font-mono">
                PHISHGUARD XAI
              </span>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-[#00F0FF] font-mono">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Explainable Fake Offer & Phishing Inspector</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-[#00F0FF]" />
            <span>GEMINI 1.5 FLASH ENGAGED</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-[#00F0FF] px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-cyan-500/50 bg-slate-800/40 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </header>
  );
}