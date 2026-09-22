import React from 'react';
import { Globe, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export default function UrlTelemetryCard({ urlAnalysis }) {
    if (!urlAnalysis) return null;

    const { domain, is_https, trust_score, phishing_probability } = urlAnalysis;

    return (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
            <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Globe className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Target Domain</p>
                    <p className="text-xs font-mono font-bold text-white truncate max-w-[180px]">{domain}</p>
                </div>
            </div>

            <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl border ${is_https ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    {is_https ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                    )}
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">SSL / Protocol Security</p>
                    <p className={`text-xs font-bold ${is_https ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {is_https ? 'Encrypted (HTTPS)' : 'Insecure (HTTP)'}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl border border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold text-[#00F0FF] bg-cyan-500/10 shadow-neon-blue">
                    {trust_score}%
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Domain Trust Score</p>
                    <p className="text-xs font-semibold text-slate-200">
                        {trust_score > 70 ? 'High Reputation' : trust_score > 40 ? 'Suspicious Domain' : 'Untrusted / Malicious'}
                    </p>
                </div>
            </div>
        </div>
    );
}