// Test our new database connection
const { dbHelpers } = require('./src/lib/db.ts');

console.log('Testing database connection...');

try {
  // Test basic query
  const result = dbHelpers.query('SELECT 1 as test');
  console.log('✅ Database connection successful!');
  console.log('Test result:', result);

  // Test table creation by checking if User table exists
  const tables = dbHelpers.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='User'
  `);
  
  if (tables.length > 0) {
    console.log('✅ User table created successfully!');
  } else {
    console.log('❌ User table not found');
  }

  // List all tables
  const allTables = dbHelpers.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);
  
  console.log('📋 Available tables:', allTables.map(t => t.name));

} catch (error) {
  console.error('❌ Database test failed:', error);
}
