'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePermissions } from '@/hooks/usePermissions';

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && !hasPermission('stats:view')) {
      router.push('/dashboard');
    }
  }, [status, router, hasPermission]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="rounded-lg overflow-hidden shadow-sm">
        <div className="bg-pink-50 p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-pink-800">SanValentin — Estadísticas</h2>
            <p className="text-sm text-slate-600">Reportes visuales y métricas clave</p>
          </div>
        </div>

        <div className="bg-white p-6 border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-md bg-white text-pink-700 font-medium border border-pink-100 shadow-sm">Reservas por País</button>
                <button className="px-4 py-2 rounded-md text-slate-700 bg-white border border-transparent hover:border-pink-100">Usuarios Registrados</button>
                <button className="px-4 py-2 rounded-md text-slate-700 bg-white border border-transparent hover:border-pink-100">Ventas Mensuales</button>
              </div>
            </div>

            <div className="w-full bg-white" style={{ minHeight: '700px' }}>
              <iframe
                title="Power BI Report"
                width="100%"
                height="700"
                src="https://app.powerbi.com/view?r=eyJrIjoiZjVkYjZmZmUtMzI2My00OGM1LTg3MGEtYmI4OGZlMDIxY2E5IiwidCI6IjlkMTJiZjNmLWU0ZjYtNDdhYi05MTJmLTFhMmYwZmM0OGFhNCIsImMiOjR9"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg border border-slate-100 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
