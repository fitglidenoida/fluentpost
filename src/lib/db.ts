import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/prod.db'  // Use /tmp for serverless environments
  : path.join(process.cwd(), 'data', 'dev.db');

// Create database connection
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Database helper functions
export const dbHelpers = {
  // Execute a query and return all results
  query: <T = any>(sql: string, params: any[] = []): T[] => {
    try {
      const stmt = db.prepare(sql);
      return stmt.all(params) as T[];
    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },

  // Execute a query and return first result
  queryFirst: <T = any>(sql: string, params: any[] = []): T | null => {
    try {
      const stmt = db.prepare(sql);
      return (stmt.get(params) as T) || null;
    } catch (error) {
      console.error('Database queryFirst error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },

  // Execute an insert/update/delete and return changes info
  execute: (sql: string, params: any[] = []) => {
    try {
      const stmt = db.prepare(sql);
      return stmt.run(params);
    } catch (error) {
      console.error('Database execute error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },

  // Execute multiple statements in a transaction
  transaction: <T>(callback: () => T): T => {
    return db.transaction(callback)();
  },

  // Close database connection
  close: () => {
    db.close();
  }
};

// Initialize database schema
export const initializeDatabase = () => {
  console.log('Initializing database schema...');
  
  // Create tables
  const createTables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      emailVerified DATETIME,
      image TEXT,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions table for NextAuth
    CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY,
      sessionToken TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      expires DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    -- Accounts table for NextAuth
    CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(provider, providerAccountId)
    );

    -- Verification tokens for NextAuth
    CREATE TABLE IF NOT EXISTS VerificationToken (
      identifier TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires DATETIME NOT NULL,
      UNIQUE(identifier, token)
    );

    -- Websites table
    CREATE TABLE IF NOT EXISTS Website (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      userId TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      lastScanned DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(url, userId)
    );

    -- SEO Recommendations table
    CREATE TABLE IF NOT EXISTS SEORecommendation (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      pageId TEXT,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      description TEXT NOT NULL,
      action TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE
    );

    -- SEO Actions table
    CREATE TABLE IF NOT EXISTS SEOActions (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      details TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE
    );

    -- Page Analysis table
    CREATE TABLE IF NOT EXISTS PageAnalysis (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      metaDescription TEXT,
      headings TEXT,
      content TEXT,
      seoScore INTEGER,
      issues TEXT,
      suggestions TEXT,
      scannedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE,
      UNIQUE(websiteId, url)
    );

    -- Keyword Research table
    CREATE TABLE IF NOT EXISTS KeywordResearch (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      keyword TEXT NOT NULL,
      searchVolume INTEGER,
      difficulty INTEGER,
      ranking INTEGER,
      suggestions TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE
    );

    -- App Settings table
    CREATE TABLE IF NOT EXISTS AppSettings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_website_userId ON Website(userId);
    CREATE INDEX IF NOT EXISTS idx_seo_recommendation_websiteId ON SEORecommendation(websiteId);
    CREATE INDEX IF NOT EXISTS idx_seo_recommendation_type ON SEORecommendation(type);
    CREATE INDEX IF NOT EXISTS idx_seo_recommendation_priority ON SEORecommendation(priority);
    CREATE INDEX IF NOT EXISTS idx_page_analysis_websiteId ON PageAnalysis(websiteId);
    CREATE INDEX IF NOT EXISTS idx_keyword_research_websiteId ON KeywordResearch(websiteId);
    CREATE INDEX IF NOT EXISTS idx_keyword_research_keyword ON KeywordResearch(keyword);
    CREATE INDEX IF NOT EXISTS idx_app_settings_key ON AppSettings(key);
  `;

  // Execute schema creation
  dbHelpers.transaction(() => {
    const statements = createTables.split(';').filter(stmt => stmt.trim());
    statements.forEach(statement => {
      if (statement.trim()) {
        dbHelpers.execute(statement.trim());
      }
    });
  });

  console.log('Database schema initialized successfully!');
};

// Auto-initialize on import
if (process.env.NODE_ENV !== 'test') {
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  initializeDatabase();
}

// Export the database connection and helpers
export default dbHelpers;
export { db };