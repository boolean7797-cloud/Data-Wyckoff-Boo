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
  Mail,
  Lock,
  Cloud,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Sparkles,
  KeyRound,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { User } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutFirebase,
  sendResetPassword,
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
  onCloudSyncSuccess,
}) => {
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'profiles'>('signin');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states for Email Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tradingTitle, setTradingTitle] = useState('Ghost Trader');
  const [initialBalance, setInitialBalance] = useState('50000');
  const [initialFundedBalance, setInitialFundedBalance] = useState('100000');

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

  if (!isOpen) return null;

  // Handle Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const user = await loginWithEmail(email.trim(), password);
      onLogin(user);
      setSuccessMessage('เข้าสู่ระบบและซิงค์ข้อมูลคลาวด์เรียบร้อยแล้ว!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { user } = await registerWithEmail(
        email.trim(),
        password,
        displayName.trim() || email.split('@')[0],
        tradingTitle.trim() || 'Ghost Trader',
        parseFloat(initialBalance) || 50000,
        parseFloat(initialFundedBalance) || 100000
      );
      onRegister(user);
      setSuccessMessage('สร้างบัญชีและเชื่อมต่อ Cloud Firestore สำเร็จ!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const user = await loginWithGoogle();
      onLogin(user);
      setSuccessMessage('เข้าสู่ระบบด้วย Google สำเร็จ!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('กรุณากรอกอีเมลที่ต้องการรีเซ็ตรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendResetPassword(email.trim());
      setSuccessMessage(`ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง ${email.trim()} เรียบร้อยแล้ว`);
      setIsResetPasswordMode(false);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
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

      <div className="relative z-10 w-full max-w-lg bg-[#06080e] border border-[#1e293b] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in my-6 font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 p-0.5 shadow-[0_0_12px_rgba(203,213,225,0.3)] flex items-center justify-center">
              <span className="font-mono font-extrabold text-xs text-slate-900">SZ</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f8fafc] flex items-center gap-2">
                <span>บัญชีเทรดเดอร์ & Cloud Sync</span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 rounded-full flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5 text-blue-400" />
                  <span>Multi-Device</span>
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ล็อกอินด้วยอีเมลเพื่อบันทึกและสลับเครื่องได้ตลอดเวลา
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

        {/* Sync Benefits Callout */}
        <div className="p-3 rounded-2xl bg-[#030407] border border-blue-900/30 flex items-start gap-2.5 text-[11px] font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-blue-300 font-bold">ข้อมูลปลอดภัย ผูกติดกับบัญชีอีเมลของคุณ:</div>
            <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
              ประวัติไม้เทรด, ภาพกราฟ, พอร์ตกองทุน, การตั้งค่า R:R และสถิติทั้งหมดจะถูกบันทึกบน Cloud Firestore อัตโนมัติ สลับใช้อุปกรณ์ไหนก็ยังอยู่ครบ
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#030407] p-1 rounded-2xl border border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
              setIsResetPasswordMode(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
              setIsResetPasswordMode(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>สมัครด้วยอีเมล</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('profiles');
              setErrorMessage(null);
              setSuccessMessage(null);
              setIsResetPasswordMode(false);
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

        {/* 1. SIGN IN TAB */}
        {authMode === 'signin' && (
          <div className="space-y-3.5 animate-fade-in">
            {!isResetPasswordMode ? (
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    อีเมล (Email Address): *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="เช่น trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-300">
                      รหัสผ่าน (Password): *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordMode(true)}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 underline"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-[0_0_12px_rgba(255,255,255,0.2)] border border-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 stroke-[2.5]" />
                        <span>เข้าสู่ระบบด้วยอีเมล (Email Sign In)</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-[#090e1a] border border-blue-900/40 text-[11px] font-mono text-slate-300 space-y-1.5 mt-1">
                    <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>คำแนะนำ: เข้าสู่ระบบและสมัครด้วยอีเมล</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      การล็อกอินด้วยอีเมลและรหัสผ่าน <strong className="text-slate-200">ไม่ต้องตั้งค่าโดเมน</strong> และพร้อมใช้งานซิงค์ข้อมูล Cloud Firestore ได้ทันทีบนทุกอุปกรณ์ หากยังไม่มีบัญชีสามารถกดแท็บ <button type="button" onClick={() => setAuthMode('signup')} className="text-blue-400 underline font-bold hover:text-blue-300">"สมัครด้วยอีเมล"</button> ด้านบนได้ทันทีครับ
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span>ขอรับลิงก์รีเซ็ตรหัสผ่าน</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่ทางอีเมล
                </p>
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    อีเมลที่ลงทะเบียนไว้:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordMode(false)}
                    className="px-3 py-2 rounded-xl bg-[#0e131f] border border-[#1e293b] text-xs font-mono text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-xl shadow-md"
                  >
                    {isLoading ? 'กำลังส่ง...' : 'ส่งอีเมลรีเซ็ตรหัสผ่าน'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. SIGN UP TAB */}
        {authMode === 'signup' && (
          <form onSubmit={handleEmailSignUp} className="space-y-3 animate-fade-in">
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                อีเมล (Email Address): *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="เช่น alex.trader@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                ตั้งรหัสผ่าน (Password): * (อย่างน้อย 6 ตัวอักษร)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  ชื่อแสดงผล (Trader Name):
                </label>
                <input
                  type="text"
                  placeholder="เช่น Alex Wyckoff"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  สไตล์เทรด (Title):
                </label>
                <input
                  type="text"
                  placeholder="เช่น SMC Pro, Swing Sniper"
                  value={tradingTitle}
                  onChange={(e) => setTradingTitle(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  พอร์ตส่วนตัว ($):
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  พอร์ตกองทุนเริ่มต้น ($):
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={initialFundedBalance}
                  onChange={(e) => setInitialFundedBalance(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-[0_0_12px_rgba(255,255,255,0.2)] border border-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังสร้างบัญชีบนคลาวด์...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>สมัครสมาชิกและเชื่อมต่อ Cloud Sync</span>
                  </>
                )}
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

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[10px] font-mono border border-rose-800 flex items-center gap-1 transition-all"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-blue-900/40 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cloud Firestore Live Sync Active</span>
                  </span>
                  <span className="text-slate-400">
                    {currentUser.lastSyncedAt
                      ? `ซิงค์ล่าสุด: ${new Date(currentUser.lastSyncedAt).toLocaleTimeString()}`
                      : 'เชื่อมต่อเรียบร้อย'}
                  </span>
                </div>
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-400">
              <span>สลับโปรไฟล์ในเครื่อง หรือ เลือกลบโปรไฟล์:</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                          {user.title} • ${(user.accountBalance || 50000).toLocaleString()}
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3 h-3 text-slate-400" />
            <Smartphone className="w-3 h-3 text-slate-400" />
            <span>รองรับคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน</span>
          </div>
          <span>Gengar Wyk Labs v1.1</span>
        </div>
      </div>
    </div>
  );
};
