import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Copy,
  Layers,
  ChevronDown,
  Clock,
  Coins,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Briefcase,
  X,
  Camera,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Trade, TradeOutcome, MultiPortfolioConfig, PortfolioType } from '../types';

interface TradeLogsTabProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onOpenAddTrade: () => void;
  onDeleteTrade: (tradeId: string) => void;
  onCopyTrade?: (trade: Trade) => void;
  onOpenManageSetups?: () => void;
  onOpenManagePairs?: () => void;
  multiPortfolioConfig?: MultiPortfolioConfig;
}

export const TradeLogsTab: React.FC<TradeLogsTabProps> = ({
  trades = [],
  onSelectTrade,
  onOpenAddTrade,
  onDeleteTrade,
  onCopyTrade,
  onOpenManageSetups,
  onOpenManagePairs,
  multiPortfolioConfig,
}) => {
  const safeTrades = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSession, setSelectedSession] = useState('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'COMPLETED' | 'RUNNING' | 'MISSED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LIVE' | 'BACKTEST'>('ALL');
  const [selectedTrend, setSelectedTrend] = useState<'ALL' | 'PRO_TREND' | 'COUNTER_TREND'>('ALL');
  const [selectedSetup, setSelectedSetup] = useState('ALL');
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedPortfolio, setSelectedPortfolio] = useState<'ALL' | 'personal' | 'funded'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Zoom Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Extract unique setups and pairs for filter dropdowns
  const uniqueSetups = useMemo(() => {
    const list = Array.from(new Set(safeTrades.map((t) => t.setupType).filter(Boolean)));
    return ['ALL', ...list];
  }, [safeTrades]);

  const uniquePairs = useMemo(() => {
    const list = Array.from(new Set(safeTrades.map((t) => t.pair).filter(Boolean)));
    return ['ALL', ...list];
  }, [safeTrades]);

  // Date calculation helpers
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toISOString().slice(0, 10);
  }, []);

  const weekStartStr = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }, []);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return safeTrades.filter((trade) => {
      // 1. Date Filter
      if (selectedDateFilter === 'TODAY') {
        if (!trade.date || !trade.date.startsWith(todayStr)) return false;
      } else if (selectedDateFilter === 'YESTERDAY') {
        if (!trade.date || !trade.date.startsWith(yesterdayStr)) return false;
      } else if (selectedDateFilter === 'WEEK') {
        if (!trade.date || trade.date.slice(0, 10) < weekStartStr) return false;
      } else if (selectedDateFilter === 'CUSTOM') {
        if (!trade.date || !trade.date.startsWith(customDate)) return false;
      }

      // 2. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesPair = trade.pair?.toLowerCase().includes(q);
        const matchesSetup = trade.setupType?.toLowerCase().includes(q);
        const matchesPlaybook = trade.setupDescription?.toLowerCase().includes(q);
        const matchesNotes = trade.notes?.toLowerCase().includes(q);
        if (!matchesPair && !matchesSetup && !matchesPlaybook && !matchesNotes) {
          return false;
        }
      }

      // 3. Category: Live vs Backtest / Screenshot Only
      if (selectedCategory === 'LIVE' && trade.isScreenshotOnly) return false;
      if (selectedCategory === 'BACKTEST' && !trade.isScreenshotOnly) return false;

      // 4. Trade Status (COMPLETED / RUNNING / MISSED)
      if (selectedStatus !== 'ALL') {
        const status = trade.tradeStatus || 'COMPLETED';
        if (status !== selectedStatus) return false;
      }

      // 5. Trend Alignment (PRO_TREND / COUNTER_TREND)
      if (selectedTrend !== 'ALL') {
        const trend = trade.trendAlignment || 'PRO_TREND';
        if (trend !== selectedTrend) return false;
      }

      // 6. Portfolio
      if (selectedPortfolio !== 'ALL' && trade.portfolio && trade.portfolio !== selectedPortfolio) {
        return false;
      }

      // 7. Session
      if (selectedSession !== 'ALL' && trade.session && !trade.session.includes(selectedSession)) {
        return false;
      }

      // 8. Outcome
      if (selectedOutcome !== 'ALL' && trade.outcome !== selectedOutcome) {
        return false;
      }

      // 9. Setup
      if (selectedSetup !== 'ALL' && trade.setupType !== selectedSetup) {
        return false;
      }

      // 10. Pair
      if (selectedPair !== 'ALL' && trade.pair !== selectedPair) {
        return false;
      }

      return true;
    });
  }, [
    safeTrades,
    selectedDateFilter,
    todayStr,
    yesterdayStr,
    weekStartStr,
    customDate,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedTrend,
    selectedPortfolio,
    selectedSession,
    selectedOutcome,
    selectedSetup,
    selectedPair,
  ]);

  // Key KPI stats calculation based on filtered trades
  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const liveTrades = filteredTrades.filter((t) => !t.isScreenshotOnly);
    const backtestTrades = filteredTrades.filter((t) => t.isScreenshotOnly);

    const executed = filteredTrades.filter((t) => t.outcome !== 'MISS');
    const wins = filteredTrades.filter((t) => t.outcome === 'WIN');
    const losses = filteredTrades.filter((t) => t.outcome === 'LOSE');
    const be = filteredTrades.filter((t) => t.outcome === 'BE');

    const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const livePnL = liveTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    const winRate = executed.length > 0 ? ((wins.length / executed.length) * 100).toFixed(1) : '0';

    const winRRs = wins.map((t) => t.riskReward || 0).filter((rr) => rr > 0);
    const avgRR =
      winRRs.length > 0 ? (winRRs.reduce((a, b) => a + b, 0) / winRRs.length).toFixed(2) : '0.00';

    return {
      total,
      liveCount: liveTrades.length,
      backtestCount: backtestTrades.length,
      winsCount: wins.length,
      lossesCount: losses.length,
      beCount: be.length,
      totalPnL,
      livePnL,
      winRate,
      avgRR,
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-4 animate-fade-in font-['Outfit',sans-serif]">
      {/* 1. Header with Stats & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#06080e] border border-[#1e293b] p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_15px_rgba(203,213,225,0.2)] flex items-center justify-center">
            <div className="w-full h-full bg-[#030407] rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#f8fafc] flex items-center gap-2">
              <span>บันทึกประวัติไม้เทรด (Trade Logs & Data)</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-600">
                {stats.total} ไม้
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              สถิติแยกพอร์ตจริง, บัญชีเก็บภาพเทรด (Backtest) พร้อมพรีวิวรูปกราฟเซ็ตอัพ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTrade}
            className="px-4 py-2 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ บันทึกไม้ใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Live vs Backtest breakdown) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Win Rate */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Win Rate (อัตราชนะ)</div>
          <div className="text-xl font-mono font-extrabold text-blue-400 mt-0.5">
            {stats.winRate}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {stats.winsCount} ชนะ / {stats.lossesCount} แพ้
          </div>
        </div>

        {/* Total Net PnL */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">กำไรสุทธิ (Net PnL)</div>
          <div
            className={`text-xl font-mono font-extrabold mt-0.5 ${
              stats.totalPnL >= 0 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            ${stats.totalPnL.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            พอร์ตจริง: ${stats.livePnL.toLocaleString()}
          </div>
        </div>

        {/* Live vs Backtest Archive Count */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ประเภทการบันทึก</div>
          <div className="text-xl font-mono font-extrabold text-[#38bdf8] mt-0.5 flex items-center gap-2">
            <span>{stats.liveCount} เทรดจริง</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            📷 {stats.backtestCount} เก็บภาพเทรด
          </div>
        </div>

        {/* Average RR */}
        <div className="p-3.5 rounded-xl bg-[#06080e] border border-[#1e293b] shadow-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Average R:R</div>
          <div className="text-xl font-mono font-extrabold text-[#f59e0b] mt-0.5">
            1:{stats.avgRR}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            ค่าเฉลี่ยไม้ชนะ
          </div>
        </div>
      </div>

      {/* 3. Category Filter Switcher (All vs Live Account vs Backtest Screenshot Archive) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#06080e] border border-[#1e293b] rounded-2xl shadow-md">
        {/* Category Tabs */}
        <div className="flex bg-[#030407] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด ({trades.length})
          </button>
          <button
            onClick={() => setSelectedCategory('LIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              selectedCategory === 'LIVE'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ บันทึกจริง</span>
            <span className="text-[10px] opacity-75">
              ({trades.filter((t) => !t.isScreenshotOnly).length})
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('BACKTEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              selectedCategory === 'BACKTEST'
                ? 'bg-[#38bdf8] text-black shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>เก็บภาพเทรด (Backtest)</span>
            <span className="text-[10px] opacity-75">
              ({trades.filter((t) => t.isScreenshotOnly).length})
            </span>
          </button>
        </div>

        {/* Portfolio Tabs (Personal vs Funded) */}
        <div className="flex bg-[#030407] p-1 rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setSelectedPortfolio('ALL')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedPortfolio === 'ALL'
                ? 'bg-[#0e131f] text-[#f8fafc] border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทุกพอร์ต
          </button>
          <button
            onClick={() => setSelectedPortfolio('personal')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedPortfolio === 'personal'
                ? 'bg-slate-700 text-white border border-slate-500 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พอร์ตส่วนตัว
          </button>
          <button
            onClick={() => setSelectedPortfolio('funded')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedPortfolio === 'funded'
                ? 'bg-[#38bdf8] text-black shadow-[0_0_6px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            พอร์ตกองทุน
          </button>
        </div>
      </div>

      {/* 4. Search & Multi-Filters Bar */}
      <div className="space-y-2.5 bg-[#06080e] border border-[#1e293b] p-3.5 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาตามคู่เงิน, ท่าเทรด, อารมณ์, เหตุผลคัดลอส, หรือโน้ต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'TODAY', 'YESTERDAY', 'WEEK'] as const).map((dPreset) => (
              <button
                key={dPreset}
                onClick={() => setSelectedDateFilter(dPreset)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                  selectedDateFilter === dPreset
                    ? 'bg-slate-700 text-white border border-slate-500 shadow-sm'
                    : 'bg-[#030407] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                {dPreset === 'ALL'
                  ? 'ทุกวัน'
                  : dPreset === 'TODAY'
                  ? 'วันนี้'
                  : dPreset === 'YESTERDAY'
                  ? 'เมื่อวาน'
                  : 'สัปดาห์นี้'}
              </button>
            ))}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                showFilters
                  ? 'bg-[#0e131f] text-slate-200 border-slate-400 shadow-sm'
                  : 'bg-[#030407] text-slate-400 hover:text-white border-[#1e293b]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ตัวกรองละเอียด</span>
            </button>
          </div>
        </div>

        {/* Detailed Filter Expandable Row */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1e293b] animate-fade-in">
            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">สถานะไม้:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full bg-[#030407] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="COMPLETED">🏁 เสร็จสิ้น (Closed)</option>
                <option value="RUNNING">⏳ กำลังวิ่ง (Running)</option>
                <option value="MISSED">🚫 ตกรถ (Missed)</option>
              </select>
            </div>

            {/* Trend Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">แนวโน้ม:</label>
              <select
                value={selectedTrend}
                onChange={(e) => setSelectedTrend(e.target.value as any)}
                className="w-full bg-[#030407] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                <option value="ALL">ทุกแนวโน้ม</option>
                <option value="PRO_TREND">📈 ตามเทรนด์ (Pro-Trend)</option>
                <option value="COUNTER_TREND">📉 สวนเทรนด์ (Counter-Trend)</option>
              </select>
            </div>

            {/* Pair Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">คู่เงิน:</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                {uniquePairs.map((p) => (
                  <option key={p} value={p}>
                    {p === 'ALL' ? 'คู่เงินทั้งหมด' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Setup Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">ท่าเทรด:</label>
              <select
                value={selectedSetup}
                onChange={(e) => setSelectedSetup(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                {uniqueSetups.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'ท่าเทรดทั้งหมด' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 5. Trades List / Cards Table with Image Thumbnails */}
      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-16 bg-[#06080e] border border-[#1e293b] rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#030407] border border-[#1e293b] flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-sm font-mono font-bold text-[#f8fafc]">
              ไม่พบประวัติไม้เทรดตามเงื่อนไขที่เลือก
            </div>
            <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
              ลองปรับเปลี่ยนตัวกรอง หรือกดปุ่มบันทึกไม้ใหม่เพื่อเพิ่มประวัติ
            </p>
            <button
              onClick={onOpenAddTrade}
              className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-sm inline-flex items-center gap-1.5 border border-white"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>บันทึกไม้ใหม่ตอนนี้</span>
            </button>
          </div>
        ) : (
          filteredTrades.map((trade) => {
            const isWin = trade.outcome === 'WIN';
            const isRunning = trade.tradeStatus === 'RUNNING';
            const isMissed = trade.tradeStatus === 'MISSED' || trade.outcome === 'MISS';
            const hasScreenshot = trade.screenshots && trade.screenshots.length > 0;
            const primaryImage = hasScreenshot ? trade.screenshots[0] : null;

            return (
              <div
                key={trade.id}
                onClick={() => onSelectTrade(trade)}
                className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] hover:border-slate-500 hover:bg-[#0a0e17] transition-all cursor-pointer shadow-lg space-y-3 group relative"
              >
                {/* Main Row Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Thumbnail + Pair + Setup + Badges */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Setup Chart Thumbnail with Click to Zoom */}
                    {primaryImage ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(primaryImage);
                        }}
                        className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border border-[#1e293b] bg-[#030407] shrink-0 group/img hover:border-slate-400 transition-all shadow-inner"
                        title="คลิกเพื่อดูรูปกราฟขนาดใหญ่"
                      >
                        <img
                          src={primaryImage}
                          alt="Chart Setup"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl border border-dashed border-[#1e293b] bg-[#030407] flex items-center justify-center shrink-0 text-slate-500">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}

                    {/* Pair, Setup & Tag details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Pair Name */}
                        <span className="text-sm sm:text-base font-extrabold text-[#f8fafc] font-mono">
                          {trade.pair}
                        </span>

                        {/* Outcome & Status Badge */}
                        {isRunning ? (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                            <span>RUNNING</span>
                          </span>
                        ) : isMissed ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            MISSED (ตกรถ)
                          </span>
                        ) : isWin ? (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600/40 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3 text-blue-400" />
                            <span>WIN</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-600/40 flex items-center gap-0.5">
                            <ArrowDownRight className="w-3 h-3 text-rose-400" />
                            <span>LOSE</span>
                          </span>
                        )}

                        {/* Trend Alignment Badge */}
                        {trade.trendAlignment === 'COUNTER_TREND' ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-700/40">
                            สวนเทรนด์
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-600/30">
                            ตามเทรนด์
                          </span>
                        )}

                        {/* Backtest vs Live Badge */}
                        {trade.isScreenshotOnly && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 flex items-center gap-0.5">
                            <Camera className="w-2.5 h-2.5" />
                            <span>Backtest</span>
                          </span>
                        )}

                        {/* Portfolio Tag */}
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            trade.portfolio === 'funded'
                              ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                              : 'bg-slate-800 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {trade.portfolio === 'funded' ? 'กองทุน' : 'ส่วนตัว'}
                        </span>
                      </div>

                      {/* Setup & Session */}
                      <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                        {trade.setupType && (
                          <span className="text-[#f8fafc] font-bold flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-300" />
                            <span>{trade.setupType}</span>
                          </span>
                        )}
                        {trade.timeframe && (
                          <span className="px-1.5 py-0.2 bg-[#030407] rounded border border-[#1e293b] text-[10px]">
                            {trade.timeframe}
                          </span>
                        )}
                        {trade.session && <span>• {trade.session}</span>}
                        {trade.date && <span>• {trade.date.replace('T', ' ')}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: PnL, RR, Distance, and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1e293b]">
                    {/* Distance in points / Fibo */}
                    {(trade.tpPoints || trade.slPoints) && (
                      <div className="text-right font-mono text-[11px] hidden sm:block">
                        <div className="text-blue-400">TP: {trade.tpPoints || 0} จุด</div>
                        <div className="text-rose-400">SL: {trade.slPoints || 0} จุด</div>
                      </div>
                    )}

                    {/* RR & PnL */}
                    <div className="text-right">
                      <div className="text-[11px] font-mono text-slate-400">
                        1 : <span className="text-[#f8fafc] font-bold">{trade.riskReward}</span> RR
                        {trade.fiboTpLevel && trade.fiboTpLevel !== 'Custom' && (
                          <span className="text-[#38bdf8] ml-1">({trade.fiboTpLevel})</span>
                        )}
                      </div>
                      <div
                        className={`text-sm sm:text-base font-mono font-extrabold ${
                          isWin ? 'text-blue-400' : isMissed ? 'text-slate-400' : 'text-rose-400'
                        }`}
                      >
                        {trade.pnl >= 0 ? `+$${trade.pnl.toLocaleString()}` : `-$${Math.abs(trade.pnl).toLocaleString()}`}
                      </div>
                    </div>

                    {/* Actions: Copy & Delete */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {onCopyTrade && (
                        <button
                          type="button"
                          onClick={() => onCopyTrade(trade)}
                          className="p-1.5 rounded-lg bg-[#030407] hover:bg-[#1e293b] text-slate-400 hover:text-[#38bdf8] border border-[#1e293b] transition-colors"
                          title="คัดลอกไม้นี้"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('ต้องการลบประวัติไม้เทรดนี้ใช่หรือไม่?')) {
                            onDeleteTrade(trade.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#030407] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-[#1e293b] transition-colors"
                        title="ลบไม้เทรดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Invalidation Reason (If LOSE) or Notes preview */}
                {(trade.invalidationReason || trade.notes || trade.emotion) && (
                  <div className="pt-2 border-t border-[#1e293b] flex flex-wrap items-center gap-2 text-xs font-mono">
                    {trade.invalidationReason && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/30 text-rose-300 border border-rose-800/40 text-[11px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>เหตุผลที่แพ้: {trade.invalidationReason}</span>
                      </div>
                    )}
                    {trade.emotion && (
                      <span className="text-[11px] text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                        {trade.emotion}
                      </span>
                    )}
                    {trade.notes && (
                      <span className="text-[11px] text-slate-400 truncate max-w-md">
                        💬 {trade.notes}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. FULL-SCREEN IMAGE ZOOM MODAL */}
      {/* ========================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-[#06080e] border border-slate-600 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-[#1e293b] mb-2">
              <span className="text-xs font-mono font-bold text-[#f8fafc] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-300" />
                <span>ภาพกราฟเซ็ตอัพวิเคราะห์ (Chart Setup Preview)</span>
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg bg-[#030407] hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] rounded-xl flex items-center justify-center bg-[#030407]">
              <img
                src={previewImage}
                alt="Setup Full Preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
