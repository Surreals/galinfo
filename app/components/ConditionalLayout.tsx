'use client';

import { usePathname } from 'next/navigation';
import Header from "@/app/header/Header";
import Footer from "@/app/footer/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Paths that should not have Header/Footer
  const excludedPaths = ['/login'];
  const shouldExclude = excludedPaths.some(path => pathname.startsWith(path));

  if (shouldExclude) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

