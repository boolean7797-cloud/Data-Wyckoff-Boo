import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Target,
  Trophy,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Trade, User, FundedAccountConfig } from '../types';

interface FundedTabProps {
  currentUser: User;
  trades: Trade[];
  fundedAccounts: FundedAccountConfig[];
  onUpdateFundedAccounts: (accounts: FundedAccountConfig[]) => void;
  onOpenAddTrade: (defaultPortfolio?: 'funded') => void;
  onSelectTrade: (trade: Trade) => void;
}

export const FundedTab: React.FC<FundedTabProps> = ({
  currentUser,
  trades = [],
  fundedAccounts = [],
  onUpdateFundedAccounts,
  onOpenAddTrade,
  onSelectTrade,
}) => {
  const safeAccounts = useMemo(() => (Array.isArray(fundedAccounts) ? fundedAccounts : []), [fundedAccounts]);
  const safeTrades = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    safeAccounts[0]?.id || 'default_funded'
  );
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  // Active funded account configuration
  const activeAccount = useMemo(() => {
    return (
      safeAccounts.find((a) => a.id === selectedAccountId) ||
      safeAccounts[0] || {
        id: 'funded_ftmo_100k',
        name: 'FTMO $100k Challenge',
        initialBalance: 100000,
        maxDailyLossPercent: 5,
        maxTotalLossPercent: 10,
        profitTargetPercent: 8,
        phase: 'Phase 1' as const,
      }
    );
  }, [safeAccounts, selectedAccountId]);

  // Form states for editing account config
  const [accountName, setAccountName] = useState(activeAccount.name);
  const [initialBalance, setInitialBalance] = useState(String(activeAccount.initialBalance));
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(
    String(activeAccount.maxDailyLossPercent)
  );
  const [maxTotalLossPercent, setMaxTotalLossPercent] = useState(
    String(activeAccount.maxTotalLossPercent)
  );
  const [profitTargetPercent, setProfitTargetPercent] = useState(
    String(activeAccount.profitTargetPercent)
  );
  const [phase, setPhase] = useState<'Phase 1' | 'Phase 2' | 'Funded Master'>(activeAccount.phase);

  // Sync state whenever activeAccount changes
  useEffect(() => {
    setAccountName(activeAccount.name);
    setInitialBalance(String(activeAccount.initialBalance));
    setMaxDailyLossPercent(String(activeAccount.maxDailyLossPercent));
    setMaxTotalLossPercent(String(activeAccount.maxTotalLossPercent));
    setProfitTargetPercent(String(activeAccount.profitTargetPercent));
    setPhase(activeAccount.phase);
  }, [activeAccount]);

  // Funded trades only
  const fundedTrades = useMemo(() => {
    return safeTrades.filter((t) => t.portfolio === 'funded');
  }, [safeTrades]);

  // Calculate Funded Metrics
  const initialCap = activeAccount.initialBalance || 100000;
  const netPnL = useMemo(() => {
    return fundedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  }, [fundedTrades]);

  const currentEquity = initialCap + netPnL;
  const currentReturnPct = (netPnL / initialCap) * 100;

  // Profit target math
  const profitTargetDollar = (initialCap * activeAccount.profitTargetPercent) / 100;
  const profitProgressPct = Math.min(
    100,
    Math.max(0, (netPnL / (profitTargetDollar || 1)) * 100)
  );

  // Today's loss calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFundedTrades = fundedTrades.filter((t) => t.date && t.date.startsWith(todayStr));
  const todayPnL = todayFundedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const maxDailyLossDollar = (initialCap * activeAccount.maxDailyLossPercent) / 100;
  const todayDailyDrawdownPct =
    todayPnL < 0 ? (Math.abs(todayPnL) / maxDailyLossDollar) * 100 : 0;

  // Total Max Loss Math
  const maxTotalLossDollar = (initialCap * activeAccount.maxTotalLossPercent) / 100;
  const totalDrawdownPct =
    netPnL < 0 ? (Math.abs(netPnL) / maxTotalLossDollar) * 100 : 0;

  // Win Rate
  const executedTrades = fundedTrades.filter((t) => t.outcome !== 'MISS');
  const winCount = executedTrades.filter((t) => t.outcome === 'WIN').length;
  const winRate = executedTrades.length > 0 ? Math.round((winCount / executedTrades.length) * 100) : 0;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FundedAccountConfig = {
      ...activeAccount,
      name: accountName.trim() || 'Funded Account',
      initialBalance: parseFloat(initialBalance) || 100000,
      maxDailyLossPercent: parseFloat(maxDailyLossPercent) || 5,
      maxTotalLossPercent: parseFloat(maxTotalLossPercent) || 10,
      profitTargetPercent: parseFloat(profitTargetPercent) || 8,
      phase,
    };

    const nextAccounts = fundedAccounts.map((a) => (a.id === activeAccount.id ? updated : a));
    if (!nextAccounts.some((a) => a.id === updated.id)) {
      nextAccounts.push(updated);
    }
    onUpdateFundedAccounts(nextAccounts);
    setIsEditingConfig(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4 pb-24 md:pb-8 animate-fade-in font-['Outfit',sans-serif]">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#06080e] via-[#090d16] to-[#04060a] border border-[#1e293b] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center">
            <div className="w-full h-full bg-[#030407] rounded-[14px] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-slate-200 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#f8fafc]">
                {activeAccount.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-600">
                {activeAccount.phase}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ระบบกองทุนย่อย (Funded Sub-System) • บันทึกและคุมกฎแยกจากพอร์ตส่วนตัว
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            className="px-3.5 py-2 rounded-xl bg-[#030407] hover:bg-[#0e131f] text-slate-300 hover:text-white text-xs font-mono font-bold border border-[#1e293b] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditingConfig ? 'ปิดการตั้งค่า' : 'ตั้งค่ากฎกองทุน'}</span>
          </button>

          {/* Prominent Add Funded Trade Button */}
          <button
            onClick={() => onOpenAddTrade('funded')}
            className="px-4 py-2 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black font-mono font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 border border-white"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ เพิ่มไม้พอร์ตกองทุน</span>
          </button>
        </div>
      </div>

      {/* Edit Config Drawer */}
      {isEditingConfig && (
        <form
          onSubmit={handleSaveConfig}
          className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-slate-600 shadow-xl space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>ปรับแต่งขนาดพอร์ตและกฎการสอบกองทุน (Prop Firm Rules)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              ปิด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                ชื่อบัญชีกองทุน / บัญชีสอบ:
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                ขนาดเงินทุนเริ่มต้น ($ Initial Capital):
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                สถานะการสอบ (Phase):
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                <option value="Phase 1">Phase 1 (สอบรอบแรก)</option>
                <option value="Phase 2">Phase 2 (สอบรอบสอง)</option>
                <option value="Funded Master">Funded Master (พอร์ตจริง ได้เงิน)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                เป้าหมายกำไร (% Profit Target):
              </label>
              <input
                type="number"
                step="0.5"
                value={profitTargetPercent}
                onChange={(e) => setProfitTargetPercent(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                จำกัดขาดทุนสูงสุดต่อวัน (% Max Daily Loss):
              </label>
              <input
                type="number"
                step="0.5"
                value={maxDailyLossPercent}
                onChange={(e) => setMaxDailyLossPercent(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-rose-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                จำกัดขาดทุนรวมสูงสุด (% Max Total Loss):
              </label>
              <input
                type="number"
                step="0.5"
                value={maxTotalLossPercent}
                onChange={(e) => setMaxTotalLossPercent(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-rose-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="px-3 py-1.5 bg-[#030407] text-slate-400 text-xs font-mono rounded-xl border border-[#1e293b]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-200 hover:bg-white text-black font-mono font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              บันทึกการตั้งค่ากฎกองทุน
            </button>
          </div>
        </form>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Current Equity */}
        <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">พอร์ตกองทุนปัจจุบัน</span>
            <DollarSign className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#f8fafc]">
            ${currentEquity.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono flex items-center gap-1.5">
            <span className="text-slate-400">ทุนเริ่ม: ${initialCap.toLocaleString()}</span>
            <span className={netPnL >= 0 ? 'text-blue-400' : 'text-rose-400'}>
              ({netPnL >= 0 ? '+' : ''}
              {currentReturnPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* 2. Profit Target Tracker */}
        <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">เป้าหมายกำไร (Target)</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-blue-400">
              ${netPnL > 0 ? netPnL.toLocaleString() : '0'} / ${profitTargetDollar.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {profitProgressPct.toFixed(1)}%
            </span>
          </div>
          {/* Progress Bar (Deep Blue for Profit Progress) */}
          <div className="w-full h-2 bg-[#030407] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(29,78,216,0.5)]"
              style={{ width: `${profitProgressPct}%` }}
            />
          </div>
        </div>

        {/* 3. Daily Loss Rule Safeguard */}
        <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">กฎขาดทุนวันนี้ (Daily Limit)</span>
            <ShieldCheck
              className={`w-4 h-4 ${todayDailyDrawdownPct > 75 ? 'text-rose-400' : 'text-[#1d4ed8]'}`}
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-[#f8fafc]">
              ${todayPnL < 0 ? Math.abs(todayPnL).toLocaleString() : '0'} / ${maxDailyLossDollar.toLocaleString()}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                todayDailyDrawdownPct > 75
                  ? 'text-rose-400'
                  : todayDailyDrawdownPct > 50
                  ? 'text-amber-400'
                  : 'text-[#1d4ed8]'
              }`}
            >
              {todayDailyDrawdownPct.toFixed(1)}% ใช้ไป
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#030407] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todayDailyDrawdownPct > 75
                  ? 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]'
                  : todayDailyDrawdownPct > 50
                  ? 'bg-amber-500'
                  : 'bg-[#1d4ed8]'
              }`}
              style={{ width: `${Math.min(100, todayDailyDrawdownPct)}%` }}
            />
          </div>
        </div>

        {/* 4. Overall Max Drawdown Safeguard */}
        <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">กฎขาดทุนรวม (Max Drawdown)</span>
            <AlertTriangle
              className={`w-4 h-4 ${totalDrawdownPct > 75 ? 'text-rose-400' : 'text-slate-400'}`}
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-[#f8fafc]">
              ${netPnL < 0 ? Math.abs(netPnL).toLocaleString() : '0'} / ${maxTotalLossDollar.toLocaleString()}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                totalDrawdownPct > 75
                  ? 'text-rose-400'
                  : totalDrawdownPct > 50
                  ? 'text-amber-400'
                  : 'text-slate-300'
              }`}
            >
              {totalDrawdownPct.toFixed(1)}% ใช้ไป
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#030407] rounded-full overflow-hidden border border-[#1e293b]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalDrawdownPct > 75
                  ? 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]'
                  : totalDrawdownPct > 50
                  ? 'bg-amber-500'
                  : 'bg-[#1d4ed8]'
              }`}
              style={{ width: `${Math.min(100, totalDrawdownPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Funded Trades List Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-extrabold text-[#f8fafc] font-mono">
              ประวัติไม้เทรดในพอร์ตกองทุน ({fundedTrades.length} ไม้)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>Win Rate: <strong className="text-blue-400">{winRate}%</strong></span>
            <span>กำไรรวม: <strong className={netPnL >= 0 ? 'text-blue-400' : 'text-rose-400'}>${netPnL.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Trades Table / List */}
        {fundedTrades.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-xs font-mono text-slate-400">
              ยังไม่มีไม้เทรดที่บันทึกลงในพอร์ตกองทุน
            </p>
            <button
              onClick={() => onOpenAddTrade('funded')}
              className="px-4 py-2 bg-slate-200 hover:bg-white text-black font-mono font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              + บันทึกไม้แรกของพอร์ตกองทุน
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {fundedTrades.map((t) => {
              const isWin = t.outcome === 'WIN';
              const isLose = t.outcome === 'LOSE';
              const isLong = t.direction === 'Long';

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTrade(t)}
                  className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] hover:border-slate-500 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs shrink-0 ${
                        isLong
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {isLong ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-[#f8fafc] group-hover:text-slate-200">
                          {t.pair}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isWin
                              ? 'bg-blue-950 text-blue-300 border border-blue-600/30'
                              : isLose
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                              : 'bg-[#64748b]/20 text-slate-400'
                          }`}
                        >
                          {t.outcome}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          1:{t.riskReward} RR
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{t.setupType || 'No Setup'}</span>
                        <span>•</span>
                        <span>{t.session}</span>
                        {t.tpPoints || t.slPoints ? (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">
                              +{t.tpPoints || '-'}จุด / <span className="text-rose-400">-{t.slPoints || '-'}จุด</span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-extrabold font-mono ${
                        t.pnl > 0
                          ? 'text-blue-400'
                          : t.pnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {t.pnl > 0 ? `+$${t.pnl.toLocaleString()}` : t.pnl < 0 ? `-$${Math.abs(t.pnl).toLocaleString()}` : '$0'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {t.date ? new Date(t.date).toLocaleDateString('th-TH') : '-'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
