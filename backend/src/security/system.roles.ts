import { UserRole } from '@prisma/client';
import { SystemPermissions, SystemPermission } from './system.permissions';

export const RolePermissionMap: Record<UserRole, SystemPermission[]> = {
  [UserRole.SUPERADMIN]: Object.values(SystemPermissions),
  [UserRole.HOST]: [
    SystemPermissions.AUTH_PROFILE_READ,
    SystemPermissions.AUTH_PROFILE_UPDATE,
    SystemPermissions.HOST_KYC_SUBMIT,
    SystemPermissions.HOST_BANK_UPDATE,
    SystemPermissions.HOST_DASHBOARD_READ,
    SystemPermissions.HOST_EVENTS_CREATE,
    SystemPermissions.HOST_EVENTS_UPDATE,
    SystemPermissions.HOST_EVENTS_DELETE,
    SystemPermissions.CLIENT_WISHLIST_MANAGE,
    SystemPermissions.CLIENT_LIKES_MANAGE,
  ],
  [UserRole.CLIENT]: [
    SystemPermissions.AUTH_PROFILE_READ,
    SystemPermissions.AUTH_PROFILE_UPDATE,
    SystemPermissions.CLIENT_BOOKINGS_CREATE,
    SystemPermissions.CLIENT_BOOKINGS_READ_OWN,
    SystemPermissions.CLIENT_BOOKINGS_CANCEL_OWN,
    SystemPermissions.CLIENT_WISHLIST_MANAGE,
    SystemPermissions.CLIENT_LIKES_MANAGE,
    SystemPermissions.CLIENT_REVIEWS_CREATE,
  ],
};

export function getPermissionsForRole(role: UserRole): SystemPermission[] {
  return RolePermissionMap[role] || RolePermissionMap[UserRole.CLIENT];
}
