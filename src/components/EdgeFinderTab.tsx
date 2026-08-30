import React, { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Award,
  Zap,
  Clock,
  Coins,
  Tag,
  BarChart2,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Trade } from '../types';

interface EdgeFinderTabProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onOpenAddTrade?: () => void;
  onOpenAiCoach?: () => void;
}

export const EdgeFinderTab: React.FC<EdgeFinderTabProps> = ({
  trades = [],
  onSelectTrade,
  onOpenAddTrade,
  onOpenAiCoach,
}) => {
  const safeTrades = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);

  // Executed trades only (excluding MISS)
  const executedTrades = useMemo(() => safeTrades.filter((t) => t.outcome !== 'MISS'), [safeTrades]);

  // 1. Group by Setup Type
  const setupAnalysis = useMemo(() => {
    const map: Record<
      string,
      { total: number; wins: number; losses: number; be: number; pnl: number; totalRR: number }
    > = {};

    safeTrades.forEach((t) => {
      const setup = t.setupType || 'Other';
      if (!map[setup]) {
        map[setup] = { total: 0, wins: 0, losses: 0, be: 0, pnl: 0, totalRR: 0 };
      }
      map[setup].total += 1;
      if (t.outcome === 'WIN') map[setup].wins += 1;
      if (t.outcome === 'LOSE') map[setup].losses += 1;
      if (t.outcome === 'BE') map[setup].be += 1;
      map[setup].pnl += t.pnl || 0;
      map[setup].totalRR += t.riskReward || 0;
    });

    return Object.entries(map).map(([setup, data]) => {
      const executed = data.wins + data.losses + data.be;
      const winRate = executed > 0 ? Math.round((data.wins / executed) * 100) : 0;
      const avgRR = data.total > 0 ? (data.totalRR / data.total).toFixed(1) : '0.0';
      return { setup, ...data, winRate, avgRR, executed };
    });
  }, [safeTrades]);

  // 2. Group by Session
  const sessionAnalysis = useMemo(() => {
    const map: Record<
      string,
      { total: number; wins: number; losses: number; be: number; pnl: number }
    > = {};

    safeTrades.forEach((t) => {
      const sess = t.session || 'Off-Session';
      if (!map[sess]) {
        map[sess] = { total: 0, wins: 0, losses: 0, be: 0, pnl: 0 };
      }
      map[sess].total += 1;
      if (t.outcome === 'WIN') map[sess].wins += 1;
      if (t.outcome === 'LOSE') map[sess].losses += 1;
      if (t.outcome === 'BE') map[sess].be += 1;
      map[sess].pnl += t.pnl || 0;
    });

    return Object.entries(map).map(([session, data]) => {
      const executed = data.wins + data.losses + data.be;
      const winRate = executed > 0 ? Math.round((data.wins / executed) * 100) : 0;
      return { session, ...data, winRate };
    });
  }, [safeTrades]);

  // 3. Group by Pair
  const pairAnalysis = useMemo(() => {
    const map: Record<
      string,
      { total: number; wins: number; losses: number; be: number; pnl: number }
    > = {};

    safeTrades.forEach((t) => {
      const pair = t.pair || 'Unknown';
      if (!map[pair]) {
        map[pair] = { total: 0, wins: 0, losses: 0, be: 0, pnl: 0 };
      }
      map[pair].total += 1;
      if (t.outcome === 'WIN') map[pair].wins += 1;
      if (t.outcome === 'LOSE') map[pair].losses += 1;
      if (t.outcome === 'BE') map[pair].be += 1;
      map[pair].pnl += t.pnl || 0;
    });

    return Object.entries(map).map(([pair, data]) => {
      const executed = data.wins + data.losses + data.be;
      const winRate = executed > 0 ? Math.round((data.wins / executed) * 100) : 0;
      return { pair, ...data, winRate };
    });
  }, [safeTrades]);

  // BEST EDGE (The Best)
  const bestWinRateSetup = useMemo(() => {
    const valid = setupAnalysis.filter((s) => s.executed >= 1);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.winRate - a.winRate || b.pnl - a.pnl)[0];
  }, [setupAnalysis]);

  const mostProfitableSetup = useMemo(() => {
    if (setupAnalysis.length === 0) return null;
    return [...setupAnalysis].sort((a, b) => b.pnl - a.pnl)[0];
  }, [setupAnalysis]);

  const bestSession = useMemo(() => {
    if (sessionAnalysis.length === 0) return null;
    return [...sessionAnalysis].sort((a, b) => b.winRate - a.winRate || b.pnl - a.pnl)[0];
  }, [sessionAnalysis]);

  const bestPair = useMemo(() => {
    if (pairAnalysis.length === 0) return null;
    return [...pairAnalysis].sort((a, b) => b.pnl - a.pnl || b.winRate - a.winRate)[0];
  }, [pairAnalysis]);

  // WORST LEAKS (The Worst)
  const worstSetup = useMemo(() => {
    const valid = setupAnalysis.filter((s) => s.executed >= 1);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => a.pnl - b.pnl || a.winRate - b.winRate)[0];
  }, [setupAnalysis]);

  const worstSession = useMemo(() => {
    if (sessionAnalysis.length === 0) return null;
    return [...sessionAnalysis].sort((a, b) => a.pnl - b.pnl || a.winRate - b.winRate)[0];
  }, [sessionAnalysis]);

  const worstPair = useMemo(() => {
    if (pairAnalysis.length === 0) return null;
    return [...pairAnalysis].sort((a, b) => a.pnl - b.pnl)[0];
  }, [pairAnalysis]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center text-black shadow-[0_0_12px_rgba(203,213,225,0.3)] font-mono font-bold text-xs">
              EF
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#f8fafc] font-['Plus_Jakarta_Sans']">
                Edge Finder (The Best & The Worst)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                ระบบค้นหาจุดได้เปรียบสูงสุด และจุดรั่วไหลที่สร้างความเสียหายในพอร์ต
              </p>
            </div>
          </div>
        </div>

        {onOpenAiCoach && (
          <button
            onClick={onOpenAiCoach}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e131f] hover:bg-[#1a233a] border border-[#1e293b] hover:border-slate-400 text-slate-200 text-xs font-mono font-bold transition-all self-start sm:self-auto shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-slate-300" />
            <span>AI Edge Diagnosis</span>
          </button>
        )}
      </div>

      {/* 2 Big Columns: THE BEST vs THE WORST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ================= 1. THE BEST (จุดได้เปรียบสูงสุด) ================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-blue-600/30 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Award className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-extrabold text-blue-400 font-mono tracking-tight flex items-center gap-1.5">
                <span>THE BEST (เงื่อนไขและท่าเทรดที่ดีที่สุด)</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-600/30 text-[10px]">A+ EDGE</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                โฟกัสทำซ้ำเงื่อนไขเหล่านี้เพื่อสร้างกำไรสม่ำเสมอ
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Best Setup */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-blue-900/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  🏆 ท่าเทรดชนะสูงสุด (Best Win Rate Setup)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {bestWinRateSetup?.setup || 'ยังไม่มีข้อมูลเพียงพอ'}
                </div>
                <div className="text-[11px] font-mono text-blue-400">
                  {bestWinRateSetup
                    ? `Win Rate ${bestWinRateSetup.winRate}% (${bestWinRateSetup.wins}W / ${bestWinRateSetup.losses}L)`
                    : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">Net P&L</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-blue-400">
                  {bestWinRateSetup && bestWinRateSetup.pnl >= 0
                    ? `+$${bestWinRateSetup.pnl.toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>

            {/* Most Profitable Setup */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-blue-900/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  💰 ท่าที่ทำเงินรวมสูงสุด (Highest P&L Setup)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {mostProfitableSetup?.setup || 'ยังไม่มีข้อมูลเพียงพอ'}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {mostProfitableSetup
                    ? `Avg R:R 1:${mostProfitableSetup.avgRR} • ${mostProfitableSetup.total} ไม้`
                    : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">รวมกำไร</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-blue-400">
                  {mostProfitableSetup && mostProfitableSetup.pnl >= 0
                    ? `+$${mostProfitableSetup.pnl.toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>

            {/* Best Session */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-blue-900/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ⏰ ช่วงเวลาที่ดีที่สุด (Optimal Session)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {bestSession?.session || 'ยังไม่มีข้อมูล'}
                </div>
                <div className="text-[11px] font-mono text-blue-400">
                  {bestSession ? `Win Rate ${bestSession.winRate}% • ${bestSession.total} ไม้` : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">Session P&L</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-blue-400">
                  {bestSession && bestSession.pnl >= 0
                    ? `+$${bestSession.pnl.toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>

            {/* Best Asset Pair */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-blue-900/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  🪙 คู่สินทรัพย์ที่ทำกำไรสม่ำเสมอที่สุด (Best Asset)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {bestPair?.pair || 'ยังไม่มีข้อมูล'}
                </div>
                <div className="text-[11px] font-mono text-blue-400">
                  {bestPair ? `Win Rate ${bestPair.winRate}% (${bestPair.wins}W / ${bestPair.losses}L)` : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">Pair P&L</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-blue-400">
                  {bestPair && bestPair.pnl >= 0 ? `+$${bestPair.pnl.toLocaleString()}` : '$0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. THE WORST (จุดรั่วไหลที่ควรระวัง) ================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-rose-800/40 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-950/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-extrabold text-rose-300 font-mono tracking-tight flex items-center gap-1.5">
                <span>THE WORST (จุดรั่วไหล & ท่าที่สร้างความเสียหาย)</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60 text-[10px] font-bold">LEAK ALERTS</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                หลีกเลี่ยงหรือปรับปรุงเงื่อนไขเหล่านี้ทันที
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Worst Setup */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-rose-900/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ⚠️ ท่าเทรดที่ขาดทุนบ่อยที่สุด (Worst Setup)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {worstSetup?.setup || 'ยังไม่มีสถิติขาดทุนชัดเจน'}
                </div>
                <div className="text-[11px] font-mono text-rose-400">
                  {worstSetup
                    ? `Win Rate ${worstSetup.winRate}% (${worstSetup.losses} ไม้ที่แพ้)`
                    : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">ขาดทุนสุทธิ</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-rose-400">
                  {worstSetup && worstSetup.pnl < 0
                    ? `-$${Math.abs(worstSetup.pnl).toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>

            {/* Worst Session */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-rose-900/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  ⏰ ช่วงเวลาที่เสียบ่อยที่สุด (Worst Session)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {worstSession?.session || 'ยังไม่มีข้อมูล'}
                </div>
                <div className="text-[11px] font-mono text-rose-400">
                  {worstSession
                    ? `Win Rate ${worstSession.winRate}% (${worstSession.losses} ไม้ที่แพ้)`
                    : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">ขาดทุนในเซสชั่น</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-rose-400">
                  {worstSession && worstSession.pnl < 0
                    ? `-$${Math.abs(worstSession.pnl).toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>

            {/* Trend Alignment & Emotion Leak Analysis */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                ⚡ สถิติการเทรดตามเทรนด์ vs สวนเทรนด์ (Trend Alignment Analysis)
              </span>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {(() => {
                  const proTrades = safeTrades.filter((t) => t.trendAlignment === 'PRO_TREND' && t.outcome !== 'MISS');
                  const counterTrades = safeTrades.filter((t) => t.trendAlignment === 'COUNTER_TREND' && t.outcome !== 'MISS');
                  const proWins = proTrades.filter((t) => t.outcome === 'WIN').length;
                  const counterWins = counterTrades.filter((t) => t.outcome === 'WIN').length;
                  const proWR = proTrades.length > 0 ? Math.round((proWins / proTrades.length) * 100) : 0;
                  const counterWR = counterTrades.length > 0 ? Math.round((counterWins / counterTrades.length) * 100) : 0;
                  return (
                    <>
                      <div className="p-2 rounded-lg bg-[#0e131f] border border-blue-900/40 text-xs font-mono">
                        <div className="text-[10px] text-blue-400 font-bold">Pro-Trend (ตามเทรนด์)</div>
                        <div className="text-[#f8fafc] font-bold mt-0.5">WR {proWR}% ({proTrades.length} ไม้)</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0e131f] border border-rose-900/40 text-xs font-mono">
                        <div className="text-[10px] text-rose-400 font-bold">Counter-Trend (สวนเทรนด์)</div>
                        <div className="text-[#f8fafc] font-bold mt-0.5">WR {counterWR}% ({counterTrades.length} ไม้)</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Worst Asset Pair */}
            <div className="p-3.5 rounded-xl bg-[#030407] border border-rose-900/30 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  🪙 สินทรัพย์ที่ขาดทุนหนักที่สุด (Worst Asset)
                </span>
                <div className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  {worstPair?.pair || 'ยังไม่มีข้อมูล'}
                </div>
                <div className="text-[11px] font-mono text-rose-400">
                  {worstPair ? `Win Rate ${worstPair.winRate}% (${worstPair.losses} ไม้ที่แพ้)` : '-'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">ผลขาดทุน</span>
                <div className="text-xs sm:text-sm font-mono font-extrabold text-rose-400">
                  {worstPair && worstPair.pnl < 0
                    ? `-$${Math.abs(worstPair.pnl).toLocaleString()}`
                    : '$0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Setup Matrix Comparison */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
              ตารางเปรียบเทียบสถิติท่าเทรด (Setup Performance Matrix)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{setupAnalysis.length} ท่าเทรด</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">ท่าเทรด (Setup)</th>
                <th className="py-2.5 px-3 text-center">จำนวนไม้</th>
                <th className="py-2.5 px-3 text-center">Win / Loss / BE</th>
                <th className="py-2.5 px-3 text-center">Win Rate ต่อการตั้งค่า</th>
                <th className="py-2.5 px-3 text-center">Avg R:R</th>
                <th className="py-2.5 px-3 text-right">Net P&L ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/40">
              {setupAnalysis.map((s, idx) => (
                <tr key={idx} className="hover:bg-[#0e131f]/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#f8fafc]">{s.setup}</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">{s.total}</td>
                  <td className="py-2.5 px-3 text-center text-[11px]">
                    <span className="text-blue-400 font-bold">{s.wins}W</span>{' '}
                    <span className="text-rose-400 font-bold">{s.losses}L</span>{' '}
                    <span className="text-slate-400">{s.be}BE</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                        s.winRate >= 50
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-600/40'
                          : 'bg-rose-950/70 text-rose-300 border border-rose-700/40'
                      }`}
                    >
                      {s.winRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-400">1:{s.avgRR}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-extrabold ${
                      s.pnl > 0
                        ? 'text-blue-400'
                        : s.pnl < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.pnl > 0
                      ? `+$${s.pnl.toLocaleString()}`
                      : s.pnl < 0
                      ? `-$${Math.abs(s.pnl).toLocaleString()}`
                      : '$0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
