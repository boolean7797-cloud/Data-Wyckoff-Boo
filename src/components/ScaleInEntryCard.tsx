import React from 'react';
import {
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  Tag,
  SlidersHorizontal,
  Target,
  Trash2,
  AlertTriangle,
  Plus,
  Compass,
  Copy,
  Layers,
} from 'lucide-react';
import {
  ScaleInEntry,
  TradeDirection,
  TradeOutcome,
  TradeStatus,
  TrendAlignment,
  SetupItem,
} from '../types';
import { TIMEFRAME_PRESETS } from '../data/mockData';
import { OrderImageUploader } from './OrderImageUploader';

interface ScaleInEntryCardProps {
  entry: ScaleInEntry;
  index: number;
  mainDirection?: TradeDirection;
  mainPair?: string;
  mainTimeframe?: string;
  mainSession?: string;
  mainDate?: string;
  mainSetupType?: string;
  pairs: string[];
  safeSetups: SetupItem[];
  activeSetups: SetupItem[];
  safeInvalidationReasons: string[];
  safeScaleInLossReasons: string[];
  onUpdate: (field: keyof ScaleInEntry, val: any) => void;
  onRemove: () => void;
  onCopyFromMain?: () => void;
  onOpenManageSetups?: () => void;
  onOpenManagePairs?: () => void;
  onOpenManageScaleInLossReasons?: () => void;
  onOpenManageInvalidationReasons?: () => void;
}

export const ScaleInEntryCard: React.FC<ScaleInEntryCardProps> = ({
  entry,
  index,
  mainDirection = 'Long',
  pairs,
  safeSetups,
  activeSetups,
  safeInvalidationReasons,
  safeScaleInLossReasons,
  onUpdate,
  onRemove,
  onCopyFromMain,
  onOpenManageSetups,
  onOpenManagePairs,
  onOpenManageScaleInLossReasons,
}) => {
  const orderNum = entry.orderNumber || index + 2;
  const currentDirection = entry.direction || mainDirection || 'Long';
  const currentOutcome: TradeOutcome =
    entry.outcome === 'LOSE' ? 'LOSE' : entry.outcome === 'BE' ? 'BE' : 'WIN';
  const currentTradeStatus: TradeStatus = entry.tradeStatus || 'COMPLETED';
  const currentTrendAlignment: TrendAlignment = entry.trendAlignment || 'PRO_TREND';

  const useSetup = entry.useSetup ?? Boolean(entry.setupType);
  const useTimeframe = entry.useTimeframe ?? Boolean(entry.timeframe);
  const usePoints =
    entry.usePoints ?? (entry.slPoints !== undefined || entry.tpPoints !== undefined);

  const riskReward = typeof entry.riskReward === 'number' ? entry.riskReward : currentOutcome === 'LOSE' ? -1.0 : 2.0;
  const pnl = typeof entry.pnl === 'number' ? Math.abs(entry.pnl) : 100;
  const isLoss = currentOutcome === 'LOSE' || riskReward < 0;

  // Sync current time helper
  const handleSyncCurrentTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const iso = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    onUpdate('date', iso);

    const hour = now.getHours();
    let detectedSession = 'Off-Session (นอกเวลา)';
    if (hour >= 6 && hour < 14) detectedSession = 'Asia (06:00-14:00)';
    else if (hour >= 14 && hour < 19) detectedSession = 'London (14:00-19:00)';
    else if (hour >= 19 && hour < 22) detectedSession = 'NY Overlap (19:00-22:00)';
    else if (hour >= 22 || hour < 3) detectedSession = 'New York (19:00-03:00)';
    onUpdate('session', detectedSession);
  };

  const handleSelectFibo = (level: 'TP1' | 'TP2' | 'TP3') => {
    onUpdate('fiboTpLevel', entry.fiboTpLevel === level ? 'Custom' : level);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#070b14] border-2 border-blue-900/60 shadow-xl space-y-4 animate-fade-in font-['Outfit',sans-serif]">
      {/* Top Banner / Order Title Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1e293b] flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-mono font-black text-xs shadow-[0_0_8px_rgba(37,99,235,0.4)]">
            {orderNum}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>ไม้ที่ {orderNum} (ไม้เติม / Scale-in Entry)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-600/40 font-bold">
                ไม้เสริม #{index + 1}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              กรอกข้อมูลและจัดเรียงทุกช่องเหมือนไม้หลัก
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Copy from Main Trade Button */}
          {onCopyFromMain && (
            <button
              type="button"
              onClick={onCopyFromMain}
              className="text-[10px] font-mono text-blue-400 hover:text-blue-200 px-2 py-1 rounded-lg bg-blue-950/50 border border-blue-800/60 hover:border-blue-500 flex items-center gap-1 transition-all"
              title="คัดลอกค่าคู่เงิน, ท่าเทรด, TF, และ Session จากไม้หลัก"
            >
              <Copy className="w-3 h-3" />
              <span className="hidden sm:inline">คัดลอกค่าจากไม้หลัก</span>
            </button>
          )}

          {/* Direction toggle */}
          <div className="flex rounded-lg bg-[#030407] p-0.5 border border-[#1e293b]">
            <button
              type="button"
              onClick={() => onUpdate('direction', 'Long')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                currentDirection === 'Long'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Long</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdate('direction', 'Short')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                currentDirection === 'Short'
                  ? 'bg-slate-700 text-slate-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Short</span>
            </button>
          </div>

          {/* Delete entry button */}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950 text-slate-400 hover:text-rose-200 border border-rose-900/50 hover:border-rose-600 transition-all flex items-center gap-1 text-[11px] font-mono"
            title={`ลบไม้ที่ ${orderNum}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">ลบไม้นี้</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OUTCOME (WIN / LOSE), STATUS (COMPLETED/RUNNING/MISSED), AND TREND ALIGNMENT */}
      {/* ========================================================================= */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-[#030407] border border-[#1e293b]">
        {/* Outcome (WIN / LOSE) */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
            ผลลัพธ์การเทรดของไม้เติม (Outcome):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onUpdate('outcome', 'WIN');
                if (currentTradeStatus === 'MISSED') onUpdate('tradeStatus', 'COMPLETED');
                if (riskReward <= 0) onUpdate('riskReward', 2.0);
              }}
              className={`py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                currentOutcome === 'WIN' && currentTradeStatus !== 'MISSED'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>WIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdate('outcome', 'LOSE');
                if (currentTradeStatus === 'MISSED') onUpdate('tradeStatus', 'COMPLETED');
                onUpdate('riskReward', -1.0);
              }}
              className={`py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                currentOutcome === 'LOSE' && currentTradeStatus !== 'MISSED'
                  ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>LOSE</span>
            </button>
          </div>
        </div>

        {/* Trade Status (Completed / Running / Missed) */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
            สถานะของไม้เติม (Trade Status):
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onUpdate('tradeStatus', 'COMPLETED')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                currentTradeStatus === 'COMPLETED'
                  ? 'bg-slate-800 text-slate-200 border-slate-500 shadow-[0_0_8px_rgba(203,213,225,0.2)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <span>COMPLETED</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdate('tradeStatus', 'RUNNING')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                currentTradeStatus === 'RUNNING'
                  ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <span>RUNNING</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdate('tradeStatus', 'MISSED')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                currentTradeStatus === 'MISSED'
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <span>MISSED</span>
            </button>
          </div>
        </div>

        {/* Trend Alignment (ตามเทรนด์ หรือ สวนเทรนด์) */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
            กลยุทธ์ตามเทรนด์ หรือ สวนเทรนด์:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate('trendAlignment', 'PRO_TREND')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
                currentTrendAlignment === 'PRO_TREND'
                  ? 'bg-blue-950 text-blue-300 border-blue-600/60 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>ตามเทรนด์ (Pro-Trend)</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdate('trendAlignment', 'COUNTER_TREND')}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
                currentTrendAlignment === 'COUNTER_TREND'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700/60 shadow-[0_0_8px_rgba(225,29,72,0.3)]'
                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              <span>สวนเทรนด์ (Counter-Trend)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PAIR, TIMEFRAME, AUTO-SESSION, AUTO-DATE/TIME, ENTRY PRICE & LOT SIZE */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Pair */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400">คู่สินทรัพย์:</label>
              {onOpenManagePairs && (
                <button
                  type="button"
                  onClick={onOpenManagePairs}
                  className="text-[10px] font-mono text-slate-300 hover:text-white hover:underline"
                >
                  + จัดการ
                </button>
              )}
            </div>
            <select
              value={entry.pair || pairs[0] || 'BTC/USD'}
              onChange={(e) => onUpdate('pair', e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
            >
              {pairs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe with Toggle on/off */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400">Timeframe:</label>
              <button
                type="button"
                onClick={() => onUpdate('useTimeframe', !useTimeframe)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all ${
                  useTimeframe
                    ? 'bg-blue-950 text-blue-300 border border-blue-600/40 font-bold'
                    : 'bg-[#0e131f] text-slate-400 border border-[#1e293b]'
                }`}
                title="เปิด/ปิดการระบุ Timeframe"
              >
                {useTimeframe ? 'เปิดใช้งาน' : 'ไม่ระบุ'}
              </button>
            </div>
            {useTimeframe ? (
              <select
                value={entry.timeframe || '5m'}
                onChange={(e) => onUpdate('timeframe', e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none animate-fade-in"
              >
                {TIMEFRAME_PRESETS.map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            ) : (
              <div
                onClick={() => onUpdate('useTimeframe', true)}
                className="w-full bg-[#0e131f]/40 border border-dashed border-[#1e293b] hover:border-slate-500 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-500 text-center cursor-pointer transition-colors"
                title="คลิกเพื่อเปิดระบุ Timeframe"
              >
                - ปิดไว้ -
              </div>
            )}
          </div>

          {/* Session */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Session (อัตโนมัติ):
            </label>
            <select
              value={entry.session || 'New York (19:00-03:00)'}
              onChange={(e) => onUpdate('session', e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
            >
              <option value="Asia (06:00-14:00)">Asia (06:00-14:00)</option>
              <option value="London (14:00-19:00)">London (14:00-19:00)</option>
              <option value="NY Overlap (19:00-22:00)">NY Overlap (19:00-22:00)</option>
              <option value="New York (19:00-03:00)">New York (19:00-03:00)</option>
              <option value="Off-Session (นอกเวลา)">Off-Session (นอกเวลา)</option>
            </select>
          </div>

          {/* Date & Time with Sync */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-slate-400">วันเวลา (Auto):</label>
              <button
                type="button"
                onClick={handleSyncCurrentTime}
                className="text-[9px] font-mono text-slate-300 hover:text-white flex items-center gap-0.5 hover:underline"
                title="ซิงค์เวลาและ Session ปัจจุบันอัตโนมัติ"
              >
                <Clock className="w-2.5 h-2.5" />
                <span>ซิงค์</span>
              </button>
            </div>
            <input
              type="datetime-local"
              value={entry.date || ''}
              onChange={(e) => onUpdate('date', e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
            />
          </div>
        </div>

        {/* Entry Price & Lot Size Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              ราคาเข้า / โซนที่เติม (Entry Price / Zone):
            </label>
            <input
              type="text"
              placeholder="เช่น 2345.50 หรือ Break High"
              value={entry.entryPrice || ''}
              onChange={(e) => onUpdate('entryPrice', e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Lot Size (ล็อตไม้เติม):
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="เช่น 0.50 หรือ 1.0"
              value={entry.lotSize ?? ''}
              onChange={(e) =>
                onUpdate('lotSize', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-600 font-bold"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SETUP (COLLAPSIBLE / OFF BY DEFAULT) */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-mono font-bold text-[#f8fafc]">
              ระบุท่าเทรดของไม้เติม (Setups)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onOpenManageSetups && (
              <button
                type="button"
                onClick={onOpenManageSetups}
                className="text-[10px] font-mono text-slate-300 hover:text-white hover:underline"
              >
                + จัดการท่าเทรด
              </button>
            )}
            {/* Toggle on/off */}
            <button
              type="button"
              onClick={() => onUpdate('useSetup', !useSetup)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                useSetup ? 'bg-blue-600' : 'bg-[#0e131f] border border-[#1e293b]'
              }`}
              title="เปิด/ปิดการบันทึกท่าเทรดไม้เติม"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  useSetup ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {useSetup && (
          <div className="space-y-2 animate-fade-in">
            <select
              value={entry.setupType || activeSetups[0]?.name || 'Breakout & Retest'}
              onChange={(e) => onUpdate('setupType', e.target.value)}
              className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
            >
              {safeSetups.map((s) => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name} {s.enabled === false ? '(ปิดใช้งาน)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. RISK REWARD & PROFIT/LOSS PNL ($) + DISTANCE TP/SL + LOSS REASONS */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-3.5">
        {/* Quick Result Selector directly in RR & PnL Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-xs font-mono font-bold text-[#f8fafc]">
                สัดส่วน Risk : Reward (RR) & กำไร/ขาดทุน ($ PnL) ของไม้เติม
              </span>
              <span className="text-[10px] font-mono text-slate-400 block">
                เลือกผลลัพธ์เพื่อระบุสัดส่วน RR และกำไรสุทธิหรือขาดทุนสุทธิของไม้ที่ {orderNum}
              </span>
            </div>
          </div>

          {/* Direct Result Selector Pills */}
          <div className="flex rounded-xl bg-[#0e131f] p-1 border border-[#1e293b] gap-1 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                onUpdate('outcome', 'WIN');
                if (currentTradeStatus === 'MISSED') onUpdate('tradeStatus', 'COMPLETED');
                if (riskReward <= 0) onUpdate('riskReward', 2.0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                currentOutcome === 'WIN' && currentTradeStatus !== 'MISSED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>ชนะ/กำไร (WIN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdate('outcome', 'LOSE');
                if (currentTradeStatus === 'MISSED') onUpdate('tradeStatus', 'COMPLETED');
                onUpdate('riskReward', -1.0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                currentOutcome === 'LOSE' && currentTradeStatus !== 'MISSED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span>แพ้/ขาดทุน (LOSE)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdate('outcome', 'BE');
                onUpdate('riskReward', 0);
                onUpdate('pnl', 0);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                currentOutcome === 'BE' || (currentOutcome === 'WIN' && riskReward === 0)
                  ? 'bg-slate-700 text-slate-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>เสมอทุน (BE)</span>
            </button>
          </div>
        </div>

        {/* Risk:Reward Row */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono font-bold text-slate-200">
                  {isLoss ? 'สัดส่วนขาดทุน (Loss RR):' : 'สัดส่วนกำไร (Risk : Reward RR):'}
                </label>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isLoss
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(225,29,72,0.25)]'
                      : riskReward === 0
                      ? 'bg-slate-800 text-slate-300 border-slate-600'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  }`}
                >
                  {isLoss
                    ? `${riskReward < 0 ? riskReward : `-${riskReward || 1}`} RR (ขาดทุน)`
                    : riskReward === 0
                    ? '0 RR (เสมอทุน / BE)'
                    : `1 : ${riskReward} RR (กำไร)`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {isLoss
                  ? 'ไม้แพ้/ขาดทุน ระบุติดลบ เช่น -1.0 RR (ชน SL) หรือเลือกปุ่มลัดด้านขวา'
                  : 'ระบุอัตราส่วนกำไร เช่น 1:2.0 RR หรือเลือกปุ่มลัด'}
              </span>
            </div>

            {/* RR Input & Presets */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap justify-end">
              <span className="text-xs font-mono text-slate-400">{isLoss ? '' : '1 :'}</span>
              <input
                type="number"
                min="-500"
                max="500"
                step="0.1"
                value={riskReward}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const safeVal = isNaN(val) ? 0 : Math.min(500, Math.max(-500, val));
                  onUpdate('riskReward', safeVal);
                  if (safeVal < 0 && currentOutcome !== 'LOSE') {
                    onUpdate('outcome', 'LOSE');
                  } else if (safeVal > 0 && currentOutcome === 'LOSE') {
                    onUpdate('outcome', 'WIN');
                  }
                }}
                className={`w-24 bg-[#0e131f] border rounded-xl px-2.5 py-1.5 text-sm font-mono font-extrabold text-center focus:outline-none ${
                  isLoss
                    ? 'border-rose-700/80 text-rose-300 focus:border-rose-400 bg-rose-950/20'
                    : 'border-slate-600 text-white focus:border-slate-300'
                }`}
                placeholder="เช่น -1 หรือ 2.0"
              />
              <span className="text-xs font-mono font-bold text-slate-300">RR</span>
            </div>
          </div>

          {/* Quick RR Presets Bar */}
          <div className="flex items-center gap-1 flex-wrap pt-1">
            <span className="text-[10px] font-mono text-slate-400 mr-1">ปุ่มลัด RR:</span>
            {isLoss ? (
              <>
                {[
                  { label: '-1.0R (SL มาตรฐาน)', val: -1.0 },
                  { label: '-0.5R (คัดลอส)', val: -0.5 },
                  { label: '-1.5R', val: -1.5 },
                  { label: '-2.0R (Over-risk)', val: -2.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      onUpdate('riskReward', item.val);
                      onUpdate('outcome', 'LOSE');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      riskReward === item.val
                        ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)]'
                        : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white hover:border-rose-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onUpdate('outcome', 'WIN');
                    onUpdate('riskReward', 2.0);
                  }}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-emerald-300 border border-[#1e293b] hover:border-emerald-800 transition-all ml-auto"
                >
                  สลับเป็นโหมดกำไร (+RR)
                </button>
              </>
            ) : (
              <>
                {[1, 1.5, 2, 2.5, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      onUpdate('riskReward', val);
                      onUpdate('outcome', 'WIN');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      riskReward === val
                        ? 'bg-blue-950 text-blue-300 border-blue-600 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
                        : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    1:{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onUpdate('outcome', 'LOSE');
                    onUpdate('riskReward', -1.0);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-400 bg-rose-950/30 hover:text-rose-200 border border-rose-900/60 hover:border-rose-600 transition-all ml-auto flex items-center gap-1"
                >
                  <span>-1.0 RR (ระบุขาดทุน)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* TP / SL in Points with Fibo Buttons (TP1 / TP2 / TP3) */}
        <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>ระบุระยะจุด & Fibo Targets (กี่จุด):</span>
            </span>
            <button
              type="button"
              onClick={() => onUpdate('usePoints', !usePoints)}
              className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                usePoints ? 'bg-blue-600' : 'bg-[#030407] border border-[#1e293b]'
              }`}
              title="เปิด/ปิดการคำนวณระยะจุด"
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                  usePoints ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {usePoints && (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-300 block mb-0.5">
                    ระยะ SL (จุด):
                  </label>
                  <input
                    type="number"
                    value={entry.slPoints ?? ''}
                    onChange={(e) =>
                      onUpdate('slPoints', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="100 จุด"
                    className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-blue-400 block mb-0.5">
                    ระยะ TP (จุด):
                  </label>
                  <input
                    type="number"
                    value={entry.tpPoints ?? ''}
                    onChange={(e) =>
                      onUpdate('tpPoints', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="200 จุด"
                    className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-blue-400 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Fibo Target Selection Tag */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 mb-1">
                  เป้าหมาย Fibonacci TP:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectFibo('TP1')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      entry.fiboTpLevel === 'TP1'
                        ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                        : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    TP1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectFibo('TP2')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      entry.fiboTpLevel === 'TP2'
                        ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                        : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    TP2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectFibo('TP3')}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      entry.fiboTpLevel === 'TP3'
                        ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                        : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    TP3
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PnL ($) Section with Dedicated Profit vs Loss Switch */}
        <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-mono text-slate-300 font-bold">
                {isLoss
                  ? 'ขาดทุนสุทธิ ($ Loss PnL):'
                  : currentOutcome === 'WIN'
                  ? 'กำไรสุทธิ ($ Profit PnL):'
                  : 'กำไร / ขาดทุนสุทธิ ($ PnL):'}
              </label>
              <span
                className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                  isLoss
                    ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                    : currentOutcome === 'WIN' && pnl > 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isLoss
                  ? `-$${pnl.toLocaleString()}`
                  : currentOutcome === 'WIN'
                  ? `+$${pnl.toLocaleString()}`
                  : '$0'}
              </span>
            </div>

            {/* Profit / Loss Type Selector */}
            <div className="flex rounded-lg bg-[#030407] p-0.5 border border-[#1e293b]">
              <button
                type="button"
                onClick={() => {
                  onUpdate('outcome', 'WIN');
                  if (riskReward <= 0) onUpdate('riskReward', 2.0);
                  if (typeof entry.pnl === 'number' && entry.pnl < 0) onUpdate('pnl', Math.abs(entry.pnl));
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  !isLoss
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                + กำไร (Profit)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdate('outcome', 'LOSE');
                  onUpdate('riskReward', -1.0);
                  if (typeof entry.pnl === 'number' && entry.pnl > 0) onUpdate('pnl', -Math.abs(entry.pnl));
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  isLoss
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                - ขาดทุน (Loss)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span
                className={`absolute left-3 top-2 text-xs font-mono font-bold ${
                  isLoss ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {isLoss ? '-$' : '$'}
              </span>
              <input
                type="number"
                step="any"
                value={pnl || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const safeVal = isNaN(val) ? 0 : val;
                  onUpdate('pnl', isLoss ? -Math.abs(safeVal) : Math.abs(safeVal));
                }}
                placeholder={
                  isLoss
                    ? 'ระบุจำนวนเงินที่ขาดทุน เช่น 100 หรือ 500'
                    : 'ระบุจำนวนเงินกำไร เช่น 500 หรือ 1000'
                }
                className={`w-full bg-[#030407] border rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold focus:outline-none ${
                  isLoss
                    ? 'border-rose-900/80 focus:border-rose-500 text-rose-200 bg-rose-950/20'
                    : 'border-[#1e293b] focus:border-slate-400 text-[#f8fafc]'
                }`}
              />
            </div>

            <div className="flex gap-1 shrink-0 flex-wrap">
              {isLoss
                ? [50, 100, 200, 300, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdate('pnl', -preset)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        pnl === preset
                          ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)]'
                          : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white hover:border-rose-800'
                      }`}
                    >
                      -${preset}
                    </button>
                  ))
                : [100, 200, 300, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdate('pnl', preset)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        pnl === preset
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                          : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                      }`}
                    >
                      +${preset}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        {/* Invalidation / Loss Reason when Outcome is LOSE */}
        {isLoss && (
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-600/40 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-rose-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>เหตุผลที่ไม้ที่ {orderNum} แพ้ (Loss Reason):</span>
              </label>
              {onOpenManageScaleInLossReasons && (
                <button
                  type="button"
                  onClick={onOpenManageScaleInLossReasons}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>+ จัดการเหตุผลแพ้</span>
                </button>
              )}
            </div>
            <select
              value={entry.lossReason || safeScaleInLossReasons[0] || safeInvalidationReasons[0]}
              onChange={(e) => onUpdate('lossReason', e.target.value)}
              className="w-full bg-[#030407] border border-rose-900/60 focus:border-rose-500 rounded-xl px-3 py-2 text-xs font-mono text-rose-200 focus:outline-none"
            >
              {safeScaleInLossReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. NOTES & ORDER IMAGES FOR THIS SPECIFIC SCALE-IN ORDER */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-slate-300 block font-bold">
            บันทึกเหตุผลและข้อคิดของไม้ที่ {orderNum} (Notes):
          </label>
          <textarea
            rows={2}
            placeholder="ระบุเหตุผลหรือข้อคิดที่เข้าไม้เติมนี้ เช่น เติมเพราะทะลุสวิงเดิม ขยับ SL บังทุนแล้ว..."
            value={entry.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl p-2.5 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-600 resize-none"
          />
        </div>

        {/* Scale-in Order Screenshot / Slip Uploader */}
        <div>
          <OrderImageUploader
            images={entry.screenshots || []}
            onChange={(imgs) => onUpdate('screenshots', imgs)}
            label={`รูปภาพกราฟ / สลิปของไม้ที่ ${orderNum} (Scale-in Screenshots)`}
            subLabel="อัปโหลดภาพเฉพาะไม้เติมนี้, ลากวางไฟล์ หรือกด Ctrl+V"
            maxImages={4}
            compact
          />
        </div>
      </div>
    </div>
  );
};
