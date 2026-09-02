import { ThemeConfig, User, Trade, SetupItem, FundedAccountConfig } from '../types';

export const DEFAULT_SCREENSHOT = '';

export const DEFAULT_THEME: ThemeConfig = {
  id: 'stainless-steel-black',
  name: 'Stainless Steel & Black',
  primary: '#e2e8f0',
  secondary: '#94a3b8',
  bgMain: '#030407',
  bgSurface: '#06080e',
  bgSurfaceContainer: '#0e131f',
  border: '#1e293b',
  textMain: '#f8fafc',
  winColor: '#38bdf8',
  lossColor: '#64748b',
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_default',
    username: 'trader',
    displayName: 'Trader',
    title: 'Trader',
    accountBalance: 0,
    fundedBalance: 0,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETUP_ITEMS: SetupItem[] = [
  {
    id: 'setup_breakout_retest',
    name: 'Breakout & Retest',
    description:
      'รอราคาเบรกแนวรับ/แนวต้านสำคัญอย่างรุนแรงด้วยแท่ง Momentum จากนั้นรอให้ราคาย่อกลับมาทดสอบระดับเดิม แล้วเกิดสัญญาณ Rejection แท่งเทียนคอนเฟิร์มก่อนเข้าออเดอร์ วาง SL หลังสวิงล่าสุด',
    enabled: true,
  },
  {
    id: 'setup_order_block',
    name: 'Order Block (OB)',
    description:
      'ระบุแท่งเทียนตรงข้ามแท่งสุดท้ายก่อนเกิดการพุ่งตัวรุนแรงที่ทำให้โครงสร้างพัง (BOS) รอราคากลับมาแตะในโซน OB 50% หรือ Open แล้วมองหา Confirmation ใน TF ย่อย (1m/5m)',
    enabled: true,
  },
  {
    id: 'setup_liquidity_sweep',
    name: 'Liquidity Sweep (กวาดสภาพคล่อง)',
    description:
      'ระบุจุดที่มี Buy-side หรือ Sell-side Liquidity (Equal Highs/Equal Lows) รอให้ราคาแทงเข็มทะลุไปกวาด Stop Loss ของรายย่อย แล้วปิดตัวกลับเข้ามาในกรอบทันที เข้าสวนทาง',
    enabled: true,
  },
  {
    id: 'setup_fvg',
    name: 'Fair Value Gap (FVG)',
    description:
      'หาช่องว่างราคา 3 แท่งเทียนที่ไม่ทับซ้อนกัน รอให้ราคา Rebalance กลับเข้ามาเติม FVG อย่างน้อย 50% (Consequent Encroachment) แล้วเข้าตามแนวโน้มเดิม',
    enabled: true,
  },
  {
    id: 'setup_trendline_bounce',
    name: 'Trendline Bounce',
    description:
      'ลากเส้นแนวโน้มที่ผ่านการสัมผัสอย่างน้อย 2 ครั้ง รอราคาทดสอบครั้งที่ 3 พร้อมตรวจดู Volume การปฏิเสธราคา เข้าตามทิศทางเทรนด์',
    enabled: true,
  },
  {
    id: 'setup_range_deviation',
    name: 'Range Deviation (False Breakout)',
    description:
      'ราคาวิ่งออกนอกกรอบสะสม (Range High/Low) ชั่วคราวแล้วดึงกลับเข้ามาอย่างรวดเร็ว บ่งบอกว่าเป็นกับดักสภาพคล่อง เข้าออเดอร์เพื่อเป้าหมายอีกฝั่งของกรอบ',
    enabled: true,
  },
];

export const DEFAULT_SETUPS: string[] = DEFAULT_SETUP_ITEMS.map((s) => s.name);

export const DEFAULT_PAIRS: string[] = [
  'BTC/USD',
  'ETH/USD',
  'XAU/USD',
  'EUR/USD',
  'SOL/USD',
  'GBP/USD',
  'US30',
  'NAS100',
];

export const DEFAULT_EMOTIONS: string[] = [
  '🎯 มีวินัย / ตามแผน (Disciplined)',
  '⚡ FOMO / กลัวตกรถ',
  '😤 Revenge / หัวร้อน',
  '😰 ลังเล / กลัวเสีย (Hesitant)',
  '😌 ผ่อนคลาย / มั่นใจ (Calm / Confident)',
  '😴 ง่วง / โฟกัสต่ำ',
  '🔥 มั่นใจเกินเหตุ (Overconfident)',
];

export const DEFAULT_INVALIDATION_REASONS: string[] = [
  'หลุดโครงสร้างราคา (Broken Market Structure / CHoCH)',
  'ชนข่าวแรงกลืนแท่ง (High-Impact News Spike / CPI / NFP)',
  'เข้าก่อนมีแท่งคอนเฟิร์ม (Entered Before Confirmation Candle)',
  'เลื่อน SL หนี / ไม่คุมความเสี่ยง (Moved Stop Loss / Overrisk)',
  'ติดแนวรับต้านใน TF ใหญ่ (Hit Higher Timeframe Supply/Demand)',
  'ตลาดไม่มี Volume / ไซด์เวย์บีบกรอบ (Low Volume Liquidity Chop)',
  'สภาพคล่องหลอก (Liquidity Trap / False Breakout)',
];

export const DEFAULT_SCALE_IN_TECHNIQUES: string[] = [
  'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง / มีกำไรแล้ว)',
  'Breakout & Pullback Add (เติมตอนเบรกแล้วย่อเทสแนว)',
  'Retest Key Level / S&R (เติมตอนเทสแนวรับต้านสำคัญ)',
  'Momentum Re-entry (เติมตามแรงโมเมนตัมต่อเนื่อง)',
  'Zone DCA / Layering (วางเลเยอร์กระจายออเดอร์ในโซน)',
  'FVG Rebalance Add (เติมตอนราคาย่อเข้า Fair Value Gap)',
  'Order Block Confirmation Add (เติมตอนเทส OB แล้วคอนเฟิร์ม)',
  'Custom / อื่นๆ',
];

export const DEFAULT_SCALE_IN_LOSS_REASONS: string[] = [
  'เติมไม้เร็วเกินไป ราคายังไม่ยืนยัน (Added Too Early / No Confirmation)',
  'ขยับ SL บังทุนไม่ทัน โดนสวิงราคากลืน (Failed to Breakeven / Swept Back)',
  'เติมไม้ใกล้แนวต้าน/แนวรับสำคัญเกินไป (Added Near Key HTF Resistance)',
  'Overtrade / อัด Lot ไม้เติมใหญ่เกินความเสี่ยง (Oversized Scale-In Lot)',
  'กราฟเปลี่ยนทิศทาง / เสียโครงสร้าง (Market Structure Shift / CHoCH)',
  'ชนข่าวผันผวนรุนแรง (News Spike / High Impact Volatility)',
  'ฝืนเติมตอนติดไซด์เวย์บีบกรอบ (Added Inside Chop / Consolidation Trap)',
];

export const DEFAULT_FUNDED_ACCOUNTS: FundedAccountConfig[] = [
  {
    id: 'funded_account_1',
    name: 'Funded Challenge',
    initialBalance: 0,
    maxDailyLossPercent: 5,
    maxTotalLossPercent: 10,
    profitTargetPercent: 8,
    phase: 'Phase 1',
  },
];

export const TIMEFRAME_PRESETS = [
  '1s',
  '3s',
  '5s',
  '15s',
  '30s',
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1D',
];

export const DEFAULT_TRADES: Trade[] = [];

export const DEFAULT_USER_TRADES_MAP: Record<string, Trade[]> = {
  user_default: [],
};

