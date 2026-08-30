import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileText,
  Inbox,
  Clock,
  User as UserIcon,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  isGmailConnected,
  requestGmailAccessToken,
  disconnectGmail,
  fetchGmailProfile,
  listGmailMessages,
  getGmailMessage,
  sendGmailEmail,
  generateTradeReportEmail,
} from '../services/gmailService';
import { GmailMessage, GmailProfile, Trade, User } from '../types';

interface GmailHubProps {
  currentUser: User;
  trades: Trade[];
  activePortfolio?: 'all' | 'personal' | 'funded';
}

export const GmailHub: React.FC<GmailHubProps> = ({
  currentUser,
  trades,
  activePortfolio = 'all',
}) => {
  const [isConnected, setIsConnected] = useState(isGmailConnected());
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email List & Viewer State
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Send Report State
  const [recipient, setRecipient] = useState(currentUser?.username ? `${currentUser.username}@gmail.com` : '');
  const [reportTitle, setReportTitle] = useState('สรุปผลการเทรด Ghost Phaze รายสัปดาห์');
  const [sendingEmail, setSendingEmail] = useState(false);

  const filteredTrades =
    activePortfolio === 'all'
      ? trades
      : trades.filter((t) => (t.portfolio || 'personal') === activePortfolio);

  // Check connection & load profile on mount
  useEffect(() => {
    if (isGmailConnected()) {
      setIsConnected(true);
      loadProfileAndMessages();
    }
  }, []);

  const loadProfileAndMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await fetchGmailProfile();
      setProfile(prof);
      if (!recipient && prof.emailAddress) {
        setRecipient(prof.emailAddress);
      }
      await loadInboxMessages();
    } catch (err: any) {
      console.warn('Gmail Profile Fetch Error:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูล Gmail ได้');
      if (err.message?.includes('expired') || err.message?.includes('not connected')) {
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInboxMessages = async () => {
    setLoadingMessages(true);
    try {
      const { messages: list } = await listGmailMessages('subject:Ghost Phaze OR subject:Trade OR subject:Recap', 10);
      if (list && list.length > 0) {
        const fullMessages = await Promise.all(
          list.slice(0, 8).map((m) => getGmailMessage(m.id).catch(() => null))
        );
        setMessages(fullMessages.filter(Boolean) as GmailMessage[]);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.warn('Load messages err:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestGmailAccessToken();
      setIsConnected(true);
      await loadProfileAndMessages();
      setSuccessMsg('เชื่อมต่อ Gmail สำเร็จแล้ว!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'การเชื่อมต่อถูกยกเลิก');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGmail();
    setIsConnected(false);
    setProfile(null);
    setMessages([]);
    setSelectedMessage(null);
    setSuccessMsg('ตัดการเชื่อมต่อ Gmail แล้ว');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      setError('กรุณาระบุอีเมลผู้รับ');
      return;
    }

    setSendingEmail(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { subject, html, text } = generateTradeReportEmail(
        filteredTrades,
        currentUser,
        reportTitle || 'สรุปผลการเทรด Ghost Phaze',
        activePortfolio
      );

      await sendGmailEmail({
        to: recipient.trim(),
        subject,
        bodyHtml: html,
        bodyText: text,
      });

      setSuccessMsg(`ส่งรายงานไปยัง ${recipient.trim()} เรียบร้อยแล้ว!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      loadInboxMessages();
    } catch (err: any) {
      setError(err.message || 'ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0e1117] to-[#06080e] border border-[#1e293b]">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_15px_rgba(203,213,225,0.3)] flex items-center justify-center">
            <div className="w-full h-full bg-[#030407] rounded-[14px] flex items-center justify-center text-slate-200">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight">
                Gmail Trading Hub & Reports
              </h1>
              {isConnected && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-950/60 border border-blue-600/40 text-blue-300 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Connected</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ส่งออกรายงานสรุปผลการเทรดแบบ Executive Report ตรงเข้ากล่องข้อความ Gmail
            </p>
          </div>
        </div>

        <div>
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <button
                id="btn-refresh-gmail"
                onClick={loadProfileAndMessages}
                disabled={loading}
                className="p-2 rounded-xl bg-[#0e131f] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                id="btn-disconnect-gmail"
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-xl bg-[#140b0e] border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>ตัดการเชื่อมต่อ</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-gmail"
              onClick={handleConnect}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black text-xs font-mono font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white transition-all active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-600/40 text-blue-300 text-xs flex items-center space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Send Report Form & Inbox Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Send Executive Report (7 cols) */}
        <div className="lg:col-span-7 bg-[#06080e] border border-[#1e293b] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-slate-300" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                ส่งรายงานบันทึกไม้ (Send Trade Report)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredTrades.length} ไม้ที่จะถูกแนบ
            </span>
          </div>

          <form onSubmit={handleSendReport} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                อีเมลผู้รับ (Recipient Email)
              </label>
              <input
                type="email"
                id="input-gmail-recipient"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030407] border border-[#1e293b] text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                หัวข้อรายงาน (Report Title / Subject)
              </label>
              <input
                type="text"
                id="input-gmail-subject"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="เช่น สรุปผลการเทรดประจำสัปดาห์ (XAUUSD + BTC)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030407] border border-[#1e293b] text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* Quick Preview Card */}
            <div className="p-4 rounded-xl bg-[#030407] border border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">พอร์ตที่เลือก:</span>
                <span className="text-white font-bold uppercase">{activePortfolio} Portfolio</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">จำนวนไม้:</span>
                <span className="text-slate-200 font-bold">{filteredTrades.length} ไม้</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Win Rate:</span>
                <span className="text-slate-100 font-bold">
                  {filteredTrades.length > 0
                    ? `${(
                        (filteredTrades.filter((t) => t.outcome === 'WIN').length /
                          filteredTrades.length) *
                        100
                      ).toFixed(1)}%`
                    : '0.0%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total PnL:</span>
                <span
                  className={`font-bold ${
                    filteredTrades.reduce((acc, t) => acc + t.pnl, 0) >= 0
                      ? 'text-blue-400'
                      : 'text-slate-300'
                  }`}
                >
                  ${filteredTrades.reduce((acc, t) => acc + t.pnl, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-send-report"
              disabled={sendingEmail || !isConnected}
              className={`w-full py-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                isConnected
                  ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-[0.99] border border-white'
                  : 'bg-[#0e131f] text-slate-500 cursor-not-allowed border border-[#1e293b]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingEmail
                  ? 'กำลังส่งอีเมลรายงาน...'
                  : isConnected
                  ? 'ส่งรายงานไปยัง Gmail ทันที'
                  : 'กรุณาเชื่อมต่อ Gmail ก่อนส่ง'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Profile & Inbox Messages (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Profile Card */}
          {profile && (
            <div className="p-4 rounded-2xl bg-[#06080e] border border-[#1e293b] space-y-2 shadow-xl">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white font-mono truncate">
                    {profile.emailAddress}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    อีเมลทั้งหมด: {profile.messagesTotal?.toLocaleString()} ฉบับ
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Sent / Trade Emails */}
          <div className="bg-[#06080e] border border-[#1e293b] rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <div className="flex items-center space-x-2">
                <Inbox className="w-4 h-4 text-slate-300" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  อีเมลรีแคปล่าสุด (Recent Mail)
                </h3>
              </div>
              <button
                onClick={loadInboxMessages}
                disabled={loadingMessages || !isConnected}
                className="text-[10px] font-mono text-slate-300 hover:text-white hover:underline"
              >
                รีเฟรช
              </button>
            </div>

            {loadingMessages ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                กำลังโหลดอีเมล...
              </div>
            ) : !isConnected ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                เชื่อมต่อ Gmail เพื่อดูประวัติอีเมลที่ส่ง
              </div>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                ยังไม่พบอีเมลรายงานที่ส่ง
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="p-2.5 rounded-xl bg-[#030407] border border-[#1e293b] hover:border-slate-500 cursor-pointer transition-all text-left group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-white truncate max-w-[180px]">
                        {msg.subject}
                      </span>
                      <span className="text-slate-500 text-[10px]">{msg.date?.slice(0, 16)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-1">{msg.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#06080e] border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#030407]">
              <div className="flex items-center space-x-2 truncate">
                <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                  {selectedMessage.subject}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#050608] border-b border-[#1e293b] text-xs font-mono space-y-1 text-slate-400">
              <div>
                <strong className="text-white">จาก:</strong> {selectedMessage.from}
              </div>
              <div>
                <strong className="text-white">ถึง:</strong> {selectedMessage.to}
              </div>
              <div>
                <strong className="text-white">วันที่:</strong> {selectedMessage.date}
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-[#030407] text-xs leading-relaxed text-[#cbd5e1]">
              {selectedMessage.bodyHtml ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                />
              ) : (
                <pre className="font-mono whitespace-pre-wrap">{selectedMessage.bodyText}</pre>
              )}
            </div>

            <div className="p-3 border-t border-[#1e293b] bg-[#030407] flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 rounded-xl bg-[#0e131f] hover:bg-[#1a233a] border border-[#1e293b] text-white text-xs font-mono font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
