import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  subscribeToUserCloudData,
  saveUserCloudData,
  fetchUserCloudData,
} from './services/firebase';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { HomeTab } from './components/HomeTab';
import { TradeLogsTab } from './components/TradeLogsTab';
import { FundedTab } from './components/FundedTab';
import { EdgeFinderTab } from './components/EdgeFinderTab';
import { DailyRecapTab } from './components/DailyRecapTab';
import { ProfileTab } from './components/ProfileTab';
import { GmailHub } from './components/GmailHub';
import { AddEditTradeModal } from './components/AddEditTradeModal';
import { TradeDetailModal } from './components/TradeDetailModal';
import { AuthModal } from './components/AuthModal';
import { ManageCustomModal } from './components/ManageCustomModal';
import { ManageSetupsModal } from './components/ManageSetupsModal';
import { TraderCertificateModal } from './components/TraderCertificateModal';
import {
  DEFAULT_USERS,
  DEFAULT_SETUPS,
  DEFAULT_SETUP_ITEMS,
  DEFAULT_PAIRS,
  DEFAULT_EMOTIONS,
  DEFAULT_INVALIDATION_REASONS,
  DEFAULT_USER_TRADES_MAP,
  DEFAULT_FUNDED_ACCOUNTS,
} from './data/mockData';
import {
  User,
  Trade,
  ActiveTab,
  DailyTargetConfig,
  MilestoneConfig,
  MultiPortfolioConfig,
  DailyRecapItem,
  SetupItem,
  FundedAccountConfig,
} from './types';

export default function App() {
  // 1. Users State & Machine/Device Persistence
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('ghost_terminal_users');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ghost_terminal_current_user_id');
      if (saved && users.some((u: User) => u.id === saved)) {
        return saved;
      }
      return users[0]?.id || DEFAULT_USERS[0].id;
    } catch {
      return DEFAULT_USERS[0].id;
    }
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || DEFAULT_USERS[0];

  // 2. Isolated Trades per User
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_trades_${currentUserId}`);
      if (saved) return JSON.parse(saved);
      return (
        DEFAULT_USER_TRADES_MAP[currentUserId] ||
        DEFAULT_USER_TRADES_MAP['user_alex'] ||
        []
      );
    } catch {
      return DEFAULT_USER_TRADES_MAP['user_alex'] || [];
    }
  });

  // 3. Isolated Setups & SetupItems per User
  const [setupItems, setSetupItems] = useState<SetupItem[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_setup_items_${currentUserId}`);
      return saved ? JSON.parse(saved) : DEFAULT_SETUP_ITEMS;
    } catch {
      return DEFAULT_SETUP_ITEMS;
    }
  });

  const setups = setupItems.map((s) => s.name);

  // 4. Pairs & Emotions
  const [pairs, setPairs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_pairs_${currentUserId}`);
      return saved ? JSON.parse(saved) : DEFAULT_PAIRS;
    } catch {
      return DEFAULT_PAIRS;
    }
  });

  const [emotions, setEmotions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_emotions_${currentUserId}`);
      return saved ? JSON.parse(saved) : DEFAULT_EMOTIONS;
    } catch {
      return DEFAULT_EMOTIONS;
    }
  });

  const [invalidationReasons, setInvalidationReasons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_invalidation_reasons_${currentUserId}`);
      return saved ? JSON.parse(saved) : DEFAULT_INVALIDATION_REASONS;
    } catch {
      return DEFAULT_INVALIDATION_REASONS;
    }
  });

  // 5. Funded Accounts Sub-System Config
  const [fundedAccounts, setFundedAccounts] = useState<FundedAccountConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_funded_accounts_${currentUserId}`);
      return saved ? JSON.parse(saved) : DEFAULT_FUNDED_ACCOUNTS;
    } catch {
      return DEFAULT_FUNDED_ACCOUNTS;
    }
  });

  // 6. Configurations (Daily Targets, Milestones 1-5000, Portfolios)
  const [dailyTargetConfig, setDailyTargetConfig] = useState<DailyTargetConfig>(() => {
    try {
      const saved = localStorage.getItem(`ghost_daily_target_${currentUserId}`);
      return saved ? JSON.parse(saved) : { enabled: false, targetRR: 3, targetPnL: 500 };
    } catch {
      return { enabled: false, targetRR: 3, targetPnL: 500 };
    }
  });

  const [milestoneConfig, setMilestoneConfig] = useState<MilestoneConfig>(() => {
    try {
      const saved = localStorage.getItem(`ghost_milestones_${currentUserId}`);
      return saved ? JSON.parse(saved) : { enabled: true, targetTrades: 500 };
    } catch {
      return { enabled: true, targetTrades: 500 };
    }
  });

  const [multiPortfolioConfig, setMultiPortfolioConfig] = useState<MultiPortfolioConfig>(() => {
    try {
      const saved = localStorage.getItem(`ghost_portfolios_${currentUserId}`);
      return saved
        ? JSON.parse(saved)
        : { enabled: true, activePortfolio: 'all', personalBalance: 50000, fundedBalance: 100000 };
    } catch {
      return { enabled: true, activePortfolio: 'all', personalBalance: 50000, fundedBalance: 100000 };
    }
  });

  // 7. Daily Video Recaps
  const [recaps, setRecaps] = useState<DailyRecapItem[]>(() => {
    try {
      const saved = localStorage.getItem(`ghost_recaps_${currentUserId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Navigation & UI Modals State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [addTradeDefaultPortfolio, setAddTradeDefaultPortfolio] = useState<'personal' | 'funded'>('personal');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<Trade | null>(null);

  // Manage Pairs / Setups Modals
  const [isManageSetupsOpen, setIsManageSetupsOpen] = useState(false);
  const [manageCustomType, setManageCustomType] = useState<'pairs' | null>(null);

  // ==========================================
  // MULTI-DEVICE CLOUD SYNC & FIREBASE ENGINE
  // ==========================================
  const isSyncingFromFirestore = useRef(false);

  // 1. Firebase Auth listener for email-based login across any device
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const fbUid = fbUser.uid;
        const fbEmail = fbUser.email || '';
        const fbDisplayName = fbUser.displayName || fbEmail.split('@')[0] || 'Trader';

        // Add or update authenticated user in local state
        setUsers((prev) => {
          const exists = prev.find((u) => u.id === fbUid);
          if (exists) {
            return prev.map((u) =>
              u.id === fbUid
                ? { ...u, email: fbEmail, displayName: u.displayName || fbDisplayName, isFirebaseUser: true }
                : u
            );
          }
          const newUser: User = {
            id: fbUid,
            email: fbEmail,
            username: fbEmail.split('@')[0] || 'trader',
            displayName: fbDisplayName,
            title: 'Ghost Trader',
            accountBalance: 50000,
            fundedBalance: 100000,
            createdAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            isFirebaseUser: true,
          };
          return [newUser, ...prev];
        });

        setCurrentUserId(fbUid);

        // Fetch initial cloud profile from Firestore
        const cloudData = await fetchUserCloudData(fbUid);
        if (cloudData) {
          isSyncingFromFirestore.current = true;
          if (Array.isArray(cloudData.trades)) setTrades(cloudData.trades);
          if (Array.isArray(cloudData.setupItems)) setSetupItems(cloudData.setupItems);
          if (Array.isArray(cloudData.pairs)) setPairs(cloudData.pairs);
          if (Array.isArray(cloudData.emotions)) setEmotions(cloudData.emotions);
          if (Array.isArray(cloudData.invalidationReasons)) setInvalidationReasons(cloudData.invalidationReasons);
          if (Array.isArray(cloudData.fundedAccounts)) setFundedAccounts(cloudData.fundedAccounts);
          if (cloudData.dailyTargetConfig) setDailyTargetConfig(cloudData.dailyTargetConfig);
          if (cloudData.milestoneConfig) setMilestoneConfig(cloudData.milestoneConfig);
          if (cloudData.multiPortfolioConfig) setMultiPortfolioConfig(cloudData.multiPortfolioConfig);
          if (Array.isArray(cloudData.recaps)) setRecaps(cloudData.recaps);
          setTimeout(() => {
            isSyncingFromFirestore.current = false;
          }, 500);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Realtime subscription to Cloud Firestore for active user
  useEffect(() => {
    if (!currentUserId) return;

    const unsub = subscribeToUserCloudData(currentUserId, (cloudData) => {
      if (!cloudData) return;
      isSyncingFromFirestore.current = true;
      if (Array.isArray(cloudData.trades)) setTrades(cloudData.trades);
      if (Array.isArray(cloudData.setupItems)) setSetupItems(cloudData.setupItems);
      if (Array.isArray(cloudData.pairs)) setPairs(cloudData.pairs);
      if (Array.isArray(cloudData.emotions)) setEmotions(cloudData.emotions);
      if (Array.isArray(cloudData.invalidationReasons)) setInvalidationReasons(cloudData.invalidationReasons);
      if (Array.isArray(cloudData.fundedAccounts)) setFundedAccounts(cloudData.fundedAccounts);
      if (cloudData.dailyTargetConfig) setDailyTargetConfig(cloudData.dailyTargetConfig);
      if (cloudData.milestoneConfig) setMilestoneConfig(cloudData.milestoneConfig);
      if (cloudData.multiPortfolioConfig) setMultiPortfolioConfig(cloudData.multiPortfolioConfig);
      if (Array.isArray(cloudData.recaps)) setRecaps(cloudData.recaps);
      setTimeout(() => {
        isSyncingFromFirestore.current = false;
      }, 500);
    });

    return () => {
      if (unsub) unsub();
    };
  }, [currentUserId]);

  // 3. Push updates to Cloud Firestore & Local Server
  const syncToCloud = useCallback(async () => {
    if (!currentUserId || isSyncingFromFirestore.current) return;
    try {
      const payload = {
        userId: currentUserId,
        user: {
          ...currentUser,
          lastSyncedAt: new Date().toISOString(),
        },
        trades,
        setupItems,
        setups,
        pairs,
        emotions,
        invalidationReasons,
        fundedAccounts,
        dailyTargetConfig,
        milestoneConfig,
        multiPortfolioConfig,
        recaps,
        updatedAt: new Date().toISOString(),
      };

      // Direct sync to Cloud Firestore
      await saveUserCloudData(currentUserId, payload);

      // Server backup endpoint
      await fetch(`/api/sync/${encodeURIComponent(currentUserId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.log('Cloud sync background sync note:', e);
    }
  }, [
    currentUserId,
    currentUser,
    trades,
    setupItems,
    setups,
    pairs,
    emotions,
    invalidationReasons,
    fundedAccounts,
    dailyTargetConfig,
    milestoneConfig,
    multiPortfolioConfig,
    recaps,
  ]);

  // Sync to cloud automatically when meaningful data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToCloud();
    }, 1200);
    return () => clearTimeout(timer);
  }, [syncToCloud]);

  // Pull from Cloud on initial load or user change
  const pullFromCloud = useCallback(async (targetUserId: string) => {
    try {
      const cloudData = await fetchUserCloudData(targetUserId);
      if (cloudData) {
        if (Array.isArray(cloudData.trades)) setTrades(cloudData.trades);
        if (Array.isArray(cloudData.setupItems)) setSetupItems(cloudData.setupItems);
        if (Array.isArray(cloudData.pairs)) setPairs(cloudData.pairs);
        if (Array.isArray(cloudData.emotions)) setEmotions(cloudData.emotions);
        if (Array.isArray(cloudData.invalidationReasons)) setInvalidationReasons(cloudData.invalidationReasons);
        if (Array.isArray(cloudData.fundedAccounts)) setFundedAccounts(cloudData.fundedAccounts);
        if (cloudData.dailyTargetConfig) setDailyTargetConfig(cloudData.dailyTargetConfig);
        if (cloudData.milestoneConfig) setMilestoneConfig(cloudData.milestoneConfig);
        if (cloudData.multiPortfolioConfig) setMultiPortfolioConfig(cloudData.multiPortfolioConfig);
        if (Array.isArray(cloudData.recaps)) setRecaps(cloudData.recaps);
        return true;
      }

      const res = await fetch(`/api/sync/${encodeURIComponent(targetUserId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.trades) {
          if (Array.isArray(json.trades)) setTrades(json.trades);
          if (Array.isArray(json.setupItems)) setSetupItems(json.setupItems);
          if (Array.isArray(json.pairs)) setPairs(json.pairs);
          if (Array.isArray(json.fundedAccounts)) setFundedAccounts(json.fundedAccounts);
          if (json.milestoneConfig) setMilestoneConfig(json.milestoneConfig);
          if (json.dailyTargetConfig) setDailyTargetConfig(json.dailyTargetConfig);
          if (json.user) {
            setUsers((prev) => {
              if (prev.some((u) => u.id === json.user.id)) {
                return prev.map((u) => (u.id === json.user.id ? json.user : u));
              }
              return [...prev, json.user];
            });
          }
          return true;
        }
      }
    } catch (e) {
      console.log('Could not fetch cloud data, using local data:', e);
    }
    return false;
  }, []);

  // Pull data on user switch
  useEffect(() => {
    pullFromCloud(currentUserId);
  }, [currentUserId, pullFromCloud]);

  // LocalStorage Persistence
  useEffect(() => {
    try {
      localStorage.setItem('ghost_terminal_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('ghost_terminal_current_user_id', currentUserId);
    } catch (e) {
      console.error(e);
    }
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_trades_${currentUserId}`, JSON.stringify(trades));
    } catch (e) {
      console.error(e);
    }
  }, [trades, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_setup_items_${currentUserId}`, JSON.stringify(setupItems));
    } catch (e) {
      console.error(e);
    }
  }, [setupItems, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_pairs_${currentUserId}`, JSON.stringify(pairs));
    } catch (e) {
      console.error(e);
    }
  }, [pairs, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_emotions_${currentUserId}`, JSON.stringify(emotions));
    } catch (e) {
      console.error(e);
    }
  }, [emotions, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_funded_accounts_${currentUserId}`, JSON.stringify(fundedAccounts));
    } catch (e) {
      console.error(e);
    }
  }, [fundedAccounts, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_daily_target_${currentUserId}`, JSON.stringify(dailyTargetConfig));
    } catch (e) {
      console.error(e);
    }
  }, [dailyTargetConfig, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_milestones_${currentUserId}`, JSON.stringify(milestoneConfig));
    } catch (e) {
      console.error(e);
    }
  }, [milestoneConfig, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(`ghost_portfolios_${currentUserId}`, JSON.stringify(multiPortfolioConfig));
    } catch (e) {
      console.error(e);
    }
  }, [multiPortfolioConfig, currentUserId]);

  // Account Switch / Login Handler
  const handleLogin = (user: User) => {
    setCurrentUserId(user.id);
    pullFromCloud(user.id);
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setTrades([]);
    setSetupItems(DEFAULT_SETUP_ITEMS);
    setPairs(DEFAULT_PAIRS);
    setFundedAccounts(DEFAULT_FUNDED_ACCOUNTS);
  };

  // Direct Account Deletion (As requested by user!)
  const handleDeleteUser = (userIdToDelete: string) => {
    setUsers((prev) => {
      const remaining = prev.filter((u) => u.id !== userIdToDelete);
      const finalUsers = remaining.length > 0 ? remaining : DEFAULT_USERS;
      if (currentUserId === userIdToDelete) {
        const nextUser = finalUsers[0];
        setCurrentUserId(nextUser.id);
      }
      return finalUsers;
    });

    // Clean local storage for that user
    try {
      localStorage.removeItem(`ghost_trades_${userIdToDelete}`);
      localStorage.removeItem(`ghost_setup_items_${userIdToDelete}`);
      localStorage.removeItem(`ghost_pairs_${userIdToDelete}`);
      localStorage.removeItem(`ghost_funded_accounts_${userIdToDelete}`);
      localStorage.removeItem(`ghost_daily_target_${userIdToDelete}`);
      localStorage.removeItem(`ghost_milestones_${userIdToDelete}`);
      localStorage.removeItem(`ghost_portfolios_${userIdToDelete}`);
      localStorage.removeItem(`ghost_recaps_${userIdToDelete}`);
    } catch (e) {
      console.error(e);
    }

    // Call server to delete if supported
    fetch(`/api/users/${encodeURIComponent(userIdToDelete)}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Trade Operations
  const handleSaveTrade = (trade: Trade) => {
    const exists = trades.some((t) => t.id === trade.id);
    if (exists) {
      setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)));
    } else {
      setTrades((prev) => [trade, ...prev]);
    }
    setIsAddTradeOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    if (selectedTradeDetail?.id === tradeId) {
      setSelectedTradeDetail(null);
    }
  };

  const handleCopyTrade = (trade: Trade) => {
    const copy: Trade = {
      ...trade,
      id: `trade_${Date.now()}`,
      date: new Date().toISOString().slice(0, 16),
      notes: trade.notes ? `[Copied] ${trade.notes}` : '',
    };
    setTrades((prev) => [copy, ...prev]);
  };

  const handleOpenAddTrade = (defaultPortfolio?: 'personal' | 'funded') => {
    setEditingTrade(null);
    setAddTradeDefaultPortfolio(defaultPortfolio || 'personal');
    setIsAddTradeOpen(true);
  };

  const handleOpenEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsAddTradeOpen(true);
  };

  // Pairs Management Handlers
  const handleAddItem = (typeOrItem: string, maybeItem?: string) => {
    const pairName = (maybeItem || typeOrItem).trim().toUpperCase();
    if (pairName) {
      setPairs((prev) => (prev.includes(pairName) ? prev : [...prev, pairName]));
    }
  };

  const handleDeleteItem = (typeOrItem: string, maybeItem?: string) => {
    const pairName = (maybeItem || typeOrItem).trim().toUpperCase();
    if (pairName) {
      setPairs((prev) => prev.filter((p) => p.toUpperCase() !== pairName));
    }
  };

  const handleResetDefaults = () => {
    setPairs(DEFAULT_PAIRS);
  };

  // Setup Items Management Handlers
  const handleAddSetup = (newSetup: SetupItem) => {
    setSetupItems((prev) => [...prev, newSetup]);
  };

  const handleUpdateSetup = (updatedSetup: SetupItem) => {
    setSetupItems((prev) => prev.map((s) => (s.id === updatedSetup.id ? updatedSetup : s)));
  };

  const handleDeleteSetup = (setupId: string) => {
    setSetupItems((prev) => prev.filter((s) => s.id !== setupId));
  };

  const handleResetDefaultSetups = () => {
    setSetupItems(DEFAULT_SETUP_ITEMS);
  };

  const handleSaveSetupItems = (newItems: SetupItem[]) => {
    setSetupItems(newItems);
  };

  // Emotion Management Handlers
  const handleAddEmotion = (newEmotion: string) => {
    if (newEmotion.trim() && !emotions.includes(newEmotion.trim())) {
      setEmotions((prev) => [...prev, newEmotion.trim()]);
    }
  };

  const handleDeleteEmotion = (emotionToDelete: string) => {
    if (emotions.length > 1) {
      setEmotions((prev) => prev.filter((e) => e !== emotionToDelete));
    }
  };

  // Invalidation Reason Management Handlers
  const handleAddInvalidationReason = (newReason: string) => {
    if (newReason.trim() && !invalidationReasons.includes(newReason.trim())) {
      setInvalidationReasons((prev) => [...prev, newReason.trim()]);
    }
  };

  const handleDeleteInvalidationReason = (reasonToDelete: string) => {
    if (invalidationReasons.length > 1) {
      setInvalidationReasons((prev) => prev.filter((r) => r !== reasonToDelete));
    }
  };

  // Milestone Target Slider Updater (1 - 5000 trades)
  const handleUpdateMilestoneTarget = (targetTrades: number) => {
    setMilestoneConfig((prev) => ({ ...prev, targetTrades }));
  };

  // Data Import / Export / Reset
  const handleImportData = (data: {
    trades: Trade[];
    setups?: string[];
    pairs?: string[];
    user?: User;
  }) => {
    if (data.trades && Array.isArray(data.trades)) {
      setTrades(data.trades);
    }
    if (data.pairs && Array.isArray(data.pairs)) {
      setPairs(data.pairs);
    }
    if (data.user) {
      handleUpdateUser(data.user);
    }
  };

  const handleResetUserData = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการเทรดของบัญชีนี้ทั้งหมด?')) {
      const defaultList =
        DEFAULT_USER_TRADES_MAP[currentUserId] ||
        DEFAULT_USER_TRADES_MAP['user_alex'] ||
        [];
      setTrades(defaultList);
      setSetupItems(DEFAULT_SETUP_ITEMS);
      setPairs(DEFAULT_PAIRS);
      setRecaps([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#030407] text-[#f8fafc] flex flex-col md:flex-row font-['Outfit',sans-serif] selection:bg-slate-400/30 selection:text-white">
      {/* 1. SIDEBAR (Persistent on Desktop, Drawer on Mobile) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        onOpenAddTrade={() => handleOpenAddTrade('personal')}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenManageSetups={() => setIsManageSetupsOpen(true)}
        onOpenManagePairs={() => setManageCustomType('pairs')}
        multiPortfolioConfig={multiPortfolioConfig}
        showRecapTab={true}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onAddTrade={() => handleOpenAddTrade('personal')}
          onOpenGmail={() => setActiveTab('gmail')}
          onOpenCertificate={() => setIsCertificateModalOpen(true)}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 w-full max-w-6xl mx-auto">
          {activeTab === 'home' && (
            <HomeTab
              currentUser={currentUser}
              trades={trades}
              onOpenAddTrade={() => handleOpenAddTrade('personal')}
              onSelectTrade={(t) => setSelectedTradeDetail(t)}
              dailyTargetConfig={dailyTargetConfig}
              onUpdateDailyTargetConfig={setDailyTargetConfig}
              milestoneConfig={milestoneConfig}
              onUpdateMilestoneTarget={handleUpdateMilestoneTarget}
            />
          )}

          {activeTab === 'logs' && (
            <TradeLogsTab
              trades={trades}
              onSelectTrade={(t) => setSelectedTradeDetail(t)}
              onOpenAddTrade={() => handleOpenAddTrade('personal')}
              onDeleteTrade={handleDeleteTrade}
              onCopyTrade={handleCopyTrade}
              onOpenManageSetups={() => setIsManageSetupsOpen(true)}
              onOpenManagePairs={() => setManageCustomType('pairs')}
              multiPortfolioConfig={multiPortfolioConfig}
            />
          )}

          {activeTab === 'funded' && (
            <FundedTab
              currentUser={currentUser}
              trades={trades}
              fundedAccounts={fundedAccounts}
              onUpdateFundedAccounts={setFundedAccounts}
              onOpenAddTrade={() => handleOpenAddTrade('funded')}
              onSelectTrade={(t) => setSelectedTradeDetail(t)}
            />
          )}

          {activeTab === 'edge-finder' && (
            <EdgeFinderTab
              trades={trades}
              onSelectTrade={(t) => setSelectedTradeDetail(t)}
              onOpenAddTrade={() => handleOpenAddTrade('personal')}
            />
          )}

          {activeTab === 'recap' && (
            <DailyRecapTab
              recaps={recaps}
              trades={trades}
              onAddRecap={(recap) => setRecaps((prev) => [recap, ...prev])}
              onDeleteRecap={(id) => setRecaps((prev) => prev.filter((r) => r.id !== id))}
              onSelectTrade={(t) => setSelectedTradeDetail(t)}
              onOpenGmail={() => setActiveTab('gmail')}
            />
          )}

          {activeTab === 'gmail' && (
            <GmailHub
              currentUser={currentUser}
              trades={trades}
              activePortfolio={multiPortfolioConfig?.activePortfolio || 'all'}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              trades={trades}
              setups={setups}
              pairs={pairs}
              onImportData={handleImportData}
              onResetUserData={handleResetUserData}
              onOpenManageSetups={() => setIsManageSetupsOpen(true)}
              onOpenManagePairs={() => setManageCustomType('pairs')}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              dailyTargetConfig={dailyTargetConfig}
              onUpdateDailyTargetConfig={setDailyTargetConfig}
              milestoneConfig={milestoneConfig}
              onUpdateMilestoneConfig={setMilestoneConfig}
              multiPortfolioConfig={multiPortfolioConfig}
              onUpdateMultiPortfolioConfig={setMultiPortfolioConfig}
              isAiCoachEnabled={false}
              onToggleAiCoachEnabled={() => {}}
              isRecapEnabled={true}
              onToggleRecapEnabled={() => {}}
              onOpenGmail={() => setActiveTab('gmail')}
            />
          )}
        </main>
      </div>

      {/* 3. BOTTOM MOBILE NAVIGATION */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onQuickAddTrade={() => handleOpenAddTrade('personal')}
        isRecapEnabled={true}
      />

      {/* 4. ADD / EDIT TRADE MODAL */}
      <AddEditTradeModal
        isOpen={isAddTradeOpen}
        onClose={() => {
          setIsAddTradeOpen(false);
          setEditingTrade(null);
        }}
        onSaveTrade={handleSaveTrade}
        tradeToEdit={editingTrade}
        setups={setupItems}
        pairs={pairs}
        emotions={emotions}
        onAddEmotion={handleAddEmotion}
        onDeleteEmotion={handleDeleteEmotion}
        invalidationReasons={invalidationReasons}
        onAddInvalidationReason={handleAddInvalidationReason}
        onDeleteInvalidationReason={handleDeleteInvalidationReason}
        onOpenManageSetups={() => setIsManageSetupsOpen(true)}
        onOpenManagePairs={() => setManageCustomType('pairs')}
        defaultPortfolio={addTradeDefaultPortfolio}
      />

      {/* 5. TRADE DETAIL MODAL */}
      <TradeDetailModal
        trade={selectedTradeDetail}
        onClose={() => setSelectedTradeDetail(null)}
        onEdit={(t) => {
          setSelectedTradeDetail(null);
          handleOpenEditTrade(t);
        }}
        onDelete={handleDeleteTrade}
      />

      {/* 6. SWITCH ACCOUNT / CLOUD MULTI-DEVICE SYNC & DELETE MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onDeleteUser={handleDeleteUser}
        onCloudSyncSuccess={() => pullFromCloud(currentUserId)}
      />

      {/* 7. MANAGE SETUP ITEMS & PLAYBOOK DESCRIPTIONS MODAL */}
      <ManageSetupsModal
        isOpen={isManageSetupsOpen}
        onClose={() => setIsManageSetupsOpen(false)}
        setups={setupItems}
        onAddSetup={handleAddSetup}
        onUpdateSetup={handleUpdateSetup}
        onDeleteSetup={handleDeleteSetup}
        onResetDefaults={handleResetDefaultSetups}
      />

      {/* 8. MANAGE CUSTOM PAIRS MODAL */}
      {manageCustomType === 'pairs' && (
        <ManageCustomModal
          type="pairs"
          isOpen={Boolean(manageCustomType)}
          onClose={() => setManageCustomType(null)}
          items={pairs}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onResetDefaults={handleResetDefaults}
        />
      )}

      {/* 9. TRADER PERFORMANCE CERTIFICATE MODAL */}
      <TraderCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        currentUser={currentUser}
        trades={trades}
      />
    </div>
  );
}
