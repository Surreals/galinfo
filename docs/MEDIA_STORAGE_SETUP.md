# External Media Storage Setup Guide

## Overview

This guide explains how to configure your application to store uploaded photos and videos in a separate folder outside the project directory. This is a best practice for production environments.

## Benefits of External Media Storage

1. **Separation of Concerns**: Keep media files separate from application code
2. **Easier Backups**: Backup media files independently from code
3. **Git Management**: Prevent large media files from bloating your repository
4. **Scalability**: Easier to move media to CDN or separate storage servers
5. **Disk Space**: Use a different drive or partition for large media files
6. **Security**: Better control over media file permissions

## Configuration

### Step 1: Create External Media Directory

Choose a location outside your project directory:

**Windows Example:**
```bash
# Create directory on C: drive
mkdir C:\media\galinfo

# Or on a different drive
mkdir D:\uploads\galinfo
```

**Linux/Mac Example:**
```bash
# Create directory in /var/www
sudo mkdir -p /var/www/media/galinfo

# Or in user's home directory
mkdir -p ~/uploads/galinfo

# Set proper permissions (Linux/Mac)
sudo chown -R www-data:www-data /var/www/media/galinfo
sudo chmod -R 755 /var/www/media/galinfo
```

### Step 2: Configure Environment Variables

Edit your `.env.local` file (create it if it doesn't exist) and add:

```bash
# Path to external media storage
# Use forward slashes (/) even on Windows
MEDIA_STORAGE_PATH=C:/media/galinfo

# Public URL for accessing media
NEXT_PUBLIC_MEDIA_URL=/media
```

**Important Notes:**
- Use forward slashes (`/`) in the path, even on Windows
- Use absolute paths (e.g., `C:/media/galinfo`, not `../media`)
- Don't include a trailing slash

### Step 3: Configure Web Server

You need to configure your web server to serve files from the external directory.

#### Option A: Next.js Development Server (for testing)

For development, you can use Next.js rewrites. Edit `next.config.ts`:

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'file://C:/media/galinfo/:path*', // Your external path
      },
    ];
  },
};
```

**Note:** File protocol rewrites may not work in all environments. For production, use a proper web server.

#### Option B: Nginx (Production - Recommended)

Add this to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name galinfo.com.ua;

    # Serve media files from external directory
    location /media/ {
        alias /var/www/media/galinfo/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy other requests to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Option C: Apache (Production)

Add this to your Apache configuration or `.htaccess`:

```apache
# Serve media files from external directory
Alias /media "C:/media/galinfo"
<Directory "C:/media/galinfo">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
    
    # Enable caching
    ExpiresActive On
    ExpiresDefault "access plus 30 days"
</Directory>

# Proxy other requests to Next.js
ProxyPass /media !
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

Then restart Apache:
```bash
# Windows
httpd -k restart

# Linux
sudo systemctl restart apache2
```

#### Option D: IIS (Windows Production)

1. Open IIS Manager
2. Select your site
3. Click "Add Virtual Directory"
   - Alias: `media`
   - Physical path: `C:\media\galinfo`
4. Click OK

### Step 4: Verify Configuration

After configuring, restart your application:

```bash
npm run dev
```

Test the upload functionality through your admin panel:
1. Go to `/admin/article-editor`
2. Upload an image
3. Verify it's saved to your external directory
4. Verify it displays correctly in the preview

## Directory Structure

The application will create the following structure in your external media directory:

```
C:/media/galinfo/
├── gallery/
│   ├── full/           # Full-size images
│   │   ├── 1/
│   │   │   ├── 7/
│   │   │   │   └── 1728543210_abc123.jpg
│   ├── tmb/            # Thumbnails
│   │   ├── 1/
│   │   │   ├── 7/
│   ├── intxt/          # In-text images
│   │   ├── 1/
│   │   │   ├── 7/
└── videos/
    ├── 1/              # Video files
    │   ├── 7/
    │   │   └── 1728543210_xyz789.mp4
    └── thumbnails/     # Video thumbnails
        ├── 1/
        │   ├── 7/
```

**Note:** Subdirectories are automatically created based on the first two characters of filenames.

## Fallback Behavior

If `MEDIA_STORAGE_PATH` is not configured or empty, the application will automatically fall back to storing files in the project's `public/media` directory. This ensures backward compatibility and easier local development.

## Troubleshooting

### Files Upload but Don't Display

**Problem:** Images upload successfully but show broken image icons.

**Solutions:**
1. Check web server configuration - ensure `/media` is properly mapped
2. Verify file permissions (Linux/Mac): `sudo chmod -R 755 /var/www/media/galinfo`
3. Check browser console for 404 errors
4. Verify `NEXT_PUBLIC_MEDIA_URL` matches your web server configuration

### Permission Denied Errors

**Problem:** Upload fails with permission errors.

**Solutions:**

**Windows:**
1. Right-click the folder → Properties → Security
2. Add the user running Node.js with Full Control permissions

**Linux/Mac:**
```bash
# Give Node.js process ownership
sudo chown -R $USER:$USER /var/www/media/galinfo

# Or for web server user
sudo chown -R www-data:www-data /var/www/media/galinfo
sudo chmod -R 755 /var/www/media/galinfo
```

### Path Not Found Errors

**Problem:** Directory creation fails.

**Solutions:**
1. Ensure the parent directory exists and is writable
2. Use absolute paths (not relative paths like `../media`)
3. On Windows, use forward slashes: `C:/media/galinfo` not `C:\media\galinfo`
4. Check for typos in the path

### Using Network Storage (NAS/SMB)

If storing media on a network drive:

**Windows:**
```bash
# Map network drive first
net use Z: \\server\share /persistent:yes

# Then use in .env.local
MEDIA_STORAGE_PATH=Z:/media/galinfo
```

**Linux (SMB):**
```bash
# Mount SMB share
sudo mount -t cifs //server/share /mnt/media -o username=user,password=pass

# Use in .env.local
MEDIA_STORAGE_PATH=/mnt/media/galinfo
```

## Production Checklist

Before deploying to production:

- [ ] External media directory created
- [ ] Proper permissions set on media directory
- [ ] Web server configured to serve `/media` from external directory
- [ ] Environment variables set in production `.env` file
- [ ] Test upload functionality
- [ ] Test image display on frontend
- [ ] Configure backup strategy for media directory
- [ ] (Optional) Set up CDN for media files
- [ ] Monitor disk space on media storage location

## Migration from Public Directory

If you have existing media files in `public/media`, migrate them:

**Windows:**
```bash
# Copy existing files to external directory
xcopy /E /I C:\Users\maria\Desktop\prj\galinfo\public\media C:\media\galinfo
```

**Linux/Mac:**
```bash
# Copy existing files
cp -r ~/projects/galinfo/public/media/* /var/www/media/galinfo/
```

After migration, you can safely remove files from `public/media` (but keep the directory structure).

## CDN Integration (Future Enhancement)

For high-traffic sites, consider using a CDN:

1. Upload media to CDN (e.g., Cloudflare, AWS CloudFront)
2. Update `NEXT_PUBLIC_MEDIA_URL` to point to CDN:
   ```bash
   NEXT_PUBLIC_MEDIA_URL=https://cdn.galinfo.com.ua/media
   ```

## Support

If you encounter issues:

1. Check the application logs for error messages
2. Verify file system permissions
3. Test with a simple file upload
4. Check web server error logs
5. Ensure environment variables are properly loaded

## Related Files

- `app/lib/config.ts` - Main configuration file
- `app/api/admin/images/upload/route.ts` - Image upload handler
- `app/api/admin/videos/upload/route.ts` - Video upload handler
- `env.example` - Environment variable examples

