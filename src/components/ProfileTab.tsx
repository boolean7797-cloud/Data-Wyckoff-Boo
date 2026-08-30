import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Coins,
  Tag,
  Download,
  Upload,
  RotateCcw,
  Save,
  Check,
  LogOut,
  Sliders,
  DollarSign,
  Target,
  Trophy,
  Briefcase,
  Bot,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Mail,
  Cloud,
} from 'lucide-react';
import {
  User,
  Trade,
  DailyTargetConfig,
  MilestoneConfig,
  MultiPortfolioConfig,
} from '../types';

interface ProfileTabProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  trades: Trade[];
  setups: string[];
  pairs: string[];
  onImportData: (data: {
    trades: Trade[];
    setups?: string[];
    pairs?: string[];
    user?: User;
  }) => void;
  onResetUserData: () => void;
  onOpenManageSetups: () => void;
  onOpenManagePairs: () => void;
  onOpenAuthModal: () => void;
  dailyTargetConfig: DailyTargetConfig;
  onUpdateDailyTargetConfig: (config: DailyTargetConfig) => void;
  milestoneConfig: MilestoneConfig;
  onUpdateMilestoneConfig: (config: MilestoneConfig) => void;
  multiPortfolioConfig: MultiPortfolioConfig;
  onUpdateMultiPortfolioConfig: (config: MultiPortfolioConfig) => void;
  isAiCoachEnabled: boolean;
  onToggleAiCoachEnabled: (enabled: boolean) => void;
  isRecapEnabled: boolean;
  onToggleRecapEnabled: (enabled: boolean) => void;
  onOpenGmail?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  onUpdateUser,
  trades = [],
  setups = [],
  pairs = [],
  onImportData,
  onResetUserData,
  onOpenManageSetups,
  onOpenManagePairs,
  onOpenAuthModal,
  dailyTargetConfig,
  onUpdateDailyTargetConfig,
  milestoneConfig,
  onUpdateMilestoneConfig,
  multiPortfolioConfig,
  onUpdateMultiPortfolioConfig,
  isAiCoachEnabled = false,
  onToggleAiCoachEnabled,
  isRecapEnabled = true,
  onToggleRecapEnabled,
  onOpenGmail,
}) => {
  const safeTrades = Array.isArray(trades) ? trades : [];
  const safeSetups = Array.isArray(setups) ? setups : [];
  const safePairs = Array.isArray(pairs) ? pairs : [];

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [accountBalance, setAccountBalance] = useState(String(currentUser?.accountBalance || 50000));
  const [isSaved, setIsSaved] = useState(false);

  // Daily target state inside form
  const [dailyTargetEnabled, setDailyTargetEnabled] = useState(dailyTargetConfig.enabled);
  const [targetRR, setTargetRR] = useState(() => (dailyTargetConfig.targetRR !== undefined ? String(dailyTargetConfig.targetRR) : '3.0'));
  const [targetPnL, setTargetPnL] = useState(() => (dailyTargetConfig.targetPnL !== undefined ? String(dailyTargetConfig.targetPnL) : '500'));
  const [targetMaxTrades, setTargetMaxTrades] = useState(() => (dailyTargetConfig.maxTrades !== undefined ? String(dailyTargetConfig.maxTrades) : '5'));

  // Sync state when currentUser changes
  useEffect(() => {
    setDisplayName(currentUser.displayName);
    setTitle(currentUser.title);
    setAccountBalance(String(currentUser.accountBalance || 50000));
    setDailyTargetEnabled(dailyTargetConfig.enabled);
    setTargetRR(dailyTargetConfig.targetRR !== undefined ? String(dailyTargetConfig.targetRR) : '3.0');
    setTargetPnL(dailyTargetConfig.targetPnL !== undefined ? String(dailyTargetConfig.targetPnL) : '500');
    setTargetMaxTrades(dailyTargetConfig.maxTrades !== undefined ? String(dailyTargetConfig.maxTrades) : '5');
  }, [currentUser.id]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.username,
      title: title.trim() || 'Ghost Trader',
      accountBalance: parseFloat(accountBalance) || 50000,
    };
    onUpdateUser(updated);

    onUpdateDailyTargetConfig({
      enabled: dailyTargetEnabled,
      targetRR: targetRR === '' ? 3.0 : parseFloat(targetRR) || 0,
      targetPnL: targetPnL === '' ? 500 : parseFloat(targetPnL) || 0,
      maxTrades: targetMaxTrades === '' ? 5 : parseInt(targetMaxTrades) || 0,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportJSON = () => {
    const backupData = {
      app: 'Ghost Phaze Trading Journal',
      version: '2.4',
      exportedAt: new Date().toISOString(),
      user: currentUser,
      trades,
      setups,
      pairs,
      configs: {
        dailyTarget: dailyTargetConfig,
        milestone: milestoneConfig,
        multiPortfolio: multiPortfolioConfig,
        isAiCoachEnabled,
        isRecapEnabled,
      },
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ghost_phaze_journal_${currentUser.username}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.trades)) {
          onImportData({
            trades: parsed.trades,
            setups: Array.isArray(parsed.setups) ? parsed.setups : undefined,
            pairs: Array.isArray(parsed.pairs) ? parsed.pairs : undefined,
            user: parsed.user,
          });
          alert('นำเข้าข้อมูลสำเร็จเรียบร้อย!');
        } else {
          alert('ไฟล์ข้อมูลไม่ถูกต้องตามรูปแบบ');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 pb-28">
      {/* User Identity Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center font-mono font-extrabold text-sm text-black shadow-[0_0_15px_rgba(203,213,225,0.3)] border border-white/40 shrink-0">
            {currentUser.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-[#f8fafc] font-['Plus_Jakarta_Sans']">
                {currentUser.displayName}
              </h2>
              {currentUser.email ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800 rounded-full flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5 text-blue-400" />
                  <span>{currentUser.email}</span>
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400">(@{currentUser.username})</span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{currentUser?.title || ''}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{safeTrades.length} ไม้ในบันทึก</span>
              {currentUser.email && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Cloud Synced</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 hover:from-blue-900 hover:to-slate-800 text-blue-200 hover:text-white text-xs font-mono border border-blue-800/80 transition-all shadow-sm"
          title="สลับบัญชีอีเมล หรือ จัดการ Cloud Multi-Device Sync"
        >
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentUser.email ? 'จัดการบัญชีคลาวด์' : 'ล็อกอินด้วยอีเมล (Cloud)'}</span>
        </button>
      </div>

      {/* 1. Account Settings Form (Removed % Risk per trade as requested) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Sliders className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
            การตั้งค่าบัญชี & เงินทุน (Account Settings)
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ชื่อแสดงผล (Display Name):
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                สไตล์การเทรด (Trading Title):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                เงินทุนเริ่มต้น ($ Balance):
              </label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black rounded-xl text-xs font-mono font-bold shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white transition-all active:scale-95"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{isSaved ? 'บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Feature Toggles & Preferences (Daily Goals, Milestones, Portfolios, AI Coach, Recap) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Target className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
            ระบบเสริม & สวิตช์เปิดปิดฟีเจอร์ (Feature Toggles)
          </h3>
        </div>

        <div className="space-y-3">
          {/* Daily Goal Target Toggle & Setting */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-slate-300" />
                <div>
                  <div className="text-xs font-bold text-[#f8fafc] font-mono">
                    เป้าหมายรายวัน (Daily Goals & Targets)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    กำหนดเป้าหมายกี่ R:R และกี่ดอลลาร์ต่อวัน เพื่อสร้างวินัย
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !dailyTargetEnabled;
                  setDailyTargetEnabled(nextVal);
                  onUpdateDailyTargetConfig({
                    enabled: nextVal,
                    targetRR: targetRR === '' ? 3.0 : parseFloat(targetRR) || 0,
                    targetPnL: targetPnL === '' ? 500 : parseFloat(targetPnL) || 0,
                    maxTrades: targetMaxTrades === '' ? 5 : parseInt(targetMaxTrades) || 0,
                  });
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  dailyTargetEnabled ? 'bg-blue-600' : 'bg-[#0e131f] border border-[#1e293b]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    dailyTargetEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {dailyTargetEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1e293b] animate-fade-in">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมาย R:R รวมต่อวัน (Target R):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="เช่น 3.0"
                    value={targetRR}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetRR(val);
                    }}
                    onBlur={() => {
                      onUpdateDailyTargetConfig({
                        enabled: true,
                        targetRR: targetRR === '' ? 3.0 : parseFloat(targetRR) || 0,
                        targetPnL: targetPnL === '' ? 500 : parseFloat(targetPnL) || 0,
                        maxTrades: targetMaxTrades === '' ? 5 : parseInt(targetMaxTrades) || 0,
                      });
                    }}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมายกำไรดอลลาร์ต่อวัน (Target $ PnL):
                  </label>
                  <input
                    type="number"
                    step="50"
                    placeholder="เช่น 500"
                    value={targetPnL}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetPnL(val);
                    }}
                    onBlur={() => {
                      onUpdateDailyTargetConfig({
                        enabled: true,
                        targetRR: targetRR === '' ? 3.0 : parseFloat(targetRR) || 0,
                        targetPnL: targetPnL === '' ? 500 : parseFloat(targetPnL) || 0,
                        maxTrades: targetMaxTrades === '' ? 5 : parseInt(targetMaxTrades) || 0,
                      });
                    }}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมายจำนวนไม้ต่อวัน (Max Trades/Day):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="50"
                    placeholder="เช่น 5"
                    value={targetMaxTrades}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetMaxTrades(val);
                    }}
                    onBlur={() => {
                      onUpdateDailyTargetConfig({
                        enabled: true,
                        targetRR: targetRR === '' ? 3.0 : parseFloat(targetRR) || 0,
                        targetPnL: targetPnL === '' ? 500 : parseFloat(targetPnL) || 0,
                        maxTrades: targetMaxTrades === '' ? 5 : parseInt(targetMaxTrades) || 0,
                      });
                    }}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 100 / 500 / 1000 Trades Milestone Roadmap Toggle */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-slate-200" />
              <div>
                <div className="text-xs font-bold text-[#f8fafc] font-mono">
                  เส้นทางเป้าหมายจำนวนไม้ (Milestone Roadmap: 100/500/1000 Trades)
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ติดตามความคืบหน้าการเทรดเพื่อพัฒนาทักษะแบบสะสมระยะยาว
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateMilestoneConfig({ enabled: !milestoneConfig.enabled })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                milestoneConfig.enabled ? 'bg-blue-600' : 'bg-[#0e131f] border border-[#1e293b]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  milestoneConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Gmail Trade Mail & Hub Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
              การเชื่อมต่อ Gmail (Google Workspace)
            </h3>
          </div>
          {onOpenGmail && (
            <button
              onClick={onOpenGmail}
              className="px-3 py-1.5 bg-[#0e131f] hover:bg-[#1a233a] text-slate-200 hover:text-white text-xs font-mono font-bold rounded-xl border border-[#1e293b] transition-colors flex items-center gap-1.5"
            >
              <span>เปิดหน้า Gmail Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          เชื่อมต่อ Gmail เพื่อส่งบันทึกสรุปไม้เทรด (Recap Journal) เข้าอีเมลของคุณหรือส่งต่อให้โค้ช/Mentor พร้อมทั้งสามารถอ่านและค้นหาการแจ้งเตือนจาก Broker และ Prop Firm ได้
        </p>
      </div>

      {/* 3. Custom Pairs & Setups Manager Links */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Tag className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
            สำรวจ & จัดการคู่เงินและท่าเทรด (Pairs & Setups)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pairs Box */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#f8fafc] font-mono flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-300" />
                <span>คู่สินทรัพย์ ({safePairs.length})</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                {safePairs.slice(0, 3).join(', ')}...
              </p>
            </div>
            <button
              onClick={onOpenManagePairs}
              className="px-3 py-1.5 bg-[#0e131f] hover:bg-[#1a233a] text-slate-200 hover:text-white text-xs font-mono rounded-xl border border-[#1e293b] transition-colors"
            >
              แก้ไขคู่เงิน
            </button>
          </div>

          {/* Setups Box */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#f8fafc] font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-300" />
                <span>ท่าเทรด ({safeSetups.length})</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                {safeSetups.map((s) => s.name).slice(0, 3).join(', ')}...
              </p>
            </div>
            <button
              onClick={onOpenManageSetups}
              className="px-3 py-1.5 bg-[#0e131f] hover:bg-[#1a233a] text-slate-200 hover:text-white text-xs font-mono rounded-xl border border-[#1e293b] transition-colors"
            >
              แก้ไขท่าเทรด
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Backup & Restore */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Download className="w-4 h-4 text-slate-300" />
          <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
            สำรอง & นำเข้าข้อมูล (Data Backup & Restore)
          </h3>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportJSON}
            className="flex-1 min-w-[140px] p-3 rounded-xl bg-[#030407] hover:bg-[#0e131f] border border-[#1e293b] hover:border-slate-500 text-left flex items-center gap-2.5 transition-all group"
          >
            <Download className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-mono font-bold text-[#f8fafc]">ดาวน์โหลดสำรองข้อมูล</div>
              <div className="text-[10px] text-slate-400 font-mono">Export .JSON File</div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[140px] p-3 rounded-xl bg-[#030407] hover:bg-[#0e131f] border border-[#1e293b] hover:border-slate-500 text-left flex items-center gap-2.5 transition-all group"
          >
            <Upload className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-mono font-bold text-[#f8fafc]">นำเข้าไฟล์สำรองข้อมูล</div>
              <div className="text-[10px] text-slate-400 font-mono">Import .JSON File</div>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>

        {/* Reset Warning */}
        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            ล้างประวัติการเทรดของไอดีนี้ทั้งหมด:
          </span>
          <button
            type="button"
            onClick={onResetUserData}
            className="px-3 py-1.5 rounded-xl bg-[#0e131f] hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-700 hover:border-slate-500 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลไอดีนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
