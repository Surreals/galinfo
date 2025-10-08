const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupAdvertisementsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Creating advertisements table...');

    // Create advertisements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS advertisements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500),
        link_url VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        click_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        start_date DATETIME NULL,
        end_date DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_order (display_order),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Advertisements table created successfully!');

    // Insert sample data
    console.log('Inserting sample advertisement...');
    await connection.execute(`
      INSERT INTO advertisements (title, image_url, link_url, is_active, display_order)
      VALUES 
        ('Sample Advertisement 1', '/media/sample-ad.jpg', 'https://example.com', true, 1),
        ('Sample Advertisement 2', '/media/sample-ad2.jpg', 'https://example.com/promo', false, 2)
      ON DUPLICATE KEY UPDATE title = title
    `);

    console.log('✅ Sample data inserted!');

  } catch (error) {
    console.error('Error setting up advertisements table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

setupAdvertisementsTable()
  .then(() => {
    console.log('Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

