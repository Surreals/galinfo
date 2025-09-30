'use client';

import { HomePageRenderer } from "@/app/components";

import styles from "./page.module.css";

export default function HomePage() {


  return (
    <>
      <div className={styles.container}>
        {/* Нова система з схемою */}
        <HomePageRenderer />

      </div>
    </>
  );
}