export const SystemPermissions = {
  // Auth Permissions
  AUTH_PROFILE_READ: 'auth:profile_read',
  AUTH_PROFILE_UPDATE: 'auth:profile_update',

  // Host Permissions
  HOST_KYC_SUBMIT: 'host:kyc_submit',
  HOST_BANK_UPDATE: 'host:bank_update',
  HOST_DASHBOARD_READ: 'host:dashboard_read',
  HOST_EVENTS_CREATE: 'host:events_create',
  HOST_EVENTS_UPDATE: 'host:events_update',
  HOST_EVENTS_DELETE: 'host:events_delete',

  // Client Permissions
  CLIENT_BOOKINGS_CREATE: 'client:bookings_create',
  CLIENT_BOOKINGS_READ_OWN: 'client:bookings_read_own',
  CLIENT_BOOKINGS_CANCEL_OWN: 'client:bookings_cancel_own',
  CLIENT_WISHLIST_MANAGE: 'client:wishlist_manage',
  CLIENT_LIKES_MANAGE: 'client:likes_manage',
  CLIENT_REVIEWS_CREATE: 'client:reviews_create',

  // Admin Permissions
  ADMIN_EVENTS_MODERATE: 'admin:events_moderate',
  ADMIN_EVENTS_APPROVE: 'admin:events_approve',
  ADMIN_EVENTS_BOOST: 'admin:events_boost',
  ADMIN_KYC_REVIEW: 'admin:kyc_review',
  ADMIN_LEDGER_READ: 'admin:ledger_read',
  ADMIN_PAYOUT_RELEASE: 'admin:payout_release',
  ADMIN_CONFIGS_MANAGE: 'admin:configs_manage',
  ADMIN_TEMPLATES_MANAGE: 'admin:templates_manage',
  ADMIN_NOTIFICATIONS_BROADCAST: 'admin:notifications_broadcast',
} as const;

export type SystemPermission = typeof SystemPermissions[keyof typeof SystemPermissions];
