'use client';
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setIsLoading(false);
    if (!result?.ok) {
        alert("Credenciales incorrectas");
    }
  };

  const handleGoogleLogin = () => {
    signIn('google');
  };

  if (status === "loading" || session) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-white shadow-2xl lg:shadow-none z-10 border-r border-slate-200">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">Bienvenido</h2>
            <p className="mt-2 text-sm text-slate-600">
              Acceda a su portal corporativo
            </p>
          </div>

          <div className="mt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 py-2 px-3 shadow-sm placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm text-slate-900"
                    placeholder="nombre@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 py-2 px-3 shadow-sm placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 sm:text-sm text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-slate-600 hover:text-slate-900">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">O</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="inline-flex w-full justify-center items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                >
                   <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                   </svg>
                  <span className="text-slate-700">Continuar con Google</span>
                </button>
              </div>
            </div>

             <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    ¿No tiene acceso? {' '}
                    <Link href="/auth/register" className="font-semibold text-slate-900 hover:text-slate-700 underline">
                     Solicitar cuenta
                    </Link>
                </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-10"></div>
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/sanvalentin-restaurant.jpg"
          alt="San Valentín Restaurant"
          fill
          sizes="50vw"
          priority
        />
        <div className="relative z-20 flex flex-col justify-center items-center w-full px-12 text-white">
          <h1 className="text-5xl font-bold mb-4 text-center">San Valentín</h1>
          <p className="text-xl text-slate-200 text-center">Restaurante & Eventos</p>
        </div>
      </div>
    </main>
  );
}
