/**
 * User Role System
 * Defines user roles and their permissions
 */

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  JOURNALIST = 'journalist'
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageTags: boolean;
  canManageAdvertisements: boolean;
  canManageTelegram: boolean;
  canManageSiteSettings: boolean;
  canCreateNews: boolean;
  canEditNews: boolean;
  canPublishNews: boolean;
  canDeleteNews: boolean;
  canMoveToDraft: boolean;
  canUploadMedia: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageCategories: true,
    canManageTags: true,
    canManageAdvertisements: true,
    canManageTelegram: true,
    canManageSiteSettings: true,
    canCreateNews: true,
    canEditNews: true,
    canPublishNews: true,
    canDeleteNews: true,
    canMoveToDraft: true,
    canUploadMedia: true,
  },
  [UserRole.EDITOR]: {
    canManageUsers: false,
    canManageCategories: false,
    canManageTags: false,
    canManageAdvertisements: false,
    canManageTelegram: false,
    canManageSiteSettings: false,
    canCreateNews: true,
    canEditNews: true,
    canPublishNews: true,
    canDeleteNews: false,
    canMoveToDraft: true,
    canUploadMedia: true,
  },
  [UserRole.JOURNALIST]: {
    canManageUsers: false,
    canManageCategories: false,
    canManageTags: false,
    canManageAdvertisements: false,
    canManageTelegram: false,
    canManageSiteSettings: false,
    canCreateNews: true,
    canEditNews: true,
    canPublishNews: false,
    canDeleteNews: false,
    canMoveToDraft: true,
    canUploadMedia: true,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Адміністратор',
  [UserRole.EDITOR]: 'Редактор',
  [UserRole.JOURNALIST]: 'Журналіст',
};

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

