import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Coins,
  Check,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  Briefcase,
  SlidersHorizontal,
  Target,
  Image,
  Camera,
  Layers,
  HelpCircle,
  Compass,
  AlertTriangle,
  PlayCircle,
  Activity,
  Flame,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import {
  Trade,
  TradeOutcome,
  TradeDirection,
  TradeStatus,
  TrendAlignment,
  PortfolioType,
  SetupItem,
  ScaleInEntry,
} from '../types';
import {
  TIMEFRAME_PRESETS,
  DEFAULT_SCREENSHOT,
  DEFAULT_EMOTIONS,
  DEFAULT_INVALIDATION_REASONS,
  DEFAULT_SCALE_IN_TECHNIQUES,
  DEFAULT_SCALE_IN_LOSS_REASONS,
} from '../data/mockData';
import { ScaleInEntryCard } from './ScaleInEntryCard';
import { OrderImageUploader } from './OrderImageUploader';

interface AddEditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  editingTrade?: Trade | null;
  tradeToEdit?: Trade | null;
  setups: SetupItem[];
  pairs: string[];
  emotions?: string[];
  onAddEmotion?: (newEmotion: string) => void;
  onDeleteEmotion?: (emotionToDelete: string) => void;
  invalidationReasons?: string[];
  onAddInvalidationReason?: (newReason: string) => void;
  onDeleteInvalidationReason?: (reasonToDelete: string) => void;
  scaleInTechniques?: string[];
  onAddScaleInTechnique?: (newTechnique: string) => void;
  onDeleteScaleInTechnique?: (techniqueToDelete: string) => void;
  scaleInLossReasons?: string[];
  onAddScaleInLossReason?: (newReason: string) => void;
  onDeleteScaleInLossReason?: (reasonToDelete: string) => void;
  onOpenManageSetups?: () => void;
  onOpenManagePairs?: () => void;
  onOpenManageScaleInTechniques?: () => void;
  onOpenManageScaleInLossReasons?: () => void;
  onOpenManageInvalidationReasons?: () => void;
  defaultPortfolio?: PortfolioType;
}

// Helper to get local date time formatted for datetime-local input (YYYY-MM-DDTHH:mm)
const getNowLocalISOString = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

// Helper to auto-detect trading session based on current Bangkok/local hour
const detectAutoSession = (): string => {
  const hour = new Date().getHours();
  // Asia session: 06:00 - 14:00
  if (hour >= 6 && hour < 14) return 'Asia (06:00-14:00)';
  // London session: 14:00 - 19:00
  if (hour >= 14 && hour < 19) return 'London (14:00-19:00)';
  // NY Overlap session: 19:00 - 22:00
  if (hour >= 19 && hour < 22) return 'NY Overlap (19:00-22:00)';
  // New York late: 22:00 - 03:00
  if (hour >= 22 || hour < 3) return 'New York (19:00-03:00)';
  // Off-Session / Pre-Asia: 03:00 - 06:00
  return 'Off-Session (นอกเวลา)';
};

export const AddEditTradeModal: React.FC<AddEditTradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  editingTrade,
  tradeToEdit,
  setups = [],
  pairs = [],
  emotions = DEFAULT_EMOTIONS,
  invalidationReasons = DEFAULT_INVALIDATION_REASONS,
  scaleInTechniques = DEFAULT_SCALE_IN_TECHNIQUES,
  scaleInLossReasons = DEFAULT_SCALE_IN_LOSS_REASONS,
  onOpenManageSetups,
  onOpenManagePairs,
  onOpenManageScaleInTechniques,
  onOpenManageScaleInLossReasons,
  onOpenManageInvalidationReasons,
  defaultPortfolio = 'personal',
}) => {
  const activeTrade = editingTrade || tradeToEdit || null;
  const safeSetups = Array.isArray(setups) ? setups : [];
  const activeSetups = useMemo(() => safeSetups.filter((s) => s.enabled !== false), [safeSetups]);
  const safeInvalidationReasons = Array.isArray(invalidationReasons) && invalidationReasons.length > 0 ? invalidationReasons : DEFAULT_INVALIDATION_REASONS;
  const safeScaleInTechniques = Array.isArray(scaleInTechniques) && scaleInTechniques.length > 0 ? scaleInTechniques : DEFAULT_SCALE_IN_TECHNIQUES;
  const safeScaleInLossReasons = Array.isArray(scaleInLossReasons) && scaleInLossReasons.length > 0 ? scaleInLossReasons : DEFAULT_SCALE_IN_LOSS_REASONS;

  // 1. Core Form State
  const [portfolio, setPortfolio] = useState<PortfolioType>(defaultPortfolio);
  const [pair, setPair] = useState(pairs[0] || 'BTC/USD');
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [outcome, setOutcome] = useState<TradeOutcome>('WIN');
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>('COMPLETED');
  const [trendAlignment, setTrendAlignment] = useState<TrendAlignment>('PRO_TREND');
  const [isScreenshotOnly, setIsScreenshotOnly] = useState(false);
  const [invalidationReason, setInvalidationReason] = useState<string>(invalidationReasons[0] || DEFAULT_INVALIDATION_REASONS[0]);

  // 2. Toggles (MANDATORY RULE: On NEW trade open, all optional toggles START AS OFF / CLOSED)
  const [useSetup, setUseSetup] = useState(false);
  const [setupType, setSetupType] = useState(activeSetups[0]?.name || 'Breakout & Retest');

  const [useTimeframe, setUseTimeframe] = useState(false);
  const [timeframe, setTimeframe] = useState('5m');

  const [usePoints, setUsePoints] = useState(false);
  const [tpPoints, setTpPoints] = useState('200');
  const [slPoints, setSlPoints] = useState('100');
  const [fiboTpLevel, setFiboTpLevel] = useState<'TP1' | 'TP2' | 'TP3' | 'Custom'>('Custom');

  // Scale-in (เติมไม้ในออเดอร์) Toggle & State
  const [hasScaleIn, setHasScaleIn] = useState(false);
  const [scaleInCount, setScaleInCount] = useState<number>(1);
  const [scaleInType, setScaleInType] = useState(safeScaleInTechniques[0] || 'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง/มีกำไร)');
  const [scaleInOutcome, setScaleInOutcome] = useState<'WIN' | 'LOSE' | 'BE' | 'RUNNING'>('WIN');
  const [scaleInTradeStatus, setScaleInTradeStatus] = useState<TradeStatus>('COMPLETED');
  const [scaleInTrendAlignment, setScaleInTrendAlignment] = useState<TrendAlignment>('PRO_TREND');
  const [scaleInRiskReward, setScaleInRiskReward] = useState<number>(2.0);
  const [scaleInPnL, setScaleInPnL] = useState('300');
  const [scaleInLossReason, setScaleInLossReason] = useState<string>(safeScaleInLossReasons[0] || DEFAULT_SCALE_IN_LOSS_REASONS[0]);
  const [scaleInNotes, setScaleInNotes] = useState('');
  const [scaleInEntries, setScaleInEntries] = useState<ScaleInEntry[]>([]);

  // 3. Time, Risk Reward, PnL, Notes & Screenshots
  const [session, setSession] = useState(() => detectAutoSession());
  const [date, setDate] = useState(() => getNowLocalISOString());
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [pnl, setPnl] = useState('0');
  const [notes, setNotes] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Draft Persistence Storage Key
  const DRAFT_STORAGE_KEY = 'gengar_trade_form_draft_v2';
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  // Selected setup details
  const selectedSetupDetails = useMemo(() => {
    return safeSetups.find((s) => s.name === setupType);
  }, [safeSetups, setupType]);

  // Function to reset all fields back to blank defaults
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
    setRestoredFromDraft(false);
    setPortfolio(defaultPortfolio);
    setPair(pairs[0] || 'BTC/USD');
    setDirection('Long');
    setOutcome('WIN');
    setTradeStatus('COMPLETED');
    setTrendAlignment('PRO_TREND');
    setIsScreenshotOnly(false);
    setInvalidationReason(invalidationReasons[0] || DEFAULT_INVALIDATION_REASONS[0]);
    setUseSetup(false);
    setSetupType(activeSetups[0]?.name || 'Breakout & Retest');
    setUseTimeframe(false);
    setTimeframe('5m');
    setUsePoints(false);
    setTpPoints('200');
    setSlPoints('100');
    setFiboTpLevel('Custom');
    setHasScaleIn(false);
    setScaleInCount(1);
    setScaleInType(safeScaleInTechniques[0] || 'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง/มีกำไร)');
    setScaleInOutcome('WIN');
    setScaleInTradeStatus('COMPLETED');
    setScaleInTrendAlignment('PRO_TREND');
    setScaleInRiskReward(2.0);
    setScaleInPnL('0');
    setScaleInLossReason(safeScaleInLossReasons[0] || DEFAULT_SCALE_IN_LOSS_REASONS[0]);
    setScaleInNotes('');
    setScaleInEntries([]);
    setSession(detectAutoSession());
    setDate(getNowLocalISOString());
    setRiskReward(2.0);
    setPnl('0');
    setNotes('');
    setScreenshots([]);
    setImageUrlInput('');
  };

  // Hydrate on edit or restore draft / reset for brand new trade
  useEffect(() => {
    if (!isOpen) return;

    if (activeTrade) {
      setRestoredFromDraft(false);
      setPortfolio(activeTrade.portfolio || 'personal');
      setPair(activeTrade.pair || pairs[0] || 'BTC/USD');
      setDirection(activeTrade.direction || 'Long');
      setOutcome(activeTrade.outcome === 'LOSE' ? 'LOSE' : 'WIN');
      setTradeStatus(activeTrade.tradeStatus || 'COMPLETED');
      setTrendAlignment(activeTrade.trendAlignment || 'PRO_TREND');
      setIsScreenshotOnly(Boolean(activeTrade.isScreenshotOnly));
      setInvalidationReason(activeTrade.invalidationReason || invalidationReasons[0] || DEFAULT_INVALIDATION_REASONS[0]);

      // Setup toggle
      if (activeTrade.setupType) {
        setUseSetup(true);
        setSetupType(activeTrade.setupType);
      } else {
        setUseSetup(false);
      }

      // Timeframe toggle
      if (activeTrade.timeframe) {
        setUseTimeframe(true);
        setTimeframe(activeTrade.timeframe);
      } else {
        setUseTimeframe(false);
      }

      // TP / SL Points toggle
      if (activeTrade.tpPoints !== undefined || activeTrade.slPoints !== undefined) {
        setUsePoints(true);
        setTpPoints(String(activeTrade.tpPoints ?? '200'));
        setSlPoints(String(activeTrade.slPoints ?? '100'));
        setFiboTpLevel(activeTrade.fiboTpLevel || 'Custom');
      } else {
        setUsePoints(false);
      }

      // Scale-in (เติมไม้) toggle & state
      if (activeTrade.hasScaleIn) {
        setHasScaleIn(true);
        setScaleInCount(activeTrade.scaleInCount ?? 1);
        setScaleInType(activeTrade.scaleInType || safeScaleInTechniques[0] || 'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง/มีกำไร)');
        setScaleInOutcome(activeTrade.scaleInOutcome || 'WIN');
        setScaleInTradeStatus(activeTrade.scaleInTradeStatus || 'COMPLETED');
        setScaleInTrendAlignment(activeTrade.scaleInTrendAlignment || 'PRO_TREND');
        setScaleInRiskReward(typeof activeTrade.scaleInRiskReward === 'number' ? activeTrade.scaleInRiskReward : 2.0);
        setScaleInPnL(activeTrade.scaleInPnL !== undefined ? String(Math.abs(activeTrade.scaleInPnL)) : '300');
        setScaleInLossReason(activeTrade.scaleInLossReason || safeScaleInLossReasons[0] || DEFAULT_SCALE_IN_LOSS_REASONS[0]);
        setScaleInNotes(activeTrade.scaleInNotes || '');
        setScaleInEntries(activeTrade.scaleInEntries || []);
      } else {
        setHasScaleIn(false);
        setScaleInCount(1);
        setScaleInType(safeScaleInTechniques[0] || 'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง/มีกำไร)');
        setScaleInOutcome('WIN');
        setScaleInTradeStatus('COMPLETED');
        setScaleInTrendAlignment('PRO_TREND');
        setScaleInRiskReward(2.0);
        setScaleInPnL('300');
        setScaleInLossReason(safeScaleInLossReasons[0] || DEFAULT_SCALE_IN_LOSS_REASONS[0]);
        setScaleInNotes('');
        setScaleInEntries([]);
      }

      setSession(activeTrade.session || detectAutoSession());
      setDate(activeTrade.date || getNowLocalISOString());
      setRiskReward(typeof activeTrade.riskReward === 'number' ? activeTrade.riskReward : 2.0);
      setPnl(String(Math.abs(activeTrade.pnl ?? 0)));
      setNotes(activeTrade.notes || '');
      setScreenshots(
        activeTrade.screenshots && activeTrade.screenshots.length > 0
          ? activeTrade.screenshots
          : [DEFAULT_SCREENSHOT]
      );
      setImageUrlInput('');
    } else {
      // Check for saved draft in localStorage so data is NEVER lost when navigating back on mobile
      let draftLoaded = false;
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object') {
            if (parsed.portfolio) setPortfolio(parsed.portfolio);
            if (parsed.pair) setPair(parsed.pair);
            if (parsed.direction) setDirection(parsed.direction);
            if (parsed.outcome) setOutcome(parsed.outcome);
            if (parsed.tradeStatus) setTradeStatus(parsed.tradeStatus);
            if (parsed.trendAlignment) setTrendAlignment(parsed.trendAlignment);
            if (typeof parsed.isScreenshotOnly === 'boolean') setIsScreenshotOnly(parsed.isScreenshotOnly);
            if (parsed.invalidationReason) setInvalidationReason(parsed.invalidationReason);

            if (typeof parsed.useSetup === 'boolean') setUseSetup(parsed.useSetup);
            if (parsed.setupType) setSetupType(parsed.setupType);
            if (typeof parsed.useTimeframe === 'boolean') setUseTimeframe(parsed.useTimeframe);
            if (parsed.timeframe) setTimeframe(parsed.timeframe);
            if (typeof parsed.usePoints === 'boolean') setUsePoints(parsed.usePoints);
            if (parsed.tpPoints !== undefined) setTpPoints(String(parsed.tpPoints));
            if (parsed.slPoints !== undefined) setSlPoints(String(parsed.slPoints));
            if (parsed.fiboTpLevel) setFiboTpLevel(parsed.fiboTpLevel);

            if (typeof parsed.hasScaleIn === 'boolean') setHasScaleIn(parsed.hasScaleIn);
            if (parsed.scaleInCount !== undefined) setScaleInCount(Number(parsed.scaleInCount) || 1);
            if (parsed.scaleInType) setScaleInType(parsed.scaleInType);
            if (parsed.scaleInOutcome) setScaleInOutcome(parsed.scaleInOutcome);
            if (parsed.scaleInTradeStatus) setScaleInTradeStatus(parsed.scaleInTradeStatus);
            if (parsed.scaleInTrendAlignment) setScaleInTrendAlignment(parsed.scaleInTrendAlignment);
            if (parsed.scaleInRiskReward !== undefined) setScaleInRiskReward(Number(parsed.scaleInRiskReward));
            if (parsed.scaleInPnL !== undefined) setScaleInPnL(String(parsed.scaleInPnL));
            if (parsed.scaleInLossReason) setScaleInLossReason(parsed.scaleInLossReason);
            if (parsed.scaleInNotes !== undefined) setScaleInNotes(parsed.scaleInNotes);
            if (Array.isArray(parsed.scaleInEntries)) setScaleInEntries(parsed.scaleInEntries);

            if (parsed.session) setSession(parsed.session);
            if (parsed.date) setDate(parsed.date);
            if (parsed.riskReward !== undefined) setRiskReward(Number(parsed.riskReward));
            if (parsed.pnl !== undefined) setPnl(String(parsed.pnl));
            if (parsed.notes !== undefined) setNotes(parsed.notes);
            if (Array.isArray(parsed.screenshots)) setScreenshots(parsed.screenshots);

            setRestoredFromDraft(true);
            draftLoaded = true;
          }
        }
      } catch (err) {
        console.warn('Could not restore draft:', err);
      }

      if (!draftLoaded) {
        setRestoredFromDraft(false);
        // Default brand-new trade entry: all toggles OFF
        setPortfolio(defaultPortfolio);
        setPair(pairs[0] || 'BTC/USD');
        setDirection('Long');
        setOutcome('WIN');
        setTradeStatus('COMPLETED');
        setTrendAlignment('PRO_TREND');
        setIsScreenshotOnly(false);
        setInvalidationReason(invalidationReasons[0] || DEFAULT_INVALIDATION_REASONS[0]);

        setUseSetup(false);
        setSetupType(activeSetups[0]?.name || 'Breakout & Retest');
        setUseTimeframe(false);
        setTimeframe('5m');
        setUsePoints(false);
        setTpPoints('200');
        setSlPoints('100');
        setFiboTpLevel('Custom');

        setHasScaleIn(false);
        setScaleInCount(1);
        setScaleInType(safeScaleInTechniques[0] || 'Pyramiding (เติมไม้เมื่อกราฟวิ่งถูกทาง/มีกำไร)');
        setScaleInOutcome('WIN');
        setScaleInTradeStatus('COMPLETED');
        setScaleInTrendAlignment('PRO_TREND');
        setScaleInRiskReward(2.0);
        setScaleInPnL('0');
        setScaleInLossReason(safeScaleInLossReasons[0] || DEFAULT_SCALE_IN_LOSS_REASONS[0]);
        setScaleInNotes('');
        setScaleInEntries([]);

        setSession(detectAutoSession());
        setDate(getNowLocalISOString());
        setRiskReward(2.0);
        setPnl('0');
        setNotes('');
        setScreenshots([]);
        setImageUrlInput('');
      }
    }
  }, [activeTrade, isOpen, defaultPortfolio, pairs, activeSetups, safeScaleInTechniques, safeScaleInLossReasons, invalidationReasons]);

  // Mobile Back Button / Popstate Handler: pushes state so back navigation closes modal safely without losing draft
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ gengarTradeModalOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  // Debounced Auto-Save Draft to LocalStorage (only for new trades, not editing existing saved trades)
  useEffect(() => {
    if (!isOpen || activeTrade) return;

    const saveTimer = setTimeout(() => {
      try {
        const draft = {
          portfolio,
          pair,
          direction,
          outcome,
          tradeStatus,
          trendAlignment,
          isScreenshotOnly,
          invalidationReason,
          useSetup,
          setupType,
          useTimeframe,
          timeframe,
          usePoints,
          tpPoints,
          slPoints,
          fiboTpLevel,
          hasScaleIn,
          scaleInCount,
          scaleInType,
          scaleInOutcome,
          scaleInTradeStatus,
          scaleInTrendAlignment,
          scaleInRiskReward,
          scaleInPnL,
          scaleInLossReason,
          scaleInNotes,
          scaleInEntries,
          session,
          date,
          riskReward,
          pnl,
          notes,
          screenshots,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn('Failed to auto-save draft:', e);
      }
    }, 350);

    return () => clearTimeout(saveTimer);
  }, [
    isOpen,
    activeTrade,
    portfolio,
    pair,
    direction,
    outcome,
    tradeStatus,
    trendAlignment,
    isScreenshotOnly,
    invalidationReason,
    useSetup,
    setupType,
    useTimeframe,
    timeframe,
    usePoints,
    tpPoints,
    slPoints,
    fiboTpLevel,
    hasScaleIn,
    scaleInCount,
    scaleInType,
    scaleInOutcome,
    scaleInTradeStatus,
    scaleInTrendAlignment,
    scaleInRiskReward,
    scaleInPnL,
    scaleInLossReason,
    scaleInNotes,
    scaleInEntries,
    session,
    date,
    riskReward,
    pnl,
    notes,
    screenshots,
  ]);

  if (!isOpen) return null;

  // Simple Fibo target selection (records which TP target, without auto-calculating/overwriting points or RR)
  const handleSelectFibo = (level: 'TP1' | 'TP2' | 'TP3') => {
    setFiboTpLevel((prev) => (prev === level ? 'Custom' : level));
  };

  const handleAddScaleInEntry = () => {
    const nextOrderNum = scaleInEntries.length + 2; // e.g. ไม้ที่ 2, ไม้ที่ 3
    const newEntry: ScaleInEntry = {
      id: `scale_${Date.now()}_${nextOrderNum}`,
      orderNumber: nextOrderNum,
      direction: direction,
      portfolio: portfolio,
      pair: pair,
      outcome: outcome || 'WIN',
      tradeStatus: tradeStatus || 'COMPLETED',
      trendAlignment: trendAlignment || 'PRO_TREND',
      setupType: useSetup ? setupType : undefined,
      session: session,
      timeframe: useTimeframe ? timeframe : undefined,
      date: date || getNowLocalISOString(),
      entryPrice: '',
      lotSize: undefined,
      useSetup: useSetup,
      useTimeframe: useTimeframe,
      usePoints: usePoints,
      slPoints: usePoints && slPoints ? parseFloat(slPoints) : undefined,
      tpPoints: usePoints && tpPoints ? parseFloat(tpPoints) : undefined,
      fiboTpLevel: usePoints ? fiboTpLevel : undefined,
      riskReward: typeof riskReward === 'number' ? riskReward : outcome === 'LOSE' ? -1.0 : 2.0,
      pnl: outcome === 'LOSE' ? -100 : 100,
      lossReason: outcome === 'LOSE' ? invalidationReason || safeScaleInLossReasons[0] : undefined,
      notes: '',
    };
    const updated = [...scaleInEntries, newEntry];
    setScaleInEntries(updated);
    setScaleInCount(updated.length);
  };

  const handleCopyFromMainToScaleIn = (index: number) => {
    const updated = [...scaleInEntries];
    const current = updated[index] || {};
    const nextOrderNum = current.orderNumber || index + 2;
    updated[index] = {
      ...current,
      id: current.id || `scale_${Date.now()}_${nextOrderNum}`,
      orderNumber: nextOrderNum,
      direction: direction,
      portfolio: portfolio,
      pair: pair,
      outcome: outcome || 'WIN',
      tradeStatus: tradeStatus || 'COMPLETED',
      trendAlignment: trendAlignment || 'PRO_TREND',
      setupType: useSetup ? setupType : undefined,
      session: session,
      timeframe: useTimeframe ? timeframe : undefined,
      date: date || getNowLocalISOString(),
      useSetup: useSetup,
      useTimeframe: useTimeframe,
      usePoints: usePoints,
      slPoints: usePoints && slPoints ? parseFloat(slPoints) : undefined,
      tpPoints: usePoints && tpPoints ? parseFloat(tpPoints) : undefined,
      fiboTpLevel: usePoints ? fiboTpLevel : undefined,
      riskReward: typeof riskReward === 'number' ? riskReward : outcome === 'LOSE' ? -1.0 : 2.0,
      pnl: outcome === 'LOSE' ? -(parseFloat(pnl) || 100) : (parseFloat(pnl) || 100),
      lossReason: outcome === 'LOSE' ? invalidationReason || safeScaleInLossReasons[0] : undefined,
    };
    setScaleInEntries(updated);
  };

  const handleRemoveScaleInEntry = (index: number) => {
    const updated = scaleInEntries.filter((_, i) => i !== index);
    setScaleInEntries(updated);
    setScaleInCount(Math.max(1, updated.length));
  };

  const handleClearAllScaleInEntries = () => {
    setScaleInEntries([]);
  };

  const handleUpdateScaleInEntry = (index: number, field: keyof ScaleInEntry, val: any) => {
    const updated = [...scaleInEntries];
    const current = updated[index] || {};
    let nextEntry = { ...current, [field]: val };

    if (field === 'outcome') {
      if (val === 'LOSE') {
        if (!current.riskReward || current.riskReward > 0) {
          nextEntry.riskReward = -1.0;
        }
        if (typeof current.pnl === 'number' && current.pnl > 0) {
          nextEntry.pnl = -Math.abs(current.pnl);
        }
      } else if (val === 'WIN') {
        if (typeof current.riskReward === 'number' && current.riskReward < 0) {
          nextEntry.riskReward = Math.abs(current.riskReward);
        } else if (!current.riskReward) {
          nextEntry.riskReward = 2.0;
        }
        if (typeof current.pnl === 'number' && current.pnl < 0) {
          nextEntry.pnl = Math.abs(current.pnl);
        }
      } else if (val === 'BE') {
        nextEntry.riskReward = 0;
        nextEntry.pnl = 0;
      }
    }

    updated[index] = nextEntry;
    setScaleInEntries(updated);
  };

  const handleAddScreenshot = () => {
    if (imageUrlInput.trim()) {
      setScreenshots([...screenshots, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSyncCurrentTimeAndSession = () => {
    setDate(getNowLocalISOString());
    setSession(detectAutoSession());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPnL = parseFloat(pnl) || 0;
    let finalPnL = 0;
    if (tradeStatus === 'MISSED') {
      finalPnL = 0;
    } else if (outcome === 'LOSE' || parsedPnL < 0) {
      finalPnL = -Math.abs(parsedPnL);
    } else if (parsedPnL === 0) {
      finalPnL = 0;
    } else {
      finalPnL = Math.abs(parsedPnL);
    }

    const rawRR = Number(riskReward) || 0;
    let safeRR = 0;
    if (outcome === 'LOSE' || rawRR < 0) {
      safeRR = -Math.abs(rawRR || 1);
    } else if (rawRR === 0) {
      safeRR = 0;
    } else {
      safeRR = Math.abs(rawRR);
    }

    const rawScaleInPnL = parseFloat(scaleInPnL) || 0;
    let finalScaleInPnL = 0;
    if (scaleInOutcome === 'LOSE' || rawScaleInPnL < 0) {
      finalScaleInPnL = -Math.abs(rawScaleInPnL);
    } else if (scaleInOutcome === 'BE' || rawScaleInPnL === 0) {
      finalScaleInPnL = 0;
    } else {
      finalScaleInPnL = Math.abs(rawScaleInPnL);
    }

    const rawScaleInRR = Number(scaleInRiskReward) || 0;
    let finalScaleInRR = 0;
    if (scaleInOutcome === 'LOSE' || rawScaleInRR < 0) {
      finalScaleInRR = -Math.abs(rawScaleInRR || 1);
    } else if (scaleInOutcome === 'BE' || rawScaleInRR === 0) {
      finalScaleInRR = 0;
    } else {
      finalScaleInRR = Math.abs(rawScaleInRR);
    }

    const newOrUpdatedTrade: Trade = {
      id: activeTrade ? activeTrade.id : `trade_${Date.now()}`,
      portfolio,
      pair,
      direction,
      outcome: tradeStatus === 'MISSED' ? 'MISS' : outcome,
      tradeStatus,
      trendAlignment,
      isScreenshotOnly,
      setupType: useSetup ? setupType : undefined,
      setupDescription: useSetup ? selectedSetupDetails?.description : undefined,
      session,
      timeframe: useTimeframe ? timeframe : undefined,
      riskReward: safeRR,
      pnl: finalPnL,
      date,
      screenshots: screenshots.length > 0 ? screenshots : [DEFAULT_SCREENSHOT],
      notes,
      tpPoints: usePoints ? parseFloat(tpPoints) || 0 : undefined,
      slPoints: usePoints ? parseFloat(slPoints) || 0 : undefined,
      fiboTpLevel: usePoints ? fiboTpLevel : undefined,
      invalidationReason: outcome === 'LOSE' ? invalidationReason : undefined,
      hasScaleIn,
      scaleInCount: hasScaleIn ? Math.max(1, Number(scaleInCount) || 1) : undefined,
      scaleInType: hasScaleIn ? scaleInType : undefined,
      scaleInOutcome: hasScaleIn ? scaleInOutcome : undefined,
      scaleInTradeStatus: hasScaleIn ? scaleInTradeStatus : undefined,
      scaleInTrendAlignment: hasScaleIn ? scaleInTrendAlignment : undefined,
      scaleInRiskReward: hasScaleIn ? finalScaleInRR : undefined,
      scaleInPnL: hasScaleIn ? finalScaleInPnL : undefined,
      scaleInLossReason: hasScaleIn && scaleInOutcome === 'LOSE' ? scaleInLossReason : undefined,
      scaleInNotes: hasScaleIn && scaleInNotes.trim() ? scaleInNotes.trim() : undefined,
      scaleInEntries: hasScaleIn && scaleInEntries.length > 0 ? scaleInEntries : undefined,
    };

    // Clean up draft on successful save
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear draft on save:', err);
    }
    setRestoredFromDraft(false);

    onSaveTrade(newOrUpdatedTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#06080e] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#030407]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-[0_0_12px_rgba(203,213,225,0.3)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#f8fafc] font-['Outfit',sans-serif] flex items-center gap-2">
                <span>{activeTrade ? 'แก้ไขข้อมูลไม้เทรด' : 'บันทึกไม้เทรดใหม่ (Gengar - Wyk Labs Data Terminal)'}</span>
                {isScreenshotOnly && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
                    เก็บภาพเทรด (Backtest)
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                บันทึกและคำนวณสถิติ Win Rate, RR และ Edge แบบ Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-['Outfit',sans-serif]">
          {/* Mobile Back Navigation & Draft Persistence Banner */}
          {!activeTrade && (
            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
              restoredFromDraft
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-[#0e131f] border-[#1e293b] text-slate-400'
            }`}>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    restoredFromDraft ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    restoredFromDraft ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                </span>
                <span className="leading-tight">
                  {restoredFromDraft
                    ? 'กู้คืนเนื้อหาที่บันทึกค้างไว้ล่าสุดแล้ว (กดย้อนกลับข้อมูลไม่หาย)'
                    : 'ระบบจำข้อมูลอัตโนมัติ (เปิดผ่านมือถือ/Google กดย้อนกลับเนื้อหาจะไม่หาย)'}
                </span>
              </div>

              {restoredFromDraft && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 text-[10px] font-mono font-bold shrink-0 transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างเริ่มใหม่</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. PORTFOLIO & REAL VS BACKTEST TOGGLE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Portfolio Selector (Personal vs Funded) */}
            <div className="flex items-center justify-between bg-[#030407] p-1.5 rounded-xl border border-[#1e293b]">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                <span>พอร์ต:</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPortfolio('personal')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    portfolio === 'personal'
                      ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  พอร์ตส่วนตัว
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolio('funded')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    portfolio === 'funded'
                      ? 'bg-[#38bdf8] text-black shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  พอร์ตกองทุน
                </button>
              </div>
            </div>

            {/* Live Trade vs Screenshot Only (Backtest / Case Study) Button */}
            <button
              type="button"
              onClick={() => setIsScreenshotOnly(!isScreenshotOnly)}
              className={`p-2 rounded-xl border flex items-center justify-between transition-all font-mono text-xs ${
                isScreenshotOnly
                  ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-[#030407] border-[#1e293b] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-bold">
                    {isScreenshotOnly ? '📷 เก็บภาพเทรด (Backtest)' : '⚡ บันทึกเทรดจริง (Live)'}
                  </div>
                  <div className="text-[9px] opacity-75">
                    {isScreenshotOnly ? 'ไม่กระทบพอร์ตจริง / แยกสถิติ' : 'คำนวณเข้ายอดพอร์ตจริง'}
                  </div>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isScreenshotOnly
                    ? 'border-[#38bdf8] bg-[#38bdf8] text-black'
                    : 'border-[#1e293b] bg-[#0e131f]'
                }`}
              >
                {isScreenshotOnly && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. OUTCOME (WIN / LOSE), STATUS (COMPLETED/RUNNING/MISSED), AND TREND ALIGNMENT */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#030407] border border-[#1e293b]">
            {/* Outcome (WIN / LOSE) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                ผลลัพธ์การเทรด (Outcome):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOutcome('WIN');
                    if (tradeStatus === 'MISSED') setTradeStatus('COMPLETED');
                    if (riskReward <= 0) setRiskReward(2.0);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                    outcome === 'WIN' && tradeStatus !== 'MISSED'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>WIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOutcome('LOSE');
                    if (tradeStatus === 'MISSED') setTradeStatus('COMPLETED');
                    // Set -1 RR for loss
                    setRiskReward(-1.0);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-mono font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                    outcome === 'LOSE' && tradeStatus !== 'MISSED'
                      ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>LOSE</span>
                </button>
              </div>
            </div>

            {/* Trade Status (Completed / Running / Missed) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                สถานะของไม้ (Trade Status):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTradeStatus('COMPLETED')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                    tradeStatus === 'COMPLETED'
                      ? 'bg-slate-800 text-slate-200 border-slate-500 shadow-[0_0_8px_rgba(203,213,225,0.2)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <span>COMPLETED</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeStatus('RUNNING')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                    tradeStatus === 'RUNNING'
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <span>RUNNING</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTradeStatus('MISSED')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1 ${
                    tradeStatus === 'MISSED'
                      ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <span>MISSED</span>
                </button>
              </div>
            </div>

            {/* Trend Alignment (ตามเทรนด์ หรือ สวนเทรนด์) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                กลยุทธ์ตามเทรนด์ หรือ สวนเทรนด์:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTrendAlignment('PRO_TREND')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    trendAlignment === 'PRO_TREND'
                      ? 'bg-blue-950 text-blue-300 border-blue-600/60 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>ตามเทรนด์ (Pro-Trend)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrendAlignment('COUNTER_TREND')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    trendAlignment === 'COUNTER_TREND'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-700/60 shadow-[0_0_8px_rgba(225,29,72,0.3)]'
                      : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>สวนเทรนด์ (Counter-Trend)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. PAIR, TIMEFRAME, AUTO-SESSION, AUTO-DATE/TIME */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Pair */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400">คู่สินทรัพย์:</label>
                {onOpenManagePairs && (
                  <button
                    type="button"
                    onClick={onOpenManagePairs}
                    className="text-[10px] font-mono text-slate-300 hover:text-white hover:underline"
                  >
                    + จัดการ
                  </button>
                )}
              </div>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                {pairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe with Toggle on/off */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400">Timeframe:</label>
                <button
                  type="button"
                  onClick={() => setUseTimeframe(!useTimeframe)}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-all ${
                    useTimeframe
                      ? 'bg-blue-950 text-blue-300 border border-blue-600/40 font-bold'
                      : 'bg-[#0e131f] text-slate-400 border border-[#1e293b]'
                  }`}
                  title="เปิด/ปิดการระบุ Timeframe"
                >
                  {useTimeframe ? 'เปิดใช้งาน' : 'ไม่ระบุ'}
                </button>
              </div>
              {useTimeframe ? (
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none animate-fade-in"
                >
                  {TIMEFRAME_PRESETS.map((tf) => (
                    <option key={tf} value={tf}>
                      {tf}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  onClick={() => setUseTimeframe(true)}
                  className="w-full bg-[#0e131f]/40 border border-dashed border-[#1e293b] hover:border-slate-500 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-500 text-center cursor-pointer transition-colors"
                  title="คลิกเพื่อเปิดระบุ Timeframe"
                >
                  - ปิดไว้ -
                </div>
              )}
            </div>

            {/* Session (Auto-detected) */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Session (อัตโนมัติ):
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              >
                <option value="Asia (06:00-14:00)">Asia (06:00-14:00)</option>
                <option value="London (14:00-19:00)">London (14:00-19:00)</option>
                <option value="NY Overlap (19:00-22:00)">NY Overlap (19:00-22:00)</option>
                <option value="New York (19:00-03:00)">New York (19:00-03:00)</option>
                <option value="Off-Session (นอกเวลา)">Off-Session (นอกเวลา)</option>
              </select>
            </div>

            {/* Date & Time with Auto-Sync Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400">วันเวลา (Auto):</label>
                <button
                  type="button"
                  onClick={handleSyncCurrentTimeAndSession}
                  className="text-[9px] font-mono text-slate-300 hover:text-white flex items-center gap-0.5 hover:underline"
                  title="ซิงค์เวลาและ Session ปัจจุบันอัตโนมัติ"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>ซิงค์</span>
                </button>
              </div>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. SETUP (COLLAPSIBLE / OFF BY DEFAULT) */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-xs font-mono font-bold text-[#f8fafc]">
                  ระบุท่าเทรด (Setups)
                </span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenManageSetups && (
                  <button
                    type="button"
                    onClick={onOpenManageSetups}
                    className="text-[10px] font-mono text-slate-300 hover:text-white hover:underline"
                  >
                    + จัดการท่าเทรด
                  </button>
                )}
                {/* Toggle on/off */}
                <button
                  type="button"
                  onClick={() => setUseSetup(!useSetup)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    useSetup ? 'bg-blue-600' : 'bg-[#0e131f] border border-[#1e293b]'
                  }`}
                  title="เปิด/ปิดการบันทึกท่าเทรด"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      useSetup ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {useSetup && (
              <div className="space-y-2 animate-fade-in">
                <select
                  value={setupType}
                  onChange={(e) => setSetupType(e.target.value)}
                  className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                >
                  {safeSetups.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name} {s.enabled === false ? '(ปิดใช้งาน)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 5. RISK REWARD & PROFIT/LOSS PNL ($) + DISTANCE TP/SL + LOSS REASONS */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-3.5">
            {/* Quick Result Selector directly in RR & PnL Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs font-mono font-bold text-[#f8fafc]">
                    สัดส่วน Risk : Reward (RR) & กำไร/ขาดทุน ($ PnL)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    เลือกผลลัพธ์เพื่อระบุสัดส่วน RR และกำไรสุทธิหรือขาดทุนสุทธิ
                  </span>
                </div>
              </div>

              {/* Direct Result Selector Pills */}
              <div className="flex rounded-xl bg-[#0e131f] p-1 border border-[#1e293b] gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setOutcome('WIN');
                    if (tradeStatus === 'MISSED') setTradeStatus('COMPLETED');
                    if (riskReward <= 0) setRiskReward(2.0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                    outcome === 'WIN' && riskReward > 0 && tradeStatus !== 'MISSED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ บวก R (WIN)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOutcome('LOSE');
                    if (tradeStatus === 'MISSED') setTradeStatus('COMPLETED');
                    if (riskReward >= 0) setRiskReward(-1.0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                    (outcome === 'LOSE' || riskReward < 0) && tradeStatus !== 'MISSED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                  <span>- ลบ R (LOSE/SL)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOutcome('WIN');
                    setRiskReward(0);
                    setPnl('0');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    riskReward === 0 || parseFloat(pnl) === 0
                      ? 'bg-slate-700 text-slate-200 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>0 R (เสมอทุน BE)</span>
                </button>
              </div>
            </div>

            {/* Risk:Reward Row with Free Manual Input (+RR and -R) */}
            <div className="space-y-2.5 p-3 rounded-xl bg-[#0e131f] border border-[#1e293b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs font-mono font-bold text-slate-200">
                      {outcome === 'LOSE' || riskReward < 0
                        ? 'สัดส่วนขาดทุน (-R / Loss RR):'
                        : riskReward === 0
                        ? 'สัดส่วนเสมอทุน (0 R / Breakeven):'
                        : 'สัดส่วนกำไร (+RR / Profit RR):'}
                    </label>
                    <span
                      className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded border ${
                        outcome === 'LOSE' || riskReward < 0
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(225,29,72,0.25)]'
                          : riskReward === 0
                          ? 'bg-slate-800 text-slate-300 border-slate-600'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      {outcome === 'LOSE' || riskReward < 0
                        ? `${riskReward < 0 ? riskReward : -Math.abs(riskReward || 1)} R (ขาดทุน/ชน SL)`
                        : riskReward === 0
                        ? '0.00 R (เสมอทุน)'
                        : `+${Math.abs(riskReward)} R (กำไร 1:${Math.abs(riskReward)})`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    พิมพ์ตัวเลขได้อิสระ เช่น 2.5, 1.8, -1.0 หรือกดปุ่ม +/- เพื่อสลับบวก/ลบ
                  </span>
                </div>

                {/* RR Free-Text Input & Quick Sign Toggle Button */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Dedicated +/- Sign Flip Button for Mobile Telephones */}
                  <button
                    type="button"
                    onClick={() => {
                      const flipped = -riskReward;
                      setRiskReward(flipped);
                      if (flipped < 0) {
                        setOutcome('LOSE');
                      } else if (flipped > 0) {
                        setOutcome('WIN');
                      }
                    }}
                    title="สลับเครื่องหมายบวก/ลบ (+/-)"
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-black border transition-all ${
                      outcome === 'LOSE' || riskReward < 0
                        ? 'bg-rose-900/60 text-rose-200 border-rose-600 hover:bg-rose-800'
                        : 'bg-emerald-900/60 text-emerald-200 border-emerald-600 hover:bg-emerald-800'
                    }`}
                  >
                    {outcome === 'LOSE' || riskReward < 0 ? 'สลับเป็น +RR' : 'สลับเป็น -R'}
                  </button>

                  <div className="relative">
                    <span
                      className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold ${
                        outcome === 'LOSE' || riskReward < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {outcome === 'LOSE' || riskReward < 0 ? '-' : '+'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={riskReward !== 0 ? Math.abs(riskReward) : 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const safeVal = isNaN(val) ? 0 : Math.abs(val);
                        if (outcome === 'LOSE') {
                          setRiskReward(-safeVal);
                        } else {
                          setRiskReward(safeVal);
                        }
                      }}
                      className={`w-24 bg-[#030407] border rounded-xl pl-6 pr-2 py-1.5 text-sm font-mono font-extrabold text-center focus:outline-none ${
                        outcome === 'LOSE' || riskReward < 0
                          ? 'border-rose-700/80 text-rose-300 focus:border-rose-400 bg-rose-950/20'
                          : 'border-emerald-700/80 text-emerald-300 focus:border-emerald-400 bg-emerald-950/20'
                      }`}
                      placeholder="เช่น 2.0"
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">RR</span>
                </div>
              </div>

              {/* Quick RR Presets Bar */}
              <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-[#1e293b]/60">
                <span className="text-[10px] font-mono text-slate-400 mr-1">ปุ่มลัด RR:</span>
                {outcome === 'LOSE' || riskReward < 0 ? (
                  <>
                    {[
                      { label: '-1.0 R', val: -1.0 },
                      { label: '-2.0 R', val: -2.0 },
                      { label: '-3.0 R', val: -3.0 },
                      { label: '-4.0 R', val: -4.0 },
                      { label: '-5.0 R', val: -5.0 },
                      { label: '-0.5 R', val: -0.5 },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setRiskReward(item.val);
                          setOutcome('LOSE');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border transition-all ${
                          riskReward === item.val
                            ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)] scale-105'
                            : 'bg-[#030407] text-slate-300 border-[#1e293b] hover:text-white hover:border-rose-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome('WIN');
                        setRiskReward(2.0);
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-800/60 hover:border-emerald-600 transition-all ml-auto flex items-center gap-1"
                    >
                      <span>สลับเป็นกำไร (+RR)</span>
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { label: '+1.0 R', val: 1 },
                      { label: '+1.5 R', val: 1.5 },
                      { label: '+2.0 R', val: 2 },
                      { label: '+2.5 R', val: 2.5 },
                      { label: '+3.0 R', val: 3 },
                      { label: '+4.0 R', val: 4 },
                      { label: '+5.0 R', val: 5 },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setRiskReward(item.val);
                          setOutcome('WIN');
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          riskReward === item.val
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                            : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white hover:border-emerald-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setOutcome('LOSE');
                        setRiskReward(-1.0);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-400 bg-rose-950/30 hover:text-rose-200 border border-rose-900/60 hover:border-rose-600 transition-all ml-auto flex items-center gap-1"
                    >
                      <span>-1.0 R (ระบุขาดทุน)</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* TP / SL in Points with Fibo Buttons (TP1 / TP2 / TP3) */}
            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>ระบุระยะจุด & Fibo Targets (กี่จุด):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setUsePoints(!usePoints)}
                  className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                    usePoints ? 'bg-blue-600' : 'bg-[#030407] border border-[#1e293b]'
                  }`}
                  title="เปิด/ปิดการคำนวณระยะจุด"
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                      usePoints ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {usePoints && (
                <div className="space-y-2 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-0.5">
                        ระยะ SL (จุด):
                      </label>
                      <input
                        type="number"
                        value={slPoints}
                        onChange={(e) => setSlPoints(e.target.value)}
                        placeholder="100 จุด"
                        className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-200 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-blue-400 block mb-0.5">
                        ระยะ TP (จุด):
                      </label>
                      <input
                        type="number"
                        value={tpPoints}
                        onChange={(e) => setTpPoints(e.target.value)}
                        placeholder="200 จุด"
                        className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-2.5 py-1.5 text-xs font-mono text-blue-400 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fibo Target Selection Tag */}
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 mb-1">
                      เป้าหมาย Fibonacci TP:
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectFibo('TP1')}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          fiboTpLevel === 'TP1'
                            ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                            : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                        }`}
                      >
                        TP1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFibo('TP2')}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          fiboTpLevel === 'TP2'
                            ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                            : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                        }`}
                      >
                        TP2
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFibo('TP3')}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          fiboTpLevel === 'TP3'
                            ? 'bg-slate-700 text-white border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.25)]'
                            : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                        }`}
                      >
                        TP3
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PnL ($) Section with Dedicated Profit vs Loss Switch and Free Manual Input */}
            <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-[11px] font-mono text-slate-300 font-bold">
                    {outcome === 'LOSE' || parseFloat(pnl) < 0
                      ? 'จำนวนเงินขาดทุน (-$ Loss PnL):'
                      : parseFloat(pnl) === 0
                      ? 'เสมอทุน ($0 Breakeven):'
                      : 'จำนวนเงินกำไร (+$ Profit PnL):'}
                  </label>
                  <span
                    className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded border ${
                      outcome === 'LOSE' || parseFloat(pnl) < 0
                        ? 'bg-rose-950 text-rose-300 border-rose-600/50 shadow-[0_0_8px_rgba(225,29,72,0.25)]'
                        : parseFloat(pnl) === 0
                        ? 'bg-slate-800 text-slate-300 border-slate-600'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                    }`}
                  >
                    {outcome === 'LOSE' || parseFloat(pnl) < 0
                      ? `-$${Math.abs(parseFloat(pnl) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} (ขาดทุน)`
                      : parseFloat(pnl) === 0
                      ? '$0.00 (เสมอทุน)'
                      : `+$${Math.abs(parseFloat(pnl) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} (กำไร)`}
                  </span>
                </div>

                {/* Profit / Loss / BE Selector Tabs */}
                <div className="flex rounded-lg bg-[#030407] p-0.5 border border-[#1e293b]">
                  <button
                    type="button"
                    onClick={() => {
                      setOutcome('WIN');
                      if (riskReward <= 0) setRiskReward(2.0);
                      if (parseFloat(pnl) < 0) setPnl(String(Math.abs(parseFloat(pnl))));
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      outcome === 'WIN' && parseFloat(pnl) > 0
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    + กำไร (Profit)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOutcome('LOSE');
                      if (riskReward >= 0) setRiskReward(-1.0);
                      if (parseFloat(pnl) === 0) setPnl('100');
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      outcome === 'LOSE' || parseFloat(pnl) < 0
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    - ขาดทุน (Loss)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPnl('0');
                      setRiskReward(0);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      parseFloat(pnl) === 0
                        ? 'bg-slate-700 text-slate-200 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    $0 BE
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                {/* Dedicated +/- Sign Flip Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (outcome === 'LOSE') {
                      setOutcome('WIN');
                      if (riskReward < 0) setRiskReward(Math.abs(riskReward));
                    } else {
                      setOutcome('LOSE');
                      if (riskReward > 0) setRiskReward(-Math.abs(riskReward));
                    }
                  }}
                  title="สลับโหมด กำไร (+) หรือ ขาดทุน (-)"
                  className={`px-2.5 py-2 rounded-xl text-xs font-mono font-black border shrink-0 transition-all ${
                    outcome === 'LOSE'
                      ? 'bg-rose-900/60 text-rose-200 border-rose-600 hover:bg-rose-800'
                      : 'bg-emerald-900/60 text-emerald-200 border-emerald-600 hover:bg-emerald-800'
                  }`}
                >
                  {outcome === 'LOSE' ? 'สลับเป็น +กำไร' : 'สลับเป็น -ขาดทุน'}
                </button>

                <div className="relative flex-1 min-w-[140px]">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold ${
                      outcome === 'LOSE' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {outcome === 'LOSE' ? '-$' : '+$'}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={pnl !== '0' ? Math.abs(parseFloat(pnl) || 0) : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPnl(val);
                    }}
                    placeholder={
                      outcome === 'LOSE'
                        ? 'พิมพ์จำนวนเงินที่ขาดทุน เช่น 100, 250 หรือ 500'
                        : 'พิมพ์จำนวนเงินกำไร เช่น 300, 500 หรือ 1200'
                    }
                    className={`w-full bg-[#030407] border rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-bold focus:outline-none ${
                      outcome === 'LOSE'
                        ? 'border-rose-900/80 focus:border-rose-500 text-rose-200 bg-rose-950/20'
                        : 'border-emerald-900/80 focus:border-emerald-500 text-emerald-200 bg-emerald-950/20'
                    }`}
                  />
                </div>

                <div className="flex gap-1 shrink-0 flex-wrap">
                  {outcome === 'LOSE'
                    ? [50, 100, 200, 300, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPnl(String(preset))}
                          className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                            Math.abs(parseFloat(pnl) || 0) === preset
                              ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)]'
                              : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white hover:border-rose-800'
                          }`}
                        >
                          -${preset}
                        </button>
                      ))
                    : [100, 200, 300, 500, 1000, 2000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPnl(String(preset))}
                          className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                            Math.abs(parseFloat(pnl) || 0) === preset
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                              : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white hover:border-emerald-800'
                          }`}
                        >
                          +${preset}
                        </button>
                      ))}
                </div>
              </div>
            </div>

            {/* Invalidation / Loss Reason when Outcome is LOSE */}
            {outcome === 'LOSE' && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-600/40 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-rose-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>เหตุผลที่แพ้ / คัดลอส (Invalidation / Loss Reason):</span>
                  </label>
                  {onOpenManageInvalidationReasons && (
                    <button
                      type="button"
                      onClick={onOpenManageInvalidationReasons}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>+ จัดการเหตุผลแพ้</span>
                    </button>
                  )}
                </div>
                <select
                  value={invalidationReason}
                  onChange={(e) => setInvalidationReason(e.target.value)}
                  className="w-full bg-[#030407] border border-rose-900/60 focus:border-rose-500 rounded-xl px-3 py-2 text-xs font-mono text-rose-200 focus:outline-none"
                >
                  {safeInvalidationReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. การเติมไม้ในออเดอร์ (SCALE-IN / LAYERING / PYRAMIDING) */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-xl bg-[#030407] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs font-mono font-bold text-[#f8fafc] flex items-center gap-1.5">
                    <span>การเติมไม้ในออเดอร์ (Scale-in / Layering)</span>
                    {hasScaleIn && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600/40 font-bold animate-fade-in">
                        เติม +{scaleInCount} ไม้
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    บันทึกว่าชุดนี้มีการกดเติมไม้เพิ่มระหว่างทางหรือไม่
                  </span>
                </div>
              </div>

              {/* Toggle on/off */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !hasScaleIn;
                  setHasScaleIn(nextState);
                  if (nextState && scaleInCount < 1) {
                    setScaleInCount(1);
                  }
                }}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  hasScaleIn ? 'bg-blue-600' : 'bg-[#0e131f] border border-[#1e293b]'
                }`}
                title="เปิด/ปิดการเติมไม้ในออเดอร์นี้"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hasScaleIn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasScaleIn && (
              <div className="p-3.5 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-3.5 animate-fade-in">
                {/* 1. Quick Count Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>จำนวนไม้ที่กดเติมเพิ่ม (Scale-in Orders):</span>
                    </label>
                    <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-600/30">
                      รวมทั้งหมด {scaleInCount + 1} ไม้ (ไม้หลัก 1 + เติม {scaleInCount})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setScaleInCount(num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                          scaleInCount === num
                            ? 'bg-blue-950 text-blue-300 border-blue-600/50 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
                            : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                        }`}
                      >
                        +{num} ไม้
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[10px] font-mono text-slate-400">หรือระบุ:</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={scaleInCount}
                        onChange={(e) => setScaleInCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Technique / Strategy Select with Manage Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-300 font-bold">
                      รูปแบบ / เทคนิคการเติมไม้:
                    </label>
                    {onOpenManageScaleInTechniques && (
                      <button
                        type="button"
                        onClick={onOpenManageScaleInTechniques}
                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ จัดการเทคนิค</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={scaleInType}
                    onChange={(e) => setScaleInType(e.target.value)}
                    className="w-full bg-[#030407] border border-[#1e293b] focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none"
                  >
                    {safeScaleInTechniques.map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Scale-In Key Metrics & Layout identical to Main Trade */}
                <div className="p-3.5 rounded-xl bg-[#030407] border border-blue-900/40 space-y-3.5">
                  {/* Header & Quick Outcome Selector directly in Scale-in Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1e293b]">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#f8fafc]">
                            ข้อมูลผลลัพธ์ & สัดส่วน RR & กำไร/ขาดทุนของไม้เติม (Scale-in)
                          </span>
                          {scaleInEntries.some((e) => typeof e.pnl === 'number') && (
                            <button
                              type="button"
                              onClick={() => {
                                const totalSubPnL = scaleInEntries.reduce(
                                  (sum, e) => sum + (typeof e.pnl === 'number' ? e.pnl : 0),
                                  0
                                );
                                setScaleInPnL(String(Math.abs(totalSubPnL)));
                                if (totalSubPnL > 0) {
                                  setScaleInOutcome('WIN');
                                  setScaleInRiskReward((prev) => (prev < 0 ? Math.abs(prev) : prev || 2.0));
                                } else if (totalSubPnL < 0) {
                                  setScaleInOutcome('LOSE');
                                  setScaleInRiskReward((prev) => (prev > 0 ? -prev : prev || -1.0));
                                } else {
                                  setScaleInOutcome('BE');
                                  setScaleInRiskReward(0);
                                }
                              }}
                              className="text-[9px] font-mono text-[#38bdf8] hover:underline font-bold px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-600/40"
                              title="คำนวณรวม PnL จากไม้เสริมที่กรอกไว้ข้างล่าง"
                            >
                              รวมยอดจากไม้แยก
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          เลือกผลลัพธ์ของไม้เติมเพื่อระบุสัดส่วน RR และกำไร/ขาดทุนสุทธิ
                        </span>
                      </div>
                    </div>

                    {/* Direct Result Selector Pills for Scale-in */}
                    <div className="flex rounded-xl bg-[#0e131f] p-1 border border-[#1e293b] gap-1 self-start sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setScaleInOutcome('WIN');
                          if (scaleInTradeStatus === 'MISSED') setScaleInTradeStatus('COMPLETED');
                          if (scaleInRiskReward <= 0) setScaleInRiskReward(2.0);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                          scaleInOutcome === 'WIN' && scaleInTradeStatus !== 'MISSED'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ชนะ/กำไร (WIN)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScaleInOutcome('LOSE');
                          if (scaleInTradeStatus === 'MISSED') setScaleInTradeStatus('COMPLETED');
                          setScaleInRiskReward(-1.0);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                          scaleInOutcome === 'LOSE' && scaleInTradeStatus !== 'MISSED'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>แพ้/ขาดทุน (LOSE)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScaleInOutcome('BE');
                          setScaleInRiskReward(0);
                          setScaleInPnL('0');
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                          scaleInOutcome === 'BE' || (scaleInOutcome === 'WIN' && scaleInRiskReward === 0)
                            ? 'bg-slate-700 text-slate-200 shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>เสมอทุน (BE)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setScaleInOutcome('RUNNING');
                          setScaleInTradeStatus('RUNNING');
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                          scaleInOutcome === 'RUNNING'
                            ? 'bg-blue-900 text-blue-200 shadow-sm border border-blue-500/50'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>กำลังวิ่ง</span>
                      </button>
                    </div>
                  </div>

                  {/* Status & Trend Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Trade Status */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        สถานะของไม้เติม (Trade Status):
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['COMPLETED', 'RUNNING', 'MISSED'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setScaleInTradeStatus(st)}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold border transition-all text-center ${
                              scaleInTradeStatus === st
                                ? 'bg-blue-950 text-blue-300 border-blue-500 shadow-sm'
                                : 'bg-[#060913] text-slate-400 border-[#1e293b] hover:text-white'
                            }`}
                          >
                            {st === 'COMPLETED' ? 'จบไม้แล้ว' : st === 'RUNNING' ? 'กำลังวิ่ง' : 'ตกรถ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trend Alignment */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-300 block mb-1 font-bold">
                        กลยุทธ์ตามเทรนด์ หรือ สวนเทรนด์:
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setScaleInTrendAlignment('PRO_TREND')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold border transition-all text-center ${
                            scaleInTrendAlignment === 'PRO_TREND'
                              ? 'bg-blue-950 text-blue-300 border-blue-500 shadow-sm'
                              : 'bg-[#060913] text-slate-400 border-[#1e293b] hover:text-white'
                          }`}
                        >
                          ตามเทรนด์
                        </button>
                        <button
                          type="button"
                          onClick={() => setScaleInTrendAlignment('COUNTER_TREND')}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold border transition-all text-center ${
                            scaleInTrendAlignment === 'COUNTER_TREND'
                              ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-sm'
                              : 'bg-[#060913] text-slate-400 border-[#1e293b] hover:text-white'
                          }`}
                        >
                          สวนเทรนด์
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scale-in Risk:Reward (RR) Row */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-bold text-slate-200">
                            {scaleInOutcome === 'LOSE' || scaleInRiskReward < 0
                              ? 'สัดส่วนขาดทุนของไม้เติม (Scale-in Loss RR):'
                              : 'สัดส่วนกำไรของไม้เติม (Scale-in Risk : Reward RR):'}
                          </label>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              scaleInOutcome === 'LOSE' || scaleInRiskReward < 0
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(225,29,72,0.25)]'
                                : scaleInRiskReward === 0 || scaleInOutcome === 'BE'
                                ? 'bg-slate-800 text-slate-300 border-slate-600'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                            }`}
                          >
                            {scaleInOutcome === 'LOSE' || scaleInRiskReward < 0
                              ? `${scaleInRiskReward < 0 ? scaleInRiskReward : `-${scaleInRiskReward || 1}`} RR (ขาดทุน)`
                              : scaleInRiskReward === 0 || scaleInOutcome === 'BE'
                              ? '0 RR (เสมอทุน / BE)'
                              : `1 : ${scaleInRiskReward} RR (กำไร)`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {scaleInOutcome === 'LOSE' || scaleInRiskReward < 0
                            ? 'ไม้เติมแพ้/ขาดทุน ระบุติดลบ เช่น -1.0 RR หรือเลือกปุ่มลัดด้านขวา'
                            : 'ระบุอัตราส่วนกำไรของไม้เติม เช่น 1:2.0 RR หรือเลือกปุ่มลัด'}
                        </span>
                      </div>

                      {/* RR Input */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap justify-end">
                        <span className="text-xs font-mono text-slate-400">
                          {scaleInOutcome === 'LOSE' || scaleInRiskReward < 0 ? '' : '1 :'}
                        </span>
                        <input
                          type="number"
                          min="-500"
                          max="500"
                          step="0.1"
                          value={scaleInRiskReward}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const safeVal = isNaN(val) ? 0 : Math.min(500, Math.max(-500, val));
                            setScaleInRiskReward(safeVal);
                            if (safeVal < 0 && scaleInOutcome !== 'LOSE') {
                              setScaleInOutcome('LOSE');
                            } else if (safeVal > 0 && scaleInOutcome === 'LOSE') {
                              setScaleInOutcome('WIN');
                            }
                          }}
                          className={`w-24 bg-[#0e131f] border rounded-xl px-2.5 py-1.5 text-sm font-mono font-extrabold text-center focus:outline-none ${
                            scaleInOutcome === 'LOSE' || scaleInRiskReward < 0
                              ? 'border-rose-700/80 text-rose-300 focus:border-rose-400 bg-rose-950/20'
                              : 'border-slate-600 text-white focus:border-slate-300'
                          }`}
                          placeholder="เช่น -1 หรือ 2.0"
                        />
                        <span className="text-xs font-mono font-bold text-slate-300">RR</span>
                      </div>
                    </div>

                    {/* Quick RR Presets Bar */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-slate-400 mr-1">ปุ่มลัด RR ไม้เติม:</span>
                      {scaleInOutcome === 'LOSE' || scaleInRiskReward < 0 ? (
                        <>
                          {[
                            { label: '-1.0 R', val: -1.0 },
                            { label: '-2.0 R', val: -2.0 },
                            { label: '-3.0 R', val: -3.0 },
                            { label: '-4.0 R', val: -4.0 },
                            { label: '-5.0 R', val: -5.0 },
                            { label: '-0.5 R', val: -0.5 },
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setScaleInRiskReward(item.val);
                                setScaleInOutcome('LOSE');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border transition-all ${
                                scaleInRiskReward === item.val
                                  ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)] scale-105'
                                  : 'bg-[#0e131f] text-slate-300 border-[#1e293b] hover:text-white hover:border-rose-800'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setScaleInOutcome('WIN');
                              setScaleInRiskReward(2.0);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-emerald-300 border border-[#1e293b] hover:border-emerald-800 transition-all ml-auto"
                          >
                            สลับเป็นโหมดกำไร (+RR)
                          </button>
                        </>
                      ) : (
                        <>
                          {[1, 1.5, 2, 2.5, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setScaleInRiskReward(val);
                                setScaleInOutcome('WIN');
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                                scaleInRiskReward === val
                                  ? 'bg-blue-950 text-blue-300 border-blue-600 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
                                  : 'bg-[#0e131f] text-slate-400 border-[#1e293b] hover:text-white'
                              }`}
                            >
                              1:{val}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setScaleInOutcome('LOSE');
                              setScaleInRiskReward(-1.0);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-400 bg-rose-950/30 hover:text-rose-200 border border-rose-900/60 hover:border-rose-600 transition-all ml-auto flex items-center gap-1"
                          >
                            <span>-1.0 RR (ระบุไม้เติมขาดทุน)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Scale-in Net PnL ($) Section with Dedicated Profit vs Loss Switch */}
                  <div className="p-3 rounded-xl bg-[#0e131f] border border-[#1e293b] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-mono text-slate-300 font-bold">
                          {scaleInOutcome === 'LOSE'
                            ? 'ขาดทุนสุทธิของไม้เติม ($ Scale-in Loss PnL):'
                            : scaleInOutcome === 'WIN'
                            ? 'กำไรสุทธิของไม้เติม ($ Scale-in Profit PnL):'
                            : 'กำไร / ขาดทุนสุทธิของไม้เติม ($ Scale-in PnL):'}
                        </label>
                        <span
                          className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                            scaleInOutcome === 'LOSE'
                              ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                              : scaleInOutcome === 'WIN' && parseFloat(scaleInPnL) > 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {scaleInOutcome === 'LOSE'
                            ? `-$${Math.abs(parseFloat(scaleInPnL) || 0).toLocaleString()}`
                            : scaleInOutcome === 'BE'
                            ? '$0'
                            : `+$${Math.abs(parseFloat(scaleInPnL) || 0).toLocaleString()}`}
                        </span>
                      </div>

                      {/* Profit / Loss Type Selector for Scale-in */}
                      <div className="flex rounded-lg bg-[#030407] p-0.5 border border-[#1e293b]">
                        <button
                          type="button"
                          onClick={() => {
                            setScaleInOutcome('WIN');
                            if (scaleInRiskReward <= 0) setScaleInRiskReward(2.0);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                            scaleInOutcome === 'WIN'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          + กำไร (Profit)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScaleInOutcome('LOSE');
                            setScaleInRiskReward(-1.0);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                            scaleInOutcome === 'LOSE'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          - ขาดทุน (Loss)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <span
                          className={`absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold ${
                            scaleInOutcome === 'LOSE' ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {scaleInOutcome === 'LOSE' ? '-$' : '+$'}
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={scaleInPnL}
                          onChange={(e) => setScaleInPnL(e.target.value)}
                          placeholder={
                            scaleInOutcome === 'LOSE'
                              ? 'ระบุจำนวนเงินที่ไม้เติมขาดทุน เช่น 100 หรือ 300'
                              : 'ระบุจำนวนเงินกำไรของไม้เติม เช่น 300 หรือ 500'
                          }
                          className={`w-full bg-[#030407] border rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold focus:outline-none ${
                            scaleInOutcome === 'LOSE'
                              ? 'border-rose-900/80 focus:border-rose-500 text-rose-200 bg-rose-950/20'
                              : 'border-[#1e293b] focus:border-slate-400 text-[#f8fafc]'
                          }`}
                        />
                      </div>

                      <div className="flex gap-1 shrink-0 flex-wrap">
                        {scaleInOutcome === 'LOSE'
                          ? [50, 100, 200, 300, 500, 1000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setScaleInPnL(String(preset))}
                                className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                  parseFloat(scaleInPnL) === preset
                                    ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.35)]'
                                    : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white hover:border-rose-800'
                                }`}
                              >
                                -${preset}
                              </button>
                            ))
                          : [100, 200, 300, 500, 1000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setScaleInPnL(String(preset))}
                                className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                  parseFloat(scaleInPnL) === preset
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                                    : 'bg-[#030407] text-slate-400 border-[#1e293b] hover:text-white'
                                }`}
                              >
                                +${preset}
                              </button>
                            ))}
                      </div>
                    </div>
                  </div>

                  {/* Scale-in Invalidation / Loss Reason when Outcome is LOSE */}
                  {scaleInOutcome === 'LOSE' && (
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-600/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono text-rose-300 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>เหตุผลที่เติมไม้แล้วแพ้ (Scale-in Loss Reason):</span>
                        </label>
                        {onOpenManageScaleInLossReasons && (
                          <button
                            type="button"
                            onClick={onOpenManageScaleInLossReasons}
                            className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>+ จัดการเหตุผลแพ้ไม้เติม</span>
                          </button>
                        )}
                      </div>
                      <select
                        value={scaleInLossReason}
                        onChange={(e) => setScaleInLossReason(e.target.value)}
                        className="w-full bg-[#030407] border border-rose-900/60 focus:border-rose-500 rounded-xl px-3 py-2 text-xs font-mono text-rose-200 focus:outline-none"
                      >
                        {safeScaleInLossReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 4. Scale-In Notes */}
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1 font-bold">
                    ข้อคิด / รายละเอียดการเติมไม้ (Scale-in Notes):
                  </label>
                  <input
                    type="text"
                    value={scaleInNotes}
                    onChange={(e) => setScaleInNotes(e.target.value)}
                    placeholder="เช่น เติมไม้ 2 ตอนกราฟทะลุ High เดิม, ขยับ SL บังทุนแล้วเติมไม้ 3..."
                    className="w-full bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
                  />
                </div>

                {/* 5. Optional Granular Entry Breakdown */}
                <div className="pt-2 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      บันทึกแยกรายละเอียดแต่ละไม้ที่เติม (Optional):
                    </span>
                    <div className="flex items-center gap-2">
                      {scaleInEntries.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllScaleInEntries}
                          className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
                          title="ลบไม้ที่เติมทั้งหมด"
                        >
                          ล้างไม้เติมทั้งหมด
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleAddScaleInEntry}
                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline font-bold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ เพิ่มรายละเอียดไม้ {scaleInEntries.length + 2}</span>
                      </button>
                    </div>
                  </div>

                  {scaleInEntries.length > 0 && (
                    <div className="space-y-4">
                      {scaleInEntries.map((entry, idx) => (
                        <ScaleInEntryCard
                          key={entry.id || idx}
                          entry={entry}
                          index={idx}
                          mainDirection={direction}
                          mainPair={pair}
                          mainTimeframe={timeframe}
                          mainSession={session}
                          mainDate={date}
                          mainSetupType={setupType}
                          pairs={pairs}
                          safeSetups={safeSetups}
                          activeSetups={activeSetups}
                          safeInvalidationReasons={safeInvalidationReasons}
                          safeScaleInLossReasons={safeScaleInLossReasons}
                          onUpdate={(field, val) => handleUpdateScaleInEntry(idx, field, val)}
                          onRemove={() => handleRemoveScaleInEntry(idx)}
                          onCopyFromMain={() => handleCopyFromMainToScaleIn(idx)}
                          onOpenManageSetups={onOpenManageSetups}
                          onOpenManagePairs={onOpenManagePairs}
                          onOpenManageScaleInLossReasons={onOpenManageScaleInLossReasons}
                          onOpenManageInvalidationReasons={onOpenManageInvalidationReasons}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 7. NOTES & CHART SCREENSHOTS */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            {/* Notes */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                บันทึกเหตุผลและข้อคิด (Notes):
              </label>
              <textarea
                rows={2}
                placeholder="เช่น เบรกแนวต้านแล้วย่อสวย, ข่าวกระทบนิดหน่อย, คุมความเสี่ยงได้ตามแผน..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500 resize-none"
              />
            </div>

            {/* Screenshots / Order Images with full upload, drag&drop, paste and URL support */}
            <div>
              <OrderImageUploader
                images={screenshots}
                onChange={setScreenshots}
                label="รูปภาพกราฟวิเคราะห์ / สลิปออเดอร์ไม้หลัก (Chart & Order Slip Images)"
                subLabel="อัปโหลดภาพจากเครื่อง, ลากและวางไฟล์ (Drag & Drop), กดวางภาพ (Ctrl+V) หรือใส่ URL"
                maxImages={10}
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 9. SUBMIT BUTTON */}
          {/* ========================================================================= */}
          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#0e131f] hover:bg-[#1e293b] text-xs font-mono text-slate-400 hover:text-white rounded-xl border border-[#1e293b]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black text-xs font-mono font-extrabold rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.25)] flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{activeTrade ? 'บันทึกการแก้ไข' : '⚡ บันทึกไม้เทรด (Save Trade)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
