// Mirrors the backend's role rules (the server enforces them; this only shapes the UI).
export const STAFF_ROLES = ['ADMIN', 'MANAGER', 'SUPPORT'];
export const PRODUCT_ROLES = [...STAFF_ROLES, 'PRODUCT_EDITOR'];
export const TEAM_ROLES = ['ADMIN'];

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SUPPORT: 'Support',
  PRODUCT_EDITOR: 'Product editor',
};

export function hasRole(session, roles) {
  return Boolean(session?.user && roles.includes(session.user.role));
}

/** Where a user lands after login, and where they're sent if a page isn't for them. */
export function homePathFor(session) {
  return hasRole(session, STAFF_ROLES) ? '/admin' : '/admin/products';
}
