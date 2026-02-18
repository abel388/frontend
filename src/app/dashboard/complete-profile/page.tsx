'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const API_URL = '/api/proxy';

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    cedula: '',
    birthDate: '',
    phone: '',
    position: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
    if (status === 'authenticated' && session?.user?.profileComplete) {
      router.push('/dashboard');
    }
    // Pre-fill name from session if available
    if (session?.user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: session.user.name || '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);

  const handleSkip = async () => {
    await update({ profileComplete: true });
    router.push('/dashboard');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es obligatoria';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!formData.position.trim()) newErrors.position = 'El cargo es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          birthDate: new Date(formData.birthDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (typeof data.message === 'string' && data.message.includes('cédula')) {
          setErrors({ cedula: data.message });
        } else if (data.message && Array.isArray(data.message)) {
          const fieldErrors: Record<string, string> = {};
          data.message.forEach((msg: string) => {
            if (msg.includes('nombre')) fieldErrors.name = msg;
            else if (msg.includes('apellido')) fieldErrors.lastName = msg;
            else if (msg.includes('cédula')) fieldErrors.cedula = msg;
            else if (msg.includes('fecha')) fieldErrors.birthDate = msg;
            else if (msg.includes('teléfono')) fieldErrors.phone = msg;
            else if (msg.includes('cargo')) fieldErrors.position = msg;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ name: data.message || 'Error al guardar el perfil' });
        }
        return;
      }

      // Update NextAuth session with profileComplete = true
      await update({ profileComplete: true });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Completa tu perfil
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Necesitamos algunos datos para continuar. Hola, {session.user?.email}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name" name="name" type="text" value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                  placeholder="Juan"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName" name="lastName" type="text" value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${errors.lastName ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                  placeholder="Pérez"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-slate-700">
                Cédula <span className="text-red-500">*</span>
              </label>
              <input
                id="cedula" name="cedula" type="text" value={formData.cedula}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${errors.cedula ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                placeholder="V-12345678"
              />
              {errors.cedula && <p className="mt-1 text-xs text-red-600">{errors.cedula}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">
                  Fecha de nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  id="birthDate" name="birthDate" type="date" value={formData.birthDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${errors.birthDate ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                />
                {errors.birthDate && <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone" name="phone" type="tel" value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${errors.phone ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                  placeholder="+58 412-1234567"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                id="position" name="position" type="text" value={formData.position}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${errors.position ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'} py-2.5 px-3 text-slate-900 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm`}
                placeholder="Gerente, Chef, Mesero, etc."
              />
              {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="flex w-full justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </span>
                ) : 'Continuar al Dashboard'}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="flex w-full justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              >
                Omitir por ahora
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
