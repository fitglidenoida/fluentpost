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
let isInitialized = false;
export const initializeDatabase = () => {
  if (isInitialized) {
    return;
  }
  
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

    -- Keyword Research table (legacy - keeping for backward compatibility)
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

    -- Phase 1: Enhanced Keyword and Topic Management Tables
    
    -- Keywords table (individual keywords with metadata)
    CREATE TABLE IF NOT EXISTS Keywords (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      keyword TEXT NOT NULL,
      searchVolume INTEGER,
      difficulty INTEGER,
      competition INTEGER,
      intent TEXT, -- informational, commercial, transactional, navigational
      status TEXT DEFAULT 'active', -- active, archived
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE,
      UNIQUE(websiteId, keyword)
    );

    -- Keyword Groups table (organize keywords into groups)
    CREATE TABLE IF NOT EXISTS KeywordGroups (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      targetAudience TEXT,
      color TEXT DEFAULT '#3B82F6', -- for UI organization
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE,
      UNIQUE(websiteId, name)
    );

    -- Keyword Group Mappings table (many-to-many relationship)
    CREATE TABLE IF NOT EXISTS KeywordGroupMappings (
      id TEXT PRIMARY KEY,
      keywordId TEXT NOT NULL,
      groupId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (keywordId) REFERENCES Keywords(id) ON DELETE CASCADE,
      FOREIGN KEY (groupId) REFERENCES KeywordGroups(id) ON DELETE CASCADE,
      UNIQUE(keywordId, groupId)
    );

    -- Topic Categories table (organize topics into categories)
    CREATE TABLE IF NOT EXISTS TopicCategories (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#10B981', -- for UI organization
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE,
      UNIQUE(websiteId, name)
    );

    -- Topic Ideas table (AI-generated and manual topic ideas)
    CREATE TABLE IF NOT EXISTS TopicIdeas (
      id TEXT PRIMARY KEY,
      websiteId TEXT NOT NULL,
      categoryId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      contentType TEXT DEFAULT 'blog', -- blog, video, social, guide
      priority TEXT DEFAULT 'medium', -- low, medium, high
      difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
      estimatedWordCount INTEGER,
      aiGenerated BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'idea', -- idea, researching, content_created, published
      viralScore REAL DEFAULT 0.0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES TopicCategories(id) ON DELETE SET NULL
    );

    -- Topic Keywords table (link topics to their target keywords)
    CREATE TABLE IF NOT EXISTS TopicKeywords (
      id TEXT PRIMARY KEY,
      topicId TEXT NOT NULL,
      keywordId TEXT NOT NULL,
      usage TEXT DEFAULT 'secondary', -- primary, secondary, related
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topicId) REFERENCES TopicIdeas(id) ON DELETE CASCADE,
      FOREIGN KEY (keywordId) REFERENCES Keywords(id) ON DELETE CASCADE,
      UNIQUE(topicId, keywordId)
    );

    -- Content Briefs table (detailed content plans generated from topics)
    CREATE TABLE IF NOT EXISTS ContentBriefs (
      id TEXT PRIMARY KEY,
      topicId TEXT NOT NULL,
      outline TEXT, -- JSON structure with H2/H3 hierarchy
      suggestedTitle TEXT,
      metaDescription TEXT,
      targetWordCount INTEGER,
      researchPoints TEXT, -- JSON array of research points to include
      callToAction TEXT,
      internalLinks TEXT, -- JSON array of suggested internal links
      difficulty TEXT DEFAULT 'medium',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topicId) REFERENCES TopicIdeas(id) ON DELETE CASCADE,
      UNIQUE(topicId)
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
    
    -- Phase 1: Indexes for new keyword and topic tables
    CREATE INDEX IF NOT EXISTS idx_keywords_websiteId ON Keywords(websiteId);
    CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON Keywords(keyword);
    CREATE INDEX IF NOT EXISTS idx_keywords_status ON Keywords(status);
    CREATE INDEX IF NOT EXISTS idx_keyword_groups_websiteId ON KeywordGroups(websiteId);
    CREATE INDEX IF NOT EXISTS idx_keyword_group_mappings_keywordId ON KeywordGroupMappings(keywordId);
    CREATE INDEX IF NOT EXISTS idx_keyword_group_mappings_groupId ON KeywordGroupMappings(groupId);
    CREATE INDEX IF NOT EXISTS idx_topic_categories_websiteId ON TopicCategories(websiteId);
    CREATE INDEX IF NOT EXISTS idx_topic_ideas_websiteId ON TopicIdeas(websiteId);
    CREATE INDEX IF NOT EXISTS idx_topic_ideas_categoryId ON TopicIdeas(categoryId);
    CREATE INDEX IF NOT EXISTS idx_topic_ideas_status ON TopicIdeas(status);
    CREATE INDEX IF NOT EXISTS idx_topic_ideas_priority ON TopicIdeas(priority);
    CREATE INDEX IF NOT EXISTS idx_topic_keywords_topicId ON TopicKeywords(topicId);
    CREATE INDEX IF NOT EXISTS idx_topic_keywords_keywordId ON TopicKeywords(keywordId);
    CREATE INDEX IF NOT EXISTS idx_content_briefs_topicId ON ContentBriefs(topicId);
  `;

  // Execute schema creation
  try {
    dbHelpers.transaction(() => {
      const statements = createTables.split(';').filter(stmt => stmt.trim());
      statements.forEach(statement => {
        if (statement.trim()) {
          dbHelpers.execute(statement.trim());
        }
      });
    });
    
    isInitialized = true;
    console.log('Database schema initialized successfully!');
  } catch (error) {
    if (error.code === 'SQLITE_BUSY') {
      console.log('Database is busy, skipping initialization (already initialized by another process)');
      isInitialized = true;
    } else {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
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