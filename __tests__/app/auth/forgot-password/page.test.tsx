import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ForgotPassword from '../../../../src/app/auth/forgot-password/page';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

global.fetch = jest.fn();

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<ForgotPassword />);
    
    expect(screen.getByText('Recuperar contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument();
  });

  it('handles successful request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });

    await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
      expect(screen.getByText(/Correo enviado exitosamente/i)).toBeInTheDocument();
    });
  });

  it('handles error request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Este correo no está registrado' }),
    });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar instrucciones/i });

    await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'error@example.com' } });
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Este correo no está registrado/i)).toBeInTheDocument();
    });
  });
});
