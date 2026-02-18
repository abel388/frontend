import { renderHook } from '@testing-library/react';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');

describe('usePermissions', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar permisos vacíos cuando no hay sesión', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.permissions).toEqual([]);
    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debe retornar loading cuando la sesión está cargando', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debe retornar permisos y rol del usuario', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: 'empleado',
          permissions: ['dashboard:view', 'profile:view'],
        },
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.role).toBe('empleado');
    expect(result.current.permissions).toEqual(['dashboard:view', 'profile:view']);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('debe detectar rol admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: 'admin', permissions: ['dashboard:view'] },
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // hasPermission
  // ---------------------------------------------------------------------------
  describe('hasPermission', () => {
    it('debe retornar true si el usuario tiene el permiso', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'empleado', permissions: ['dashboard:view', 'profile:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('dashboard:view')).toBe(true);
    });

    it('debe retornar false si el usuario no tiene el permiso', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'empleado', permissions: ['dashboard:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('users:manage')).toBe(false);
    });

    it('admin siempre tiene todos los permisos', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'admin', permissions: [] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('anything:here')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // hasAnyPermission
  // ---------------------------------------------------------------------------
  describe('hasAnyPermission', () => {
    it('debe retornar true si tiene al menos uno de los permisos', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'empleado', permissions: ['dashboard:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyPermission(['dashboard:view', 'users:manage'])).toBe(true);
    });

    it('debe retornar false si no tiene ninguno de los permisos', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'empleado', permissions: ['dashboard:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyPermission(['users:manage', 'stats:view'])).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // hasAllPermissions
  // ---------------------------------------------------------------------------
  describe('hasAllPermissions', () => {
    it('debe retornar true si tiene todos los permisos', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'supervisor', permissions: ['dashboard:view', 'users:view', 'stats:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAllPermissions(['dashboard:view', 'users:view'])).toBe(true);
    });

    it('debe retornar false si le falta algún permiso', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { role: 'supervisor', permissions: ['dashboard:view'] },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAllPermissions(['dashboard:view', 'users:manage'])).toBe(false);
    });
  });
});
