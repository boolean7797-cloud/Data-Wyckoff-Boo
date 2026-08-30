import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  Coins,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Sparkles,
  BarChart2,
  X,
  Eye,
  Target,
  Trophy,
  CheckCircle2,
  AlertOctagon,
  Shield,
  DollarSign,
  Plus,
  Sliders,
  Zap,
  Settings,
  Check,
  Pencil,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trade, User, DailyTargetConfig, MilestoneConfig } from '../types';

interface HomeTabProps {
  currentUser: User;
  trades: Trade[];
  onOpenAddTrade: () => void;
  onSelectTrade: (trade: Trade) => void;
  dailyTargetConfig?: DailyTargetConfig;
  onUpdateDailyTargetConfig?: (config: DailyTargetConfig) => void;
  milestoneConfig?: MilestoneConfig;
  onUpdateMilestoneTarget?: (target: number) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentUser,
  trades = [],
  onOpenAddTrade,
  onSelectTrade,
  dailyTargetConfig,
  onUpdateDailyTargetConfig,
  milestoneConfig,
  onUpdateMilestoneTarget,
}) => {
  const safeTrades = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);

  // Quick Daily Target Editor State
  const [isEditingDailyTarget, setIsEditingDailyTarget] = useState(false);
  const [editTargetRR, setEditTargetRR] = useState(() =>
    dailyTargetConfig?.targetRR !== undefined ? String(dailyTargetConfig.targetRR) : '3.0'
  );
  const [editTargetPnL, setEditTargetPnL] = useState(() =>
    dailyTargetConfig?.targetPnL !== undefined ? String(dailyTargetConfig.targetPnL) : '500'
  );
  const [editTargetMaxTrades, setEditTargetMaxTrades] = useState(() =>
    dailyTargetConfig?.maxTrades !== undefined ? String(dailyTargetConfig.maxTrades) : '5'
  );

  const handleSaveDailyTarget = () => {
    if (onUpdateDailyTargetConfig) {
      onUpdateDailyTargetConfig({
        enabled: dailyTargetConfig?.enabled ?? true,
        targetRR: editTargetRR === '' ? 3.0 : parseFloat(editTargetRR) || 0,
        targetPnL: editTargetPnL === '' ? 500 : parseFloat(editTargetPnL) || 0,
        maxTrades: editTargetMaxTrades === '' ? 5 : parseInt(editTargetMaxTrades) || 0,
      });
    }
    setIsEditingDailyTarget(false);
  };

  // Calendar month state (defaults to current date/month)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{
    dateStr: string;
    trades: Trade[];
  } | null>(null);

  // Filter & Metric Calculations
  const executedTrades = useMemo(() => safeTrades.filter((t) => t.outcome !== 'MISS'), [safeTrades]);
  const winTrades = useMemo(() => safeTrades.filter((t) => t.outcome === 'WIN'), [safeTrades]);
  const loseTrades = useMemo(() => safeTrades.filter((t) => t.outcome === 'LOSE'), [safeTrades]);
  const beTrades = useMemo(() => safeTrades.filter((t) => t.outcome === 'BE'), [safeTrades]);
  const missTrades = useMemo(() => safeTrades.filter((t) => t.outcome === 'MISS'), [safeTrades]);

  const totalPnL = useMemo(() => safeTrades.reduce((acc, t) => acc + (t.pnl || 0), 0), [safeTrades]);

  const grossProfit = useMemo(
    () => winTrades.reduce((acc, t) => acc + (t.pnl || 0), 0),
    [winTrades]
  );
  const grossLoss = useMemo(
    () => Math.abs(loseTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)),
    [loseTrades]
  );

  const profitFactor =
    grossLoss > 0
      ? (grossProfit / grossLoss).toFixed(2)
      : grossProfit > 0
      ? 'MAX'
      : '0.00';

  const winRate =
    executedTrades.length > 0 ? Math.round((winTrades.length / executedTrades.length) * 100) : 0;

  const avgRR =
    safeTrades.length > 0
      ? (safeTrades.reduce((acc, t) => acc + (t.riskReward || 0), 0) / safeTrades.length).toFixed(1)
      : '0.0';

  const initialBalance = currentUser.accountBalance || 50000;
  const currentBalance = initialBalance + totalPnL;
  const growthPercent = ((totalPnL / initialBalance) * 100).toFixed(2);

  // Sorted trades chronologically for Equity Curve
  const sortedTrades = useMemo(() => {
    return [...safeTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [safeTrades]);

  // Equity Curve Data
  const equityData = useMemo(() => {
    let runningPnL = 0;
    const initialPoint = { index: 0, date: 'Start', pnl: 0, cumulativePnL: 0, pair: '' };
    const points = [initialPoint];

    sortedTrades.forEach((t, idx) => {
      runningPnL += t.pnl || 0;
      const dateLabel = t.date ? t.date.slice(5, 10) : `#${idx + 1}`;
      points.push({
        index: idx + 1,
        date: dateLabel,
        pnl: t.pnl || 0,
        cumulativePnL: runningPnL,
        pair: t.pair,
      });
    });

    return points;
  }, [sortedTrades]);

  // Setup Win Rate Stats
  const setupStats = useMemo(() => {
    const setupMap: Record<
      string,
      {
        total: number;
        wins: number;
        losses: number;
        be: number;
        miss: number;
        pnl: number;
        lossAmount: number;
      }
    > = {};

    safeTrades.forEach((t) => {
      const setup = t.setupType || 'Other';
      if (!setupMap[setup]) {
        setupMap[setup] = {
          total: 0,
          wins: 0,
          losses: 0,
          be: 0,
          miss: 0,
          pnl: 0,
          lossAmount: 0,
        };
      }
      setupMap[setup].total += 1;
      if (t.outcome === 'WIN') setupMap[setup].wins += 1;
      if (t.outcome === 'LOSE') {
        setupMap[setup].losses += 1;
        setupMap[setup].lossAmount += Math.abs(t.pnl || 0);
      }
      if (t.outcome === 'BE') setupMap[setup].be += 1;
      if (t.outcome === 'MISS') setupMap[setup].miss += 1;
      setupMap[setup].pnl += t.pnl || 0;
    });

    return Object.entries(setupMap).map(([setup, data]) => {
      const executed = data.wins + data.losses + data.be;
      const winRate = executed > 0 ? Math.round((data.wins / executed) * 100) : 0;
      return {
        setup,
        ...data,
        winRate,
      };
    });
  }, [safeTrades]);

  // Session Win Rate Stats
  const sessionStats = useMemo(() => {
    const sessions = ['London', 'New York', 'Asia', 'Off-Session'];
    return sessions.map((sess) => {
      const sessTrades = safeTrades.filter((t) => t.session === sess);
      const executed = sessTrades.filter((t) => t.outcome !== 'MISS');
      const wins = sessTrades.filter((t) => t.outcome === 'WIN').length;
      const losses = sessTrades.filter((t) => t.outcome === 'LOSE').length;
      const miss = sessTrades.filter((t) => t.outcome === 'MISS').length;
      const winRate = executed.length > 0 ? Math.round((wins / executed.length) * 100) : 0;
      const pnl = sessTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

      return {
        session: sess,
        total: sessTrades.length,
        wins,
        losses,
        miss,
        winRate,
        pnl,
      };
    });
  }, [safeTrades]);

  // Today Trades Calculation for Daily Goals
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrades = useMemo(() => {
    return safeTrades.filter((t) => t.date && t.date.startsWith(todayStr));
  }, [safeTrades, todayStr]);

  const todayPnL = useMemo(() => {
    return todayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  }, [todayTrades]);

  const todayAchievedRR = useMemo(() => {
    return todayTrades.reduce((acc, t) => {
      if (t.outcome === 'WIN') return acc + (t.riskReward || 0);
      if (t.outcome === 'LOSE') return acc - 1;
      return acc;
    }, 0);
  }, [todayTrades]);

  // Milestone Progress (1 to 5000 trades)
  const milestoneTarget = milestoneConfig?.targetTrades || 500;
  const milestoneProgressPct = Math.min(100, Math.round((safeTrades.length / milestoneTarget) * 100));
  const remainingTrades = Math.max(0, milestoneTarget - safeTrades.length);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'มกราคม (Jan)',
    'กุมภาพันธ์ (Feb)',
    'มีนาคม (Mar)',
    'เมษายน (Apr)',
    'พฤษภาคม (May)',
    'มิถุนายน (Jun)',
    'กรกฎาคม (Jul)',
    'สิงหาคม (Aug)',
    'กันยายน (Sep)',
    'ตุลาคม (Oct)',
    'พฤศจิกายน (Nov)',
    'ธันวาคม (Dec)',
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayData = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const datePrefix = `${year}-${formattedMonth}-${formattedDay}`;

    const dayTrades = safeTrades.filter((t) => t.date && t.date.startsWith(datePrefix));
    const dayPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    return {
      dateStr: datePrefix,
      trades: dayTrades,
      count: dayTrades.length,
      pnl: dayPnL,
      hasWins: dayTrades.some((t) => t.outcome === 'WIN'),
      hasLosses: dayTrades.some((t) => t.outcome === 'LOSE'),
    };
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-4 pb-24 md:pb-8 animate-fade-in">
      {/* 1. TOP ACCOUNT & PERFORMANCE BANNER WITH PROMINENT ADD TRADE BUTTON */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#06080e] via-[#0d121c] to-[#06080e] border border-slate-700/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-mono font-extrabold uppercase shadow-sm">
                {currentUser.title}
              </span>
              <span className="text-xs font-mono text-slate-400">@{currentUser.username}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc] tracking-tight">
              ${currentBalance.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-mono font-normal">พอร์ตส่วนตัว</span>
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Net P&L รวม:</span>
              <span
                className={`font-extrabold flex items-center gap-0.5 ${
                  totalPnL >= 0 ? 'text-blue-400' : 'text-rose-400'
                }`}
              >
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                )}
                {totalPnL >= 0
                  ? `+$${totalPnL.toLocaleString()}`
                  : `-$${Math.abs(totalPnL).toLocaleString()}`}{' '}
                ({growthPercent}%)
              </span>
            </div>
          </div>

          {/* Quick Win/Loss Pill & High-Visibility Add Trade Button */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] flex items-center gap-4 text-center">
              <div>
                <div className="text-[10px] font-mono text-slate-400">Win Rate</div>
                <div className="text-sm font-extrabold font-mono text-blue-400">{winRate}%</div>
              </div>
              <div className="w-[1px] h-6 bg-[#1e293b]" />
              <div>
                <div className="text-[10px] font-mono text-slate-400">Total ไม้</div>
                <div className="text-sm font-extrabold font-mono text-[#f8fafc]">{trades.length}</div>
              </div>
            </div>

            {/* Ultra Prominent Add Trade Button */}
            <button
              onClick={onOpenAddTrade}
              className="px-5 py-3 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black font-mono font-extrabold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border border-white whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>⚡ เพิ่มไม้เทรด (Add Trade)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. OPTIONAL: DAILY GOALS & TARGET TRACKER (If enabled by user) */}
      {dailyTargetConfig?.enabled && (
        <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-300" />
              <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
                เป้าหมายการเทรดรายวัน (Daily Goals & Targets)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">
                {todayTrades.length} ไม้วันนี้
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditTargetRR(dailyTargetConfig.targetRR !== undefined ? String(dailyTargetConfig.targetRR) : '3.0');
                  setEditTargetPnL(dailyTargetConfig.targetPnL !== undefined ? String(dailyTargetConfig.targetPnL) : '500');
                  setEditTargetMaxTrades(dailyTargetConfig.maxTrades !== undefined ? String(dailyTargetConfig.maxTrades) : '5');
                  setIsEditingDailyTarget((prev) => !prev);
                }}
                className="text-[11px] font-mono text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-[#0e131f] border border-[#1e293b] hover:border-slate-500 transition-all flex items-center gap-1"
              >
                <Settings className="w-3 h-3 text-slate-400" />
                <span>{isEditingDailyTarget ? 'ปิดการตั้งค่า' : 'ปรับเป้าหมาย'}</span>
              </button>
            </div>
          </div>

          {/* Inline Quick Editor if open */}
          {isEditingDailyTarget && (
            <div className="p-3 rounded-xl bg-[#030407] border border-blue-900/40 animate-fade-in space-y-2.5">
              <div className="text-[11px] font-mono text-blue-300 font-bold flex items-center gap-1.5">
                <Pencil className="w-3 h-3 text-blue-400" />
                <span>ปรับเปลี่ยนเป้าหมายรายวัน (Daily Goals Config):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมาย R:R (Target R)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="เช่น 3.0"
                    value={editTargetRR}
                    onChange={(e) => setEditTargetRR(e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมายกำไร ($ PnL)
                  </label>
                  <input
                    type="number"
                    step="50"
                    placeholder="เช่น 500"
                    value={editTargetPnL}
                    onChange={(e) => setEditTargetPnL(e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    เป้าหมายจำนวนไม้ (Max Trades)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="50"
                    placeholder="เช่น 5"
                    value={editTargetMaxTrades}
                    onChange={(e) => setEditTargetMaxTrades(e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingDailyTarget(false)}
                  className="px-3 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-[#0e131f] border border-[#1e293b]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveDailyTarget}
                  className="px-3.5 py-1 rounded-lg text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3 h-3" />
                  <span>บันทึกเป้าหมาย</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Daily R:R Goal */}
            <div className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">เป้าหมาย Daily R:R:</span>
                <span className="font-bold text-[#f8fafc]">
                  {todayAchievedRR.toFixed(1)} / {dailyTargetConfig.targetRR ?? 3}R
                </span>
              </div>
              <div className="w-full bg-[#0e131f] h-2.5 rounded-full overflow-hidden border border-[#1e293b]/50">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (todayAchievedRR / (dailyTargetConfig.targetRR || 3)) * 100)
                    )}%`,
                  }}
                  className={`h-full transition-all ${
                    todayAchievedRR >= (dailyTargetConfig.targetRR || 3)
                      ? 'bg-[#1d4ed8]'
                      : 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* 2. Daily PnL Goal */}
            <div className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">เป้าหมาย Daily P&L:</span>
                <span
                  className={`font-bold ${todayPnL >= 0 ? 'text-blue-400' : 'text-rose-400'}`}
                >
                  {todayPnL >= 0 ? `+$${todayPnL.toLocaleString()}` : `-$${Math.abs(todayPnL).toLocaleString()}`} / $
                  {(dailyTargetConfig.targetPnL ?? 500).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[#0e131f] h-2.5 rounded-full overflow-hidden border border-[#1e293b]/50">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (todayPnL / (dailyTargetConfig.targetPnL || 500)) * 100)
                    )}%`,
                  }}
                  className={`h-full transition-all ${
                    todayPnL >= (dailyTargetConfig.targetPnL || 500)
                      ? 'bg-[#1d4ed8]'
                      : 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* 3. Daily Max Trades Goal */}
            <div className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">เป้าหมายจำนวนไม้:</span>
                <span className="font-bold text-[#f8fafc]">
                  {todayTrades.length} / {dailyTargetConfig.maxTrades ?? 5} ไม้
                </span>
              </div>
              <div className="w-full bg-[#0e131f] h-2.5 rounded-full overflow-hidden border border-[#1e293b]/50">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (todayTrades.length / (dailyTargetConfig.maxTrades || 5)) * 100)
                    )}%`,
                  }}
                  className={`h-full transition-all ${
                    todayTrades.length <= (dailyTargetConfig.maxTrades || 5)
                      ? 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500'
                      : 'bg-rose-600'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE 1 - 5000 TRADES MILESTONE ROADMAP (As requested: ปรับจำนวน 1 - 5000 ไม้) */}
      {milestoneConfig?.enabled && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0e131f] border border-slate-700 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-slate-200" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono flex items-center gap-2">
                  <span>ภารกิจสะสมจำนวนไม้ (Trade Milestone Target)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-600">
                    {milestoneProgressPct}% สำเร็จ
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  ตั้งเป้าหมายสะสมจำนวนไม้เพื่อฝึกวินัย (ปรับเลื่อนได้ 1 - 5,000 ไม้)
                </p>
              </div>
            </div>

            {/* Target Number Display & Direct Input */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-mono text-slate-400">เป้าหมาย:</span>
              <input
                type="number"
                min="1"
                max="5000"
                value={milestoneTarget}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 100;
                  if (onUpdateMilestoneTarget) {
                    onUpdateMilestoneTarget(Math.min(5000, Math.max(1, val)));
                  }
                }}
                className="w-20 bg-[#030407] border border-slate-600 focus:border-slate-300 rounded-xl px-2 py-1 text-xs font-mono font-extrabold text-slate-100 text-center focus:outline-none"
              />
              <span className="text-xs font-mono font-bold text-[#f8fafc]">ไม้</span>
            </div>
          </div>

          {/* Large Interactive Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-[#f8fafc] font-extrabold">
                สะสมแล้ว <strong className="text-blue-400 text-base">{trades.length}</strong> / {milestoneTarget} ไม้
              </span>
              <span className="text-slate-400">
                {remainingTrades > 0 ? `เหลืออีก ${remainingTrades} ไม้จะครบเป้า` : '🎉 บรรลุเป้าหมายเรียบร้อย!'}
              </span>
            </div>

            <div className="w-full bg-[#030407] h-3.5 rounded-full overflow-hidden border border-[#1e293b] p-0.5">
              <div
                style={{ width: `${milestoneProgressPct}%` }}
                className="h-full bg-gradient-to-r from-slate-500 via-slate-300 to-slate-100 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(203,213,225,0.4)]"
              />
            </div>

            {/* Slider to adjust target 1 to 5000 */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>เลื่อนปรับเป้าหมาย:</span>
                <span>1 - 5,000 ไม้</span>
              </div>
              <input
                type="range"
                min="1"
                max="5000"
                step="10"
                value={milestoneTarget}
                onChange={(e) => {
                  if (onUpdateMilestoneTarget) {
                    onUpdateMilestoneTarget(parseInt(e.target.value));
                  }
                }}
                className="w-full accent-slate-300 bg-[#0e131f] h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Preset Buttons for Milestones */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[50, 100, 250, 500, 1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateMilestoneTarget && onUpdateMilestoneTarget(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    milestoneTarget === preset
                      ? 'bg-gradient-to-r from-slate-200 to-slate-100 text-black border border-white shadow-sm'
                      : 'bg-[#0e131f] text-slate-400 hover:text-white border border-[#1e293b]'
                  }`}
                >
                  {preset} ไม้
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. STATS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Win Rate */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Win Rate (ความแม่นยำ)</div>
          <div className="text-xl font-extrabold font-mono text-blue-400">{winRate}%</div>
          <div className="text-[10px] font-mono text-slate-400">
            {winTrades.length}W / {loseTrades.length}L / {beTrades.length}BE / {missTrades.length}MISS
          </div>
        </div>

        {/* Profit Factor */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Profit Factor</div>
          <div className="text-xl font-extrabold font-mono text-slate-200">{profitFactor}</div>
          <div className="text-[10px] font-mono text-slate-400">
            +${grossProfit.toLocaleString()} / -${grossLoss.toLocaleString()}
          </div>
        </div>

        {/* Avg R:R */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Risk : Reward</div>
          <div className="text-xl font-extrabold font-mono text-[#f8fafc]">1 : {avgRR}</div>
          <div className="text-[10px] font-mono text-slate-400">เฉลี่ยสัดส่วนผลตอบแทน</div>
        </div>

        {/* Total Trades */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">รายการเทรดทั้งหมด</div>
          <div className="text-xl font-extrabold font-mono text-[#f8fafc]">{trades.length} ไม้</div>
          <div className="text-[10px] font-mono text-slate-400">
            เข้าเทรดจริง {executedTrades.length} • ตกรถ {missTrades.length}
          </div>
        </div>
      </div>

      {/* 5. CUMULATIVE EQUITY CURVE CHART ($) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-300" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
              เส้นการเติบโตของกำไรสุทธิสะสม (Cumulative Equity Curve)
            </h3>
          </div>
          <div
            className={`text-xs font-mono font-extrabold ${
              totalPnL >= 0 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            Net: {totalPnL >= 0 ? `+$${totalPnL.toLocaleString()}` : `-$${Math.abs(totalPnL).toLocaleString()}`}
          </div>
        </div>

        <div className="h-56 sm:h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradientHome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0]?.payload) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-[#030407] border border-slate-500 shadow-xl text-xs font-mono">
                        <div className="text-[#94a3b8] text-[10px]">
                          {data.date} {data.pair ? `• ${data.pair}` : ''}
                        </div>
                        <div className="text-white font-bold mt-0.5">
                          PnL ไม้นี้: {data.pnl >= 0 ? `+$${data.pnl}` : `-$${Math.abs(data.pnl)}`}
                        </div>
                        <div
                          className={`font-extrabold mt-0.5 ${
                            data.cumulativePnL >= 0 ? 'text-blue-400' : 'text-rose-400'
                          }`}
                        >
                          ยอดสะสม: ${data.cumulativePnL.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativePnL"
                stroke="#e2e8f0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#equityGradientHome)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. SETUPS & SESSIONS PERFORMANCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Setup Win Rate Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-300" />
              <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
                Win Rate ต่อการตั้งค่า (พร้อมสถิติคัดลอส/แพ้)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{setupStats.length} ท่าเทรด</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {setupStats.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-mono">
                ยังไม่มีข้อมูลท่าเทรด
              </div>
            ) : (
              setupStats.map((stat) => (
                <div
                  key={stat.setup}
                  className="p-3 rounded-xl bg-[#030407] border border-[#1e293b] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#f8fafc]">{stat.setup}</span>
                    <span
                      className={`text-xs font-mono font-extrabold ${
                        stat.pnl >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}
                    >
                      {stat.pnl >= 0
                        ? `+$${stat.pnl.toLocaleString()}`
                        : `-$${Math.abs(stat.pnl).toLocaleString()}`}
                    </span>
                  </div>

                  {/* Progress Bar (Win vs Loss: Deep Cobalt Blue vs Muted Rose Crimson) */}
                  <div className="w-full bg-[#0e131f] h-2 rounded-full overflow-hidden flex border border-[#1e293b]">
                    <div style={{ width: `${stat.winRate}%` }} className="bg-[#1d4ed8] h-full shadow-[0_0_8px_rgba(29,78,216,0.5)]" />
                    <div style={{ width: `${100 - stat.winRate}%` }} className="bg-rose-900/60 border-l border-rose-600/40 h-full" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>
                      Win Rate: <strong className="text-[#f8fafc]">{stat.winRate}%</strong> ({stat.wins}W /{' '}
                      <span className="text-rose-400 font-bold">{stat.losses}L คัดลอส</span>
                      {stat.be > 0 ? ` / ${stat.be}BE` : ''}
                      {stat.miss > 0 ? ` / ${stat.miss}MISS` : ''})
                    </span>
                    <span className="text-rose-400/80">
                      {stat.losses > 0 ? `ขาดทุน -$${stat.lossAmount.toLocaleString()}` : '0 Loss'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Session Win Rate Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-300" />
              <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
                วินเรทตามช่วงตลาด (Win Rate per Session)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">4 Sessions</span>
          </div>

          <div className="space-y-2.5">
            {sessionStats.map((stat) => (
              <div
                key={stat.session}
                className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#f8fafc]">
                      {stat.session} Session
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-extrabold ${
                      stat.pnl >= 0 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {stat.pnl >= 0
                      ? `+$${stat.pnl.toLocaleString()}`
                      : `-$${Math.abs(stat.pnl).toLocaleString()}`}
                  </span>
                </div>

                <div className="w-full bg-[#0e131f] h-2.5 rounded-full overflow-hidden flex border border-[#1e293b]">
                  <div
                    style={{ width: `${stat.winRate}%` }}
                    className="bg-[#1d4ed8] h-full transition-all shadow-[0_0_8px_rgba(29,78,216,0.5)]"
                  />
                  <div
                    style={{ width: `${100 - stat.winRate}%` }}
                    className="bg-rose-900/60 border-l border-rose-600/40 h-full transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>
                    Win Rate: <strong className="text-[#f8fafc]">{stat.winRate}%</strong> ({stat.wins}W /{' '}
                    <span className="text-rose-400 font-bold">{stat.losses}L</span>
                    {stat.miss > 0 ? ` • ${stat.miss}MISS` : ''})
                  </span>
                  <span>{stat.total} ไม้</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. INTERACTIVE TRADING CALENDAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-300" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
              ปฏิทินบันทึกผลการเทรดรายวัน (Trading Calendar)
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-[#1e293b]">
            <button
              onClick={prevMonth}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-[#f8fafc]">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-400 font-bold pb-1 border-b border-[#1e293b]">
          <div>อา.</div>
          <div>จ.</div>
          <div>อ.</div>
          <div>พ.</div>
          <div>พฤ.</div>
          <div>ศ.</div>
          <div>ส.</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 font-mono">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl bg-transparent opacity-20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const data = getDayData(dayNum);
            const hasTrades = data.count > 0;
            const isProfit = data.pnl > 0;
            const isLoss = data.pnl < 0;

            return (
              <div
                key={dayNum}
                onClick={() => {
                  if (hasTrades) {
                    setSelectedDayTrades({ dateStr: data.dateStr, trades: data.trades });
                  }
                }}
                className={`h-14 sm:h-16 p-1 sm:p-1.5 rounded-xl border transition-all flex flex-col justify-between select-none ${
                  hasTrades
                    ? isProfit
                      ? 'bg-blue-950/40 border-blue-600/50 hover:border-blue-400 cursor-pointer'
                    : isLoss
                      ? 'bg-rose-950/40 border-rose-700/50 hover:border-rose-400 cursor-pointer'
                      : 'bg-slate-700/20 border-slate-500 hover:border-slate-300 cursor-pointer'
                    : 'bg-[#030407] border-[#1e293b] text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${hasTrades ? 'text-[#f8fafc]' : 'text-slate-500'}`}>
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[9px] px-1 rounded bg-[#0a0d14] text-slate-300 border border-[#1e293b]">
                      {data.count}T
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div
                    className={`text-[10px] sm:text-xs font-extrabold truncate ${
                      isProfit ? 'text-blue-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {data.pnl >= 0 ? `+$${data.pnl}` : `-$${Math.abs(data.pnl)}`}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-700">-</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY TRADES MODAL */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedDayTrades(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-[#06080e] border border-slate-600 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(0,0,0,0.9)] space-y-3 max-h-[85vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div>
                <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
                  รายการเทรดวันที่ {selectedDayTrades.dateStr}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  มีทั้งหมด {selectedDayTrades.trades.length} ไม้
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {selectedDayTrades.trades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => {
                    setSelectedDayTrades(null);
                    onSelectTrade(trade);
                  }}
                  className="p-3 rounded-xl bg-[#030407] hover:bg-[#0e131f] border border-[#1e293b] hover:border-slate-400 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        trade.direction === 'Long'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-700/40'
                      }`}
                    >
                      {trade.direction}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#f8fafc]">{trade.pair}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {trade.setupType} • {trade.session}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-mono font-extrabold ${
                        trade.pnl >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}
                    >
                      {trade.pnl >= 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`}
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        trade.outcome === 'WIN'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                          : trade.outcome === 'LOSE'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                          : trade.outcome === 'MISS'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-700/40 text-slate-300'
                      }`}
                    >
                      {trade.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
