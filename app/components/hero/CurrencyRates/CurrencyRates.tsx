import Image from "next/image";
import arrowRight from "@/assets/icons/arrowRight.svg";
import styles from './CurrencyRates.module.css';

interface ExchangeRate {
  currency: string;
  buy: number;
  sell: number;
  interbank: number;
}

export default function CurrencyRates() {
  // Дані для курсів валют
  const exchangeRates: ExchangeRate[] = [
    {
      currency: 'USD',
      buy: 41.50,
      sell: 41.68,
      interbank: 41.76,
    },
    {
      currency: 'EUR',
      buy: 49.30,
      sell: 49.49,
      interbank: 49.10,
    },
  ];
  return (
    <div className={styles.currencySection}>
      <div className={styles.titleBox}>
        <h4 className={styles.sectionTitle}>КУРСИ ВАЛЮТ</h4>
        <Image
          src={arrowRight}
          alt={'Arrow right'}
          width={10}
          height={8}
        />
      </div>
      <div className={styles.exchangeTable}>
        <div className={styles.exchangeTableHeader}>
          <div></div>
          <div className={styles.exchangeCurrency}>КУПІВЛЯ</div>
          <div className={styles.exchangeCurrency}>ПРОДАЖ</div>
          <div className={styles.exchangeCurrency}>МІЖБАНК</div>
        </div>

        {exchangeRates.map((rate) => (
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
