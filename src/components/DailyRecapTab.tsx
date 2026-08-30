import React, { useState, useMemo } from 'react';
import {
  Video,
  Plus,
  Play,
  Calendar,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  Film,
  Sparkles,
  X,
  Mail,
} from 'lucide-react';
import { DailyRecap, Trade } from '../types';

interface DailyRecapTabProps {
  trades: Trade[];
  recaps: DailyRecap[];
  onAddRecap: (recap: DailyRecap) => void;
  onDeleteRecap: (recapId: string) => void;
  onSelectTrade: (trade: Trade) => void;
  onOpenGmail?: () => void;
}

export const DailyRecapTab: React.FC<DailyRecapTabProps> = ({
  trades = [],
  recaps = [],
  onAddRecap,
  onDeleteRecap,
  onSelectTrade,
  onOpenGmail,
}) => {
  const safeTrades = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);
  const safeRecaps = useMemo(() => (Array.isArray(recaps) ? recaps : []), [recaps]);

  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [activeVideoToWatch, setActiveVideoToWatch] = useState<DailyRecap | null>(null);

  // Group trades by date to see day's statistics
  const dayStatsMap = useMemo(() => {
    const map: Record<string, { total: number; wins: number; losses: number; pnl: number; trades: Trade[] }> = {};
    safeTrades.forEach((t) => {
      const d = t.date ? t.date.slice(0, 10) : 'Unknown';
      if (!map[d]) {
        map[d] = { total: 0, wins: 0, losses: 0, pnl: 0, trades: [] };
      }
      map[d].total += 1;
      if (t.outcome === 'WIN') map[d].wins += 1;
      if (t.outcome === 'LOSE') map[d].losses += 1;
      map[d].pnl += t.pnl || 0;
      map[d].trades.push(t);
    });
    return map;
  }, [safeTrades]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    const newRecap: DailyRecap = {
      id: `recap_${Date.now()}`,
      date: date || new Date().toISOString().slice(0, 10),
      videoUrl: videoUrl.trim(),
      title: title.trim() || `Daily Order Recap - ${date}`,
      notes: notes.trim(),
    };

    onAddRecap(newRecap);
    setIsAdding(false);
    setVideoUrl('');
    setTitle('');
    setNotes('');
  };

  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string') return null;
    try {
      // YouTube watch?v= convert
      if (url.includes('youtube.com/watch?v=') || url.includes('youtube.com/watch')) {
        const parts = url.split('watch?v=');
        if (parts.length > 1 && parts[1]) {
          const id = parts[1].split('&')[0];
          if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
        }
      }
      // YouTube youtu.be convert
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1 && parts[1]) {
          const id = parts[1].split('?')[0];
          if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
        }
      }
      // Loom convert
      if (url.includes('loom.com/share/')) {
        const parts = url.split('share/');
        if (parts.length > 1 && parts[1]) {
          const id = parts[1].split('?')[0];
          if (id) return `https://www.loom.com/embed/${id}`;
        }
      }
    } catch {
      return url;
    }
    return url;
  };

  return (
    <div className="w-full px-3.5 sm:px-6 py-4 space-y-4 pb-28">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center text-black shadow-[0_0_12px_rgba(203,213,225,0.3)]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#f8fafc] font-['Plus_Jakarta_Sans']">
              Daily Video Recap (รีแคปออเดอร์รายวัน)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              บันทึกคลิปวิดีโอสรุปภาพรวมออเดอร์และการตัดสินใจประจำวัน (YouTube, Loom, วิดีโอลิงก์)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenGmail && (
            <button
              onClick={onOpenGmail}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e131f] hover:bg-[#1a233a] text-slate-300 hover:text-white border border-[#1e293b] text-xs font-mono font-semibold transition-colors"
              title="ส่งสรุปประวัติไม้เข้าอีเมลผ่าน Gmail"
            >
              <Mail className="w-4 h-4 text-slate-300" />
              <span className="hidden xs:inline">ส่งสรุปเข้า Gmail</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black text-xs font-mono font-bold shadow-[0_0_12px_rgba(255,255,255,0.25)] border border-white transition-all active:scale-95"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
            <span>{isAdding ? 'ปิดฟอร์ม' : 'เพิ่มคลิป Recap'}</span>
          </button>
        </div>
      </div>

      {/* Add Recap Form (Collapsible) */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-4 sm:p-5 rounded-2xl bg-[#06080e] border border-[#1e293b] shadow-xl space-y-3.5 animate-fade-in"
        >
          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2.5">
            <Film className="w-4 h-4 text-slate-300" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#f8fafc] font-mono">
              เพิ่มวิดีโอรีแคปออเดอร์ (New Video Recap)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                วันที่ของออเดอร์ (Trade Date) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                หัวข้อรีแคป (Title)
              </label>
              <input
                type="text"
                placeholder="เช่น สรุป NY Session 3 ไม้ Breakout สวยๆ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-200 font-bold block mb-1">
              ลิงก์คลิปวิดีโอ (YouTube / Loom / Drive / MP4 URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=... หรือ https://www.loom.com/share/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1">
              ข้อคิด & Key Takeaways ประจำวัน (Notes)
            </label>
            <textarea
              rows={2}
              placeholder="สรุปสิ่งที่ทำได้ดีตามแผน หรือจุดผิดพลาดที่ต้องระวัง..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl p-3 text-xs font-mono text-[#f8fafc] focus:outline-none resize-none placeholder-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-[#0e131f] hover:bg-[#1a233a] text-xs font-mono text-slate-300 rounded-xl border border-[#1e293b]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black text-xs font-mono font-bold rounded-xl shadow-lg border border-white"
            >
              บันทึกคลิป Recap
            </button>
          </div>
        </form>
      )}

      {/* Recap List */}
      {safeRecaps.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#06080e] border border-[#1e293b] text-center space-y-3 shadow-xl">
          <Film className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-[#f8fafc]">ยังไม่มีวิดีโอรีแคปในระบบ</div>
          <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
            คุณสามารถเพิ่มคลิปวิดีโอ Loom, YouTube หรือลิงก์บันทึกหน้าจอเพื่อทบทวนการเทรดของแต่ละวัน
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black text-xs font-mono font-bold rounded-xl shadow-lg transition-all border border-white"
          >
            + บันทึกคลิปแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeRecaps.map((recap) => {
            const stats = dayStatsMap[recap.date];
            const embed = getEmbedUrl(recap.videoUrl);
            const isEmbeddable =
              embed && (embed.includes('youtube.com') || embed.includes('loom.com'));

            return (
              <div
                key={recap.id}
                className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] hover:border-slate-500 transition-all shadow-xl flex flex-col justify-between space-y-3 group"
              >
                <div>
                  {/* Top bar with date and actions */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs font-mono font-extrabold text-[#f8fafc]">
                        {recap.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (window.confirm('ต้องการลบวิดีโอรีแคปนี้หรือไม่?')) {
                            onDeleteRecap(recap.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="ลบคลิปนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Day Stats */}
                  <div className="mt-2 space-y-1">
                    <h4 className="text-sm font-bold text-[#f8fafc] font-['Plus_Jakarta_Sans'] line-clamp-1">
                      {recap.title || `Recap ${recap.date}`}
                    </h4>

                    {stats && (
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-slate-400">{stats.total} ไม้ในวันนี้</span>
                        <span>•</span>
                        <span className="text-blue-400">{stats.wins}W</span>
                        <span className="text-slate-300">{stats.losses}L</span>
                        <span>•</span>
                        <span
                          className={`font-bold ${
                            stats.pnl >= 0 ? 'text-blue-400' : 'text-slate-300'
                          }`}
                        >
                          {stats.pnl >= 0 ? `+$${stats.pnl}` : `-$${Math.abs(stats.pnl)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {recap.notes && (
                    <p className="text-xs text-slate-400 font-mono line-clamp-2 mt-2 leading-relaxed bg-[#030407] p-2.5 rounded-xl border border-[#1e293b]">
                      {recap.notes}
                    </p>
                  )}
                </div>

                {/* Video Preview or Watch Button */}
                <div className="space-y-2 pt-1">
                  {isEmbeddable ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1e293b] bg-black">
                      <iframe
                        src={embed}
                        title={recap.title || 'Recap Video'}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <a
                      href={recap.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0e131f] hover:bg-[#1a233a] text-slate-200 hover:text-white border border-[#1e293b] hover:border-slate-400 text-xs font-mono font-bold transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>เปิดดูคลิปวิดีโอ (Open Video)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
