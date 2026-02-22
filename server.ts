import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("nyayaos.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    displayName TEXT,
    role TEXT,
    poolId TEXT,
    reputationScore REAL DEFAULT 0,
    contributionScore REAL DEFAULT 0,
    votingParticipation REAL DEFAULT 0,
    proposalAccuracy REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS pools (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    subscriptionTier TEXT,
    isPrivate INTEGER,
    treasuryBalance REAL DEFAULT 0,
    createdAt TEXT,
    adminId TEXT
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    poolId TEXT,
    title TEXT,
    description TEXT,
    creatorId TEXT,
    status TEXT,
    votesFor INTEGER DEFAULT 0,
    votesAgainst INTEGER DEFAULT 0,
    weightedVotesFor REAL DEFAULT 0,
    weightedVotesAgainst REAL DEFAULT 0,
    createdAt TEXT,
    expiresAt TEXT
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    poolId TEXT,
    title TEXT,
    description TEXT,
    stage TEXT,
    estimatedCost REAL,
    actualCost REAL DEFAULT 0,
    status TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS federationGroups (
    id TEXT PRIMARY KEY,
    title TEXT,
    sharedTreasury REAL DEFAULT 0,
    governanceModel TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS federationMembers (
    federationId TEXT,
    poolId TEXT,
    PRIMARY KEY (federationId, poolId)
  );

  CREATE TABLE IF NOT EXISTS auditLogs (
    id TEXT PRIMARY KEY,
    poolId TEXT,
    userId TEXT,
    action TEXT,
    details TEXT,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    poolId TEXT UNIQUE,
    tier TEXT,
    status TEXT,
    currentPeriodEnd TEXT,
    stripeCustomerId TEXT,
    stripeSubscriptionId TEXT
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    proposalId TEXT,
    userId TEXT,
    choice TEXT,
    weight REAL,
    timestamp TEXT,
    UNIQUE(proposalId, userId)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- RBAC Middleware ---
  const checkRole = (roles: string[]) => (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    req.user = user;
    next();
  };

  const logAction = (poolId: string | null, userId: string, action: string, details: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    db.prepare("INSERT INTO auditLogs (id, poolId, userId, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, poolId, userId, action, details, timestamp);
  };

  // --- API Routes ---

  // Auth Simulation
  app.post("/api/auth/register", (req, res) => {
    const { email, displayName, role = 'member' } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      db.prepare("INSERT INTO users (id, email, displayName, role) VALUES (?, ?, ?, ?)").run(id, email, displayName, role);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user) res.json(user);
    else res.status(404).json({ error: "User not found" });
  });

  // Pools
  app.get("/api/pools", (req, res) => {
    const pools = db.prepare("SELECT * FROM pools WHERE isPrivate = 0").all();
    res.json(pools);
  });

  app.post("/api/pools", (req, res) => {
    const { name, description, subscriptionTier, isPrivate, adminId } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();
    db.prepare("INSERT INTO pools (id, name, description, subscriptionTier, isPrivate, adminId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, description, subscriptionTier, isPrivate ? 1 : 0, adminId, createdAt);
    
    // Update user's poolId
    db.prepare("UPDATE users SET poolId = ? WHERE id = ?").run(id, adminId);
    
    logAction(id, adminId, "POOL_CREATED", `Pool ${name} initialized with tier ${subscriptionTier}`);
    
    res.json({ id, name, description, subscriptionTier, isPrivate, adminId, createdAt });
  });

  app.get("/api/pools/:id", (req, res) => {
    const pool = db.prepare("SELECT * FROM pools WHERE id = ?").get(req.params.id);
    if (!pool) return res.status(404).json({ error: "Pool not found" });
    res.json(pool);
  });

  // Proposals
  app.get("/api/pools/:poolId/proposals", (req, res) => {
    const proposals = db.prepare("SELECT * FROM proposals WHERE poolId = ?").all(req.params.poolId);
    res.json(proposals);
  });

  app.post("/api/proposals", (req, res) => {
    const { poolId, title, description, creatorId, expiresAt } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();
    db.prepare("INSERT INTO proposals (id, poolId, title, description, creatorId, status, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)")
      .run(id, poolId, title, description, creatorId, createdAt, expiresAt);
    
    logAction(poolId, creatorId, "PROPOSAL_CREATED", `New proposal created: ${title}`);
    
    res.json({ id, poolId, title, description, creatorId, status: 'active', createdAt, expiresAt });
  });

  app.post("/api/proposals/:id/vote", (req, res) => {
    const { choice } = req.body;
    const proposalId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!['for', 'against'].includes(choice)) return res.status(400).json({ error: "Invalid choice" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const proposal = db.prepare("SELECT * FROM proposals WHERE id = ?").get(proposalId);

    if (!user || !proposal) return res.status(404).json({ error: "User or Proposal not found" });
    if (proposal.status !== 'active') return res.status(400).json({ error: "Proposal is not active" });

    const weight = user.reputationScore || 1;
    const voteId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    try {
      db.transaction(() => {
        db.prepare("INSERT INTO votes (id, proposalId, userId, choice, weight, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
          .run(voteId, proposalId, userId, choice, weight, timestamp);

        if (choice === 'for') {
          db.prepare("UPDATE proposals SET votesFor = votesFor + 1, weightedVotesFor = weightedVotesFor + ? WHERE id = ?")
            .run(weight, proposalId);
        } else {
          db.prepare("UPDATE proposals SET votesAgainst = votesAgainst + 1, weightedVotesAgainst = weightedVotesAgainst + ? WHERE id = ?")
            .run(weight, proposalId);
        }
      })();

      logAction(proposal.poolId, userId as string, "VOTE_CAST", `Voted ${choice} on proposal: ${proposal.title}`);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "You have already voted on this proposal" });
    }
  });

  // Reputation Engine Simulation (Cloud Function)
  app.post("/api/reputation/recalculate", (req, res) => {
    const { userId } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const weight = (user.contributionScore * 0.4) + (user.votingParticipation * 0.3) + (user.proposalAccuracy * 0.3);
    db.prepare("UPDATE users SET reputationScore = ? WHERE id = ?").run(weight, userId);
    res.json({ userId, newScore: weight });
  });

  // Audit Logs
  app.get("/api/audit-logs", (req, res) => {
    const { poolId, userId, action, startDate, endDate } = req.query;
    let query = "SELECT * FROM auditLogs WHERE 1=1";
    const params: any[] = [];

    if (poolId) {
      query += " AND poolId = ?";
      params.push(poolId);
    }
    if (userId) {
      query += " AND userId = ?";
      params.push(userId);
    }
    if (action) {
      query += " AND action = ?";
      params.push(action);
    }
    if (startDate) {
      query += " AND timestamp >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND timestamp <= ?";
      params.push(endDate);
    }

    query += " ORDER BY timestamp DESC";
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  });

  // Payments (Stripe Mock)
  app.post("/api/payments/create-checkout", (req, res) => {
    const { poolId, tier } = req.body;
    // In a real app, you'd call stripe.checkout.sessions.create
    const sessionId = "mock_session_" + Math.random().toString(36).substr(2, 9);
    res.json({ url: `${process.env.APP_URL}/payment-success?session_id=${sessionId}&poolId=${poolId}&tier=${tier}` });
  });

  app.post("/api/payments/webhook", (req, res) => {
    const { type, data } = req.body;
    // Handle Stripe webhooks
    if (type === "checkout.session.completed") {
      const { poolId, tier } = data.object.metadata;
      const subId = Math.random().toString(36).substr(2, 9);
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      db.prepare(`
        INSERT INTO subscriptions (id, poolId, tier, status, currentPeriodEnd)
        VALUES (?, ?, ?, 'active', ?)
        ON CONFLICT(poolId) DO UPDATE SET tier=excluded.tier, status='active', currentPeriodEnd=excluded.currentPeriodEnd
      `).run(subId, poolId, tier, periodEnd.toISOString());

      db.prepare("UPDATE pools SET subscriptionTier = ? WHERE id = ?").run(tier, poolId);
      logAction(poolId, "system", "SUBSCRIPTION_UPDATED", `Pool upgraded to ${tier}`);
    }
    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
