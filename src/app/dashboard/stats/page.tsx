'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePermissions } from '@/hooks/usePermissions';


export default function StatsPage() {
  // URLs de los reportes de Power BI
  const REPORTS = {
    generaVenta: "https://app.powerbi.com/view?r=eyJrIjoiYmJjZDU2YTMtOTQxYi00ZjFhLWI4OWUtNjExOWIzMmViODRkIiwidCI6IjlkMTJiZjNmLWU0ZjYtNDdhYi05MTJmLTFhMmYwZmM0OGFhNCIsImMiOjR9&pageName=0114f7e59420a1ee1ff9",
    reserva: "https://app.powerbi.com/view?r=eyJrIjoiN2RmODdhNzMtYmU4ZS00ZDkwLWJkNDctZjA3MDdjZTU2YTgwIiwidCI6IjlkMTJiZjNmLWU0ZjYtNDdhYi05MTJmLTFhMmYwZmM0OGFhNCIsImMiOjR9&pageName=f18a0e179126c41bc6c6"
  };
  // Estado para el reporte seleccionado
  const [selectedReport, setSelectedReport] = useState<'generaVenta' | 'reserva'>('generaVenta');
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
            <div className="mb-4 flex items-center gap-3">
              <button
                className={`px-4 py-2 rounded-md font-medium border shadow-sm ${selectedReport === 'generaVenta' ? 'bg-pink-700 text-white border-pink-100' : 'bg-white text-pink-700 border-pink-100'}`}
                onClick={() => setSelectedReport('generaVenta')}
              >
                Ver Genera Venta
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium border shadow-sm ${selectedReport === 'reserva' ? 'bg-pink-700 text-white border-pink-100' : 'bg-white text-pink-700 border-pink-100'}`}
                onClick={() => setSelectedReport('reserva')}
              >
                Ver Reserva
              </button>
            </div>
            <div className="w-full bg-white" style={{ minHeight: '700px' }}>
              <iframe
                title="Power BI Report"
                width="100%"
                height="700"
                src={REPORTS[selectedReport]}
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
