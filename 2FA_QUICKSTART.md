# 🚀 Швидкий старт: Двофакторна автентифікація

## Крок 1: Запустити міграцію БД

```bash
node scripts/add-2fa-fields.js
```

Це додасть 3 нові поля в таблицю `a_powerusers`:

- `twofa_secret` - секретний ключ
- `twofa_enabled` - статус (увімкнено/вимкнено)
- `backup_codes` - резервні коди

## Крок 2: Перезапустити сервер

```bash
npm run dev
```

## Крок 3: Налаштувати 2FA

### Для адміністратора:

1. Увійдіть в адмін панель `/admin`
2. Перейдіть на `/admin/settings/2fa`
3. Натисніть **"Увімкнути 2FA"**
4. **Відскануйте QR код** через Google Authenticator:
   - iOS: [App Store](https://apps.apple.com/app/google-authenticator/id388497605)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
5. **Введіть 6-значний код** для підтвердження
6. **ОБОВ'ЯЗКОВО збережіть** резервні коди в безпечному місці!

## Крок 4: Протестувати вхід

1. Вийдіть з системи
2. Введіть логін/пароль на `/login`
3. Система попросить ввести **6-значний код** з Google Authenticator
4. Введіть код → успішний вхід! ✅

## 💡 Що робити, якщо втрачено доступ до телефону?

Використайте **резервний код** (8 символів), який ви зберегли при налаштуванні 2FA.

Кожен код можна використати тільки **один раз**.

## 📱 Підтримувані додатки

Підтримується будь-який TOTP додаток:

- ✅ Google Authenticator (рекомендовано)
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ LastPass Authenticator

## 🔧 Налаштування

Всі файли вже створені та готові до роботи!

**API Endpoints:**

- `/api/admin/2fa/enable` - увімкнути
- `/api/admin/2fa/verify` - перевірити код
- `/api/admin/2fa/disable` - вимкнути
- `/api/admin/2fa/status` - статус

**UI Сторінки:**

- `/admin/settings/2fa` - налаштування
- `/login` - вхід з підтримкою 2FA

## 📖 Повна документація

Детальна інформація в файлі: `docs/TWO_FACTOR_AUTH_README.md`

## ⚡ Все готово!

2FA система повністю функціональна та готова до використання!
