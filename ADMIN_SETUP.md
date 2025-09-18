# Admin Setup Guide

This guide explains how to set up admin access for the GalInfo admin panel.

## Quick Setup

### Method 1: Web Interface (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin setup page:
   ```
   http://localhost:3000/admin/setup
   ```

3. Click "Створити адміністратора" (Create Administrator) to create the default admin user

4. Use the default credentials to log in:
   - **Login:** `admin`
   - **Password:** `admin`

5. **Important:** Change the default password after first login!

### Method 2: Command Line

Run the setup script:

```bash
npm run setup:admin
```

Or directly with Node.js:

```bash
node scripts/setup-admin.js
```

### Method 3: API Endpoint

You can also create the admin user by making a POST request to:

```
POST /api/admin/init
```

## Default Admin Credentials

- **Login:** `admin`
- **Password:** `admin`

**Note:** The system now accepts any type of login format (not just email). You can use usernames, email addresses, or any other string as a login identifier.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Password:** Always change the default password after first login
2. **Production Setup:** In production, use strong passwords and consider additional security measures
3. **Database Access:** Ensure your database is properly secured
4. **Environment Variables:** Keep your `.env` files secure and never commit them to version control

## Access Admin Panel

Once the admin user is created, you can access the admin panel at:

```
http://localhost:3000/admin/login
```

## Database Requirements

The system requires a MySQL database with the `a_users` table. The setup scripts will automatically create this table if it doesn't exist.

### Manual Table Creation

If you need to create the table manually:

```sql
CREATE TABLE IF NOT EXISTS a_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uname VARCHAR(255),
  upass VARCHAR(255),
  name VARCHAR(255),
  approved VARCHAR(255),
  logged DATETIME,
  logqty INT DEFAULT 0,
  services VARCHAR(255),
  blogs INT DEFAULT 0,
  regdate DATETIME,
  shortinfo TEXT,
  avatar VARCHAR(255),
  ulang INT DEFAULT 1
);
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Check your `.env` file contains correct database credentials
2. Ensure MySQL server is running
3. Verify the database exists
4. Test database connection with: `npm run test:db`

### Admin User Already Exists

If you get an "admin user already exists" message:

1. The admin user has already been created
2. Try logging in with the default credentials
3. If you forgot the password, delete the admin user from the database and run setup again

### Permission Issues

If you encounter permission errors:

1. Ensure the database user has INSERT, UPDATE, SELECT permissions
2. Check that the `a_users` table exists and is accessible
3. Verify your database configuration in `.env`

## Environment Setup

Make sure your `.env` file contains:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=galinfodb_db
DB_PORT=3306
```

## Support

For additional help, check the documentation in the `docs/` directory or review the admin system README at `docs/ADMIN_SYSTEM_README.md`.
