import React from 'react';
import { Home, BookOpen, User, Sparkles, Briefcase, Video } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isRecapEnabled?: boolean;
  onQuickAddTrade?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isRecapEnabled = true,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: Home },
    { id: 'logs', label: 'บันทึกไม้', icon: BookOpen },
    { id: 'funded', label: 'กองทุน', icon: Briefcase },
    { id: 'edge-finder', label: 'Edge', icon: Sparkles },
    { id: 'profile', label: 'ตั้งค่า', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#05070c]/95 backdrop-blur-lg border-t border-[#1e293b] px-2 sm:px-6 py-1.5 flex items-center justify-around max-w-lg mx-auto sm:rounded-t-2xl shadow-2xl md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all relative ${
              isActive ? 'text-white' : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-slate-100' : 'text-[#94a3b8]'}`} />
            <span
              className={`text-[9px] sm:text-[10px] font-mono tracking-tight mt-0.5 ${
                isActive ? 'font-extrabold text-slate-100' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-1 w-4 h-0.5 bg-gradient-to-r from-slate-300 to-slate-100 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
