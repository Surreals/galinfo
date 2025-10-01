#!/usr/bin/env node

/**
 * Video Table Setup Script
 * 
 * This script creates the a_videos table for storing video files.
 * Similar to a_pics table but for video content.
 * 
 * Usage:
 *   node scripts/setup-videos-table.js
 */

const mysql = require('mysql2/promise');
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

async function createVideosTable() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('📊 Creating a_videos table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS a_videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        title_ua VARCHAR(500),
        title_deflang VARCHAR(500),
        description_ua TEXT,
        description_deflang TEXT,
        thumburl VARCHAR(500),
        duration INT DEFAULT 0,
        file_size BIGINT DEFAULT 0,
        mime_type VARCHAR(100),
        video_type TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_filename (filename),
        INDEX idx_video_type (video_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ a_videos table created/verified successfully!');
    console.log('');
    console.log('📋 Table structure:');
    console.log('   - id: Primary key');
    console.log('   - filename: Unique video filename');
    console.log('   - title_ua: Ukrainian title');
    console.log('   - title_deflang: Default language title');
    console.log('   - description_ua: Ukrainian description');
    console.log('   - description_deflang: Default language description');
    console.log('   - duration: Video duration in seconds');
    console.log('   - file_size: File size in bytes');
    console.log('   - mime_type: MIME type (video/mp4, etc.)');
    console.log('   - video_type: Type of video (1=news, 2=gallery, 3=advertisement)');
    console.log('   - created_at/updated_at: Timestamps');
    
  } catch (error) {
    console.error('❌ Error creating videos table:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed.');
    }
  }
}

async function main() {
  console.log('🚀 GalInfo Videos Table Setup');
  console.log('=============================');
  
  try {
    await createVideosTable();
    console.log('');
    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createVideosTable };
