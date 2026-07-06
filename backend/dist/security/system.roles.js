"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionMap = void 0;
exports.getPermissionsForRole = getPermissionsForRole;
const client_1 = require("@prisma/client");
const system_permissions_1 = require("./system.permissions");
exports.RolePermissionMap = {
    [client_1.UserRole.SUPERADMIN]: Object.values(system_permissions_1.SystemPermissions),
    [client_1.UserRole.HOST]: [
        system_permissions_1.SystemPermissions.AUTH_PROFILE_READ,
        system_permissions_1.SystemPermissions.AUTH_PROFILE_UPDATE,
        system_permissions_1.SystemPermissions.HOST_KYC_SUBMIT,
        system_permissions_1.SystemPermissions.HOST_BANK_UPDATE,
        system_permissions_1.SystemPermissions.HOST_DASHBOARD_READ,
        system_permissions_1.SystemPermissions.HOST_EVENTS_CREATE,
        system_permissions_1.SystemPermissions.HOST_EVENTS_UPDATE,
    ],
    [client_1.UserRole.CLIENT]: [
        system_permissions_1.SystemPermissions.AUTH_PROFILE_READ,
        system_permissions_1.SystemPermissions.AUTH_PROFILE_UPDATE,
        system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CREATE,
        system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_READ_OWN,
        system_permissions_1.SystemPermissions.CLIENT_BOOKINGS_CANCEL_OWN,
        system_permissions_1.SystemPermissions.CLIENT_WISHLIST_MANAGE,
        system_permissions_1.SystemPermissions.CLIENT_LIKES_MANAGE,
        system_permissions_1.SystemPermissions.CLIENT_REVIEWS_CREATE,
    ],
};
function getPermissionsForRole(role) {
    return exports.RolePermissionMap[role] || exports.RolePermissionMap[client_1.UserRole.CLIENT];
}
