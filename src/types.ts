export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgMain: string;
  bgSurface: string;
  bgSurfaceContainer: string;
  border: string;
  textMain: string;
  winColor: string;
  lossColor: string;
  fontVibe?: string;
}

export type PortfolioType = 'personal' | 'funded';

export interface SetupItem {
  id: string;
  name: string;
  description?: string; // คำอธิบายการเล่น / Playbook Rules / Checklist
  enabled?: boolean;
}

export interface FundedAccountConfig {
  id: string;
  name: string;
  initialBalance: number;
  maxDailyLossPercent: number; // e.g. 5% ($5,000)
  maxTotalLossPercent: number; // e.g. 10% ($10,000)
  profitTargetPercent: number; // e.g. 8% ($8,000)
  phase: 'Phase 1' | 'Phase 2' | 'Funded Master';
}

export interface User {
  id: string;
  email?: string;
  username: string;
  password?: string;
  displayName: string;
  title: string;
  photoURL?: string;
  accountBalance: number; // พอร์ตส่วนตัว (Personal Balance)
  fundedBalance?: number; // พอร์ตกองทุน (Funded Balance)
  createdAt: string;
  lastSyncedAt?: string;
  isFirebaseUser?: boolean;
}

export type TradeOutcome = 'WIN' | 'LOSE' | 'BE' | 'MISS';
export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'COMPLETED' | 'RUNNING' | 'MISSED'; // 🏁 เสร็จแล้ว / ⏳ กำลังวิ่ง (ยังไม่ SL/TP) / 🚫 ตกรถ
export type TrendAlignment = 'PRO_TREND' | 'COUNTER_TREND'; // 📈 ตามเทรนด์ / 📉 สวนเทรนด์

export interface ScaleInEntry {
  id: string;
  orderNumber: number; // ไม้ที่เติม (ไม้ 2, ไม้ 3...)
  portfolio?: PortfolioType; // พอร์ตส่วนตัว / พอร์ตกองทุน
  pair?: string; // คู่สินทรัพย์
  direction?: TradeDirection; // Long / Short
  setupType?: string; // Setup / ท่าเทรดไม้ที่เติม
  setupDescription?: string;
  useSetup?: boolean;
  timeframe?: string; // TF ที่เข้า
  useTimeframe?: boolean;
  session?: string; // Session เทรด
  date?: string; // วันเวลาที่เข้าไม้เติม
  entryPrice?: string; // ราคาเข้า / โซน
  tradeStatus?: TradeStatus; // สถานะไม้เติม: COMPLETED | RUNNING | MISSED
  trendAlignment?: TrendAlignment; // ตามเทรนด์ (PRO_TREND) หรือ สวนเทรนด์ (COUNTER_TREND)
  usePoints?: boolean;
  slPoints?: number; // ระยะ SL (จุด)
  tpPoints?: number; // ระยะ TP (จุด)
  fiboTpLevel?: 'TP1' | 'TP2' | 'TP3' | 'Custom';
  riskReward?: number; // R:R ไม้เสริม
  pnl?: number; // กำไร/ขาดทุนไม้เสริม ($)
  lotSize?: number; // ล็อต (ถ้ามี)
  outcome?: 'WIN' | 'LOSE' | 'BE' | 'RUNNING'; // ผลลัพธ์ไม้เสริม
  lossReason?: string; // เหตุผลที่แพ้ของไม้นี้ (Invalidation Reason)
  invalidationReason?: string;
  notes?: string; // ข้อคิด / โซนที่เติมไม้
}

export interface Trade {
  id: string;
  portfolio?: PortfolioType; // 'personal' | 'funded'
  fundedAccountId?: string;
  pair: string;
  direction?: TradeDirection;
  outcome: TradeOutcome;
  tradeStatus?: TradeStatus; // สถานะไม้: COMPLETED | RUNNING | MISSED
  trendAlignment?: TrendAlignment; // ตามเทรนด์ (PRO_TREND) หรือ สวนเทรนด์ (COUNTER_TREND)
  isScreenshotOnly?: boolean; // ไม้นี้เป็นการเก็บภาพเทรด (Backtest / Case Study) ไม่ใช่เทรดจริง
  invalidationReason?: string; // เหตุผลที่คัดลอส / แพ้เพราะอะไร
  setupType?: string;
  setupDescription?: string; // คำอธิบายการเล่นที่ใช้
  session?: 'London' | 'New York' | 'Asia' | 'Off-Session' | string;
  timeframe?: string;
  riskReward: number; // 1 to 500
  pnl: number;
  date: string;
  screenshots: string[];
  notes: string;
  emotion?: string;
  slPoints?: number; // ระยะ SL (จุด)
  tpPoints?: number; // ระยะ TP (จุด)
  fiboTpLevel?: 'TP1' | 'TP2' | 'TP3' | 'Custom'; // เป้าหมาย Fibo TP
  slPips?: number; // fallback compat
  tpPips?: number; // fallback compat
  recapVideoUrl?: string; // ลิงก์คลิปวิดีโอรีแคป
  hasScaleIn?: boolean; // ชุดนี้ได้กดเติมไม้มั้ย (ติ๊กเปิด/ปิด)
  scaleInCount?: number; // จำนวนไม้ที่เติมเพิ่ม (เช่น 1, 2, 3 ไม้)
  scaleInType?: string; // รูปแบบการเติมไม้ (เช่น Pyramiding, Breakout Pullback, DCA Zone, Momentum Add)
  scaleInOutcome?: 'WIN' | 'LOSE' | 'BE' | 'RUNNING'; // ผลลัพธ์การเทรดของไม้เติม (Outcome)
  scaleInTradeStatus?: TradeStatus; // สถานะไม้เติม: COMPLETED | RUNNING | MISSED
  scaleInTrendAlignment?: TrendAlignment; // กลยุทธ์ไม้เติม: ตามเทรนด์ (PRO_TREND) หรือ สวนเทรนด์ (COUNTER_TREND)
  scaleInRiskReward?: number; // สัดส่วน Risk : Reward (RR) ของไม้เติม
  scaleInPnL?: number; // กำไร / ขาดทุนสุทธิ ($ PnL) ของไม้เติม
  scaleInLossReason?: string; // เหตุผลที่เติมไม้แล้วแพ้ / ข้อผิดพลาดในการเติมไม้
  scaleInNotes?: string; // รายละเอียดการเติมไม้
  scaleInEntries?: ScaleInEntry[]; // รายละเอียดแยกแต่ละไม้ที่เติม
}

export interface CertificateConfig {
  showWinRate: boolean;
  showTotalPnL: boolean;
  showProfitFactor: boolean;
  showMaxStreak: boolean;
  showAverageRR: boolean;
  showOfficialSeal: boolean;
  showSignature: boolean;
  showPortfolioTag: boolean;
  customNotes?: string;
}

export interface DailyTargetConfig {
  enabled: boolean;
  targetRR: number;
  targetPnL: number;
  maxTrades?: number; // เป้าหมายจำนวนไม้ต่อวัน เช่น 3 - 5 ไม้
}

export interface MilestoneConfig {
  enabled: boolean;
  targetTrades: number; // 1 - 5000 ไม้ (หลอดปรับจำนวน)
}

export interface MultiPortfolioConfig {
  enabled: boolean;
  activePortfolio: 'all' | 'personal' | 'funded';
  personalBalance: number;
  fundedBalance: number;
}

export interface DailyRecap {
  id: string;
  date: string;
  videoUrl: string;
  title?: string;
  notes?: string;
  portfolio?: PortfolioType;
}

export type DailyRecapItem = DailyRecap;

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: {
    headers: GmailMessageHeader[];
    body?: {
      data?: string;
      size?: number;
    };
    parts?: any[];
  };
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
  bodyText?: string;
  bodyHtml?: string;
  isRead?: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export type ActiveTab = 'home' | 'logs' | 'edge-finder' | 'funded' | 'recap' | 'gmail' | 'profile';
