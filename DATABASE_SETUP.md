# Database Setup Guide

This guide will help you connect your Next.js app to MariaDB.

## Prerequisites

- MariaDB server running locally or remotely
- Node.js and npm installed
- Your Next.js project set up

## Installation

The required dependencies have already been installed:
- `mysql2` - MariaDB/MySQL client for Node.js
- `@types/mysql` - TypeScript type definitions

## Configuration

### 1. Create Environment File

Create a `.env.local` file in your project root with your database credentials:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=galinfo
DB_PORT=3306
```

**Important:** Replace the values with your actual MariaDB credentials.

### 2. Database Setup

Make sure your MariaDB server is running and create the database if it doesn't exist:

```sql
CREATE DATABASE IF NOT EXISTS galinfo;
USE galinfo;
```

## Testing the Connection

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Visit the Test Page

Navigate to `/test-db` in your browser to access the database testing interface.

### 3. Test the Connection

Click the "Test Connection" button to verify your database connection.

## API Endpoints

### GET `/api/test-db`
Tests the database connection and returns a simple query result.

### POST `/api/test-db`
Executes a custom SQL query. Send a JSON body with:
```json
{
  "query": "SELECT * FROM your_table LIMIT 5",
  "params": []
}
```

## File Structure

```
app/
├── lib/
│   └── db.ts              # Database configuration and utilities
├── api/
│   └── test-db/
│       └── route.ts       # API endpoints for testing
└── test-db/
    └── page.tsx           # Test page UI
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MariaDB server is running
   - Check if the port (3306) is correct
   - Verify firewall settings

2. **Access Denied**
   - Check username and password
   - Ensure the user has access to the specified database
   - Verify user privileges

3. **Database Not Found**
   - Create the database: `CREATE DATABASE galinfo;`
   - Check the database name in your environment variables

### Debug Mode

To see detailed connection logs, check your terminal where the Next.js server is running.

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for sensitive information
- Consider using connection pooling for production
- Implement proper authentication and authorization

## Next Steps

Once the connection is working, you can:
1. Create database models and schemas
2. Implement CRUD operations
3. Add data validation
4. Set up database migrations
5. Implement connection pooling for production

## Support

If you encounter issues:
1. Check the MariaDB server logs
2. Verify your connection parameters
3. Test with a simple MySQL client first
4. Check the browser console and server logs for errors
