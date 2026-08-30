import React from 'react';
import {
  X,
  Home,
  BookOpen,
  Settings,
  Plus,
  UserCheck,
  Flame,
  ShieldAlert,
  Coins,
  Tag,
  Sparkles,
  Video,
  Briefcase,
  Layers,
  Mail,
  Sliders,
  Cloud,
  Award,
} from 'lucide-react';
import { ActiveTab, User, MultiPortfolioConfig } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddTrade: (defaultPortfolio?: 'funded') => void;
  currentUser: User;
  onOpenAuthModal: () => void;
  onOpenManageSetups: () => void;
  onOpenManagePairs: () => void;
  onOpenCertificate?: () => void;
  multiPortfolioConfig?: MultiPortfolioConfig;
  showRecapTab?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAddTrade,
  currentUser,
  onOpenAuthModal,
  onOpenManageSetups,
  onOpenManagePairs,
  onOpenCertificate,
  multiPortfolioConfig,
  showRecapTab = true,
}) => {
  const initials = (currentUser?.displayName || 'Trader')
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    { id: 'home', label: 'หน้าหลัก & สถิติ (Home)', icon: Home },
    { id: 'logs', label: 'บันทึกประวัติไม้ (Trade Logs)', icon: BookOpen },
    { id: 'funded', label: 'ระบบกองทุนย่อย (Funded System)', icon: Briefcase, isHighlight: true },
    { id: 'edge-finder', label: 'Edge Finder (Best & Worst)', icon: Sparkles },
    ...(showRecapTab
      ? [{ id: 'recap', label: 'วิดีโอรีแคป (Daily Recap)', icon: Video }]
      : []),
    { id: 'gmail', label: 'Gmail Trade Mail & Hub', icon: Mail },
    { id: 'profile', label: 'การตั้งค่า & จัดการ (Settings)', icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 space-y-4 font-['Outfit',sans-serif]">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_15px_rgba(203,213,225,0.25)] flex items-center justify-center">
              <div className="w-full h-full bg-[#05070c] rounded-[10px] overflow-hidden flex items-center justify-center">
                <img
                  src="/gengar_logo.jpg"
                  alt="Gengar - Wyk Labs (Data)"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#f8fafc] tracking-tight">
                Gengar - Wyk Labs (Data)
              </h2>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block animate-pulse" />
                <span>Stainless Steel Engine Active</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg bg-[#050608] text-[#94a3b8] hover:text-white border border-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-3 rounded-xl bg-[#06080e] border border-[#1e293b] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0e131f] border border-slate-600 flex items-center justify-center font-mono font-extrabold text-xs text-slate-200 shadow-inner">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#f8fafc] truncate max-w-[110px]">
                {currentUser?.displayName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                ${(currentUser?.accountBalance || 0).toLocaleString()} (ส่วนตัว)
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="p-1.5 rounded-lg bg-[#0e131f] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#1e293b] text-xs font-mono transition-colors"
            title="สลับบัญชี หรือ เชื่อมต่อเครื่องอื่น"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button: Add Trade */}
        <button
          onClick={() => {
            onClose();
            onOpenAddTrade();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black font-mono text-xs font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all border border-white active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ บันทึกไม้ใหม่ (New Trade)</span>
        </button>

        {/* Action Button: Trader Performance Certificate */}
        {onOpenCertificate && (
          <button
            onClick={() => {
              onClose();
              onOpenCertificate();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold border border-slate-600 hover:border-slate-400 transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-slate-300" />
            <span>ใบประกาศนียบัตรผลงาน</span>
          </button>
        )}

        {/* Main Navigation Links */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-slate-400 px-2 mb-1 uppercase">เมนูหลัก</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHighlight = (item as any).isHighlight;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onClose();
                  onSelectTab(item.id as ActiveTab);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? isHighlight
                      ? 'bg-[#0e1d33] text-[#38bdf8] border border-[#38bdf8]/50 font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-gradient-to-r from-slate-800 via-slate-700/80 to-slate-800 text-white border border-slate-500 font-bold shadow-[0_0_12px_rgba(203,213,225,0.15)]'
                    : isHighlight
                    ? 'text-[#38bdf8] hover:bg-[#0e1d33]/50'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#0f1420]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? isHighlight
                          ? 'text-[#38bdf8]'
                          : 'text-slate-200'
                        : isHighlight
                        ? 'text-[#38bdf8]/80'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Pair/Setup Management links */}
        <div className="pt-2 border-t border-[#1e293b] space-y-1">
          <div className="text-[10px] font-mono text-slate-400 px-2 mb-1 uppercase">การจัดการท่า & สินทรัพย์</div>
          <button
            onClick={() => {
              onClose();
              onOpenManageSetups();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-[#94a3b8] hover:text-white hover:bg-[#0f1420] transition-colors text-left"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>จัดการท่าเทรด (Setups)</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenManagePairs();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-[#94a3b8] hover:text-white hover:bg-[#0f1420] transition-colors text-left"
          >
            <Coins className="w-3.5 h-3.5 text-slate-400" />
            <span>จัดการคู่สินทรัพย์ (Pairs)</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#1e293b] space-y-1.5">
        <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span>Gengar - Wyk Labs (Data) • Stainless Terminal</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#05070c] border-r border-[#1e293b] h-screen sticky top-0 z-20 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-[#05070c] border-r border-[#1e293b] h-full shadow-2xl animate-fade-in overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
