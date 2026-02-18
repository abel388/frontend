'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

/**
 * Hook para verificar permisos del usuario actual.
 * 
 * Uso:
 *   const { hasPermission, hasAnyPermission, role, permissions } = usePermissions();
 *   if (hasPermission('users:manage')) { ... }
 *   if (hasAnyPermission(['stats:view', 'dashboard:view'])) { ... }
 */
export function usePermissions() {
  const { data: session, status } = useSession();

  const permissions = useMemo(() => session?.user?.permissions ?? [], [session?.user?.permissions]);
  const role = session?.user?.role ?? null;
  const isAdmin = role === 'admin';

  const hasPermission = useCallback((permission: string): boolean => {
    if (isAdmin) return true; // Admin has all permissions
    return permissions.includes(permission);
  }, [isAdmin, permissions]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  }, [isAdmin, permissions]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    if (isAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  }, [isAdmin, permissions]);

  return {
    permissions,
    role,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
