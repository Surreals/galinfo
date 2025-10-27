#!/usr/bin/env node

/**
 * Update Admin Password Script
 * 
 * This script updates the admin user password in the database
 * 
 * Usage: node scripts/update-admin-password.js
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

async function updateAdminPassword() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    // New password
    const newPassword = 'vx572Z9hpJPZ';
    const hashedPassword = crypto.createHash('md5').update(newPassword).digest('hex');
    
    console.log('🔐 Updating admin password...');
    
    // Update admin password
    const [result] = await connection.execute(
      'UPDATE a_powerusers SET upass = ? WHERE uname = ?',
      [hashedPassword, 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('');
      console.log('🔑 New Admin Credentials:');
      console.log('   Login: admin');
      console.log('   Password: vx572Z9hpJPZ');
      console.log('');
      console.log('🌐 Access the admin panel at: http://localhost:3000/admin/login');
    } else {
      console.log('⚠️  Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed.');
    }
  }
}

async function main() {
  console.log('🚀 GalInfo Admin Password Update');
  console.log('=================================');
  
  try {
    await updateAdminPassword();
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateAdminPassword };
