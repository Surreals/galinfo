# GalInfo - News Portal

This is a [Next.js](https://nextjs.org) news portal project with a comprehensive admin system and role-based access control.

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or later
- MariaDB/MySQL database
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd galinfo
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:

```bash
npm run migrate:add-roles
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

**Default credentials:**

- Login: `admin`
- Password: `admin`

⚠️ **Important:** Change the default password immediately after first login!

## 🔐 Role-Based Access Control

GalInfo implements a comprehensive RBAC system with three user roles:

### User Roles

1. **Адміністратор (Administrator)** 🔴

   - Full system access
   - User management
   - Site settings
   - All content operations

2. **Редактор (Editor)** 🟠

   - Create and publish content
   - Manage tags
   - Upload media
   - Cannot delete permanently

3. **Журналіст (Journalist)** 🔵
   - Create content (drafts only)
   - Upload media
   - Edit own drafts
   - Cannot publish

See [ROLE_BASED_ACCESS_CONTROL.md](./ROLE_BASED_ACCESS_CONTROL.md) for detailed documentation.

## 📚 Documentation

### Admin System

- [Admin System Overview](./ADMIN_SYSTEM_README.md)
- [Admin Setup Guide](./ADMIN_SETUP.md)
- [Role-Based Access Control](./ROLE_BASED_ACCESS_CONTROL.md)
- [RBAC Implementation Summary](./RBAC_IMPLEMENTATION_SUMMARY.md)

### Authentication

- [Two-Factor Authentication](./TWO_FACTOR_AUTH_README.md)
- [2FA Setup Guide](./2FA_SETUP.md)
- [2FA Quickstart](./2FA_QUICKSTART.md)

### Content Management

- [Article Editor Guide](./ARTICLE_EDITOR_DATA_LOADING_README.md)
- [Article Page Documentation](./ARTICLE_PAGE_README.md)
- [Article Types Guide](./ARTICLE_TYPE_GUIDE.md)
- [News System](./NEWS_SYSTEM_README.md)

### Categories & Tags

- [Category Management](./CATEGORY_MANAGEMENT_README.md)
- [Tags Management](./TAGS_MANAGEMENT_README.md)
- [Breadcrumbs](./BREADCRUMBS_README.md)

### Media

- [Media Storage Setup](./MEDIA_STORAGE_SETUP.md)
- [Media Storage Quickstart](./MEDIA_STORAGE_QUICKSTART.md)
- [Video Functionality](./VIDEO_FUNCTIONALITY_README.md)

### Integrations

- [Telegram Bot Setup](./TELEGRAM_BOT_SETUP.md)
- [Telegram Integration](./TELEGRAM_INTEGRATION_COMPLETE.md)
- [Telegram Messenger Guide](./TELEGRAM_MESSENGER_GUIDE.md)

### Advertisements

- [Advertisements Setup](./ADVERTISEMENTS_SETUP.md)
- [Advertisements Guide](./ADVERTISEMENTS_README.md)
- [Ad Banner Documentation](./AD_BANNER_README.md)

### Database

- [Database Setup](./DATABASE_SETUP.md)

### SEO & Performance

- [SEO Pages Report](./SEO_PAGES_REPORT.md)
- [Dynamic Schemas Integration](./DYNAMIC_SCHEMAS_INTEGRATION.md)

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack

# Production
npm run build            # Build for production
npm run start            # Start production server

# Database Migrations
npm run migrate:add-roles # Add role column to users table
npm run migrate:2fa      # Add 2FA columns to users table

# Testing
npm run test:db          # Test database connection
npm run test:telegram    # Test Telegram bot

# Admin Setup
npm run setup:admin      # Set up admin user

# Linting
npm run lint             # Run ESLint
```

## 🏗️ Project Structure

```
galinfo/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── components/        # Shared components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript types
├── docs/                  # Documentation
├── public/                # Static assets
├── scripts/               # Database migration scripts
└── deprecated_php_app/    # Legacy PHP code (deprecated)
```

## 🔧 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MariaDB
- **UI Library:** Ant Design
- **Styling:** CSS Modules, SCSS
- **Editor:** CKEditor 5, TipTap
- **Authentication:** Custom JWT-like tokens
- **2FA:** Speakeasy (TOTP)

## 🚢 Deployment

### Prerequisites

1. Node.js 22.x installed on server
2. MariaDB/MySQL database configured
3. Environment variables set

### Steps

1. Build the application:

```bash
npm run build
```

2. Run migrations:

```bash
npm run migrate:add-roles
npm run migrate:2fa
```

3. Start the server:

```bash
npm run start
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

This is a private project. Please follow the coding standards and conventions outlined in [AI_RULES.md](./AI_RULES.md).

## 📄 License

Private/Proprietary

## 📞 Support

For questions or issues, please contact the development team or consult the documentation in the `docs/` directory.
