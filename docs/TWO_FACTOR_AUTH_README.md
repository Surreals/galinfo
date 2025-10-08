# Двофакторна автентифікація (2FA) з Google Authenticator

## Огляд

Реалізована повна система двофакторної автентифікації (2FA) для адміністраторів сайту на основі **Google Authenticator** з підтримкою резервних кодів.

## 🎯 Основні можливості

- ✅ **Google Authenticator** інтеграція з QR кодом
- ✅ **Резервні коди** (10 кодів) для відновлення доступу
- ✅ **Крок-за-кроком** налаштування 2FA
- ✅ **Безпечне вимкнення** з підтвердженням паролем
- ✅ **Перевірка при вході** з підтримкою резервних кодів
- ✅ **Повністю адаптивний UI** для мобільних та десктопів

## 📁 Структура файлів

### API Endpoints

```
/app/api/admin/2fa/
├── enable/route.ts      - Генерація секрета і QR коду
├── verify/route.ts      - Перевірка OTP або резервного коду
├── disable/route.ts     - Вимкнення 2FA
└── status/route.ts      - Перевірка статусу 2FA
```

### Frontend Components

```
/app/login/
├── page.tsx             - Логін сторінка з підтримкою 2FA
├── TwoFactorPage.tsx    - Сторінка введення OTP коду
└── login.module.css     - Стилі для логіну та 2FA

/app/admin/settings/2fa/
├── page.tsx             - Налаштування 2FA в адмін панелі
└── twofa.module.css     - Стилі для налаштувань

/app/api/admin/
└── login/route.ts       - Оновлений API логіну з 2FA
```

### Database Migration

```
/scripts/
└── add-2fa-fields.js    - SQL міграція для додавання полів 2FA
```

## 🗄️ Структура бази даних

### Таблиця `a_powerusers`

Додані нові поля:

```sql
ALTER TABLE a_powerusers
ADD COLUMN twofa_secret VARCHAR(255) NULL DEFAULT NULL COMMENT '2FA secret key for Google Authenticator';

ALTER TABLE a_powerusers
ADD COLUMN twofa_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 if 2FA is enabled, 0 otherwise';

ALTER TABLE a_powerusers
ADD COLUMN backup_codes TEXT NULL DEFAULT NULL COMMENT 'JSON array of backup codes for 2FA recovery';
```

**Поля:**

- `twofa_secret` (VARCHAR 255) - секретний ключ для TOTP
- `twofa_enabled` (TINYINT 1) - прапорець чи увімкнено 2FA
- `backup_codes` (TEXT) - JSON масив резервних кодів

## 🚀 Встановлення

### 1. Встановити залежності

```bash
npm install speakeasy qrcode --legacy-peer-deps
npm install -D @types/speakeasy @types/qrcode --legacy-peer-deps
```

**Бібліотеки:**

- `speakeasy` - генерація та перевірка TOTP (Time-based One-Time Password)
- `qrcode` - генерація QR кодів для Google Authenticator
- `@types/*` - типи TypeScript

### 2. Запустити міграцію бази даних

```bash
node scripts/add-2fa-fields.js
```

Скрипт автоматично додасть необхідні поля в таблицю `a_powerusers`.

### 3. Перевірити доступність сторінок

- **Налаштування 2FA:** `/admin/settings/2fa`
- **Логін:** `/login`

## 🔐 Як працює 2FA

### Flow активації 2FA

```
1. Користувач → "Увімкнути 2FA"
   ↓
2. API генерує секретний ключ (speakeasy.generateSecret)
   ↓
3. Генерується QR код з URL для Google Authenticator
   ↓
4. Генеруються 10 резервних кодів (8 символів кожен)
   ↓
5. Користувач сканує QR код
   ↓
6. Користувач вводить 6-значний код з Google Authenticator
   ↓
7. API перевіряє код (speakeasy.totp.verify)
   ↓
8. 2FA активується (twofa_enabled = 1)
   ↓
9. Користувач зберігає резервні коди
```

### Flow входу з 2FA

```
1. Користувач вводить логін/пароль
   ↓
2. API перевіряє credentials
   ↓
3. Якщо twofa_enabled = 1 → повертає requiresTwoFactor: true
   ↓
4. Відображається сторінка введення OTP
   ↓
5. Користувач вводить 6-значний код або резервний код
   ↓
6. API перевіряє код
   ↓
7. Якщо код правильний → видається token і доступ
```

### Flow вимкнення 2FA

```
1. Користувач → "Вимкнути 2FA"
   ↓
2. Запит пароля для підтвердження
   ↓
3. API перевіряє пароль (MD5 hash)
   ↓
4. Очищаються поля: twofa_secret, twofa_enabled, backup_codes
   ↓
5. 2FA вимкнено
```

## 📱 Використання Google Authenticator

### Встановлення додатку

**iOS:**

- [Google Authenticator в App Store](https://apps.apple.com/app/google-authenticator/id388497605)

**Android:**

- [Google Authenticator в Google Play](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

### Налаштування

1. Відкрийте Google Authenticator
2. Натисніть "+" (додати акаунт)
3. Оберіть "Сканувати QR код"
4. Наведіть камеру на QR код
5. Акаунт "GalInfo Admin" з'явиться в додатку
6. Кожні 30 секунд генерується новий 6-значний код

### Альтернатива (без QR коду)

Якщо не можете відсканувати QR:

1. Оберіть "Ввести ключ налаштування"
2. Назва облікового запису: `GalInfo Admin`
3. Ключ: `[секретний ключ з інтерфейсу]`
4. Тип: На основі часу

## 🔑 Резервні коди

### Що це?

Резервні коди - це 10 одноразових кодів по 8 символів, які можна використати замість OTP коду.

**Формат:** `ABC12DEF` (заглавні букви та цифри)

### Коли використовувати?

- ❌ Втрачено доступ до телефону з Google Authenticator
- ❌ Телефон розрядився
- ❌ Додаток Google Authenticator не працює
- ❌ Не можете згенерувати код

### Важливо!

⚠️ **Кожен код можна використати тільки один раз**
⚠️ **Зберігайте коди в безпечному місці**
⚠️ **Не діліться кодами з іншими**

### Де зберігати?

1. **Паперовий запис** в сейфі
2. **Менеджер паролів** (1Password, LastPass, Bitwarden)
3. **Зашифрований файл** на комп'ютері
4. **Захищена нотатка** на телефоні

## 🛠️ API Endpoints

### 1. Enable 2FA

```http
POST /api/admin/2fa/enable
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**

```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "ABC12DEF",
    "GHI34JKL",
    ...
  ],
  "otpauth_url": "otpauth://totp/GalInfo..."
}
```

### 2. Verify Token

```http
POST /api/admin/2fa/verify
Content-Type: application/json

{
  "userId": 1,
  "token": "123456",
  "isLogin": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token verified",
  "remainingBackupCodes": 10
}
```

### 3. Disable 2FA

```http
POST /api/admin/2fa/disable
Content-Type: application/json

{
  "userId": 1,
  "password": "mypassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

### 4. Check Status

```http
GET /api/admin/2fa/status?userId=1
```

**Response:**

```json
{
  "enabled": true,
  "backupCodesCount": 8
}
```

## 🎨 UI Компоненти

### Сторінка налаштувань 2FA

**Шлях:** `/admin/settings/2fa`

**Функції:**

- Відображення поточного статусу (увімкнено/вимкнено)
- Кнопка "Увімкнути 2FA"
- Модальне вікно з 3 кроками:
  1. Сканування QR коду
  2. Введення коду для перевірки
  3. Збереження резервних кодів
- Кнопка "Вимкнути 2FA" (потребує пароль)
- Інформація про 2FA

### Сторінка входу з 2FA

**Шлях:** `/login`

**Функції:**

- Стандартний логін (username/password)
- Автоматичний перехід на OTP, якщо 2FA увімкнено
- Введення 6-значного коду
- Кнопка "Використати резервний код"
- Кнопка "Назад до входу"

## 🔒 Безпека

### Реалізовані заходи

1. **TOTP стандарт (RFC 6238)**

   - Time-based One-Time Password
   - 30-секундне вікно
   - 6-значні коди

2. **Резервні коди**

   - Одноразове використання
   - Видаляються після використання
   - 8 символів (букви + цифри)

3. **Clock Skew**

   - Window = 2 (допускається ±60 секунд)
   - Компенсує розбіжності годинників

4. **Підтвердження паролем**

   - При вимкненні 2FA потрібен пароль
   - MD5 хеш (відповідає існуючій системі)

5. **Безпечне зберігання**
   - Секрет в БД (base32 encoded)
   - Резервні коди в JSON
   - Ніяких plain-text паролів

## 📊 Тестування

### Ручне тестування

#### 1. Активація 2FA

```bash
1. Увійти в адмін панель
2. Перейти на /admin/settings/2fa
3. Натиснути "Увімкнути 2FA"
4. Відсканувати QR код через Google Authenticator
5. Ввести 6-значний код
6. Перевірити успішну активацію
7. Зберегти резервні коди
```

#### 2. Вхід з 2FA

```bash
1. Вийти з системи
2. Ввести логін/пароль на /login
3. Перевірити перенаправлення на OTP сторінку
4. Ввести код з Google Authenticator
5. Перевірити успішний вхід
```

#### 3. Вхід з резервним кодом

```bash
1. Вийти з системи
2. Ввести логін/пароль
3. Натиснути "Використати резервний код"
4. Ввести резервний код
5. Перевірити успішний вхід
6. Перевірити що кількість резервних кодів зменшилась
```

#### 4. Вимкнення 2FA

```bash
1. Перейти на /admin/settings/2fa
2. Натиснути "Вимкнути 2FA"
3. Ввести пароль
4. Перевірити успішне вимкнення
5. Вийти і ввійти без OTP коду
```

### Перевірка БД

```sql
-- Перевірити статус 2FA користувача
SELECT
  id,
  uname,
  twofa_enabled,
  CASE WHEN twofa_secret IS NOT NULL THEN 'SET' ELSE 'NULL' END as secret_status,
  CASE WHEN backup_codes IS NOT NULL THEN
    JSON_LENGTH(backup_codes)
  ELSE 0 END as backup_codes_count
FROM a_powerusers
WHERE id = 1;
```

## 🐛 Troubleshooting

### Проблема: QR код не сканується

**Рішення:**

1. Збільшити яскравість екрану
2. Використати ручне введення ключа
3. Перевірити що Google Authenticator встановлений

### Проблема: Код не приймається

**Рішення:**

1. Перевірити час на телефоні та сервері (має бути синхронізований)
2. Спробувати наступний код (генерується кожні 30 сек)
3. Використати резервний код

### Проблема: Втрачено доступ до телефону

**Рішення:**

1. Використати резервний код
2. Якщо немає резервних кодів - зв'язатися з адміністратором
3. Адміністратор може вимкнути 2FA через БД:

```sql
UPDATE a_powerusers
SET twofa_enabled = 0,
    twofa_secret = NULL,
    backup_codes = NULL
WHERE id = [USER_ID];
```

### Проблема: Всі резервні коди використані

**Рішення:**

1. Вимкнути 2FA (потрібен OTP код)
2. Увімкнути знову - буде згенеровано нові резервні коди
3. Зберегти нові коди

## 📚 Додаткові ресурси

- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator](https://support.google.com/accounts/answer/1066447)
- [Speakeasy Documentation](https://www.npmjs.com/package/speakeasy)
- [QRCode Documentation](https://www.npmjs.com/package/qrcode)

## ✅ Checklist для впровадження

- [x] Встановлено бібліотеки (speakeasy, qrcode)
- [x] Створено міграцію БД
- [x] Створено API endpoints (enable, verify, disable, status)
- [x] Оновлено login flow
- [x] Створено сторінку введення OTP
- [x] Створено UI налаштувань 2FA
- [x] Реалізовано резервні коди
- [x] Додано генерацію QR коду
- [x] Додано перевірку при вході
- [x] Створено документацію

## 🎉 Готово!

Система 2FA повністю готова до використання. Тепер адміністратори можуть захистити свої облікові записи додатковим рівнем безпеки через Google Authenticator!

---

**Автор:** AI Assistant  
**Дата:** 7 жовтня 2025  
**Версія:** 1.0.0
