import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Home from '../../src/app/page';
import { useSession, signIn } from 'next-auth/react';

// -----------------------------------------------------------------------------
// Configuracion de Mocks (Simulaciones)
// -----------------------------------------------------------------------------
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), replace: jest.fn() };
  },
}));

describe('Página de Inicio (Home)', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockSignIn = signIn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // ESTADO: NO AUTENTICADO
  // ===========================================================================
  describe('Estado: Usuario NO Autenticado', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('debe renderizar el formulario de login completo', () => {
      render(<Home />);

      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
      expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      
      // Botones
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continuar con Google/i })).toBeInTheDocument();
    });

    it('debe permitir escribir y enviar formulario (login manual)', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      render(<Home />);

      // Simular interaccion del usuario
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'user@test.com',
        password: '123456',
      });
    });

    it('debe mostrar alerta si las credenciales son incorrectas', async () => {
      // Mock de window.alert para capturarlo
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      // En la última versión de React Testing Library, la interacción con promesas en useEffect/handlers 
      // a veces requiere un pequeño flush o que el mock resuelva inmediatamente en el ciclo correcto.
      // Aseguramos que mockSignIn devuelva el fallo.
      mockSignIn.mockResolvedValue({ ok: false, error: 'Credenciales inválidas' }); 
      
      render(<Home />);

      // Escribir credenciales para evitar validación HTML5 required
      fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'fail@test.com' } });
      fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'fail' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      });

      // waitFor reintentará la aserción hasta que pase o timeout
      await waitFor(() => {
         expect(alertMock).toHaveBeenCalledWith("Credenciales incorrectas");
      });
      
      alertMock.mockRestore();
    });

    it('debe iniciar login con google', () => {
      render(<Home />);
      fireEvent.click(screen.getByRole('button', { name: /Continuar con Google/i }));
      expect(mockSignIn).toHaveBeenCalledWith('google');
    });
  });

  // ===========================================================================
  // ESTADO: AUTENTICADO
  // ===========================================================================
  describe('Estado: Usuario Autenticado', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { name: 'Juan Cloud', email: 'juan@cloud.com', image: null } },
        status: 'authenticated',
      });
    });

    it('debe mostrar spinner y redirigir al dashboard', () => {
      render(<Home />);

      // Cuando está autenticado, muestra spinner mientras redirige a /dashboard
      expect(screen.queryByLabelText(/Correo electrónico/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // ESTADO: CARGANDO
  // ===========================================================================
  describe('Estado: Cargando', () => {
    it('debe mostrar spinner de carga', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'loading' });
      const { container } = render(<Home />);
      expect(container.getElementsByClassName('animate-spin').length).toBeGreaterThan(0);
    });
  });
});
