/**
 * RoleProtected Component
 * Wraps components and only renders them if the user has the required role
 */

'use client';

import { ReactNode } from 'react';
import { useRolePermissions } from '@/app/hooks/useRolePermissions';
import { UserRole, RolePermissions } from '@/app/types/roles';
import { Alert } from 'antd';

interface RoleProtectedProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function RoleProtected({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
  showMessage = true,
}: RoleProtectedProps) {
  const { role, checkPermission } = useRolePermissions();

  // Check if user has required role
  if (requiredRole) {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.EDITOR]: 2,
      [UserRole.JOURNALIST]: 1,
    };

    if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
      if (showMessage) {
        return (
          <Alert
            message="Доступ заборонено"
            description="У вас немає достатніх прав для доступу до цього розділу."
            type="error"
            showIcon
            style={{ margin: '20px' }}
          />
        );
      }
      return <>{fallback}</>;
    }
  }

  // Check if user has required permission
  if (requiredPermission && !checkPermission(requiredPermission)) {
    if (showMessage) {
      return (
        <Alert
          message="Доступ заборонено"
          description="У вас немає необхідних прав для виконання цієї дії."
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

