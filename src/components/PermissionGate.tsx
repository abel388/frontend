'use client';
import { usePermissions } from '@/hooks/usePermissions';
import { ReactNode } from 'react';

interface PermissionGateProps {
  /** Permiso requerido (se verifica uno solo) */
  permission?: string;
  /** Múltiples permisos, basta con tener uno */
  anyOf?: string[];
  /** Múltiples permisos, debe tener todos */
  allOf?: string[];
  /** Contenido a mostrar si tiene permiso */
  children: ReactNode;
  /** Contenido alternativo si no tiene permiso */
  fallback?: ReactNode;
}

/**
 * Componente que muestra/oculta contenido basado en permisos.
 * 
 * Uso:
 *   <PermissionGate permission="users:manage">
 *     <AdminPanel />
 *   </PermissionGate>
 * 
 *   <PermissionGate anyOf={['stats:view', 'dashboard:view']} fallback={<NoAccess />}>
 *     <StatsPage />
 *   </PermissionGate>
 */
export default function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf) {
    hasAccess = hasAllPermissions(allOf);
  } else {
    hasAccess = true; // No permission specified, allow
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
