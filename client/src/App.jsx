import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col font-sans selection:bg-[#00F0FF] selection:text-slate-950">
      <Navbar onReset={() => window.location.reload()} />
      <main className="flex-1">
        <Dashboard />
      </main>
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 font-mono">
        PhishGuard XAI Security Engine &copy; {new Date().getFullYear()} — Built for Google Build with AI
      </footer>
    </div>
  );
}