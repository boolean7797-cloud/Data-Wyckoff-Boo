import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Lock,
  Flame,
  TrendingUp,
  Percent,
  DollarSign,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { Trade, User, CertificateConfig } from '../types';

interface TraderCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  trades: Trade[];
}

export const TraderCertificateModal: React.FC<TraderCertificateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  trades = [],
}) => {
  const certRef = useRef<HTMLDivElement | null>(null);

  // Certificate Config Toggles
  const [config, setConfig] = useState<CertificateConfig>({
    showWinRate: true,
    showTotalPnL: true,
    showProfitFactor: true,
    showMaxStreak: true,
    showAverageRR: true,
    showOfficialSeal: true,
    showSignature: true,
    showPortfolioTag: true,
    customNotes: 'Gengar - Wyk Labs (Data) Quantitative Risk & Execution Audited',
  });

  const [traderTitle, setTraderTitle] = useState(
    currentUser?.title || 'Senior Executive Prop Trader'
  );
  const [certificateId] = useState(
    () => `GWL-EXEC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );

  // Compute live all-time high metrics
  const metrics = useMemo(() => {
    const validTrades = (Array.isArray(trades) ? trades : []).filter((t) => !t.isScreenshotOnly);
    const totalTrades = validTrades.length;
    const wins = validTrades.filter((t) => t.outcome === 'WIN');
    const losses = validTrades.filter((t) => t.outcome === 'LOSE');

    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const totalPnL = validTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    const grossWin = wins.reduce((acc, t) => acc + Math.max(0, t.pnl || 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + Math.min(0, t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 9.99 : 0;

    let maxStreak = 0;
    let curStreak = 0;
    for (const t of validTrades) {
      if (t.outcome === 'WIN') {
        curStreak++;
        if (curStreak > maxStreak) maxStreak = curStreak;
      } else {
        curStreak = 0;
      }
    }

    const avgRR =
      wins.length > 0
        ? wins.reduce((acc, t) => acc + (t.riskReward || 1), 0) / wins.length
        : 2.5;

    return {
      totalTrades,
      winCount: wins.length,
      lossCount: losses.length,
      winRate: winRate.toFixed(1),
      totalPnL,
      profitFactor: profitFactor.toFixed(2),
      maxStreak: maxStreak || (wins.length > 0 ? 1 : 0),
      avgRR: avgRR.toFixed(1),
    };
  }, [trades]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-black font-['Outfit',sans-serif]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md print:hidden" onClick={onClose} />

      {/* Modal Container - Landscape Width Focus */}
      <div className="relative z-10 w-full max-w-5xl bg-[#06080e] border border-[#1e293b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden my-4 flex flex-col max-h-[96vh] animate-fade-in print:border-none print:shadow-none print:max-w-none print:w-full print:my-0">
        {/* Top Control Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#030407] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_15px_rgba(203,213,225,0.3)] flex items-center justify-center">
              <div className="w-full h-full bg-[#030407] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="/gengar_logo.jpg"
                  alt="Gengar - Wyk Labs (Data)"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#f8fafc] tracking-wide flex items-center gap-2 font-['Outfit',sans-serif]">
                <span>CERTIFICATE OF TRADING EXCELLENCE (แนวนอน • LANDSCAPE)</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600 shadow-sm">
                  LANDSCAPE A4
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Gengar - Wyk Labs (Data) Institutional Performance & Risk Certification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black text-xs font-mono font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / บันทึก PDF (แนวนอน)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Customization Options Bar */}
          <div className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] space-y-2 print:hidden">
            <div className="flex items-center justify-between text-xs font-bold text-[#f8fafc]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-mono">ปรับแต่งข้อมูลบนใบประกาศนียบัตร:</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                เลือกเปิด-ปิด สถิติเพื่อแสดงบนใบประกาศ
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showWinRate}
                  onChange={(e) => setConfig({ ...config, showWinRate: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">Win Rate ({metrics.winRate}%)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showTotalPnL}
                  onChange={(e) => setConfig({ ...config, showTotalPnL: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">
                  Net PnL (${metrics.totalPnL.toLocaleString()})
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showProfitFactor}
                  onChange={(e) => setConfig({ ...config, showProfitFactor: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">Profit Factor ({metrics.profitFactor})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showMaxStreak}
                  onChange={(e) => setConfig({ ...config, showMaxStreak: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">Max Streak ({metrics.maxStreak} W)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showAverageRR}
                  onChange={(e) => setConfig({ ...config, showAverageRR: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">Avg R:R (1:{metrics.avgRR})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showOfficialSeal}
                  onChange={(e) => setConfig({ ...config, showOfficialSeal: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">ตราประทับ Stainless Steel</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showSignature}
                  onChange={(e) => setConfig({ ...config, showSignature: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">ลายเซ็น Executive Board</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-[#06080e] border border-[#1e293b] cursor-pointer hover:border-slate-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.showPortfolioTag}
                  onChange={(e) => setConfig({ ...config, showPortfolioTag: e.target.checked })}
                  className="rounded accent-slate-300"
                />
                <span className="text-slate-300 text-[11px]">ตำแหน่ง Trader</span>
              </label>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LANDSCAPE (แนวนอน) STAINLESS STEEL & METALLIC CHROME CERTIFICATE */}
          {/* ========================================================================= */}
          <div className="w-full flex items-center justify-center overflow-x-auto p-1">
            <div
              ref={certRef}
              className="relative w-full max-w-[960px] aspect-[16/10] sm:aspect-[1.45/1] min-h-[540px] bg-[#020305] text-[#f8fafc] rounded-2xl p-6 sm:p-10 border-2 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden print:p-8 print:border-4 print:border-black print:bg-black font-['Outfit',sans-serif] flex flex-col justify-between"
              style={{
                backgroundImage: `radial-gradient(ellipse at 50% 15%, rgba(225, 29, 72, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 10%, rgba(203, 213, 225, 0.15) 0%, transparent 70%), linear-gradient(180deg, #07090f 0%, #010204 100%)`,
              }}
            >
              {/* Background Textured Certificate Artwork / Watermark */}
              <div className="absolute inset-0 opacity-20 pointer-events-none select-none mix-blend-screen overflow-hidden">
                <img
                  src="/certificate_bg.jpg"
                  alt="Certificate Texture"
                  className="w-full h-full object-cover filter contrast-125"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Stainless Steel Dual Border Frame */}
              <div className="absolute inset-2 sm:inset-3 border border-slate-800 rounded-xl pointer-events-none" />
              <div className="absolute inset-3 sm:inset-4 border border-slate-500/40 rounded-lg pointer-events-none" />

              {/* Polished Metallic Corner Ornaments */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-slate-300 pointer-events-none" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-slate-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-slate-300 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-slate-300 pointer-events-none" />

              {/* Background Full-Bleed Seamless Watermark Raven Logo */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-[0.14] pointer-events-none select-none overflow-hidden mix-blend-screen"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 85%)',
                }}
              >
                <img
                  src="/gengar_logo.jpg"
                  alt="Watermark"
                  className="w-full h-full object-contain scale-110 filter contrast-125 brightness-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* 1. Certificate Landscape Header */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                {/* Left: Official Gengar Emblem Logo */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_20px_rgba(203,213,225,0.3)] flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-[#030407] rounded-[14px] overflow-hidden flex items-center justify-center">
                      <img
                        src="/gengar_logo.jpg"
                        alt="Gengar - Wyk Labs Logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0d14] border border-slate-600 text-slate-200 text-[10px] font-semibold tracking-[0.2em] uppercase shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-slate-300" />
                      <span>GENGAR - WYK LABS</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 tracking-wider mt-0.5">
                      INSTITUTIONAL QUANT DATA ENGINE
                    </div>
                  </div>
                </div>

                {/* Center / Right: Certificate Title */}
                <div className="text-center sm:text-right">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 uppercase">
                    CERTIFICATE OF TRADING EXCELLENCE
                  </h1>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-400 font-mono mt-0.5">
                    ACCREDITATION OF RISK DISCIPLINE & PERFORMANCE
                  </p>
                </div>
              </div>

              {/* 2. Recipient Conferral Section */}
              <div className="text-center py-4 sm:py-6 space-y-2 relative z-10">
                <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-[0.25em] uppercase font-mono">
                  THIS CERTIFICATE IS OFFICIALLY PRESENTED AND CONFERRED UPON
                </p>

                <div className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-wide py-1 font-['Outfit',sans-serif]">
                  {currentUser?.displayName || 'Trader'}
                </div>

                {config.showPortfolioTag && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#0a0d14] border border-slate-700/80 text-xs font-mono text-[#f8fafc] shadow-sm">
                    <span className="text-slate-400">@{currentUser?.username || 'trader'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-200 font-bold tracking-wide uppercase">{traderTitle}</span>
                  </div>
                )}

                <p className="text-xs text-slate-300 max-w-2xl mx-auto pt-1 leading-relaxed text-center font-normal">
                  &ldquo;Having demonstrated rigorous adherence to strict risk parameters, sustained statistical edge,
                  and professional execution across market conditions as verified by the quantitative audit engine.&rdquo;
                </p>
              </div>

              {/* 3. Verified Metrics Horizontal Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 py-3 relative z-10 border-y border-slate-800 bg-[#06080d]/80 rounded-xl my-1">
                {config.showWinRate && (
                  <div className="p-2 sm:p-3 text-center border-r border-slate-800/80 last:border-none">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                      WIN RATE
                    </div>
                    <div className="text-lg sm:text-2xl font-bold font-mono text-slate-100 mt-0.5">
                      {metrics.winRate}%
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      {metrics.winCount}W / {metrics.lossCount}L
                    </div>
                  </div>
                )}

                {config.showTotalPnL && (
                  <div className="p-2 sm:p-3 text-center border-r border-slate-800/80 last:border-none">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                      NET REALIZED PNL
                    </div>
                    <div
                      className={`text-lg sm:text-2xl font-bold font-mono mt-0.5 ${
                        metrics.totalPnL >= 0 ? 'text-slate-100' : 'text-slate-400'
                      }`}
                    >
                      ${metrics.totalPnL.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      {metrics.totalTrades} Executed Orders
                    </div>
                  </div>
                )}

                {config.showProfitFactor && (
                  <div className="p-2 sm:p-3 text-center border-r border-slate-800/80 last:border-none">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                      PROFIT FACTOR
                    </div>
                    <div className="text-lg sm:text-2xl font-bold font-mono text-slate-200 mt-0.5">
                      {metrics.profitFactor}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      Gross Gain / Loss
                    </div>
                  </div>
                )}

                {config.showMaxStreak && (
                  <div className="p-2 sm:p-3 text-center border-r border-slate-800/80 last:border-none">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                      MAX WIN STREAK
                    </div>
                    <div className="text-lg sm:text-2xl font-bold font-mono text-slate-200 mt-0.5">
                      {metrics.maxStreak}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      Consecutive Wins
                    </div>
                  </div>
                )}

                {config.showAverageRR && (
                  <div className="p-2 sm:p-3 text-center last:border-none">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                      AVERAGE R:R
                    </div>
                    <div className="text-lg sm:text-2xl font-bold font-mono text-slate-100 mt-0.5">
                      1:{metrics.avgRR}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      Risk to Reward
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Certificate Landscape Footer: Metadata + Stainless Seal + Signature */}
              <div className="pt-3 sm:pt-4 flex flex-row items-center justify-between gap-4 relative z-10">
                {/* Document Metadata */}
                <div className="space-y-1 text-left font-mono">
                  <div className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider">
                    SERIAL: <span className="text-slate-200 font-bold">{certificateId}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider">
                    ISSUED: <span className="text-slate-200">{currentDateStr}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-300" />
                    <span className="tracking-wide uppercase">GENGAR - WYK LABS AUDIT PROTOCOL</span>
                  </div>
                </div>

                {/* Formal Stainless Steel Official Seal */}
                {config.showOfficialSeal && (
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-double border-slate-400 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-1 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(203,213,225,0.3)] relative z-10">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200 mb-0.5 stroke-[2]" />
                      <span className="text-[6.5px] sm:text-[7.5px] font-black tracking-[0.15em] text-white">
                        GENGAR - WYK
                      </span>
                      <span className="text-[6px] tracking-widest text-slate-400 uppercase font-mono">
                        OFFICIAL SEAL
                      </span>
                    </div>
                    {/* Metallic Silver Ribbons */}
                    <div className="flex gap-1 -mt-2 opacity-90 pointer-events-none">
                      <div className="w-2.5 h-4 bg-gradient-to-b from-slate-400 to-slate-600 rotate-[-12deg] rounded-b-sm shadow-sm" />
                      <div className="w-2.5 h-4 bg-gradient-to-b from-slate-300 to-slate-500 rotate-[12deg] rounded-b-sm shadow-sm" />
                    </div>
                  </div>
                )}

                {/* Formal Signature Authority */}
                {config.showSignature && (
                  <div className="text-right space-y-1 font-mono">
                    <div className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 tracking-wide">
                      Gengar - Wyk Labs Executive Board
                    </div>
                    <div className="w-36 sm:w-44 h-0.5 bg-gradient-to-r from-slate-800 via-slate-400 to-slate-200 ml-auto" />
                    <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider">
                      CHIEF QUANTITATIVE & RISK OFFICER
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
