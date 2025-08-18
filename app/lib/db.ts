import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env' });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.production') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Database configuration with fallbacks
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfodb_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add connection timeout for remote connections
  connectTimeout: process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost' ? 60000 : 10000,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Handle SSL-specific errors
    if (error instanceof Error && error.message.includes('secure connection')) {
      console.log('🔄 SSL connection failed, trying to connect without SSL...');
      
      // Try to create a new connection without SSL
      try {
        const nonSslConfig = { ...dbConfig };
        
        const mysql = require('mysql2/promise');
        const tempPool = mysql.createPool(nonSslConfig);
        const connection = await tempPool.getConnection();
        console.log('✅ Database connected successfully without SSL!');
        connection.release();
        await tempPool.end();
        return true;
      } catch (sslError) {
        console.error('❌ Non-SSL connection also failed:', sslError);
        return false;
      }
    }
    
    return false;
  }
}

// Execute query function
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

// Close pool function
export async function closePool() {
  await pool.end();
}

export default pool;
