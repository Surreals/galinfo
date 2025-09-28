'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/contexts/AdminAuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedAdminRoute({ 
  children, 
  fallback = null 
}: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #ccc",
            borderTop: "4px solid #c7084f",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{marginTop: "16px", fontSize: "18px", color: "#333"}}>
          Перевірка авторизації...
        </p>

        {/* Додаємо ключові кадри прямо в JSX через <style> */}
        <style>
          {`
      @keyframes spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
