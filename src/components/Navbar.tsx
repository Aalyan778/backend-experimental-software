import React from 'react';
import { Terminal, Plus, Play, BookOpen, Layers } from 'lucide-react';
import avatarImg from '../assets/images/avatar_developer_user_1790549117790.jpg';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'docs';
  onNavigate: (view: 'landing' | 'dashboard' | 'docs') => void;
  onOpenCreateModal: () => void;
  onOpenPlayground: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateModal,
  onOpenPlayground,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-100 group-hover:text-emerald-400 transition-colors">
            FormPulse
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-neutral-100 ${
              currentView === 'landing' ? 'text-neutral-100 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors hover:text-neutral-100 ${
              currentView === 'dashboard' ? 'text-neutral-100 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className={`transition-colors hover:text-neutral-100 ${
              currentView === 'docs' ? 'text-neutral-100 font-semibold' : ''
            }`}
          >
            Documentation
          </button>
          <button
            onClick={onOpenPlayground}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Tester</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPlayground}
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900"
            title="Open Live Tester"
          >
            <Play className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm hover:shadow-emerald-500/10 transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Form</span>
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-800 cursor-pointer group"
            title="View Developer Account"
          >
            <img
              src={avatarImg}
              alt="Developer Profile"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-700 group-hover:ring-emerald-500/60 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
