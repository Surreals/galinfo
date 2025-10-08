# AI Rules for GalInfo Project

## Project Overview

GalInfo is a Next.js news portal with direct MariaDB connection (no PHP). It uses a custom design different from the previous PHP-based approach.

## Important System Features

### Authentication & Authorization

- The project uses `a_powerusers` table for admin users
- **Three user roles implemented:**
  - `admin` - Full system access
  - `editor` - Can create and publish content
  - `journalist` - Can only create drafts
- Role field: `role` VARCHAR(20) in `a_powerusers` table
- Default role for new users: `journalist`

### Database Tables

- `a_powerusers` - Admin users with role-based access
- `a_news` - News and articles
- Role column added: See `scripts/add-role-column.js`

### Key Directories

- `app/` - Next.js app directory
- `app/admin/` - Admin panel
- `app/api/` - API routes
- `app/types/` - TypeScript types including roles
- `app/hooks/` - React hooks including `useRolePermissions`
- `scripts/` - Database migration scripts
- `docs/` - Documentation

## Code Style & Conventions

### File Naming

- React components: PascalCase (e.g., `UserManagement.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useRolePermissions.ts`)
- API routes: kebab-case (e.g., `add-role-column.js`)
- Types: PascalCase (e.g., `roles.ts`)

### TypeScript

- Always use TypeScript for new files
- Define interfaces for all data structures
- Use enums for constants with multiple values

### React Patterns

- Use functional components with hooks
- Client components: Add `'use client'` directive
- Server components: Default (no directive)
- Context providers: Use for shared state

## Database Operations

### Migrations

- Create migration scripts in `scripts/` directory
- Use `mysql2/promise` for database operations
- Always check if column/table exists before adding
- Provide rollback instructions in comments

### Queries

- Use `executeQuery` from `@/app/lib/db`
- Always use parameterized queries (prevent SQL injection)
- Handle errors gracefully

## Security Best Practices

### Role-Based Access Control

- **Frontend protection:**
  - Use `useRolePermissions` hook
  - Hide/disable UI elements based on roles
  - Filter navigation menu items
- **Backend protection:**
  - Always verify user role in API routes
  - Check permissions before sensitive operations
  - Validate that publish actions are authorized

### User Management

- Admins cannot change their own role (prevents lockout)
- Hash passwords with MD5 (legacy, consider upgrading)
- Validate all inputs

## Documentation Standards

### File Headers

- Include purpose and overview
- Date created/updated
- Related files/dependencies

### Code Comments

- Explain "why" not "what"
- Document complex algorithms
- Add warnings for critical sections

### README Files

- Keep main README up to date
- Create specific docs in `docs/` directory
- Include examples and usage

## Common Patterns

### Permission Checking

```typescript
import { useRolePermissions } from "@/app/hooks/useRolePermissions";

const { isAdmin, permissions } = useRolePermissions();

if (permissions.canPublishNews) {
  // Allow publish
}
```

### API Routes

```typescript
import { executeQuery } from "@/app/lib/db";

export async function POST(request: Request) {
  // Verify permissions
  // Validate input
  // Execute query
  // Return response
}
```

### Component Protection

```tsx
import RoleProtected from "@/app/components/RoleProtected";

<RoleProtected requiredPermission="canManageUsers">
  <AdminPanel />
</RoleProtected>;
```

## Testing Guidelines

### Before Committing

- Test all three user roles
- Clear browser cache after auth changes
- Test on both desktop and mobile
- Verify database migrations work

### Test Users

- Create test users for each role
- Don't commit test user credentials
- Document test scenarios

## Deployment

### Pre-deployment Checklist

- Run `npm run build` successfully
- Test migrations on staging database
- Update environment variables
- Clear server cache
- Document any manual steps

### Migration Steps

1. Backup database
2. Run migration script: `npm run migrate:add-roles`
3. Verify results
4. Test with different roles
5. Monitor logs

## Important Notes

- **Never commit:**

  - `.env` file
  - Database credentials
  - User passwords
  - API keys

- **Always:**
  - Use TypeScript
  - Validate inputs
  - Handle errors
  - Document changes
  - Test thoroughly

## Quick Reference

### NPM Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run migrate:add-roles # Add role column to database
npm run test:db          # Test database connection
```

### Key Files

- `app/types/roles.ts` - Role definitions
- `app/hooks/useRolePermissions.ts` - Permission hook
- `scripts/add-role-column.js` - Role migration
- `docs/ROLE_BASED_ACCESS_CONTROL.md` - RBAC documentation

## Related Documentation

- [RBAC System](./ROLE_BASED_ACCESS_CONTROL.md)
- [RBAC Implementation Summary](./RBAC_IMPLEMENTATION_SUMMARY.md)
- [Admin System](./ADMIN_SYSTEM_README.md)
- [Database Setup](./DATABASE_SETUP.md)
