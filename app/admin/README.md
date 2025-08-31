# Admin Authentication System

## Overview

The admin system now requires authentication to access all admin pages. Users must log in with valid credentials from the `a_users` table.

## Authentication Flow

### 1. Login Process
- **Route:** `/admin/login`
- **Method:** POST to `/api/admin/login`
- **Credentials:** Email and password from `a_users` table
- **Security:** MD5 password hashing (matches existing system)

### 2. Protected Routes
All admin pages are now protected and require authentication:
- `/admin` - Main admin panel (redirects to login if not authenticated)
- `/admin/dashboard` - News management dashboard
- `/admin/test-category-news` - Test page for category news
- All other admin routes

### 3. Session Management
- Stores user data and token in localStorage
- Automatic redirect to login if not authenticated
- Logout functionality with session cleanup

## Components

### AdminAuthProvider
- Provides authentication context to all admin pages
- Manages user state, token, and authentication methods
- Handles localStorage persistence

### ProtectedAdminRoute
- Wrapper component that checks authentication
- Redirects to login if not authenticated
- Shows loading state during authentication check

### AdminNavigation
- Updated to show user information
- Includes logout button
- Only displays when user is authenticated

## API Endpoints

### POST /api/admin/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1429,
    "name": "Василь Павлюк",
    "email": "pavliuk@galinfo.com.ua",
    "services": "1",
    "blogs": 4,
    "regdate": "2012-05-04T13:36:49.000Z",
    "shortinfo": "...",
    "avatar": "0",
    "ulang": 1
  },
  "token": "generated_token_here",
  "message": "Login successful"
}
```

## Database Requirements

### Users Table (`a_users`)
```sql
CREATE TABLE a_users (
  id INT PRIMARY KEY,
  uname VARCHAR(255),           -- Email/username
  upass VARCHAR(255),           -- MD5 hashed password
  name VARCHAR(255),            -- Display name
  approved VARCHAR(255),        -- Approval status
  logged DATETIME,              -- Last login time
  logqty INT,                   -- Login count
  services VARCHAR(255),        -- User services
  blogs INT,                    -- Blog count
  regdate DATETIME,             -- Registration date
  shortinfo TEXT,               -- User bio
  avatar VARCHAR(255),          -- Avatar image
  ulang INT                     -- User language
);
```

## Usage

### 1. Access Admin Panel
- Navigate to `/admin/login`
- Enter credentials from `a_users` table
- Click "Увійти" (Login) button

### 2. Protected Pages
- All admin pages automatically check authentication
- Unauthorized users are redirected to login
- Authenticated users can access all admin functionality

### 3. Logout
- Click "Вийти" (Logout) button in navigation
- Session is cleared and user is redirected to login

## Security Features

### Authentication
- Password hashing (MD5)
- Session token generation
- User approval validation
- Secure redirects

### Route Protection
- All admin routes require authentication
- Automatic redirect on authentication failure
- Loading states during authentication checks

### Session Security
- Token-based authentication
- Local storage encryption
- Automatic logout on token expiry
- Secure route protection

## File Structure

```
app/admin/
├── layout.tsx                    # Admin layout with AuthProvider
├── page.tsx                      # Main admin page (protected)
├── login/
│   ├── page.tsx                 # Login page
│   └── login.module.css         # Login styles
├── dashboard/
│   └── page.tsx                 # Dashboard (protected)
├── test-category-news/
│   └── page.tsx                 # Test page (protected)
├── components/
│   └── AdminNavigation.tsx      # Navigation with auth
└── contexts/
    └── AdminAuthContext.tsx     # Authentication context
```

## Development

### Adding New Protected Pages
1. Import `ProtectedAdminRoute` component
2. Wrap your component with `<ProtectedAdminRoute>`
3. Use `useAdminAuth()` hook for user data

### Example:
```tsx
import ProtectedAdminRoute from '@/app/components/ProtectedAdminRoute';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';

export default function MyAdminPage() {
  const { user } = useAdminAuth();
  
  return (
    <ProtectedAdminRoute>
      <div>
        <h1>Welcome, {user?.name}</h1>
        {/* Your admin content */}
      </div>
    </ProtectedAdminRoute>
  );
}
```

## Troubleshooting

### Common Issues

1. **Login Fails**
   - Check database connection
   - Verify user credentials in `a_users` table
   - Confirm account approval status

2. **Protected Routes Not Working**
   - Ensure `AdminAuthProvider` wraps admin layout
   - Check `ProtectedAdminRoute` implementation
   - Verify authentication context

3. **Session Not Persisting**
   - Check localStorage permissions
   - Verify token generation
   - Check authentication flow

### Debug Mode
Enable detailed logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Environment Variables

Ensure these are set in your `.env.local`:
```bash
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=galinfodb_db
DB_PORT=3306
```
