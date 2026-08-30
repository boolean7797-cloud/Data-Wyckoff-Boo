import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// In-Memory Cloud Store for Multi-Device User Account Sync
interface CloudUserData {
  user: any;
  trades: any[];
  setups: any[];
  pairs: string[];
  emotions: string[];
  dailyTargetConfig?: any;
  milestoneConfig?: any;
  multiPortfolioConfig?: any;
  fundedAccounts?: any[];
  recaps?: any[];
  updatedAt: string;
}

const cloudSyncStore: Record<string, CloudUserData> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Ghost Phaze Sync Engine",
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Get all cloud registered users (For multi-device listing)
  app.get("/api/users", (_req, res) => {
    const users = Object.values(cloudSyncStore).map((data) => ({
      ...data.user,
      tradesCount: data.trades?.length || 0,
      lastSyncedAt: data.updatedAt,
    }));
    res.json({ users });
  });

  // 2. Register / Upsert User profile
  app.post("/api/users", (req, res) => {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "User payload is required" });
    }

    if (!cloudSyncStore[user.id]) {
      cloudSyncStore[user.id] = {
        user,
        trades: [],
        setups: [],
        pairs: [],
        emotions: [],
        updatedAt: new Date().toISOString(),
      };
    } else {
      cloudSyncStore[user.id].user = user;
      cloudSyncStore[user.id].updatedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      user: cloudSyncStore[user.id].user,
      lastSyncedAt: cloudSyncStore[user.id].updatedAt,
    });
  });

  // 3. Delete user account and all cloud synced data
  app.delete("/api/users/:userId", (req, res) => {
    const { userId } = req.params;
    if (cloudSyncStore[userId]) {
      delete cloudSyncStore[userId];
    }
    res.json({ success: true, message: `Account ${userId} removed from cloud` });
  });

  // 4. Pull Synced Cloud Data for User (Multi-Device Sync)
  app.get("/api/sync/:userId", (req, res) => {
    const { userId } = req.params;
    const userData = cloudSyncStore[userId];

    if (!userData) {
      return res.status(404).json({
        found: false,
        message: "No cloud data found for this account ID yet. Initializing new sync.",
      });
    }

    res.json({
      found: true,
      data: userData,
      lastSyncedAt: userData.updatedAt,
    });
  });

  // 5. Push Updated Data to Cloud (Multi-Device Sync)
  app.post("/api/sync/:userId", (req, res) => {
    const { userId } = req.params;
    const {
      user,
      trades,
      setups,
      pairs,
      emotions,
      dailyTargetConfig,
      milestoneConfig,
      multiPortfolioConfig,
      fundedAccounts,
      recaps,
    } = req.body;

    const existing = cloudSyncStore[userId] || ({} as CloudUserData);

    cloudSyncStore[userId] = {
      user: user || existing.user || { id: userId },
      trades: trades !== undefined ? trades : existing.trades || [],
      setups: setups !== undefined ? setups : existing.setups || [],
      pairs: pairs !== undefined ? pairs : existing.pairs || [],
      emotions: emotions !== undefined ? emotions : existing.emotions || [],
      dailyTargetConfig: dailyTargetConfig !== undefined ? dailyTargetConfig : existing.dailyTargetConfig,
      milestoneConfig: milestoneConfig !== undefined ? milestoneConfig : existing.milestoneConfig,
      multiPortfolioConfig:
        multiPortfolioConfig !== undefined ? multiPortfolioConfig : existing.multiPortfolioConfig,
      fundedAccounts: fundedAccounts !== undefined ? fundedAccounts : existing.fundedAccounts || [],
      recaps: recaps !== undefined ? recaps : existing.recaps || [],
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      tradesCount: cloudSyncStore[userId].trades.length,
      lastSyncedAt: cloudSyncStore[userId].updatedAt,
    });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ghost Phaze Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
