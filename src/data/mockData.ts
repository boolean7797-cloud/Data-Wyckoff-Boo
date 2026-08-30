import { ThemeConfig, User, Trade, SetupItem, FundedAccountConfig } from '../types';

export const DEFAULT_SCREENSHOT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqisVjqZNNaD3J8-M6tzIKcX5YspZhps1HI2NTUz0NdOPXxee3Vc0h1TOofBRq2v4rDjzENcQRF1KNQk-54pxmZLXri6_WWd1ApI6gK9rfoZ_eQJWalcozwbMkAeBFk97sNCbDyHdrSfAou0mMnXeZ2UrD_pB65QQPWZq0juExKOYJ1CMdC-cnCgajlceVGTAZLjMKeXzQKcYReuK5KVhGMZxaPQij4S0YNJS12Xp1_VWh8OyOp4U_';

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
    id: 'user_alex',
    username: 'alex',
    displayName: 'Alex Vance',
    title: 'Senior Prop Trader',
    accountBalance: 50000,
    fundedBalance: 100000,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user_elena',
    username: 'elena',
    displayName: 'Elena Rostova',
    title: 'SMC Sniper',
    accountBalance: 25000,
    fundedBalance: 50000,
    createdAt: '2026-02-01T10:00:00Z',
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

export const DEFAULT_FUNDED_ACCOUNTS: FundedAccountConfig[] = [
  {
    id: 'funded_ftmo_100k',
    name: 'FTMO $100,000 Challenge',
    initialBalance: 100000,
    maxDailyLossPercent: 5, // 5% = $5,000
    maxTotalLossPercent: 10, // 10% = $10,000
    profitTargetPercent: 8, // 8% = $8,000
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

export const DEFAULT_TRADES: Trade[] = [
  {
    id: 'trade-1',
    portfolio: 'personal',
    pair: 'BTC/USD',
    direction: 'Long',
    outcome: 'WIN',
    tradeStatus: 'COMPLETED',
    trendAlignment: 'PRO_TREND',
    isScreenshotOnly: false,
    setupType: 'Breakout & Retest',
    setupDescription: 'รอราคาเบรกแนวรับ/แนวต้านสำคัญอย่างรุนแรงด้วยแท่ง Momentum...',
    session: 'New York',
    timeframe: '5m',
    riskReward: 2.5,
    pnl: 1250,
    date: '2026-08-08T14:30',
    screenshots: [DEFAULT_SCREENSHOT],
    notes: 'Clean break above the key resistance level with high delta volume. Followed plan strictly.',
    emotion: '🎯 มีวินัย / ตามแผน (Disciplined)',
    tpPoints: 250,
    slPoints: 100,
    fiboTpLevel: 'TP2',
  },
  {
    id: 'trade-2',
    portfolio: 'personal',
    pair: 'XAU/USD',
    direction: 'Short',
    outcome: 'LOSE',
    tradeStatus: 'COMPLETED',
    trendAlignment: 'COUNTER_TREND',
    isScreenshotOnly: false,
    invalidationReason: 'หลุดโครงสร้างราคา (Broken Market Structure / CHoCH)',
    setupType: 'Order Block',
    session: 'London',
    timeframe: '15m',
    riskReward: 3.0,
    pnl: -500,
    date: '2026-08-07T08:15',
    screenshots: [DEFAULT_SCREENSHOT],
    notes: 'London liquidity raid into 15m supply zone, stopped out cleanly as risk defined.',
    emotion: '🎯 มีวินัย / ตามแผน (Disciplined)',
    tpPoints: 150,
    slPoints: 50,
  },
  {
    id: 'trade-3',
    portfolio: 'funded',
    pair: 'EUR/USD',
    direction: 'Long',
    outcome: 'WIN',
    tradeStatus: 'COMPLETED',
    trendAlignment: 'PRO_TREND',
    isScreenshotOnly: false,
    setupType: 'Liquidity Sweep',
    session: 'London',
    timeframe: '5m',
    riskReward: 4.0,
    pnl: 2000,
    date: '2026-08-06T09:45',
    screenshots: [DEFAULT_SCREENSHOT],
    notes: 'Asian Lows swept right at London open. Strong impulse reversal with bullish engulfing.',
    emotion: '😌 ผ่อนคลาย / มั่นใจ (Calm / Confident)',
    tpPoints: 400,
    slPoints: 100,
    fiboTpLevel: 'TP3',
  },
  {
    id: 'trade-4',
    portfolio: 'personal',
    pair: 'SOL/USD',
    direction: 'Long',
    outcome: 'WIN',
    tradeStatus: 'COMPLETED',
    trendAlignment: 'PRO_TREND',
    isScreenshotOnly: true, // Case study / Backtest
    setupType: 'Breakout & Retest',
    session: 'New York',
    timeframe: '1m',
    riskReward: 3.5,
    pnl: 1750,
    date: '2026-08-05T16:20',
    screenshots: [DEFAULT_SCREENSHOT],
    notes: 'High-speed 1m momentum break during market open. Backtest case study.',
    emotion: '🎯 มีวินัย / ตามแผน (Disciplined)',
    tpPoints: 350,
    slPoints: 100,
    fiboTpLevel: 'TP2',
  },
  {
    id: 'trade-5',
    portfolio: 'funded',
    pair: 'XAU/USD',
    direction: 'Long',
    outcome: 'WIN',
    tradeStatus: 'RUNNING', // Still running
    trendAlignment: 'PRO_TREND',
    isScreenshotOnly: false,
    setupType: 'Fair Value Gap (FVG)',
    session: 'New York',
    timeframe: '15m',
    riskReward: 2.0,
    pnl: 450,
    date: '2026-08-04T13:00',
    screenshots: [DEFAULT_SCREENSHOT],
    notes: 'Filled 15m FVG, partials taken at 1R, holding for higher targets.',
    emotion: '🎯 มีวินัย / ตามแผน (Disciplined)',
    tpPoints: 200,
    slPoints: 100,
    fiboTpLevel: 'TP1',
  },
];

export const DEFAULT_USER_TRADES_MAP: Record<string, Trade[]> = {
  user_alex: DEFAULT_TRADES,
  user_elena: DEFAULT_TRADES.slice(1, 4),
};
