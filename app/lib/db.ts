import mysql from 'mysql2/promise';
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'MISSING');
console.log('process:', process.env);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfodb_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
