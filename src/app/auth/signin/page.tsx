'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

/* Esta página redirige a la página principal que contiene el login
function SignInOld() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (result?.ok) {
      router.push('/');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Iniciar sesión
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Bienvenido de nuevo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 pl-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 pl-3"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="font-semibold text-slate-600 hover:text-slate-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all duration-200"
              >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">O continuar con</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signIn('google')}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:ring-transparent"
              >
               <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 20.45c4.6667 0 8.0167-3.2417 8.0167-8.1584 0-0.575-.0583-1.125-.1667-1.6583H12.0003v3.1333h4.5167c-.2 1.05-.7917 1.9417-1.675 2.5333v2.1h2.725c1.5916-1.4666 2.5083-3.6 2.5083-6.1083 0-6.625-5.375-12-12-12s-12 5.375-12 12c0 6.625 5.375 12 12 12z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.0003 20.45c4.6667 0 8.0167-3.2417 8.0167-8.1584 0-0.575-.058-1.125-.1667-1.6583H12.0003v3.1333h4.5167c-.2 1.05-.7917 1.9417-1.675 2.5333v2.1h2.725c1.5916-1.4666 2.5083-3.6 2.5083-6.1083 0-6.625-5.375-12-12-12s-12 5.375-12 12c0 6.625 5.375 12 12 12z"
                    fill="#34A853"
                    clipPath="url(#b)"
                  />
                  <path
                    d="M5.2669 14.2667c-.25-0.7417-.3917-1.5334-.3917-2.3667s.1417-1.625.3917-2.3667l-2.7083-2.1C1.9836 8.5583 1.6336 10.2333 1.6336 12s.35 3.4417 1.2583 4.8917l2.7083-2.1z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0003 5.3833c2.4583 0 4.6583 0.85 6.3917 2.25l2.3583-2.3583C18.2336 2.9417 15.3586 2 12.0003 2 7.3753 2 3.3253 4.65 1.6336 8.5333l2.7083 2.1c.7834-2.325 2.9667-4.0083 5.6584-4.0083z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
          
           <div className="mt-6 flex justify-center text-sm">
              <span className="text-slate-500 mr-1">¿No tienes cuenta?</span>
              <Link href="/auth/register" className="font-semibold text-slate-600 hover:text-slate-500">
                Regístrate ahora
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
*/
