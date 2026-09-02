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
  Cloud,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Sparkles,
  RotateCcw,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { User } from '../types';
import {
  loginWithGoogle,
  logoutFirebase,
  formatAuthError,
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  allUsers: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onResetAllToZero?: () => void;
  onCloudSyncSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  onLogin,
  onRegister,
  onDeleteUser,
  onResetAllToZero,
}) => {
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];
  const [authMode, setAuthMode] = useState<'google' | 'newProfile' | 'profiles'>('google');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form states for New Local Profile
  const [displayName, setDisplayName] = useState('');
  const [tradingTitle, setTradingTitle] = useState('Trader');
  const [initialBalance, setInitialBalance] = useState('0');
  const [initialFundedBalance, setInitialFundedBalance] = useState('0');

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const user = await loginWithGoogle();
      onLogin(user);
      setSuccessMessage('เข้าสู่ระบบด้วย Google และเชื่อมต่อ Cloud Firestore สำเร็จ!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create Local Profile
  const handleCreateLocalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim() || 'Trader';
    const newId = `user_${Date.now()}`;
    const newUser: User = {
      id: newId,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      displayName: name,
      title: tradingTitle.trim() || 'Trader',
      accountBalance: parseFloat(initialBalance) || 0,
      fundedBalance: parseFloat(initialFundedBalance) || 0,
      createdAt: new Date().toISOString(),
    };

    onRegister(newUser);
    setSuccessMessage(`สร้างโปรไฟล์ "${name}" สำเร็จและพร้อมใช้งาน!`);
    setDisplayName('');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutFirebase();
      setSuccessMessage('ออกจากระบบเรียบร้อยแล้ว');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Factory Clean / Reset to 0
  const handleExecuteResetToZero = () => {
    if (onResetAllToZero) {
      onResetAllToZero();
      setSuccessMessage('รีเซ็ตข้อมูลทั้งหมดให้เป็น 0 (Clean Slate) เรียบร้อยแล้ว!');
      setShowResetConfirm(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'TR';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase() || 'TR';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#06080e] border border-[#1e293b] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in my-6 font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 p-0.5 shadow-[0_0_12px_rgba(203,213,225,0.3)] flex items-center justify-center">
              <span className="font-mono font-extrabold text-xs text-slate-900">SZ</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f8fafc] flex items-center gap-2">
                <span>บัญชีเทรดเดอร์ & การจัดการ</span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 rounded-full flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5 text-blue-400" />
                  <span>Cloud Sync</span>
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                เข้าสู่ระบบด้วย Google หรือสร้างโปรไฟล์ใช้งานในเครื่อง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#030407] p-1 rounded-2xl border border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('google');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'google'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('newProfile');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'newProfile'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ โปรไฟล์ใหม่</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('profiles');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'profiles'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>โปรไฟล์ ({safeUsers.length})</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. GOOGLE LOGIN TAB */}
        {authMode === 'google' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#0a0f1c] border border-blue-900/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">เข้าสู่ระบบด้วยบัญชี Google</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  คลิกเดียวเพื่อซิงค์ประวัติไม้และสถิติทั้งหมดบน Cloud Firestore ปลอดภัยและรวดเร็ว
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-mono font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                    <span>กำลังเชื่อมต่อ Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#030407] border border-[#1e293b] flex items-start gap-2.5 text-[11px] font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-bold">ไม่ต้องการล็อกอิน?</span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  คุณสามารถใช้งานระบบได้ทันทีโดยไม่ต้องล็อกอิน ข้อมูลจะถูกเก็บในเครื่องของคุณอย่างปลอดภัย
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CREATE NEW LOCAL PROFILE */}
        {authMode === 'newProfile' && (
          <form onSubmit={handleCreateLocalProfile} className="space-y-3 animate-fade-in">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                ชื่อโปรไฟล์เทรดเดอร์ (Trader Name): *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Trader A, Wyckoff Sniper"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                สไตล์หรือฉายา (Trading Style / Title):
              </label>
              <input
                type="text"
                placeholder="เช่น Scalper, SMC Pro, Swing Sniper"
                value={tradingTitle}
                onChange={(e) => setTradingTitle(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  ทุนพอร์ตส่วนตัวเริ่มต้น ($):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  ทุนพอร์ตกองทุนเริ่มต้น ($):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={initialFundedBalance}
                  onChange={(e) => setInitialFundedBalance(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-[0_0_12px_rgba(255,255,255,0.2)] border border-white transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>สร้างโปรไฟล์ใหม่และเริ่มใช้งาน</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. PROFILES & MULTI-DEVICE MANAGEMENT */}
        {authMode === 'profiles' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Active Connected User Status */}
            {currentUser && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0e1422] to-[#080c16] border border-blue-800/60 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-300 font-mono font-bold text-sm shadow-inner">
                      {getInitials(currentUser.displayName)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{currentUser.displayName}</span>
                        {currentUser.email && (
                          <span className="px-1.5 py-0.2 bg-blue-900/60 text-blue-300 text-[9px] font-mono rounded">
                            {currentUser.email}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {currentUser.title} • ส่วนตัว ${(currentUser.accountBalance || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {currentUser.isFirebaseUser && (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[10px] font-mono border border-rose-800 flex items-center gap-1 transition-all"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>ออกจากระบบ</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-blue-900/40 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>สถานะ: {currentUser.isFirebaseUser ? 'Google Cloud Sync' : 'Local Storage Mode'}</span>
                  </span>
                  <span className="text-slate-400">
                    {currentUser.lastSyncedAt
                      ? `ซิงค์: ${new Date(currentUser.lastSyncedAt).toLocaleTimeString()}`
                      : 'พร้อมใช้งาน'}
                  </span>
                </div>
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>รายชื่อโปรไฟล์ในเครื่อง:</span>
              <span>({safeUsers.length} บัญชี)</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {safeUsers.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                const isConfirmingThis = confirmDeleteId === user.id;

                return (
                  <div
                    key={user.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-slate-900/90 border-slate-400 shadow-[0_0_12px_rgba(203,213,225,0.2)]'
                        : 'bg-[#030407] border-[#1e293b] hover:bg-[#0e131f] hover:border-slate-500'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onLogin(user);
                        onClose();
                      }}
                      className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#0e131f] border border-slate-600 flex items-center justify-center font-mono font-bold text-xs text-slate-200 shrink-0">
                        {getInitials(user.displayName)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#f8fafc] flex items-center gap-1.5">
                          <span>{user.displayName}</span>
                          {user.email && (
                            <span className="text-[10px] text-blue-400 font-mono">
                              ({user.email})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {user.title} • ${(user.accountBalance || 0).toLocaleString()}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isConfirmingThis ? (
                        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-red-500 animate-fade-in">
                          <span className="text-[10px] font-mono text-red-400 font-bold">
                            ลบ?
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteUser(user.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold rounded"
                          >
                            ลบ
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 bg-[#0e131f] text-slate-400 text-[10px] font-mono rounded"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <>
                          {isCurrent ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-700">
                              ใช้งานอยู่
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

                          {safeUsers.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(user.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                              title="ลบโปรไฟล์"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FACTORY CLEAN / RESET ALL DATA TO 0 SECTION */}
        <div className="pt-3 border-t border-[#1e293b] space-y-2">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 text-xs font-mono flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>รีเซ็ตข้อมูลทั้งหมดให้เป็น 0 (Clean Slate / เหมือนเริ่มใหม่)</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-red-950/90 border border-red-600 text-center space-y-2 animate-fade-in">
              <div className="text-xs font-mono font-bold text-red-200 flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>ยืนยันการล้างข้อมูลทั้งหมดให้เป็น 0?</span>
              </div>
              <p className="text-[11px] text-red-300 font-mono">
                ประวัติการเทรดทั้งหมด, สถิติ, วิดีโอรีแคป และยอดเงินจะถูกรีเซ็ตกลับเป็น 0 เหมือนเพิ่งเปิดใช้งานครั้งแรก
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleExecuteResetToZero}
                  className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-lg shadow-red-900/50"
                >
                  ยืนยันรีเซ็ตเป็น 0
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3 h-3 text-slate-400" />
            <Smartphone className="w-3 h-3 text-slate-400" />
            <span>รองรับคอมพิวเตอร์และสมาร์ทโฟน</span>
          </div>
          <span>Gengar Wyk Labs</span>
        </div>
      </div>
    </div>
  );
};
