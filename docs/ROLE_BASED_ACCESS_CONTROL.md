# Role-Based Access Control (RBAC) System

## Overview

The GalInfo admin system implements a comprehensive role-based access control system with three distinct user roles:

1. **Адміністратор (Administrator)** - Full system access
2. **Редактор (Editor)** - Content management with publishing rights
3. **Журналіст (Journalist)** - Content creation with draft-only rights

## User Roles

### Адміністратор (Administrator)

**Full Access** - Complete control over all system functions.

**Permissions:**

- ✅ User Management (create, edit, delete users, assign roles)
- ✅ Category & Tag Management
- ✅ Advertisement Management
- ✅ Telegram Integration Management
- ✅ Site Settings Management
- ✅ Create News/Articles
- ✅ Edit All News/Articles
- ✅ Publish News/Articles
- ✅ Delete News/Articles
- ✅ Move News/Articles to Drafts
- ✅ Upload Media (images, videos)

### Редактор (Editor)

**Content Management** - Can create, edit, and publish content but cannot manage system settings or users.

**Permissions:**

- ❌ User Management
- ❌ Category Management
- ❌ Tag Management
- ❌ Advertisement Management
- ❌ Telegram Management
- ❌ Site Settings Management
- ✅ Create News/Articles
- ✅ Edit News/Articles
- ✅ Publish News/Articles
- ❌ Delete News/Articles (can only move to drafts)
- ✅ Move News/Articles to Drafts
- ✅ Upload Media (images, videos)

### Журналіст (Journalist)

**Draft Creation** - Can create and edit content but cannot publish.

**Permissions:**

- ❌ User Management
- ❌ Category Management
- ❌ Tag Management
- ❌ Advertisement Management
- ❌ Telegram Management
- ❌ Site Settings Management
- ✅ Create News/Articles (draft only)
- ✅ Edit Own News/Articles (draft only)
- ❌ Publish News/Articles
- ❌ Delete News/Articles
- ✅ Move News/Articles to Drafts
- ✅ Upload Media (images, videos)

## Database Schema

### `a_powerusers` Table

The role column has been added to the existing users table:

```sql
ALTER TABLE a_powerusers
ADD COLUMN role VARCHAR(20) DEFAULT 'journalist' AFTER perm;
```

**Role Field Values:**

- `'admin'` - Administrator
- `'editor'` - Editor
- `'journalist'` - Journalist

## Implementation

### 1. Type Definitions

Located in: `app/types/roles.ts`

```typescript
export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  JOURNALIST = "journalist",
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Адміністратор",
  [UserRole.EDITOR]: "Редактор",
  [UserRole.JOURNALIST]: "Журналіст",
};
```

### 2. Permission Hook

Located in: `app/hooks/useRolePermissions.ts`

```typescript
export function useRolePermissions() {
  const { user } = useAdminAuth();
  const role = (user?.role as UserRole) || UserRole.JOURNALIST;

  return {
    role,
    permissions,
    checkPermission,
    isAdmin,
    isEditor,
    isJournalist,
  };
}
```

### 3. Role Protection Component

Located in: `app/components/RoleProtected.tsx`

Use this component to wrap content that should only be visible to certain roles:

```tsx
import RoleProtected from "@/app/components/RoleProtected";
import { UserRole } from "@/app/types/roles";

<RoleProtected requiredRole={UserRole.ADMIN}>
  <AdminOnlyContent />
</RoleProtected>;
```

Or check specific permissions:

```tsx
<RoleProtected requiredPermission="canManageUsers">
  <UserManagementPanel />
</RoleProtected>
```

## Usage Examples

### In React Components

```tsx
import { useRolePermissions } from "@/app/hooks/useRolePermissions";

export default function MyComponent() {
  const { isAdmin, permissions } = useRolePermissions();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {permissions.canPublishNews && <PublishButton />}
    </div>
  );
}
```

### In Article Editor

The article editor automatically enforces role permissions:

- **Journalists**: "Опублікувати на сайті" checkbox is disabled, articles are always saved as drafts
- **Editors & Admins**: Can publish articles by checking the checkbox
- **Delete Button**: Shows "ВИДАЛИТИ" for admins, "В ЧЕРНЕТКИ" for editors/journalists

### In User Management

Located in: `app/admin/users/page.tsx`

- Only **Admins** can see the "Додати користувача" button
- Only **Admins** can edit user roles
- **Admins cannot change their own role** (protection against self-demotion)
- Role dropdown is disabled when editing your own user account

## API Endpoints

### Login API

`POST /api/admin/login`

Returns user object including role:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "token": "..."
}
```

### User Management APIs

**Get Users**: `GET /api/admin/users`

- Returns all users with their roles

**Create User**: `POST /api/admin/users`

```json
{
  "uname_ua": "Іван Петренко",
  "uname": "ivan",
  "upass": "password",
  "uagency": "Agency Name",
  "role": "editor",
  "active": true,
  "permissions": {}
}
```

**Update User**: `PUT /api/admin/users/:id`

- Same payload as create
- Validates that admins cannot change their own role

**Delete User**: `DELETE /api/admin/users/:id`

## Database Migration

### Initial Setup

Run the migration script to add the role column and set default roles:

```bash
node scripts/add-role-column.js
```

This script will:

1. Add the `role` column to `a_powerusers` table
2. Set all existing users to `'journalist'` role by default
3. Set the user with username `'admin'` to `'admin'` role

### Manual Migration

If you prefer to run SQL manually:

```sql
-- Add role column
ALTER TABLE a_powerusers
ADD COLUMN role VARCHAR(20) DEFAULT 'journalist' AFTER perm;

-- Set all users to journalist
UPDATE a_powerusers
SET role = 'journalist'
WHERE role IS NULL OR role = '';

-- Set admin user to admin role
UPDATE a_powerusers
SET role = 'admin'
WHERE uname = 'admin';
```

## UI Components

### Header Display

The header now displays the user's role:

**Desktop:**

- User name on first line
- Role label on second line (smaller, gray text)

**Mobile:**

- User name
- Role label
- Email

### User Management Table

New "Роль" column displays user roles with color-coded tags:

- 🔴 **Red**: Адміністратор
- 🟠 **Orange**: Редактор
- 🔵 **Blue**: Журналіст

### Article Editor

Visual indicators for journalists:

- Disabled "Опублікувати на сайті" checkbox
- Warning message: "⚠️ Журналісти можуть зберігати тільки в чернетках"
- Delete button shows "В ЧЕРНЕТКИ" instead of "ВИДАЛИТИ"

## Admin Navigation

The admin navigation menu automatically filters based on user role:

**Редактори та Журналісти:**

- Новини / Статті
- Галерея

**Тільки Адміністратори:**

- Сайт
- JSON Шаблони
- Властивості
- Користувачі
- Реклама
- Теги
- Telegram
- Тестування

## Security Considerations

### Frontend Protection

- UI elements are hidden/disabled based on roles
- Navigation menu items are filtered
- Form fields are disabled for unauthorized actions

### Backend Protection

⚠️ **Important**: Frontend protection alone is not sufficient. All sensitive operations should be validated on the backend.

**Recommended Backend Checks:**

- Verify user role before processing requests
- Check permissions in API endpoints
- Validate that publish actions are only performed by editors/admins
- Prevent role escalation attempts

### Role Change Protection

- Admins cannot change their own role (prevents accidental lockout)
- Role changes are logged in the system
- Only admins can modify user roles

## Testing

### Test Scenarios

1. **Journalist Login**

   - ✅ Can create articles
   - ✅ Articles are saved as drafts
   - ❌ Cannot publish articles
   - ❌ Cannot access admin settings

2. **Editor Login**

   - ✅ Can create articles
   - ✅ Can publish articles
   - ✅ Can move articles to drafts
   - ❌ Cannot delete articles permanently
   - ❌ Cannot manage users

3. **Admin Login**
   - ✅ Full access to all functions
   - ✅ Can manage users and roles
   - ✅ Can publish and delete articles
   - ❌ Cannot change own role

### Test Users

After migration, you can create test users:

```sql
-- Create test editor
INSERT INTO a_powerusers (uname_ua, uname, upass, role, active)
VALUES ('Тестовий Редактор', 'editor', MD5('editor123'), 'editor', 1);

-- Create test journalist
INSERT INTO a_powerusers (uname_ua, uname, upass, role, active)
VALUES ('Тестовий Журналіст', 'journalist', MD5('journalist123'), 'journalist', 1);
```

## Troubleshooting

### Users Don't Have Roles

If existing users don't have roles after updating:

```sql
-- Check users without roles
SELECT * FROM a_powerusers WHERE role IS NULL OR role = '';

-- Set default role
UPDATE a_powerusers
SET role = 'journalist'
WHERE role IS NULL OR role = '';
```

### Admin Locked Out

If the admin user was accidentally changed:

```sql
-- Restore admin role
UPDATE a_powerusers
SET role = 'admin'
WHERE uname = 'admin';
```

### Role Not Displaying in UI

1. Clear browser cache and localStorage
2. Log out and log back in
3. Check that the API response includes the role field
4. Verify the role column exists in the database

## Future Enhancements

Potential improvements for the RBAC system:

1. **Granular Permissions**: Allow custom permission sets beyond predefined roles
2. **Role Templates**: Create custom role templates
3. **Permission Auditing**: Log all permission checks and role changes
4. **Time-Based Permissions**: Grant temporary elevated permissions
5. **Content Ownership**: Allow users to only edit their own articles
6. **Workflow System**: Implement approval workflows for publishing

## Related Documentation

- [Admin System README](./ADMIN_SYSTEM_README.md)
- [User Management](./ADMIN_SETUP.md)
- [Two-Factor Authentication](./TWO_FACTOR_AUTH_README.md)
- [Article Editor Guide](./ARTICLE_EDITOR_DATA_LOADING_README.md)

## Support

For questions or issues related to the RBAC system, please consult this documentation or contact the development team.
