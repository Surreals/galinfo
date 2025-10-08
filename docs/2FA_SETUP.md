# Two-Factor Authentication (2FA) Setup

This document describes the 2FA system implementation for the GalInfo admin panel.

## Overview

Two-Factor Authentication (2FA) has been implemented using Google Authenticator for enhanced security of admin accounts.

## Database Schema

The following columns were added to the `a_powerusers` table:

```sql
twofa_enabled TINYINT(1) DEFAULT 0      -- Flag indicating if 2FA is enabled
twofa_secret VARCHAR(255) DEFAULT NULL  -- Secret key for TOTP generation
backup_codes TEXT DEFAULT NULL          -- JSON array of backup codes
```

## Migration

If you're upgrading an existing installation, run the migration:

```bash
npm run migrate:2fa
```

This will add the necessary columns to your `a_powerusers` table.

## API Endpoints

### Enable 2FA
`POST /api/admin/2fa/enable`
- Generates QR code and backup codes
- Does not enable 2FA until verified

### Verify 2FA Token
`POST /api/admin/2fa/verify`
- Verifies the 6-digit code from Google Authenticator
- Enables 2FA after successful verification
- Also supports backup codes

### Check 2FA Status
`GET /api/admin/2fa/status?userId={id}`
- Returns current 2FA status
- Returns count of remaining backup codes

### Disable 2FA
`POST /api/admin/2fa/disable`
- Requires password confirmation
- Clears all 2FA data

## User Interface

Access the 2FA settings page:
- Navigate to `/admin`
- Click on the "Безпека" (Security) card
- Or go directly to `/admin/settings/2fa`

### Features

1. **Enable 2FA**
   - Scan QR code with Google Authenticator
   - Enter 6-digit verification code
   - Download or copy backup codes

2. **View Status**
   - See if 2FA is enabled
   - Check remaining backup codes

3. **Disable 2FA**
   - Requires password confirmation
   - Removes all 2FA data

## Setup Flow

1. User clicks "Увімкнути 2FA" (Enable 2FA)
2. System generates:
   - Secret key
   - QR code for Google Authenticator
   - 10 backup codes (8 characters each)
3. User scans QR code with Google Authenticator app
4. User enters 6-digit code for verification
5. Upon successful verification:
   - 2FA is enabled
   - Backup codes are displayed for download/copy
6. User saves backup codes in a secure location

## Security Notes

- Uses TOTP (Time-based One-Time Password) algorithm
- Compatible with Google Authenticator and other TOTP apps
- Backup codes can be used once each
- Password verification required to disable 2FA
- Secret keys are stored securely in the database

## Backup Codes

- 10 codes generated per user
- Each code is 8 characters (alphanumeric)
- Can be used once each
- Automatically removed after use
- Should be stored securely by the user

## Future Enhancements

Potential improvements:
- SMS-based 2FA as alternative
- Email verification for 2FA disable
- Regenerate backup codes functionality
- 2FA usage logs and audit trail
- Force 2FA for all admin users

