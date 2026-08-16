import React, { useState } from 'react';
import { 
  Shield, LayoutDashboard, Search, GitGraph, FileSearch, 
  ShieldAlert, PlayCircle, UserCheck, LogOut, Heart,
  Cpu, AlertTriangle, Bot, BarChart3, Settings
} from 'lucide-react';
import { UserProfileModal } from '../UserProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: 'command', label: '▣ COMMAND CENTER', icon: LayoutDashboard },
    { id: 'investigation', label: '◈ THREATS', icon: Search },
    { id: 'graph', label: '⌁ NETWORK', icon: GitGraph },
    { id: 'devices', label: '◉ DEVICES', icon: Cpu },
    { id: 'incidents', label: '⚠ INCIDENTS', icon: AlertTriangle },
    { id: 'evidence', label: '◇ EVIDENCE', icon: FileSearch },
    { id: 'ai-assistant', label: '✦ HEALTHSHIELD AI', icon: Bot },
    { id: 'analytics', label: '▤ ANALYTICS', icon: BarChart3 },
    { id: 'settings', label: '⚙ SETTINGS', icon: Settings },
    { id: 'patient_portal', label: '♥ HEALTHCARE PORTAL', icon: Heart },
    { id: 'defense', label: '🛡 DEFENSE ARCHITECT', icon: ShieldAlert },
    { id: 'replay', label: '▶ REPLAY & VALIDATION', icon: PlayCircle },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0d1117] border-r border-[#1e293b] flex flex-col justify-between h-screen sticky top-0 z-30 select-none font-sans overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#1e293b] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-100 tracking-wide text-xs font-mono">HEALTHSHIELD-X</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">v2.0 · PROTECTED</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1 font-mono">
            <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              SOC COMMAND SYSTEM
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-300 ease-out cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors duration-300 ease-out ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Status & Profile Trigger */}
        <div className="p-3 border-t border-[#1e293b] text-xs text-slate-500 space-y-2">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full p-2 rounded-xl bg-[#161b22] border border-[#1e293b] hover:border-cyan-500/50 flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
            title="Click to inspect Reflective User Credentials ID Badge"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono text-[9px]">
              <div className="font-bold text-slate-200">DR. ALEXANDER DOE</div>
              <div className="text-cyan-400 text-[8px]">CLEARANCE BADGE →</div>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT SESSION</span>
            </button>
          )}

          <div className="flex items-center justify-between font-mono text-[9px] pt-1">
            <span>● PROTECTED</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">DEMO ENV</span>
          </div>
        </div>
      </aside>

      {/* User Profile ReflectiveCard Badge Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={onLogout}
      />
    </>
  );
};
