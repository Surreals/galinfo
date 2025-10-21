import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Extend global type to include _mysqlPool
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env' });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.production') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Database configuration
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfodb_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,    // 5–15 зазвичай достатньо
  queueLimit: 50,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  // Add charset to ensure proper encoding
  charset: 'utf8mb4',
  // Add support for multiple statements (disabled for security)
  multipleStatements: false,
  // Add connection retry options
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add SSL configuration if needed
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
  // Add connection validation
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Close idle connections after 15 seconds
  idleTimeout: 15000,
};

// Ensure single pool instance across all requests
global._mysqlPool = global._mysqlPool || mysql.createPool(config);

// Add pool event handlers for debugging (only once)
if (!global._mysqlPool.listenerCount('connection')) {
  global._mysqlPool.on('connection', (connection) => {
    // console.log('🔗 New connection established as id ' + connection.threadId);
  });

  global._mysqlPool.on('acquire', (connection) => {
    // console.log('🔓 Connection %d acquired', connection.threadId);
  });

  global._mysqlPool.on('release', (connection) => {
    // console.log('🔒 Connection %d released', connection.threadId);
  });
}

const pool = global._mysqlPool;

// Connection health check function
export async function checkConnectionHealth(): Promise<boolean> {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    return true;
  } catch (error) {
     console.error('Connection health check failed:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Test connection function
export async function testConnection() {
  try {
    const isHealthy = await checkConnectionHealth();
    if (isHealthy) {
      // console.log('✅ Database connected successfully!');
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
        const nonSslConfig = { ...config, ssl: undefined };
        const connection = await mysql.createConnection(nonSslConfig);
        await connection.ping();
        // console.log('✅ Database connected successfully without SSL!');
        await connection.end();
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
      // console.log(`🔗 Executing query (attempt ${attempt})`);
      
      // Use pool.query() for automatic connection management
      const result = await pool.query(query, params);
      // console.log(`✅ Query executed successfully (attempt ${attempt})`);
      
      // mysql2 query returns [rows, fields] where rows is the actual data array
      return result as [T[], any];
    } catch (error) {
      lastError = error;
      console.error(`❌ Query execution failed (attempt ${attempt}/${maxRetries}):`, error);
      
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
        console.log(`🔄 Retryable error detected, attempting to reconnect and retry query (attempt ${attempt + 1}/${maxRetries})...`);
        
        // Special handling for "Too many connections" error
        if ((error as any).code === 'ER_CON_COUNT_ERROR' || (error as any).errno === 1040) {
           console.log('⚠️ Too many connections error detected, waiting longer before retry...');
          // Wait longer for connections to clear
          const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000); // Longer backoff for connection limit errors
          await new Promise(resolve => setTimeout(resolve, waitTime));
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

// Function to get pool statistics
export function getPoolStats() {
  return {
    totalConnections: pool.pool._allConnections?.length || 0,
    freeConnections: pool.pool._freeConnections?.length || 0,
    acquiringConnections: pool.pool._acquiringConnections?.length || 0,
    usedConnections: (pool.pool._allConnections?.length || 0) - (pool.pool._freeConnections?.length || 0)
  };
}

// Close connection pool function
export async function closeConnectionPool() {
  await pool.end();
}

// Export the pool for direct use if needed
export default pool;