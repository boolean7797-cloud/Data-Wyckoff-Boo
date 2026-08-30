import React from 'react';
import { Menu, Plus, Mail, User, Shield, Flame, Award, Sparkles, Cloud } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType;
  onOpenSidebar: () => void;
  onOpenProfile: () => void;
  onOpenAuthModal: () => void;
  onAddTrade: () => void;
  onOpenGmail: () => void;
  onOpenCertificate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenSidebar,
  onOpenProfile,
  onOpenAuthModal,
  onAddTrade,
  onOpenGmail,
  onOpenCertificate,
}) => {
  const initials = (currentUser?.displayName || 'Trader')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[#030407]/95 backdrop-blur-md border-b border-[#1e293b] px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Left: Sidebar Toggle & App Title */}
      <div className="flex items-center space-x-3">
        <button
          id="btn-open-sidebar"
          onClick={onOpenSidebar}
          className="p-2 rounded-xl bg-[#0a0d14] border border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-slate-500 hover:bg-[#151b28] transition-all shadow-sm"
          title="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_12px_rgba(203,213,225,0.25)] flex items-center justify-center">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center overflow-hidden">
              <img
                src="/gengar_logo.jpg"
                alt="Gengar - Wyk Labs (Data)"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-['Outfit',sans-serif]">
                Gengar - Wyk Labs (Data)
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-800 border border-slate-600 text-slate-200 rounded">
                PRO DATA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Institutional Edge Terminal & Performance Certification Engine
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Certificate Button */}
        {onOpenCertificate && (
          <button
            id="btn-header-cert"
            onClick={onOpenCertificate}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 hover:shadow-[0_0_15px_rgba(203,213,225,0.2)] transition-all flex items-center space-x-1.5 font-medium"
            title="เปิดใบประกาศนียบัตรผลงานเทรด"
          >
            <Award className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-mono hidden md:inline">ประกาศนียบัตร</span>
          </button>
        )}

        {/* Gmail Direct Action */}
        <button
          id="btn-header-gmail"
          onClick={onOpenGmail}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0a0d14] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] hover:border-slate-500 transition-all flex items-center space-x-1.5"
          title="เปิด Gmail Hub"
        >
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono hidden md:inline">Gmail</span>
        </button>

        {/* Quick Add Trade Button */}
        <button
          id="btn-header-add-trade"
          onClick={onAddTrade}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black font-mono font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,255,255,0.25)] transition-all active:scale-95 border border-white"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">+ บันทึกไม้ใหม่</span>
          <span className="sm:hidden">+ ไม้</span>
        </button>

        {/* User Badge / Account Switch */}
        <div className="flex items-center space-x-2 pl-1 border-l border-[#1e293b]">
          <button
            id="btn-header-auth-switch"
            onClick={onOpenAuthModal}
            className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#0a0d14] border border-[#1e293b] hover:border-slate-500 transition-all"
            title="ล็อกอินด้วยอีเมล / สลับบัญชี / จัดการ Cloud Sync"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-500 border border-slate-400 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white tracking-tight leading-tight flex items-center gap-1">
                <span className="truncate max-w-[120px]">{currentUser?.displayName || 'Trader'}</span>
                {currentUser?.email && (
                  <Cloud className="w-3 h-3 text-blue-400 shrink-0" title={`Cloud Synced with ${currentUser.email}`} />
                )}
              </div>
              <div className="text-[10px] font-mono text-blue-400">
                {currentUser?.email ? (
                  <span className="text-[9px] text-slate-400 truncate block max-w-[120px]">{currentUser.email}</span>
                ) : (
                  `$${(currentUser?.accountBalance || 0).toLocaleString()}`
                )}
              </div>
            </div>
          </button>

          <button
            id="btn-header-profile-settings"
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-[#0a0d14] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] hover:border-slate-500 transition-all"
            title="การตั้งค่าโปรไฟล์"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
