# Database Migrations Summary

This document summarizes all database migrations performed in the GalInfo project.

## Overview

The project has undergone several database migrations to add new features and functionality. All migrations are consolidated into a single script: `scripts/complete-database-migration.js`

## Migration Summary

### 1. New Tables Created

#### `advertisements` Table
- **Purpose**: Store advertisement data for the website
- **Key Fields**:
  - `id` (Primary Key)
  - `title` (Advertisement title)
  - `image_url` (Advertisement image)
  - `link_url` (Advertisement link)
  - `placement` (Position: adbanner, infomo, sidebar, general)
  - `is_active` (Active status)
  - `display_order` (Display order)
  - `click_count`, `view_count` (Statistics)
  - `start_date`, `end_date` (Campaign dates)
  - `created_at`, `updated_at` (Timestamps)

#### `template_schemas` Table
- **Purpose**: Store template schemas for different page layouts
- **Key Fields**:
  - `id` (Primary Key)
  - `template_id` (Unique template identifier)
  - `name` (Template name)
  - `description` (Template description)
  - `schema_json` (JSON schema data)
  - `created_at`, `updated_at` (Timestamps)

#### `a_videos` Table
- **Purpose**: Store video file metadata
- **Key Fields**:
  - `id` (Primary Key)
  - `filename` (Unique video filename)
  - `title_ua`, `title_deflang` (Titles in different languages)
  - `description_ua`, `description_deflang` (Descriptions)
  - `thumburl` (Thumbnail URL)
  - `duration` (Video duration in seconds)
  - `file_size` (File size in bytes)
  - `mime_type` (MIME type)
  - `video_type` (Type: 1=news, 2=gallery, 3=advertisement)
  - `created_at`, `updated_at` (Timestamps)

### 2. Columns Added to Existing Tables

#### `a_powerusers` Table Additions

##### 2FA (Two-Factor Authentication) Columns
- `twofa_enabled` (TINYINT(1)) - 2FA enabled flag
- `twofa_secret` (VARCHAR(255)) - 2FA secret key
- `backup_codes` (TEXT) - 2FA backup codes (JSON format)

##### Role Management Column
- `role` (VARCHAR(20)) - User role (admin, editor, journalist)
  - Default: 'journalist'
  - Admin user gets 'admin' role automatically

#### `a_news` Table Additions

##### Project Feature Column
- `isProject` (TINYINT(1)) - Marks news as "Project" type
  - Default: 0 (false)
  - 1 = Project display mode
  - Enables special layout without sidebars/ads

#### `advertisements` Table Additions

##### Placement Column
- `placement` (VARCHAR(50)) - Advertisement placement type
  - Values: 'adbanner', 'infomo', 'sidebar', 'general'
  - Default: 'general'
  - Indexed for performance

#### `a_videos` Table Additions

##### Thumbnail URL Column
- `thumburl` (VARCHAR(500)) - Video thumbnail URL
  - Positioned after `description_deflang`
  - Nullable field

## Default Data Setup

### Advertisement Placements
- **adbanner**: Main advertisement (AdBanner component)
- **infomo**: IN-FOMO banner
- **sidebar**: Sidebar advertisement
- **general**: General advertisement (default)

### Template Schemas
Default templates created for:
- Main page (Desktop/Mobile)
- Category pages (Desktop/Mobile)
- Hero sections
- Article pages (Desktop/Mobile)

### User Roles
- **admin**: Full administrative access
- **editor**: Content editing permissions
- **journalist**: Basic content creation permissions

## Migration Script Usage

### Run Complete Migration
```bash
node scripts/complete-database-migration.js
```

### Individual Migration Scripts
If you need to run individual migrations:

```bash
# 2FA columns
node scripts/add-2fa-columns.js

# Role column
node scripts/add-role-column.js

# Project feature
node scripts/add-isproject-column.js

# Advertisement placement
node scripts/add-placement-to-advertisements.js

# Video thumbnail
node scripts/add-thumburl-to-videos.js

# Create tables
node scripts/setup-advertisements-table.js
node scripts/setup-templates-table.js
node scripts/setup-videos-table.js
```

## Features Enabled by Migrations

### 1. Two-Factor Authentication (2FA)
- Secure login with TOTP codes
- Backup codes for account recovery
- Admin-configurable 2FA settings

### 2. Role-Based Access Control (RBAC)
- Three-tier permission system
- Admin, Editor, Journalist roles
- Protected admin routes and features

### 3. Project Display Mode
- Special news layout for "Projects"
- Full-width banner with centered title
- No sidebars or advertisements
- Custom styling and layout

### 4. Advertisement Management
- Multiple placement types
- Campaign scheduling
- Click/view tracking
- Active/inactive status

### 5. Video Management
- Video file metadata storage
- Thumbnail support
- Duration and file size tracking
- Multiple video types

### 6. Template System
- JSON-based template schemas
- Desktop/Mobile variants
- Page-specific layouts
- Dynamic template management

## Database Requirements

- **MySQL/MariaDB**: Version 5.7+ or 10.2+
- **JSON Support**: Required for template_schemas
- **UTF8MB4**: Full Unicode support
- **InnoDB Engine**: For foreign keys and transactions

## Rollback Information

Most migrations are additive and safe to run multiple times. The script includes existence checks to prevent errors on re-runs.

**Note**: This migration script is designed to be idempotent - it can be run multiple times safely without causing issues.

## Environment Variables Required

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=galinfo
DB_PORT=3306
```

## Post-Migration Verification

After running the migration, verify:

1. All tables exist and have correct structure
2. Default data is inserted
3. User roles are properly assigned
4. Advertisement placements are configured
5. Template schemas are available

## Support

If you encounter issues during migration:

1. Check database connection settings
2. Ensure sufficient database permissions
3. Verify MySQL/MariaDB version compatibility
4. Check for existing conflicting data

For additional support, refer to the individual migration scripts in the `scripts/` directory.
