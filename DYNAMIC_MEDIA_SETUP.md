# 🖼️ Динамічна генерація зображень - Інструкція по налаштуванню

## Що реалізовано

### ✅ Fallback логіка
- Якщо немає файлу в папці `intxt` або `tmb` → автоматично береться з `full`
- Зображення генеруються на льоту з правильними розмірами

### ✅ Динамічне створення розмірів
- **Full**: Оригінальне зображення (без змін)
- **Intxt**: 800x600px, якість 85% (для контенту)  
- **Tmb**: 150x150px, якість 80% (для мініатюр)

### ✅ URL структура
```
http://89.116.31.189/media/gallery/full/1/7/file.jpg  ← Повне фото
http://89.116.31.189/media/gallery/intxt/1/7/file.jpg ← Середнє (800px)
http://89.116.31.189/media/gallery/tmb/1/7/file.jpg   ← Мініатюра (150px)
```

## Налаштування nginx

### 1. Оновіть конфігурацію nginx

Додайте до вашого nginx конфігу:

```nginx
server {
    listen 80;
    server_name 89.116.31.189;
    
    root /var/media/galinfo;
    
    # Обробка запитів до зображень з fallback на API
    location ~ ^/media/gallery/(tmb|intxt|full)/(.+)$ {
        set $size $1;
        set $path $2;
        
        # Спочатку шукаємо статичний файл
        try_files /gallery/$size/$path @nextjs_media;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Fallback на Next.js API
    location @nextjs_media {
        proxy_pass http://localhost:3000/api/media/gallery/$size/$path$is_args$args;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Інші запити до Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Перезапустіть nginx

```bash
sudo nginx -t                    # Перевірка конфігурації
sudo systemctl reload nginx     # Перезавантаження конфігу
```

### 3. Перевірте роботу

```bash
# Перевірте, що Next.js запущений
pm2 list

# Тестові запити
curl -I http://89.116.31.189/media/gallery/full/4/0/4041.png
curl -I http://89.116.31.189/media/gallery/tmb/4/0/4041.png
```

## Як це працює

### 🔄 Алгоритм обробки запиту

1. **Користувач запитує**: `http://89.116.31.189/media/gallery/tmb/1/7/file.jpg`

2. **Nginx перевіряє**: чи існує файл `/var/media/galinfo/gallery/tmb/1/7/file.jpg`

3. **Якщо файл існує** → nginx віддає його напряму (швидко!)

4. **Якщо файлу немає** → nginx перенаправляє запит на Next.js API

5. **Next.js API**:
   - Читає оригінал з `/var/media/galinfo/gallery/full/1/7/file.jpg`
   - Генерує зображення потрібного розміру за допомогою Sharp
   - Зберігає згенероване зображення в `/var/media/galinfo/gallery/tmb/1/7/file.jpg`
   - Повертає зображення користувачу

6. **Наступні запити** до того ж файлу будуть оброблятися швидко nginx (кешування!)

### 📊 Переваги системи

- ⚡ **Швидкість**: Статичні файли віддаються nginx напряму
- 🔄 **Автоматичність**: Розміри генеруються за потребою
- 💾 **Кешування**: Згенеровані файли зберігаються для майбутніх запитів
- 🔧 **Оптимізація**: Автоматичне стиснення та конвертація в JPG
- 🛡️ **Надійність**: Fallback на оригінальний розмір якщо щось не так

### 🗂️ Структура файлів після роботи

```
/var/media/galinfo/gallery/
├── full/
│   ├── 1/7/1761574574725_59m3t1s5ikd.jpg  ← Оригінал
│   └── 4/0/4041.png                       ← Оригінал
├── intxt/                                 ← Генеруються автоматично
│   ├── 1/7/1761574574725_59m3t1s5ikd.jpg  ← 800px версія
│   └── 4/0/4041.jpg                       ← 800px версія (PNG→JPG)
└── tmb/                                   ← Генеруються автоматично
    ├── 1/7/1761574574725_59m3t1s5ikd.jpg  ← 150px версія
    └── 4/0/4041.jpg                       ← 150px версія (PNG→JPG)
```

## Налагодження

### Перевірка логів nginx
```bash
sudo tail -f /var/log/nginx/galinfo_access.log
sudo tail -f /var/log/nginx/galinfo_error.log
```

### Перевірка Next.js API
```bash
# Прямий запит до API
curl -I http://localhost:3000/api/media/gallery/tmb/4/0/4041.png
```

### Перевірка файлової системи
```bash
ls -la /var/media/galinfo/gallery/full/4/0/
ls -la /var/media/galinfo/gallery/tmb/4/0/
```

Тепер ваша система підтримує як статичні файли, так і динамічну генерацію зображень! 🎉
