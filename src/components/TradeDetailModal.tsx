import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  Maximize2,
  Sparkles,
  Tag,
  Coins,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Play,
  CheckCircle2,
  Briefcase,
  Layers,
  Target,
} from 'lucide-react';
import { Trade } from '../types';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!trade) return null;

  const isWin = trade.outcome === 'WIN';
  const isLose = trade.outcome === 'LOSE';
  const isMiss = trade.outcome === 'MISS';
  const isLong = trade.direction === 'Long';

  const handleDelete = () => {
    if (window.confirm('คุณต้องการลบรายการเทรดนี้ออกจากประวัติหรือไม่?')) {
      onDelete(trade.id);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl bg-[#06080e] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-fade-in font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#030407]">
          <div className="flex items-center gap-3">
            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1 ${
                isLong
                  ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                  : 'bg-slate-800 text-slate-300 border border-slate-600'
              }`}
            >
              {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isLong ? 'LONG (BUY)' : 'SHORT (SELL)'}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#f8fafc]">
                  {trade.pair}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isWin
                      ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                      : isLose
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                      : isMiss
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-[#64748b]/20 text-slate-400 border border-[#64748b]/40'
                  }`}
                >
                  {trade.outcome}
                </span>
                {trade.portfolio && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0e131f] text-[#38bdf8] border border-[#38bdf8]/30">
                    {trade.portfolio === 'personal' ? 'Personal' : 'Funded'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {trade.setupType ? `${trade.setupType} • ` : ''}{trade.session || 'New York'} Session
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onEdit(trade);
              }}
              className="p-2 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b] transition-all"
              title="แก้ไขไม้นี้"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-[#0e131f] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-[#1e293b] hover:border-rose-700/50 transition-all"
              title="ลบไม้นี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b] transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Profit / RR Banner */}
          <div className="p-4 rounded-2xl bg-[#030407] border border-[#1e293b] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                กำไร / ขาดทุนสุทธิ (Net P&L)
              </span>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 ${
                  trade.pnl > 0
                    ? 'text-blue-400'
                    : trade.pnl < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {trade.pnl > 0
                  ? `+$${trade.pnl.toLocaleString()}`
                  : trade.pnl < 0
                  ? `-$${Math.abs(trade.pnl).toLocaleString()}`
                  : '$0 (BE / Miss)'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Risk : Reward</span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-200 mt-0.5">
                1 : {trade.riskReward ?? 0} RR
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-slate-400">Timeframe</div>
              <div className="text-xs font-mono font-bold text-[#f8fafc] mt-1">
                {trade.timeframe || 'ไม่ระบุ (None)'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-slate-400">Session</div>
              <div className="text-xs font-mono font-bold text-[#f8fafc] mt-1">{trade.session}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-slate-400">TP / SL (จุด)</div>
              <div className="text-xs font-mono font-bold text-[#f8fafc] mt-1">
                {(trade.tpPoints || trade.slPoints || trade.tpPips || trade.slPips) ? (
                  <span className="text-blue-400">
                    +{trade.tpPoints ?? trade.tpPips ?? '-'}จุด /{' '}
                    <span className="text-rose-400">-{trade.slPoints ?? trade.slPips ?? '-'}จุด</span>
                  </span>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-slate-400">Fibo TP Target</div>
              <div className="text-xs font-mono font-bold text-[#38bdf8] mt-1 truncate flex items-center gap-1">
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{trade.fiboTpLevel && trade.fiboTpLevel !== 'Custom' ? trade.fiboTpLevel : 'Custom / None'}</span>
              </div>
            </div>
          </div>

          {/* Trade Video Recap Link (If present) */}
          {trade.recapVideoUrl && (
            <div className="p-3 rounded-xl bg-[#0e131f] border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-slate-300 fill-current" />
                <div>
                  <div className="text-xs font-bold text-[#f8fafc] font-mono">
                    คลิปวิดีโอรีแคปไม้นี้ (Video Recap)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                    {trade.recapVideoUrl}
                  </div>
                </div>
              </div>
              <a
                href={trade.recapVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1 shadow-md border border-slate-600"
              >
                <span>เปิดดู</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Trade Notes */}
          {trade.notes && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#f8fafc] font-mono">
                บันทึกข้อคิดและเหตุผลการเข้า (Notes)
              </div>
              <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                {trade.notes}
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {trade.screenshots && trade.screenshots.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#f8fafc] font-mono">
                ภาพกราฟวิเคราะห์ (Chart Screenshots)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trade.screenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-[#1e293b] bg-[#030407] group"
                  >
                    <img
                      src={shot}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-44 object-cover cursor-pointer"
                      onClick={() => setSelectedImage(shot)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={() => setSelectedImage(shot)}
                        className="p-1.5 bg-black/80 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#030407] flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-400">{formatDate(trade.date)}</div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0e131f] hover:bg-[#1e293b] text-xs font-mono text-[#f8fafc] rounded-xl border border-[#1e293b] transition-all"
          >
            ปิด
          </button>
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-slate-700 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};
