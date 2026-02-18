import { render, screen } from '@testing-library/react';
import DashboardPage from '../../../src/app/dashboard/page';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn() };
  },
  usePathname() {
    return '/dashboard';
  },
}));

// Mock DashboardLayout since it uses session/router internally
jest.mock('../../../src/components/DashboardLayout', () => {
  return function MockDashboardLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="dashboard-layout">{children}</div>;
  };
});

describe('DashboardPage', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows spinner when loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    const { container } = render(<DashboardPage />);
    expect(container.getElementsByClassName('animate-spin').length).toBeGreaterThan(0);
  });

  it('redirects to / when unauthenticated', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders dashboard when authenticated (profile incomplete - no redirect)', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', name: 'Juan', profileComplete: false },
        accessToken: 'token123',
      },
      status: 'authenticated',
    });
    render(<DashboardPage />);
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
  });

  it('renders dashboard when authenticated with complete profile', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', name: 'Juan', profileComplete: true },
        accessToken: 'token123',
      },
      status: 'authenticated',
    });
    render(<DashboardPage />);
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido, Juan/)).toBeInTheDocument();
  });
});
