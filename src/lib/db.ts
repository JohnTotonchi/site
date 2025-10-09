import Database from 'better-sqlite3';
import path from 'path';

// Database path - use absolute path for better-sqlite3
const dbPath = path.join(process.cwd(), 'data', 'ride-the-bus.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables - drop first to ensure clean schema
db.exec(`
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    balance INTEGER NOT NULL DEFAULT 300,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_users_username ON users(username);

  CREATE TRIGGER update_users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
`);

// Prepared statements for better performance
export const dbStatements = {
  // User operations
  createUser: db.prepare(`
    INSERT OR REPLACE INTO users (id, username, balance)
    VALUES (?, ?, 300)
  `),

  getUser: db.prepare(`
    SELECT id, username, balance, created_at, updated_at FROM users WHERE id = ?
  `),

  getUserByUsername: db.prepare(`
    SELECT id, username, balance, created_at, updated_at FROM users WHERE username = ?
  `),

  updateBalance: db.prepare(`
    UPDATE users SET balance = ? WHERE id = ?
  `),

  updateUsername: db.prepare(`
    UPDATE users SET username = ? WHERE id = ?
  `),

  getAllUsers: db.prepare(`
    SELECT id, username, balance, created_at, updated_at FROM users ORDER BY username
  `),

  deleteUser: db.prepare(`
    DELETE FROM users WHERE id = ?
  `),
};

export function initDatabase() {
  // Database is already initialized above, no additional setup needed
  console.log('Database initialized successfully');
}

export default db;
