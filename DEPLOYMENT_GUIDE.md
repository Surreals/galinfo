# Deployment Guide: Connecting to MariaDB Server

This guide explains how to set up both your local development environment and your Ubuntu server to connect to the MariaDB database on your server (84.46.249.31).

## 🏗️ Architecture Overview

```
Local Development (Your Mac) ←→ MariaDB Server (84.46.249.31)
Ubuntu Server App ←→ MariaDB Server (84.46.249.31)
```

## 🔧 Local Development Setup

### 1. Environment Configuration

Your local environment (`.env.local`) is configured to connect to the remote MariaDB server:

```bash
# Database Configuration for Local Development
DB_HOST=84.46.249.31
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=galinfodb_db
DB_PORT=3306
NODE_ENV=development
```

### 2. Test Local Connection

```bash
# Test database connection from local machine
npm run test:db
# or
pnpm test:db
```

### 3. Run Local Development

```bash
pnpm dev
```

## 🚀 Ubuntu Server Setup

### 1. Environment Configuration

On your Ubuntu server, create `.env.production`:

```bash
# Database Configuration for Production Server
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=galinfodb_db
DB_PORT=3306
NODE_ENV=production
```

### 2. Deploy to Server

```bash
# On your local machine, build the app
pnpm build

# Copy the following to your server:
# - .next/ directory
# - .env.production
# - package.json
# - package-lock.json or pnpm-lock.yaml
# - public/ directory
# - next.config.ts
# - tailwind.config.ts
# - tsconfig.json

# On your server, install dependencies
pnpm install --production

# Start the production server
pnpm start
```

## 🔒 MariaDB Server Configuration

### 1. Allow Remote Connections

On your MariaDB server (84.46.249.31), ensure MariaDB is configured to accept remote connections:

```sql
-- Connect to MariaDB as root
mysql -u root -p

-- Create a user for remote access (if needed)
CREATE USER 'galinfo_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON galinfodb_db.* TO 'galinfo_user'@'%';
FLUSH PRIVILEGES;

-- Or modify existing root user to allow remote access
UPDATE mysql.user SET Host='%' WHERE User='root';
FLUSH PRIVILEGES;
```

### 2. MariaDB Configuration File

Edit `/etc/mysql/mariadb.conf.d/50-server.cnf`:

```ini
[mysqld]
# Allow remote connections
bind-address = 0.0.0.0

# Increase connection limits
max_connections = 200
max_connect_errors = 1000
```

### 3. Firewall Configuration

Ensure port 3306 is open on your server:

```bash
# Check if port 3306 is open
sudo ufw status

# If UFW is active, allow MySQL port
sudo ufw allow 3306

# Or if using iptables
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
```

### 4. Restart MariaDB

```bash
sudo systemctl restart mariadb
```

## 🧪 Testing Connections

### Test from Local Machine

```bash
# Test database connection
pnpm test:db

# Expected output:
# 🔍 Testing database connection...
# 📍 Host: 84.46.249.31
# 👤 User: root
# 🗄️  Database: galinfodb_db
# 🔌 Port: 3306
# 🔒 SSL: Enabled
# ⏱️  Timeout: 60000 ms
# ✅ Database connected successfully!
# ✅ Query test successful: [ { test: 1 } ]
```

### Test from Ubuntu Server

```bash
# Test local connection to MariaDB
mysql -u root -p -h 127.0.0.1 galinfodb_db

# Test from your app
NODE_ENV=production node scripts/test-db-connection.js
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if MariaDB is running: `sudo systemctl status mariadb`
   - Verify port 3306 is open: `netstat -tlnp | grep 3306`

2. **Access Denied**
   - Check user permissions: `SHOW GRANTS FOR 'root'@'%';`
   - Verify password is correct

3. **SSL Issues**
   - The configuration automatically disables SSL verification for remote connections
   - If you need SSL, configure proper certificates

4. **Timeout Issues**
   - Remote connections have a 60-second timeout
   - Local connections have a 10-second timeout

### Debug Commands

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Check MariaDB logs
sudo journalctl -u mariadb -f

# Check network connectivity
telnet 84.46.249.31 3306

# Check firewall status
sudo ufw status
```

## 📱 Environment Variables Summary

| Environment | File | DB_HOST | Purpose |
|-------------|------|---------|---------|
| Local Development | `.env.local` | `84.46.249.31` | Connect to remote server |
| Production Server | `.env.production` | `127.0.0.1` | Connect to local MariaDB |

## 🔄 Next Steps

1. **Update passwords** in both `.env.local` and `.env.production`
2. **Test local connection** with `pnpm test:db`
3. **Deploy to Ubuntu server** with production environment
4. **Test server connection** from the deployed app
5. **Monitor logs** for any connection issues

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify MariaDB is running and accessible
3. Check firewall and network configurations
4. Review MariaDB error logs
