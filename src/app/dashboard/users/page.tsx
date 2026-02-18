'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { usePermissions } from '@/hooks/usePermissions';

const API_URL = '/api/proxy';

interface User {
  id: number;
  email: string;
  name: string | null;
  lastName: string | null;
  position: string | null;
  profileComplete: boolean;
  role: { id: number; name: string } | null;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      if (!hasPermission('users:view')) {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [status, router, hasPermission, fetchUsers]);

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'supervisor': return 'bg-purple-100 text-purple-700';
      case 'empleado': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-slate-600">Gestión de usuarios del sistema</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {(user.name?.[0] || user.email[0]).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900">
                          {user.name} {user.lastName || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.position || '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.role ? (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleColor(user.role.name)}`}>
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sin rol</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.profileComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {user.profileComplete ? 'Completo' : 'Incompleto'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
