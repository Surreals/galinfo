/**
 * Conversion Script: Convert old role values to new format
 * 
 * Converts:
 * - 'administrator' → 'admin'
 * - Old 'editor' → 'editor' (no change)
 * - Old 'journalist' → 'journalist' (no change)
 * 
 * Usage: node scripts/convert-roles.js
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

async function convertRoles() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Show current distribution
    console.log('\n📊 Current role distribution:');
    const [beforeStats] = await connection.execute(`
      SELECT role, COUNT(*) as count 
      FROM a_powerusers 
      GROUP BY role 
      ORDER BY role
    `);
    console.table(beforeStats);

    // Convert 'administrator' to 'admin'
    console.log('\n🔄 Converting roles...');
    const [result1] = await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'admin' 
      WHERE role = 'administrator'
    `);
    console.log(`✅ Converted ${result1.affectedRows} users from 'administrator' to 'admin'`);

    // Ensure 'editor' values are correct (in case there were any variations)
    const [result2] = await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'editor' 
      WHERE role = 'editor' OR role = 'Editor'
    `);
    if (result2.affectedRows > 0) {
      console.log(`✅ Normalized ${result2.affectedRows} editor roles`);
    }

    // Ensure 'journalist' values are correct
    const [result3] = await connection.execute(`
      UPDATE a_powerusers 
      SET role = 'journalist' 
      WHERE role = 'journalist' OR role = 'Journalist'
    `);
    if (result3.affectedRows > 0) {
      console.log(`✅ Normalized ${result3.affectedRows} journalist roles`);
    }

    // Show updated distribution
    console.log('\n📊 Updated role distribution:');
    const [afterStats] = await connection.execute(`
      SELECT role, COUNT(*) as count 
      FROM a_powerusers 
      GROUP BY role 
      ORDER BY role
    `);
    console.table(afterStats);

    // Display summary of all users
    console.log('\n📋 All Users:');
    const [users] = await connection.execute(`
      SELECT id, uname_ua, uname, role 
      FROM a_powerusers 
      ORDER BY 
        CASE role 
          WHEN 'admin' THEN 1 
          WHEN 'editor' THEN 2 
          WHEN 'journalist' THEN 3 
          ELSE 4 
        END,
        uname
    `);
    console.table(users);
    
    console.log('\n✅ Role conversion completed successfully!');
    
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

// Run the conversion
convertRoles()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Conversion failed:', error);
    process.exit(1);
  });

