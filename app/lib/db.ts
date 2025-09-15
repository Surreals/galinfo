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
  connectionLimit: 2, // Further reduced to match database server limits
  queueLimit: 0,
  // Add connection timeout for remote connections
  connectTimeout: process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost' ? 60000 : 10000,
  // Add acquire timeout
  acquireTimeout: 10000, // Reduced to 10 seconds to fail faster
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
  maxIdle: 1, // Reduced to 1 to minimize idle connections
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
  
  // Handle both Denque objects and regular arrays
  const getLength = (obj: any) => {
    if (!obj) return 0;
    if (typeof obj.length === 'number') return obj.length;
    if (typeof obj.size === 'number') return obj.size;
    return 0;
  };
  
  const total = getLength(poolInternal._allConnections);
  const free = getLength(poolInternal._freeConnections);
  const acquiring = getLength(poolInternal._acquiringConnections);
  
  return {
    total,
    free,
    acquiring,
    used: total - free
  };
}

// Track connection usage for leak detection
let connectionLeakCount = 0;
let lastConnectionCount = 0;

// Monitor pool status
setInterval(() => {
  const stats = getPoolStats();
  console.log(`Pool status: ${stats.total} total, ${stats.free} free, ${stats.used} used, ${stats.acquiring} acquiring`);
  
  // Connection leak detection
  if (stats.total === lastConnectionCount && stats.used > 0) {
    connectionLeakCount++;
    if (connectionLeakCount >= 3) { // If connections stay the same for 3 cycles (90 seconds)
      console.error('🚨 Potential connection leak detected! Forcing pool reset...');
      cleanupConnections().catch(err => console.error('Leak cleanup failed:', err));
      connectionLeakCount = 0;
    }
  } else {
    connectionLeakCount = 0;
  }
  lastConnectionCount = stats.total;
  
  // Warn if pool is getting full and trigger cleanup
  if (stats.total >= 2) { // Warn when all connections are used (100% of max 2)
    console.warn('⚠️ Connection pool is at maximum capacity!');
    // Trigger cleanup when pool is full
    cleanupConnections().catch(err => console.error('Auto-cleanup failed:', err));
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
            
            // Force close all connections to reset the pool
            console.log('Forcing complete connection pool reset...');
            const poolInternal = pool.pool as any;
            
            // Close all connections to force a complete reset
            try {
              const allConnections = poolInternal._allConnections;
              if (allConnections && Array.isArray(allConnections)) {
                const connectionsToClose = [...allConnections];
                for (const conn of connectionsToClose) {
                  try {
                    await conn.end();
                  } catch (e) {
                    // Ignore cleanup errors
                  }
                }
              } else {
                console.warn('_allConnections is not available or not an array during retry cleanup');
              }
            } catch (cleanupError) {
              console.warn('Error accessing pool connections during retry:', cleanupError);
            }
            
            // Clear the connection arrays (they might be Denque objects, not regular arrays)
            try {
              if (poolInternal._allConnections && typeof poolInternal._allConnections.clear === 'function') {
                poolInternal._allConnections.clear();
              } else if (poolInternal._allConnections && Array.isArray(poolInternal._allConnections)) {
                poolInternal._allConnections.length = 0;
              }
              
              if (poolInternal._freeConnections && typeof poolInternal._freeConnections.clear === 'function') {
                poolInternal._freeConnections.clear();
              } else if (poolInternal._freeConnections && Array.isArray(poolInternal._freeConnections)) {
                poolInternal._freeConnections.length = 0;
              }
            } catch (clearError) {
              console.warn('Error clearing connection arrays:', clearError);
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
    
    // Close excess free connections - keep only 1 free connection
    if (stats.free > 1) {
      const poolInternal = pool.pool as any;
      let excessConnections: any[] = [];
      
      try {
        if (poolInternal._freeConnections) {
          if (Array.isArray(poolInternal._freeConnections)) {
            excessConnections = poolInternal._freeConnections.splice(1); // Keep only 1 free connection
          } else if (typeof poolInternal._freeConnections.splice === 'function') {
            // Handle Denque objects
            excessConnections = poolInternal._freeConnections.splice(1);
          }
        }
        
        console.log(`Closing ${excessConnections.length} excess connections`);
        
        for (const conn of excessConnections) {
          try {
            await conn.end();
          } catch (e) {
            console.warn('Failed to close excess connection:', e);
          }
        }
      } catch (error) {
        console.warn('Error accessing free connections for cleanup:', error);
      }
    }
    
    // Force close all connections if we're still at limit
    if (stats.total >= 2) {
      console.log('Pool still at limit, forcing connection reset...');
      const poolInternal = pool.pool as any;
      
      // Close all connections and let pool recreate them
      try {
        const allConnections = poolInternal._allConnections;
        if (allConnections && Array.isArray(allConnections)) {
          const connectionsToClose = [...allConnections];
          for (const conn of connectionsToClose) {
            try {
              await conn.end();
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        } else {
          console.warn('_allConnections is not available or not an array, skipping connection cleanup');
        }
      } catch (error) {
        console.error('Error accessing pool connections:', error);
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
