/**
 * Fix Script: Fix role column structure in a_powerusers table
 * 
 * This script:
 * 1. Checks the current structure of the role column
 * 2. Modifies it to VARCHAR(20) if needed
 * 3. Sets proper default values
 * 
 * Usage: node scripts/fix-role-column.js
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

async function fixRoleColumn() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check current column structure
    console.log('📊 Checking current role column structure...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM a_powerusers LIKE 'role'
    `);

    if (columns.length > 0) {
      const columnInfo = columns[0];
      console.log('Current column structure:', columnInfo);
      
      // Modify column to ensure it's VARCHAR(20)
      console.log('🔧 Modifying role column to VARCHAR(20)...');
      await connection.execute(`
        ALTER TABLE a_powerusers 
        MODIFY COLUMN role VARCHAR(20) DEFAULT 'journalist'
      `);
      console.log('✅ Role column structure updated');
      
    } else {
      // Column doesn't exist, create it
      console.log('➕ Creating role column...');
      await connection.execute(`
        ALTER TABLE a_powerusers 
        ADD COLUMN role VARCHAR(20) DEFAULT 'journalist' 
        AFTER perm
      `);
      console.log('✅ Role column created');
    }

    // Set all users to journalist by default where role is NULL or empty
    console.log('🔄 Setting default roles...');
    await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'journalist' 
      WHERE role IS NULL OR role = ''
    `);
    console.log('✅ Set default role to journalist for users without role');
    
    // Set admin role for admin user
    console.log('👑 Setting admin role for admin user...');
    const [result] = await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'admin' 
      WHERE uname = 'admin'
    `);
    console.log(`✅ Set admin role for admin user (${result.affectedRows} rows affected)`);

    // Display summary
    console.log('\n📋 User Role Summary:');
    const [users] = await connection.execute(`
      SELECT id, uname_ua, uname, role FROM a_powerusers ORDER BY role, uname
    `);
    
    console.table(users);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the fix
fixRoleColumn()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });

