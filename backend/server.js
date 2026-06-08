const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const { customAlphabet } = require('nanoid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'thevoix.db');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChoraleLaFOI2028';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new Database(DB_PATH);

// Improve concurrency for multi-user usage
try {
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
} catch (e) {
  console.warn('Could not set SQLite pragmas', e.message || e);
}

function initDb() {
  db.prepare(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    pack_type TEXT,
    votes INTEGER,
    price INTEGER,
    used INTEGER DEFAULT 0,
    used_at TEXT,
    used_by TEXT,
    used_for_candidate TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT,
    candidate_id TEXT,
    candidate_name TEXT,
    votes INTEGER,
    price INTEGER,
    user_id TEXT,
    user_name TEXT,
    timestamp TEXT
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    nom TEXT,
    prenom TEXT,
    categorie TEXT,
    votes INTEGER DEFAULT 0
  )`).run();

  // Seed default candidates if empty
  const count = db.prepare('SELECT COUNT(1) as c FROM candidates').get().c;
  if (count === 0) {
    const defaultCandidates = [
      { id: '1', nom: 'ADJO', prenom: 'Marie', categorie: 'soliste' },
      { id: '2', nom: 'KODJO', prenom: 'Frères', categorie: 'duo' },
      { id: '3', nom: 'AGBÉ', prenom: 'Kossi', categorie: 'soliste' },
      { id: '4', nom: 'ESPOIR', prenom: 'Chœur', categorie: 'groupe' }
    ];
    const insert = db.prepare('INSERT INTO candidates (id, nom, prenom, categorie, votes) VALUES (@id, @nom, @prenom, @categorie, 0)');
    const insertMany = db.transaction((rows) => {
      for (const r of rows) insert.run(r);
    });
    insertMany(defaultCandidates);
  }
}

initDb();

const nano = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Admin: generate codes (protected by simple password)
app.post('/api/admin/generate-codes', (req, res) => {
  const { password, packType, count = 10, votes = 1, price = 0 } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const insert = db.prepare('INSERT INTO tickets (code, pack_type, votes, price, used) VALUES (?, ?, ?, ?, 0)');
  const created = [];
  for (let i = 0; i < count; i++) {
    let code = nano();
    // ensure uniqueness
    while (db.prepare('SELECT 1 FROM tickets WHERE code = ?').get(code)) {
      code = nano();
    }
    insert.run(code, packType, votes, price);
    created.push({ code, packType, votes, price });
  }

  return res.json({ created });
});

// Verify ticket
app.get('/api/tickets/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const t = db.prepare('SELECT code, pack_type, votes, price, used FROM tickets WHERE code = ?').get(code);
  if (!t) return res.status(404).json({ valid: false, error: 'Code not found' });
  if (t.used) return res.json({ valid: false, error: 'Code already used', ticket: t });
  return res.json({ valid: true, ticket: t });
});

// Use ticket (mark used and record vote)
app.post('/api/tickets/use', (req, res) => {
  const { code, userId, candidateId, candidateName, userName } = req.body;
  if (!code || !candidateId) return res.status(400).json({ success: false, error: 'Missing parameters' });
  const upper = code.toUpperCase();

  // Use a transaction to make check-and-set atomic (prevents race conditions)
  const now = new Date().toISOString();
  try {
    const useTicketTx = db.transaction(({ code, userId, candidateId, candidateName, userName, now }) => {
      const ticket = db.prepare('SELECT * FROM tickets WHERE code = ?').get(code);
      if (!ticket) throw { status: 404, message: 'Ticket not found' };
      if (ticket.used) throw { status: 400, message: 'Ticket already used' };

      db.prepare('UPDATE tickets SET used = 1, used_at = ?, used_by = ?, used_for_candidate = ? WHERE code = ?')
        .run(now, userId || null, candidateId, code);

      db.prepare('UPDATE candidates SET votes = votes + ? WHERE id = ?')
        .run(ticket.votes, candidateId);

      db.prepare('INSERT INTO votes (ticket_code, candidate_id, candidate_name, votes, price, user_id, user_name, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(code, candidateId, candidateName || null, ticket.votes, ticket.price || 0, userId || null, userName || null, now);

      return { votes: ticket.votes };
    });

    const result = useTicketTx({ code: upper, userId, candidateId, candidateName, userName, now });
    return res.json({ success: true, votes: result.votes });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ success: false, error: err.message });
    console.error('Ticket use transaction error:', err);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(1) as c FROM tickets').get().c;
  const used = db.prepare('SELECT COUNT(1) as c FROM tickets WHERE used = 1').get().c;
  const votes = db.prepare('SELECT COUNT(1) as c FROM votes').get().c;
  const candidates = db.prepare('SELECT id, nom, prenom, votes, categorie FROM candidates').all();
  res.json({ total, used, available: total - used, votes, candidates });
});

app.get('/api/candidates', (req, res) => {
  const candidates = db.prepare('SELECT id, nom, prenom, votes, categorie FROM candidates').all();
  res.json({ candidates });
});

app.post('/api/admin/reset-votes', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  db.prepare('UPDATE candidates SET votes = 0').run();
  db.prepare('DELETE FROM votes').run();
  db.prepare('UPDATE tickets SET used = 0, used_at = NULL, used_by = NULL, used_for_candidate = NULL').run();
  return res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The Voïx backend running on http://localhost:${PORT}`);
});
