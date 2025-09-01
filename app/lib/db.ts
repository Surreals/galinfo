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
  // Add charset to ensure proper encoding
  charset: 'utf8mb4',
  // Add support for multiple statements (disabled for security)
  multipleStatements: false,
  // Add connection retry options
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
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

// Execute query function with retry logic
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [rows] = await pool.execute(query, params);
      return rows as T[];
    } catch (error) {
      lastError = error;
      console.error(`Query execution failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // If it's a malformed packet error, try to reconnect
      if (error instanceof Error && 
          (error.message.includes('Malformed communication packet') || 
           error.message.includes('Lost connection') ||
           error.message.includes('Connection lost'))) {
        
        if (attempt < maxRetries) {
          console.log(`Attempting to reconnect and retry query (attempt ${attempt + 1}/${maxRetries})...`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }
      
      // For other errors, don't retry
      break;
    }
  }
  
  throw lastError;
}

// Close pool function
export async function closePool() {
  await pool.end();
}

export default pool;
