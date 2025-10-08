/**
 * Migration Script: Add role column to a_powerusers table
 * 
 * This script:
 * 1. Adds a 'role' column to the a_powerusers table
 * 2. Sets the default role to 'journalist'
 * 3. Sets role to 'admin' for the user with username 'admin'
 * 
 * Usage: node scripts/add-role-column.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306', 10),
};

async function addRoleColumn() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if role column already exists
    console.log('📊 Checking if role column exists...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM a_powerusers LIKE 'role'
    `);

    if (columns.length > 0) {
      console.log('⚠️  Role column already exists');
      
      // Ask if user wants to reset roles
      console.log('🔄 Updating user roles...');
      
      // Set all users to journalist by default
      await connection.execute(`
        UPDATE a_powerusers 
        SET role = 'journalist' 
        WHERE role IS NULL OR role = ''
      `);
      console.log('✅ Set default role to journalist for users without role');
      
      // Set admin role for admin user
      const [result] = await connection.execute(`
        UPDATE a_powerusers 
        SET role = 'admin' 
        WHERE uname = 'admin'
      `);
      console.log(`✅ Set admin role for admin user (${result.affectedRows} rows affected)`);
      
    } else {
      console.log('➕ Adding role column...');
      
      // Add role column with default value 'journalist'
      await connection.execute(`
        ALTER TABLE a_powerusers 
        ADD COLUMN role VARCHAR(20) DEFAULT 'journalist' 
        AFTER perm
      `);
      console.log('✅ Role column added successfully');

      // Set all existing users to journalist
      await connection.execute(`
        UPDATE a_powerusers 
        SET role = 'journalist' 
        WHERE role IS NULL OR role = ''
      `);
      console.log('✅ Set default role to journalist for all existing users');

      // Set admin role for admin user
      const [result] = await connection.execute(`
        UPDATE a_powerusers 
        SET role = 'admin' 
        WHERE uname = 'admin'
      `);
      console.log(`✅ Set admin role for admin user (${result.affectedRows} rows affected)`);
    }

    // Display summary
    console.log('\n📋 User Role Summary:');
    const [users] = await connection.execute(`
      SELECT uname_ua, uname, role FROM a_powerusers ORDER BY role, uname
    `);
    
    console.table(users);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the migration
addRoleColumn()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

