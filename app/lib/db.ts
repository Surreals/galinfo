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
  // Add acquire timeout
  acquireTimeout: 60000,
  // Add timeout for operations
  timeout: 60000,
  // Add charset to ensure proper encoding
  charset: 'utf8mb4',
  // Add support for multiple statements (disabled for security)
  multipleStatements: false,
  // Add connection retry options
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add reconnect options
  reconnect: true,
  // Add SSL configuration if needed
  ssl: process.env.DB_SSL === 'true' ? {} : false,
  // Add connection validation
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Add idle timeout
  idleTimeout: 300000, // 5 minutes
  // Add maximum idle connections
  maxIdle: 5,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Add pool event handlers for better debugging
pool.on('connection', (connection) => {
  console.log('New connection established as id ' + connection.threadId);
});

// Connection health check function
export async function checkConnectionHealth(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Connection health check failed:', error);
    return false;
  }
}

// Test connection function
export async function testConnection() {
  try {
    const isHealthy = await checkConnectionHealth();
    if (isHealthy) {
      console.log('✅ Database connected successfully!');
      return true;
    } else {
      console.error('❌ Database connection health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Handle SSL-specific errors
    if (error instanceof Error && error.message.includes('secure connection')) {
      console.log('🔄 SSL connection failed, trying to connect without SSL...');
      
      // Try to create a new connection without SSL
      try {
        const nonSslConfig = { ...dbConfig, ssl: false };
        
        const mysql = require('mysql2/promise');
        const tempPool = mysql.createPool(nonSslConfig);
        const connection = await tempPool.getConnection();
        await connection.ping();
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
export async function executeQuery<T = any>(query: string, params?: any[]): Promise<[T[], any]> {
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.execute(query, params);
      // mysql2 execute returns [rows, fields] where rows is the actual data array
      return result as [T[], any];
    } catch (error) {
      lastError = error;
      console.error(`Query execution failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // Check if this is a retryable error
      const isRetryableError = error instanceof Error && (
        error.message.includes('Malformed communication packet') || 
        error.message.includes('Lost connection') ||
        error.message.includes('Connection lost') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        (error as any).code === 'ECONNRESET' ||
        (error as any).code === 'ETIMEDOUT' ||
        (error as any).code === 'ENOTFOUND' ||
        (error as any).errno === -54 // ECONNRESET errno
      );
      
      if (isRetryableError && attempt < maxRetries) {
        console.log(`Retryable error detected, attempting to reconnect and retry query (attempt ${attempt + 1}/${maxRetries})...`);
        // Wait progressively longer between retries
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Try to get a fresh connection
        try {
          const connection = await pool.getConnection();
          connection.release();
        } catch (connError) {
          console.warn('Failed to get fresh connection during retry:', connError);
        }
        
        continue;
      }
      
      // For non-retryable errors or max retries reached, break
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
