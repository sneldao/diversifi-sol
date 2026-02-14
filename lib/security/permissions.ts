// lib/security/permissions.ts - Role-based access control

type Permission = 
  | 'read:portfolio'
  | 'write:portfolio'
  | 'read:alerts'
  | 'write:alerts'
  | 'read:history'
  | 'write:rebalance'
  | 'read:admin'
  | 'write:admin'
  | 'read:api_keys'
  | 'write:api_keys';

type Role = 'user' | 'trader' | 'admin';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    'read:portfolio',
    'read:alerts',
    'read:history',
  ],
  trader: [
    'read:portfolio',
    'write:portfolio',
    'read:alerts',
    'write:alerts',
    'read:history',
    'write:rebalance',
  ],
  admin: [
    'read:portfolio',
    'write:portfolio',
    'read:alerts',
    'write:alerts',
    'read:history',
    'write:rebalance',
    'read:admin',
    'write:admin',
    'read:api_keys',
    'write:api_keys',
  ],
};

interface User {
  id: string;
  role: Role;
  wallet?: string;
}

// Check if user has permission
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

// Check multiple permissions (all must match)
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

// Check multiple permissions (any must match)
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

// Get user permissions
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Middleware helper for API routes
export function requirePermission(permission: Permission) {
  return (user: User | null): boolean => {
    return hasPermission(user, permission);
  };
}
