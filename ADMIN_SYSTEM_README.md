# GalInfo Admin System

This document describes the admin system that provides secure access to manage news content and user administration.

## 🚀 **Overview**

The admin system consists of:
- **Login Page** (`/admin`) - Secure authentication for admin users
- **Dashboard** (`/admin/dashboard`) - News management interface
- **API Endpoints** - Backend services for authentication and data management

## 🔐 **Authentication System**

### **Login Process**
1. **Route:** `/admin`
2. **Method:** POST to `/api/admin/login`
3. **Credentials:** Email and password from `a_users` table
4. **Security:** MD5 password hashing (matches existing system)

### **User Validation**
- Checks if user exists in `a_users` table
- Verifies password hash
- Confirms account is approved (`approved` field)
- Updates login statistics (`logged`, `logqty`)

### **Session Management**
- Stores user data in localStorage
- Generates authentication token
- Redirects to dashboard on success

## 📊 **Admin Dashboard**

### **Features**
- **News Management:** View, approve, reject, delete news articles
- **Search & Filtering:** Find news by title, approval status, type
- **Pagination:** Navigate through large datasets
- **Real-time Actions:** Immediate feedback on operations

### **News Operations**
- **Approve:** Mark news as approved (`approved = 1`)
- **Reject:** Mark news as not approved (`approved = 0`)
- **Delete:** Remove news and related data completely

### **Data Display**
- News title, subtitle, and metadata
- Approval status indicators
- Date, type, weight, and other properties
- Action buttons for each news item

## 🛠 **API Endpoints**

### **1. Login API**
```
POST /api/admin/login
Content-Type: application/json

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

### **2. News Fetch API**
```
GET /api/admin/news?query=SQL_QUERY&params=JSON_PARAMS
```

**Parameters:**
- `query`: SQL query string
- `params`: JSON array of query parameters

**Response:**
```json
{
  "success": true,
  "news": [...],
  "total": 150,
  "message": "News fetched successfully"
}
```

### **3. News Action API**
```
POST /api/admin/news/action
Content-Type: application/json

{
  "newsId": 12345,
  "action": "approve" | "reject" | "delete"
}
```

**Response:**
```json
{
  "success": true,
  "message": "News approved successfully",
  "action": "approve",
  "newsId": 12345
}
```

## 🗄 **Database Schema**

### **Users Table (`a_users`)**
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

### **News Table (`a_news`)**
```sql
CREATE TABLE a_news (
  id INT PRIMARY KEY,
  nheader VARCHAR(255),         -- News header
  nsubheader TEXT,              -- News subheader
  ndate VARCHAR(255),           -- News date
  ntime VARCHAR(255),           -- News time
  ntype INT,                    -- News type
  approved INT,                 -- Approval status (0/1)
  rated INT,                    -- Rating status
  comments INT,                 -- Comment count
  images TEXT,                  -- Image data
  urlkey VARCHAR(255),          -- URL key
  photo VARCHAR(255),           -- Photo data
  video VARCHAR(255),           -- Video data
  udate BIGINT,                 -- Unix timestamp
  lang INT,                     -- Language
  rubric INT,                   -- Category
  theme INT,                    -- Theme
  userid INT,                   -- User ID
  nweight INT,                  -- News weight
  headlineblock INT,            -- Headline block flag
  maininblock INT,              -- Main block flag
  suggest INT,                  -- Suggested flag
  printsubheader TEXT           -- Print subheader
);
```

## 🔒 **Security Features**

### **Authentication**
- Password hashing (MD5)
- Session token generation
- User approval validation
- Secure redirects

### **Data Protection**
- Parameterized SQL queries
- Input validation
- Error message sanitization
- Access control checks

### **Session Security**
- Local storage encryption
- Token-based authentication
- Automatic logout on token expiry
- Secure route protection

## 📱 **User Interface**

### **Login Page**
- Clean, modern design
- Responsive layout
- Error handling
- Loading states

### **Dashboard**
- Professional admin interface
- Intuitive navigation
- Real-time updates
- Mobile responsive

### **Components**
- Search functionality
- Advanced filtering
- Pagination controls
- Action buttons
- Status indicators

## 🚀 **Usage Instructions**

### **1. Access Admin Panel**
- Navigate to `/admin`
- Enter credentials from `a_users` table
- Click "Login" button

### **2. Manage News**
- View all news in paginated list
- Use search to find specific articles
- Filter by approval status and type
- Perform actions (approve/reject/delete)

### **3. User Management**
- View user information
- Monitor login statistics
- Manage user permissions

## 🛠 **Development Setup**

### **Prerequisites**
- Node.js 18+
- MySQL database
- Next.js project

### **Installation**
1. Ensure database connection is configured
2. Create admin user in `a_users` table
3. Set up environment variables
4. Start development server

### **Environment Variables**
```bash
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=galinfodb_db
DB_PORT=3306
```

## 🔧 **Customization**

### **Adding New Actions**
1. Extend the action API endpoint
2. Add new action types
3. Update frontend interface
4. Implement business logic

### **Modifying Filters**
1. Update filter options in dashboard
2. Modify SQL queries
3. Adjust parameter handling
4. Test functionality

### **Styling Changes**
1. Modify CSS modules
2. Update component styles
3. Adjust responsive breakpoints
4. Test on different devices

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Login Fails**
   - Check database connection
   - Verify user credentials
   - Confirm account approval status

2. **News Not Loading**
   - Check API endpoint status
   - Verify SQL query syntax
   - Check database permissions

3. **Actions Not Working**
   - Verify API endpoint
   - Check database constraints
   - Review error logs

### **Debug Mode**
Enable detailed logging:
```bash
DEBUG=true npm run dev
```

## 📈 **Performance Optimization**

### **Database**
- Use appropriate indexes
- Optimize SQL queries
- Implement connection pooling
- Monitor query performance

### **Frontend**
- Implement virtual scrolling
- Add loading states
- Optimize re-renders
- Use React.memo for components

### **API**
- Add response caching
- Implement rate limiting
- Optimize data transfer
- Add compression

## 🔮 **Future Enhancements**

### **Planned Features**
- User role management
- Advanced analytics
- Bulk operations
- Audit logging
- API rate limiting
- Real-time notifications

### **Technical Improvements**
- JWT authentication
- Redis caching
- GraphQL API
- WebSocket integration
- Progressive Web App

## 📞 **Support**

For technical support or feature requests:
- Check error logs
- Review API responses
- Test database connectivity
- Verify user permissions

## 📄 **License**

This admin system is part of the GalInfo project and follows the same licensing terms.
