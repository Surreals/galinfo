/**
 * Hook for checking user role permissions
 */

import { useAdminAuth } from '@/app/contexts/AdminAuthContext';
import { UserRole, getRolePermissions, hasPermission, RolePermissions } from '@/app/types/roles';

export function useRolePermissions() {
  const { user } = useAdminAuth();
  
  const role = (user?.role as UserRole) || UserRole.JOURNALIST;
  const permissions = getRolePermissions(role);

  const checkPermission = (permission: keyof RolePermissions): boolean => {
    return hasPermission(role, permission);
  };

  return {
    role,
    permissions,
    checkPermission,
    isAdmin: role === UserRole.ADMIN,
    isEditor: role === UserRole.EDITOR,
    isJournalist: role === UserRole.JOURNALIST,
  };
}

