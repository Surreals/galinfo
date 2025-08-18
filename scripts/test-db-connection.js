#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'galinfodb_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    // Try SSL first, but allow fallback to non-SSL
    ssl: process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost' ? {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined,
    // Add connection timeout for remote connections
    connectTimeout: process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost' ? 60000 : 10000,
  };

  console.log('🔍 Testing database connection...');
  console.log('📍 Host:', config.host);
  console.log('👤 User:', config.user);
  console.log('🗄️  Database:', config.database);
  console.log('🔌 Port:', config.port);
  console.log('🔒 SSL:', config.ssl ? 'Enabled (with fallback)' : 'Disabled');
  console.log('⏱️  Timeout:', config.connectTimeout, 'ms');
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // If SSL fails, try without SSL
    if (error.code === 'HANDSHAKE_NO_SSL_SUPPORT' || error.code === 'ECONNRESET') {
      console.log('\n🔄 SSL connection failed, trying without SSL...');
      
      const nonSslConfig = { ...config };
      delete nonSslConfig.ssl;
      
      try {
        const connection = await mysql.createConnection(nonSslConfig);
        console.log('✅ Database connected successfully without SSL!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query test successful:', rows);
        
        await connection.end();
        return true;
      } catch (sslError) {
        console.error('❌ Non-SSL connection also failed:');
        console.error('Error code:', sslError.code);
        console.error('Error message:', sslError.message);
        console.error('Error details:', sslError);
        return false;
      }
    } else {
      console.error('Error details:', error);
      return false;
    }
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
