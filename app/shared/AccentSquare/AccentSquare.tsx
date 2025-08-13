import Image from "next/image";

import categoryIcon from "@/assets/icons/categoryIcon.svg";

import styles from './AccentSquare.module.css';

interface AccentSquareProps {
  className?: string;
}

export default function AccentSquare({ className }: AccentSquareProps) {
  return (
    <Image
      className={styles.icon}
      src={categoryIcon}
      alt="Right arrow"
      width={32}
      height={32}
    />
  );
} 