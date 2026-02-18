import { render, screen } from '@testing-library/react';
import PermissionGate from '../../src/components/PermissionGate';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');

describe('PermissionGate', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no muestra nada mientras carga', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });

    render(
      <PermissionGate permission="users:view">
        <div data-testid="protected">Protected Content</div>
      </PermissionGate>,
    );

    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('muestra contenido cuando no se especifica permiso', () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: 'empleado', permissions: [] } },
      status: 'authenticated',
    });

    render(
      <PermissionGate>
        <div data-testid="open">Open Content</div>
      </PermissionGate>,
    );

    expect(screen.getByTestId('open')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // permission (single)
  // ---------------------------------------------------------------------------
  describe('permission (single)', () => {
    it('muestra contenido cuando tiene el permiso', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'empleado', permissions: ['dashboard:view'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate permission="dashboard:view">
          <div data-testid="allowed">Allowed</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId('allowed')).toBeInTheDocument();
    });

    it('oculta contenido cuando no tiene el permiso', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'empleado', permissions: ['dashboard:view'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate permission="users:manage">
          <div data-testid="hidden">Hidden</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId('hidden')).not.toBeInTheDocument();
    });

    it('muestra fallback cuando no tiene permiso', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'empleado', permissions: [] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate permission="users:manage" fallback={<div data-testid="fallback">No Access</div>}>
          <div data-testid="protected">Protected</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // anyOf
  // ---------------------------------------------------------------------------
  describe('anyOf', () => {
    it('muestra contenido si tiene al menos un permiso', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'empleado', permissions: ['stats:view'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate anyOf={['stats:view', 'users:manage']}>
          <div data-testid="any">Any Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId('any')).toBeInTheDocument();
    });

    it('oculta contenido si no tiene ninguno', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'empleado', permissions: ['dashboard:view'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate anyOf={['users:manage', 'stats:view']}>
          <div data-testid="hidden">Hidden</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId('hidden')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // allOf
  // ---------------------------------------------------------------------------
  describe('allOf', () => {
    it('muestra contenido si tiene todos los permisos', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'supervisor', permissions: ['users:view', 'users:manage'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate allOf={['users:view', 'users:manage']}>
          <div data-testid="all">All Content</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId('all')).toBeInTheDocument();
    });

    it('oculta contenido si falta algún permiso', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'supervisor', permissions: ['users:view'] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate allOf={['users:view', 'users:manage']}>
          <div data-testid="partial">Partial</div>
        </PermissionGate>,
      );

      expect(screen.queryByTestId('partial')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Admin bypass
  // ---------------------------------------------------------------------------
  describe('admin bypass', () => {
    it('admin siempre puede ver contenido protegido', () => {
      mockUseSession.mockReturnValue({
        data: { user: { role: 'admin', permissions: [] } },
        status: 'authenticated',
      });

      render(
        <PermissionGate permission="any:permission">
          <div data-testid="admin-access">Admin Access</div>
        </PermissionGate>,
      );

      expect(screen.getByTestId('admin-access')).toBeInTheDocument();
    });
  });
});
