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
  connectionLimit: 5, // Reduced from 10 to prevent connection exhaustion
  queueLimit: 0,
  // Add connection timeout for remote connections
  connectTimeout: process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost' ? 60000 : 10000,
  // Add acquire timeout
  acquireTimeout: 30000, // Reduced to 30 seconds
  // Add timeout for operations
  timeout: 30000, // Reduced to 30 seconds
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
  // Add idle timeout - reduced to prevent long-lived connections
  idleTimeout: 60000, // 1 minute instead of 5 minutes
  // Add maximum idle connections - reduced
  maxIdle: 2, // Reduced from 5 to 2
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Add pool event handlers for better debugging
pool.on('connection', (connection) => {
  console.log('New connection established as id ' + connection.threadId);
});

// Function to get pool statistics
export function getPoolStats() {
  const poolInternal = pool.pool as any;
  return {
    total: poolInternal._allConnections?.length || 0,
    free: poolInternal._freeConnections?.length || 0,
    acquiring: poolInternal._acquiringConnections?.length || 0,
    used: (poolInternal._allConnections?.length || 0) - (poolInternal._freeConnections?.length || 0)
  };
}

// Monitor pool status
setInterval(() => {
  const stats = getPoolStats();
  console.log(`Pool status: ${stats.total} total, ${stats.free} free, ${stats.used} used, ${stats.acquiring} acquiring`);
  
  // Warn if pool is getting full
  if (stats.total >= 4) { // Warn when 80% of max connections are used
    console.warn('⚠️ Connection pool is getting full!');
  }
}, 30000); // Log every 30 seconds

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
        error.message.includes('Too many connections') ||
        (error as any).code === 'ECONNRESET' ||
        (error as any).code === 'ETIMEDOUT' ||
        (error as any).code === 'ENOTFOUND' ||
        (error as any).code === 'ER_CON_COUNT_ERROR' ||
        (error as any).errno === -54 || // ECONNRESET errno
        (error as any).errno === 1040 // ER_CON_COUNT_ERROR errno
      );
      
      if (isRetryableError && attempt < maxRetries) {
        console.log(`Retryable error detected, attempting to reconnect and retry query (attempt ${attempt + 1}/${maxRetries})...`);
        
        // Special handling for "Too many connections" error
        if ((error as any).code === 'ER_CON_COUNT_ERROR' || (error as any).errno === 1040) {
          console.log('Too many connections error detected, waiting longer before retry...');
          // Wait longer for connection pool to clear
          const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000); // Longer backoff for connection limit errors
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Try to force cleanup of idle connections
          try {
            // Get pool statistics
            const stats = getPoolStats();
            console.log(`Pool status before cleanup:`, stats);
            
            // Force close idle connections if there are too many
            if (stats.free > 2) {
              console.log('Forcing cleanup of excess idle connections...');
              const poolInternal = pool.pool as any;
              const excessConnections = poolInternal._freeConnections?.splice(2) || []; // Keep only 2 free connections
              for (const conn of excessConnections) {
                try {
                  await conn.end();
                } catch (e) {
                  // Ignore cleanup errors
                }
              }
            }
          } catch (cleanupError) {
            console.warn('Connection cleanup failed:', cleanupError);
          }
        } else {
          // Regular retry for other errors
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        continue;
      }
      
      // For non-retryable errors or max retries reached, break
      break;
    }
  }
  
  throw lastError;
}

// Force cleanup of excess connections
export async function cleanupConnections(): Promise<void> {
  try {
    const stats = getPoolStats();
    console.log(`Cleaning up connections. Current stats:`, stats);
    
    // Close excess free connections
    if (stats.free > 2) {
      const poolInternal = pool.pool as any;
      const excessConnections = poolInternal._freeConnections?.splice(2) || []; // Keep only 2 free connections
      console.log(`Closing ${excessConnections.length} excess connections`);
      
      for (const conn of excessConnections) {
        try {
          await conn.end();
        } catch (e) {
          console.warn('Failed to close excess connection:', e);
        }
      }
    }
    
    console.log(`Cleanup complete. New stats:`, getPoolStats());
  } catch (error) {
    console.error('Connection cleanup failed:', error);
  }
}

// Close pool function
export async function closePool() {
  await pool.end();
}

export default pool;
