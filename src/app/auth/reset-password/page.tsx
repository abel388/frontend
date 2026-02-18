'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
  
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');
  
      if (password !== confirmPassword) {
        setMessage('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (!token) {
        setMessage('Token inválido o expirado');
        setLoading(false);
        return;
      }
  
      try {
        const res = await fetch('/api/proxy/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: password }),
        });
  
        if (res.ok) {
            setMessage('Contraseña restablecida correctamente.');
            setIsSuccess(true);
            setTimeout(() => router.push('/'), 2000);
        } else {
            const data = await res.json();
            setMessage(data.message || 'Error al restablecer la contraseña');
        }
      } catch {
        setMessage('Error de conexión');
      } finally {
        setLoading(false);
      }
    };
  
    if (!token) {
        return (
            <div className="text-center text-red-600">
                Token no válido. Por favor solicita un nuevo enlace.
                <div className="mt-4">
                    <Link href="/auth/forgot-password" className="text-slate-900 underline">Solicitar uno nuevo</Link>
                </div>
            </div>
        );
    }
  
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
              Nueva contraseña
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 pl-3"
              />
            </div>
          </div>
  
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900">
              Confirmar contraseña
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 pl-3"
              />
            </div>
          </div>
  
          {message && (
            <div className={`text-sm text-center p-3 rounded-md ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}
  
          <div>
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="flex w-full justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Espere...' : 'Cambiar contraseña'}
            </button>
          </div>
      </form>
    );
  }

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Restablecer contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Suspense fallback={<div>Cargando...</div>}>
                <ResetForm />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
