/**
 * Migration script to add 2FA (Two-Factor Authentication) fields to a_powerusers table
 * 
 * This adds:
 * - twofa_secret: stores the secret key for TOTP
 * - twofa_enabled: boolean flag if 2FA is enabled
 * - backup_codes: JSON array of backup codes for recovery
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addTwoFactorFields() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM a_powerusers LIKE 'twofa_%'
    `);

    if (columns.length > 0) {
      console.log('⚠️  2FA columns already exist. Skipping...');
      return;
    }

    // Add twofa_secret column
    await connection.query(`
      ALTER TABLE a_powerusers 
      ADD COLUMN twofa_secret VARCHAR(255) NULL DEFAULT NULL
      COMMENT '2FA secret key for Google Authenticator'
      AFTER active
    `);
    console.log('✅ Added twofa_secret column');

    // Add twofa_enabled column
    await connection.query(`
      ALTER TABLE a_powerusers 
      ADD COLUMN twofa_enabled TINYINT(1) NOT NULL DEFAULT 0
      COMMENT '1 if 2FA is enabled, 0 otherwise'
      AFTER twofa_secret
    `);
    console.log('✅ Added twofa_enabled column');

    // Add backup_codes column
    await connection.query(`
      ALTER TABLE a_powerusers 
      ADD COLUMN backup_codes TEXT NULL DEFAULT NULL
      COMMENT 'JSON array of backup codes for 2FA recovery'
      AFTER twofa_enabled
    `);
    console.log('✅ Added backup_codes column');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNew columns added to a_powerusers:');
    console.log('  - twofa_secret (VARCHAR 255)');
    console.log('  - twofa_enabled (TINYINT 1, default 0)');
    console.log('  - backup_codes (TEXT)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run migration
addTwoFactorFields()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });

