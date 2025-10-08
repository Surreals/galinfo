#!/usr/bin/env node

/**
 * Admin Setup Script
 * 
 * This script creates a default admin user for the GalInfo admin panel.
 * Uses the a_powerusers table for admin authentication.
 * 
 * Usage:
 *   node scripts/setup-admin.js
 * 
 * Default credentials:
 *   Login: admin
 *   Password: admin
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'galinfodb_db',
  port: Number(process.env.DB_PORT || 3306),
};

async function setupAdmin() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    // Check if admin user already exists
    console.log('🔍 Checking for existing admin user...');
    const [existingAdmin] = await connection.execute(
      'SELECT * FROM a_powerusers WHERE uname = ?',
      ['admin']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Login: admin');
      console.log('   If you forgot the password, delete the admin user from the database and run this script again.');
      return;
    }

    // Create default admin credentials
    const adminLogin = 'admin';
    const adminPassword = 'admin';
    const hashedPassword = crypto.createHash('md5').update(adminPassword).digest('hex');

    console.log('👤 Creating admin user...');
    
    // Create default permissions for admin user (all permissions enabled)
    const defaultPermissions = {
      ac_usermanage: true,
      ac_newsmanage: true,
      ac_articlemanage: true,
      ac_commentmanage: true,
      ac_sitemanage: true,
      ac_admanage: true,
      ac_telegrammanage: true
    };
    
    // Insert admin user with all required fields for a_powerusers table
    await connection.execute(
      `INSERT INTO a_powerusers (
        uname, upass, uname_ua, uagency, perm, active
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        adminLogin,                    // uname (username)
        hashedPassword,                // upass (MD5 hashed password)
        'Адміністратор',               // uname_ua (Ukrainian name)
        'Гал-Інфо',                    // uagency (agency)
        JSON.stringify(defaultPermissions), // perm (permissions as JSON)
        1                              // active (active status)
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('🔑 Default Admin Credentials:');
    console.log('   Login: admin');
    console.log('   Password: admin');
    console.log('');
    console.log('🌐 Access the admin panel at: http://localhost:3000/admin/login');
    console.log('');
    console.log('⚠️  SECURITY WARNING: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('');
      console.log('💡 The a_powerusers table does not exist. You may need to:');
      console.log('   1. Run database migrations');
      console.log('   2. Create the table manually using the SQL schema in docs/');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Cannot connect to database. Please check:');
      console.log('   1. Database server is running');
      console.log('   2. Database credentials in .env file');
      console.log('   3. Database name exists');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed.');
    }
  }
}

// Create the a_powerusers table if it doesn't exist
async function createPowerUsersTable() {
  let connection;
  
  try {
    console.log('📊 Creating a_powerusers table...');
    connection = await mysql.createConnection(config);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS a_powerusers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uname VARCHAR(255) NOT NULL UNIQUE,
        upass VARCHAR(255) NOT NULL,
        uname_ua VARCHAR(255),
        uagency VARCHAR(255),
        perm TEXT,
        active TINYINT(1) DEFAULT 1,
        twofa_enabled TINYINT(1) DEFAULT 0,
        twofa_secret VARCHAR(255) DEFAULT NULL,
        backup_codes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ a_powerusers table created/verified.');
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('🚀 GalInfo Admin Setup');
  console.log('====================');
  
  try {
    // First try to create the table if it doesn't exist
    await createPowerUsersTable();
    
    // Then setup the admin user
    await setupAdmin();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { setupAdmin, createPowerUsersTable };
