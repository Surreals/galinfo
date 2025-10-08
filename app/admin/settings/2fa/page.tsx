'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import { Button, Modal, Input, message } from 'antd';
import { LockOutlined, UnlockOutlined, QrcodeOutlined } from '@ant-design/icons';
import Image from 'next/image';
import styles from './twofa.module.css';

export default function TwoFactorSettingsPage() {
  const { user } = useAdminAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Enable 2FA modal
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'scan' | 'verify' | 'backup'>('scan');
  
  // Disable 2FA modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  // Load 2FA status
  useEffect(() => {
    if (user?.id) {
      loadTwoFactorStatus();
    }
  }, [user]);

  const loadTwoFactorStatus = async () => {
    try {
      const response = await fetch(`/api/admin/2fa/status?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTwoFactorEnabled(data.enabled);
        setBackupCodesCount(data.backupCodesCount);
      }
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setShowEnableModal(true);
        setStep('scan');
      } else {
        message.error('Помилка активації 2FA');
      }
    } catch (error) {
      message.error('Помилка підключення');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error('Введіть 6-значний код');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          token: verificationCode,
          isLogin: false
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('2FA успішно активовано!');
        setStep('backup');
        setTwoFactorEnabled(true);
        setBackupCodesCount(backupCodes.length);
      } else {
        message.error('Невірний код автентифікації');
      }
    } catch (error) {
      message.error('Помилка підключення');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) {
      message.error('Введіть пароль');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          password: disablePassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('2FA успішно вимкнено');
        setTwoFactorEnabled(false);
        setBackupCodesCount(0);
        setShowDisableModal(false);
        setDisablePassword('');
      } else {
        message.error('Невірний пароль');
      }
    } catch (error) {
      message.error('Помилка підключення');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    message.success('Резервні коди скопійовано');
  };

  const downloadBackupCodes = () => {
    const text = `GalInfo 2FA Резервні коди\nКористувач: ${user?.name}\nДата: ${new Date().toLocaleDateString('uk-UA')}\n\n${backupCodes.join('\n')}\n\nЗбережіть ці коди в безпечному місці!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `galinfo-2fa-backup-codes-${user?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Резервні коди завантажено');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Двофакторна автентифікація (2FA)</h1>
        <p className={styles.subtitle}>
          Підвищте безпеку свого облікового запису за допомогою Google Authenticator
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.status}>
          <div className={styles.statusIcon}>
            {twoFactorEnabled ? (
              <LockOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            ) : (
              <UnlockOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
            )}
          </div>
          <div className={styles.statusInfo}>
            <h2 className={styles.statusTitle}>
              {twoFactorEnabled ? 'Увімкнено' : 'Вимкнено'}
            </h2>
            <p className={styles.statusText}>
              {twoFactorEnabled
                ? `2FA активовано. Залишилось ${backupCodesCount} резервних кодів.`
                : '2FA не активовано. Ваш обліковий запис захищений тільки паролем.'}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          {!twoFactorEnabled ? (
            <Button
              type="primary"
              size="large"
              icon={<LockOutlined />}
              onClick={handleEnable}
              loading={loading}
            >
              Увімкнути 2FA
            </Button>
          ) : (
            <Button
              danger
              size="large"
              icon={<UnlockOutlined />}
              onClick={() => setShowDisableModal(true)}
            >
              Вимкнути 2FA
            </Button>
          )}
        </div>

        <div className={styles.info}>
          <h3>Що таке 2FA?</h3>
          <p>
            Двофакторна автентифікація додає додатковий рівень безпеки до вашого облікового запису.
            При вході в систему, окрім пароля, потрібно буде ввести код з додатку Google Authenticator.
          </p>
          <h3>Як це працює?</h3>
          <ol>
            <li>Завантажте додаток Google Authenticator на свій телефон</li>
            <li>Відскануйте QR код, який ми згенеруємо</li>
            <li>Введіть 6-значний код для підтвердження</li>
            <li>Збережіть резервні коди в безпечному місці</li>
          </ol>
        </div>
      </div>

      {/* Enable 2FA Modal */}
      <Modal
        title={
          step === 'scan' ? 'Крок 1: Скануйте QR код' :
          step === 'verify' ? 'Крок 2: Введіть код' :
          'Крок 3: Збережіть резервні коди'
        }
        open={showEnableModal}
        onCancel={() => {
          setShowEnableModal(false);
          setStep('scan');
          setVerificationCode('');
        }}
        footer={null}
        width={600}
      >
        {step === 'scan' && (
          <div className={styles.modalContent}>
            <p>1. Завантажте Google Authenticator на свій телефон</p>
            <p>2. Відскануйте цей QR код:</p>
            {qrCode && (
              <div className={styles.qrCode}>
                <Image src={qrCode} alt="QR Code" width={256} height={256} />
              </div>
            )}
            <p>Або введіть цей код вручну:</p>
            <Input value={secret} readOnly className={styles.secretInput} />
            <Button
              type="primary"
              size="large"
              block
              onClick={() => setStep('verify')}
            >
              Далі
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className={styles.modalContent}>
            <p>Введіть 6-значний код з додатку Google Authenticator:</p>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{ fontSize: 24, textAlign: 'center', letterSpacing: '0.5em' }}
            />
            <Button
              type="primary"
              size="large"
              block
              onClick={handleVerifyCode}
              loading={loading}
              disabled={verificationCode.length !== 6}
              style={{ marginTop: 16 }}
            >
              Підтвердити
            </Button>
          </div>
        )}

        {step === 'backup' && (
          <div className={styles.modalContent}>
            <p><strong>Важливо!</strong> Збережіть ці резервні коди в безпечному місці.</p>
            <p>Кожен код можна використати тільки один раз для входу, якщо ви втратите доступ до телефону.</p>
            <div className={styles.backupCodes}>
              {backupCodes.map((code, index) => (
                <div key={index} className={styles.backupCode}>
                  {code}
                </div>
              ))}
            </div>
            <div className={styles.backupActions}>
              <Button onClick={copyBackupCodes}>Копіювати</Button>
              <Button type="primary" onClick={downloadBackupCodes}>Завантажити</Button>
            </div>
            <Button
              type="default"
              size="large"
              block
              onClick={() => {
                setShowEnableModal(false);
                setStep('scan');
                setVerificationCode('');
              }}
              style={{ marginTop: 16 }}
            >
              Готово
            </Button>
          </div>
        )}
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        title="Вимкнути 2FA"
        open={showDisableModal}
        onOk={handleDisable}
        onCancel={() => {
          setShowDisableModal(false);
          setDisablePassword('');
        }}
        confirmLoading={loading}
        okText="Вимкнути"
        cancelText="Скасувати"
        okButtonProps={{ danger: true }}
      >
        <p>Ви впевнені, що хочете вимкнути двофакторну автентифікацію?</p>
        <p>Введіть свій пароль для підтвердження:</p>
        <Input.Password
          value={disablePassword}
          onChange={(e) => setDisablePassword(e.target.value)}
          placeholder="Ваш пароль"
        />
      </Modal>
    </div>
  );
}

