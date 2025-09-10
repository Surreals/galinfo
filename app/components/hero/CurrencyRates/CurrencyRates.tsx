import { useMemo } from 'react';
import { Skeleton } from 'antd';
import {useCurrencyRates, RateRow} from "@/app/hooks/UseCurrencyRatesResult";

import styles from './CurrencyRates.module.css';

export default function CurrencyRates({ loading }) {
  // ✅ фіксуємо масив, щоб не створювати новий на кожному рендері
  const currencies = useMemo(() => ['USD', 'EUR'], []);
  const { rates, error } = useCurrencyRates(currencies);

  if (loading) {
    return (
      <div className={styles.currencySection}>
        <div className={styles.titleBox}>
          <h4 className={styles.sectionTitle}>КУРСИ ВАЛЮТ</h4>
        </div>
        <div className={styles.exchangeTable}>
          <div className={styles.exchangeTableHeader}>
            <div></div>
            <div className={styles.exchangeCurrency}>КУПІВЛЯ</div>
            <div className={styles.exchangeCurrency}>ПРОДАЖ</div>
            <div className={styles.exchangeCurrency}>МІЖБАНК</div>
          </div>
            <div className={styles.skeletonBox} >
                <Skeleton.Input active style={{ height: '40px', width: '100%' }} />
                <Skeleton.Input active style={{ height: '40px', width: '100%' }} />
            </div>
        </div>
      </div>
    );
  }

  if (error) return <div>Помилка: {error}</div>;
  if (!rates) return null;

  return (
    <div className={styles.currencySection}>
      <div className={styles.titleBox}>
        <h4 className={styles.sectionTitle}>КУРСИ ВАЛЮТ</h4>
      </div>
      <div className={styles.exchangeTable}>
        <div className={styles.exchangeTableHeader}>
          <div></div>
          <div className={styles.exchangeCurrency}>КУПІВЛЯ</div>
          <div className={styles.exchangeCurrency}>ПРОДАЖ</div>
          <div className={styles.exchangeCurrency}>МІЖБАНК</div>
        </div>

        {rates.map((rate: RateRow) => (
          <div key={rate.currency} className={styles.exchangeTableRow}>
            <div className={styles.exchangeCurrency}>{rate.currency}</div>
            <div className={styles.exchangeValue}>{rate.buy.toFixed(2)}</div>
            <div className={styles.exchangeValue}>{rate.sell.toFixed(2)}</div>
            <div className={styles.exchangeValue}>{rate.interbank.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}