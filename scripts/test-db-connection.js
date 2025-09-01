#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'galinfodb_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 60000,
    charset: 'utf8mb4',
    multipleStatements: false,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
  
  console.log('📋 Database configuration:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Password: ${dbConfig.password ? '[SET]' : '[NOT SET]'}`);
  
  try {
    // Test basic connection
    console.log('\n🔌 Testing basic connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Basic connection successful!');
    
    // Test simple query
    console.log('\n📝 Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Simple query successful:', rows);
    
    // Test table existence
    console.log('\n📊 Testing table existence...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('a_news', 'a_news_headers', 'a_statcomm', 'a_statview')
    `, [dbConfig.database]);
    
    console.log('✅ Available tables:', tables.map(t => t.TABLE_NAME));
    
    // Test search query structure
    console.log('\n🔍 Testing search query structure...');
    const searchTerm = '%test%';
    const lang = '1';
    const limit = 10;
    const offset = 0;
    
    const testQuery = `
      SELECT 
        a_news.id,
        a_news.ndate,
        a_news_headers.nheader,
        a_news_headers.nsubheader,
        a_news_headers.nteaser
      FROM a_news
      LEFT JOIN a_news_headers ON a_news.id = a_news_headers.id
      WHERE a_news.udate < UNIX_TIMESTAMP() 
        AND a_news.approved = 1 
        AND a_news.lang = ? 
        AND (a_news_headers.nheader LIKE ? OR a_news_headers.nsubheader LIKE ? OR a_news_headers.nteaser LIKE ?)
      ORDER BY a_news.udate DESC
      LIMIT ? OFFSET ?
    `;
    
    const [searchResults] = await connection.execute(testQuery, [
      lang, searchTerm, searchTerm, searchTerm, limit, offset
    ]);
    
    console.log(`✅ Search query successful! Found ${searchResults.length} results`);
    
    await connection.end();
    console.log('\n🎉 All tests passed! Database connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check your database credentials in .env file');
      console.log('  2. Ensure the user has proper permissions');
      console.log('  3. Verify the database exists');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check if MySQL server is running');
      console.log('  2. Verify the host and port are correct');
      console.log('  3. Check firewall settings');
    } else if (error.code === 'ER_MALFORMED_PACKET') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check network connectivity');
      console.log('  2. Verify MySQL server version compatibility');
      console.log('  3. Try increasing connection timeout');
    }
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
