import React, { useState } from 'react';
import {
  User as UserIcon,
  Plus,
  Trash2,
  Check,
  X,
  UserPlus,
  LogIn,
  AlertTriangle,
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  allUsers: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onCloudSyncAccount?: (username: string) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  onLogin,
  onRegister,
  onDeleteUser,
}) => {
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];
  const [mode, setMode] = useState<'select' | 'register'>('select');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newTitle, setNewTitle] = useState('Ghost Trader');
  const [newBalance, setNewBalance] = useState('50000');
  const [newFundedBalance, setNewFundedBalance] = useState('100000');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const uName = newUsername.trim().toLowerCase();
    if (!uName) return;

    if (safeUsers.some((u) => u.username.toLowerCase() === uName)) {
      alert('มีชื่อบัญชีนี้ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น หรือคลิกเข้าสู่ระบบ');
      return;
    }

    const newUser: User = {
      id: `user_${uName.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}`,
      username: uName,
      displayName: newDisplayName.trim() || newUsername.trim(),
      title: newTitle.trim() || 'Ghost Trader',
      accountBalance: parseFloat(newBalance) || 50000,
      fundedBalance: parseFloat(newFundedBalance) || 100000,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    onRegister(newUser);
    onClose();
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'GP';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase() || 'GP';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#06080e] border border-[#1e293b] rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in my-6 font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 p-0.5 shadow-[0_0_12px_rgba(203,213,225,0.3)] flex items-center justify-center">
              <span className="font-mono font-extrabold text-xs text-slate-900">SZ</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f8fafc]">
                {mode === 'select'
                  ? 'จัดการไอดี & สลับบัญชีเทรดเดอร์'
                  : 'สร้างไอดีใหม่'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {mode === 'select'
                  ? 'เลือกสลับบัญชี หรือลบไอดีที่ไม่ต้องการ'
                  : 'กรอกรายละเอียดเพื่อสร้างบัญชีเทรดเดอร์ใหม่'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#030407] p-1 rounded-xl border border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              setMode('select');
              setConfirmDeleteId(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'select'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>รายชื่อไอดี ({safeUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setConfirmDeleteId(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ สร้างไอดีใหม่</span>
          </button>
        </div>

        {/* 1. SELECT & DELETE ACCOUNT MODE */}
        {mode === 'select' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>คลิกแถวเพื่อสลับไอดี หรือกดปุ่มถังขยะเพื่อลบ:</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {safeUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  ยังไม่มีบัญชีในระบบ กดสร้างไอดีใหม่ได้ทันที
                </div>
              ) : (
                safeUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isConfirmingThis = confirmDeleteId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-slate-900/80 border-slate-400 shadow-[0_0_12px_rgba(203,213,225,0.2)]'
                          : 'bg-[#030407] border-[#1e293b] hover:bg-[#0e131f] hover:border-slate-500'
                      }`}
                    >
                      {/* Profile info */}
                      <button
                        type="button"
                        onClick={() => {
                          onLogin(user);
                          onClose();
                        }}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#0e131f] border border-slate-600 flex items-center justify-center font-mono font-extrabold text-xs text-slate-200 shrink-0">
                          {getInitials(user.displayName)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#f8fafc] flex items-center gap-1.5">
                            <span>{user.displayName}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              (@{user.username})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {user.title} • ส่วนตัว ${(user.accountBalance || 50000).toLocaleString()}{' '}
                            {user.fundedBalance ? `• กองทุน $${user.fundedBalance.toLocaleString()}` : ''}
                          </div>
                        </div>
                      </button>

                      {/* Right Action: Current badge + Delete Button */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isConfirmingThis ? (
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-red-500 animate-fade-in">
                            <span className="text-[10px] font-mono text-red-400 font-bold">
                              ลบไอดีนี้?
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUser(user.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold rounded hover:bg-red-500"
                            >
                              ลบ
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-[#0e131f] text-slate-400 hover:text-white text-[10px] font-mono rounded"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <>
                            {isCurrent ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700 text-white border border-slate-500">
                                กำลังใช้
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onLogin(user);
                                  onClose();
                                }}
                                className="text-[10px] font-mono px-2 py-1 bg-[#0e131f] hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-[#1e293b]"
                              >
                                เลือก
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(user.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                              title="ลบไอดีนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setMode('register')}
                className="w-full py-2.5 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-xs font-mono text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 transition-all font-bold"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ สร้างไอดีใหม่</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. REGISTER NEW ACCOUNT MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ชื่อบัญชีผู้ใช้ (Username / ID): *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น alex_prop, ghost_trader"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                ชื่อแสดงผล (Display Name):
              </label>
              <input
                type="text"
                placeholder="เช่น Alex Vance"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  สไตล์เทรด (Title):
                </label>
                <input
                  type="text"
                  placeholder="เช่น SMC Sniper, Scalper"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  พอร์ตส่วนตัว ($):
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                พอร์ตกองทุนเริ่มต้น ($ Funded Capital):
              </label>
              <input
                type="number"
                placeholder="100000"
                value={newFundedBalance}
                onChange={(e) => setNewFundedBalance(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="px-3 py-1.5 bg-[#0e131f] hover:bg-[#1e293b] text-xs font-mono text-slate-400 rounded-xl border border-[#1e293b]"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-bold rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] border border-white"
              >
                สร้างและเข้าสู่ระบบ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
