/**
 * Smart Role Assignment Script
 * 
 * Automatically assigns roles based on username patterns:
 * - Users with 'editor' in username → 'editor'
 * - User 'admin' → 'admin'
 * - All others → keep current role or set to 'journalist'
 * 
 * Usage: node scripts/assign-roles-by-name.js
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

// Check if --yes flag is provided
const autoConfirm = process.argv.includes('--yes') || process.argv.includes('-y');

async function assignRolesByName() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Get all users
    const [users] = await connection.execute(`
      SELECT id, uname_ua, uname, role 
      FROM a_powerusers 
      ORDER BY uname
    `);

    console.log(`📊 Found ${users.length} users\n`);

    // Prepare role suggestions
    const suggestions = users.map(user => {
      let suggestedRole = user.role; // Keep current role by default

      // Check username patterns
      const lowerUsername = user.uname.toLowerCase();
      
      if (user.uname === 'admin') {
        suggestedRole = 'admin';
      } else if (lowerUsername.includes('editor') || lowerUsername.includes('redaktor')) {
        suggestedRole = 'editor';
      } else if (lowerUsername.includes('journalist') || lowerUsername.includes('zhurnalist')) {
        suggestedRole = 'journalist';
      }

      return {
        ...user,
        suggestedRole,
        willChange: user.role !== suggestedRole
      };
    });

    // Show suggestions
    console.log('📋 Role assignment suggestions:\n');
    const changingUsers = suggestions.filter(u => u.willChange);
    
    if (changingUsers.length === 0) {
      console.log('✅ No changes needed - all users already have appropriate roles');
      return;
    }

    console.table(changingUsers.map(u => ({
      'ID': u.id,
      'Ім\'я': u.uname_ua,
      'Логін': u.uname,
      'Поточна роль': u.role,
      '→ Нова роль': u.suggestedRole
    })));

    console.log(`\n🔄 Will update ${changingUsers.length} users\n`);

    if (!autoConfirm) {
      console.log('⚠️  Run with --yes flag to apply changes automatically');
      console.log('   Example: npm run migrate:assign-roles -- --yes\n');
      console.log('📋 Summary: This will change roles for the users listed above');
      return;
    }

    // Apply changes
    console.log('\n🔄 Applying role changes...');
    let updatedCount = 0;

    for (const user of changingUsers) {
      await connection.execute(
        'UPDATE a_powerusers SET role = ? WHERE id = ?',
        [user.suggestedRole, user.id]
      );
      updatedCount++;
      console.log(`  ✅ ${user.uname} → ${user.suggestedRole}`);
    }

    console.log(`\n✅ Updated ${updatedCount} users`);

    // Show final distribution
    console.log('\n📊 Final role distribution:');
    const [stats] = await connection.execute(`
      SELECT role, COUNT(*) as count 
      FROM a_powerusers 
      GROUP BY role 
      ORDER BY 
        CASE role 
          WHEN 'admin' THEN 1 
          WHEN 'editor' THEN 2 
          WHEN 'journalist' THEN 3 
          ELSE 4 
        END
    `);
    console.table(stats);
    
    console.log('\n✅ Role assignment completed!');
    
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

// Run the assignment
assignRolesByName()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Assignment failed:', error);
    process.exit(1);
  });

