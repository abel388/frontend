import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResetPassword from '../../../../src/app/auth/reset-password/page';
import { useSearchParams, useRouter } from 'next/navigation';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

global.fetch = jest.fn();

describe('ResetPassword Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('shows error if no token is present', () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
    render(<ResetPassword />);
    expect(screen.getByText(/token no válido/i)).toBeInTheDocument();
  });

  it('renders form if token is present', () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'valid-token' });
    render(<ResetPassword />);
    
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'valid-token' });
    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: /cambiar contraseña/i });

    await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'mismatched' } });
        fireEvent.click(submitButton);
    });

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles successful reset', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: () => 'valid-token' });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ResetPassword />);

    const passwordInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: /cambiar contraseña/i });

    await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({
          body: JSON.stringify({ token: 'valid-token', newPassword: 'newpassword123' }),
        })
      );
      expect(screen.getByText(/contraseña restablecida correctamente/i)).toBeInTheDocument();
    });
  });
});
