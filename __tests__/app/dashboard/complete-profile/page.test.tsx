import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CompleteProfilePage from '../../../../src/app/dashboard/complete-profile/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

global.fetch = jest.fn();

describe('CompleteProfilePage', () => {
  const mockPush = jest.fn();
  const mockUpdate = jest.fn();
  const mockUseSession = useSession as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it('shows loading spinner when session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading', update: mockUpdate });
    const { container } = render(<CompleteProfilePage />);
    expect(container.getElementsByClassName('animate-spin').length).toBeGreaterThan(0);
  });

  it('redirects to / when unauthenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: mockUpdate });
    render(<CompleteProfilePage />);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('redirects to /dashboard when profile is already complete', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', profileComplete: true },
        accessToken: 'token123',
      },
      status: 'authenticated',
      update: mockUpdate,
    });
    render(<CompleteProfilePage />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders the profile form when authenticated with incomplete profile', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', profileComplete: false },
        accessToken: 'token123',
      },
      status: 'authenticated',
      update: mockUpdate,
    });
    render(<CompleteProfilePage />);

    expect(screen.getByText('Completa tu perfil')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cédula/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de nacimiento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cargo/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar al Dashboard/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', profileComplete: false },
        accessToken: 'token123',
      },
      status: 'authenticated',
      update: mockUpdate,
    });
    render(<CompleteProfilePage />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continuar al Dashboard/i }));
    });

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La cédula es obligatoria')).toBeInTheDocument();
    expect(screen.getByText('La fecha de nacimiento es obligatoria')).toBeInTheDocument();
    expect(screen.getByText('El teléfono es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El cargo es obligatorio')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits form and redirects on success', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', profileComplete: false },
        accessToken: 'token123',
      },
      status: 'authenticated',
      update: mockUpdate,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Juan', profileComplete: true }),
    });
    mockUpdate.mockResolvedValueOnce({});

    render(<CompleteProfilePage />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
      fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText(/Cédula/), { target: { value: 'V-12345678' } });
      fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/), { target: { value: '1990-01-15' } });
      fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '+58 412-1234567' } });
      fireEvent.change(screen.getByLabelText(/Cargo/), { target: { value: 'Chef' } });
      fireEvent.click(screen.getByRole('button', { name: /Continuar al Dashboard/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/profile'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith({ profileComplete: true });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles API error responses', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { email: 'test@test.com', profileComplete: false },
        accessToken: 'token123',
      },
      status: 'authenticated',
      update: mockUpdate,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: ['El nombre es requerido'] }),
    });

    render(<CompleteProfilePage />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
      fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText(/Cédula/), { target: { value: 'V-12345678' } });
      fireEvent.change(screen.getByLabelText(/Fecha de nacimiento/), { target: { value: '1990-01-15' } });
      fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '+58 412-1234567' } });
      fireEvent.change(screen.getByLabelText(/Cargo/), { target: { value: 'Chef' } });
      fireEvent.click(screen.getByRole('button', { name: /Continuar al Dashboard/i }));
    });

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard');
    });
  });
});
