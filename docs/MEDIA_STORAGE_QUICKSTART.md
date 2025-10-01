# Quick Setup: External Media Storage

## 🎯 Quick Start (5 minutes)

### Step 1: Create the External Directory

**Windows:**
```bash
mkdir C:\media\galinfo
```

**Linux/Mac:**
```bash
sudo mkdir -p /var/www/media/galinfo
sudo chown -R $USER:$USER /var/www/media/galinfo
sudo chmod -R 755 /var/www/media/galinfo
```

### Step 2: Configure Environment

Create or edit `.env.local` in your project root:

```bash
# Windows
MEDIA_STORAGE_PATH=C:/media/galinfo

# Linux/Mac
MEDIA_STORAGE_PATH=/var/www/media/galinfo

# Public URL (same for all)
NEXT_PUBLIC_MEDIA_URL=/media
```

**⚠️ Important:** Use forward slashes `/` even on Windows!

### Step 3: Configure Web Server

Choose your web server:

<details>
<summary>📘 <strong>Development (Next.js only)</strong></summary>

No additional configuration needed! Files will work locally, but you'll need a web server for production.

</details>

<details>
<summary>🔷 <strong>Nginx (Recommended for Production)</strong></summary>

Add to your Nginx config:

```nginx
location /media/ {
    alias /var/www/media/galinfo/;
    expires 30d;
}
```

Reload: `sudo systemctl reload nginx`

</details>

<details>
<summary>🔶 <strong>Apache</strong></summary>

Add to your Apache config:

```apache
Alias /media "C:/media/galinfo"
<Directory "C:/media/galinfo">
    Require all granted
</Directory>
```

Restart: `sudo systemctl restart apache2`

</details>

<details>
<summary>🪟 <strong>IIS (Windows)</strong></summary>

1. Open IIS Manager
2. Select your site → "Add Virtual Directory"
3. Alias: `media`
4. Physical path: `C:\media\galinfo`

</details>

### Step 4: Test

1. Restart your app: `npm run dev`
2. Upload an image in the admin panel
3. Check if it appears in `C:\media\galinfo\gallery\intxt\...`
4. Verify it displays correctly on the site

## ✅ Done!

Your uploaded photos and videos will now be stored outside the project directory.

## 📚 Need More Details?

See the full documentation: [docs/MEDIA_STORAGE_SETUP.md](docs/MEDIA_STORAGE_SETUP.md)

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Permission denied | **Windows:** Right-click folder → Properties → Security → Grant Full Control<br>**Linux:** `sudo chown -R $USER:$USER /var/www/media/galinfo` |
| Images don't display | Check web server configuration - ensure `/media` location is properly configured |
| Path not found | Use absolute paths with forward slashes: `C:/media/galinfo` |

## 💡 Want to Keep Using Project Directory?

Simply leave `MEDIA_STORAGE_PATH` empty or don't set it. The app will automatically use `public/media` as before.

