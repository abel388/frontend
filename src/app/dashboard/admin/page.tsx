'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const API_URL = '/api/proxy';

interface Permission {
  id: number;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

interface RolePermission {
  permissionId: number;
  permission: Permission;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: RolePermission[];
  _count?: { users: number };
}

interface User {
  id: number;
  email: string;
  name: string | null;
  lastName: string | null;
  cedula: string | null;
  phone: string | null;
  birthDate: string | null;
  position: string | null;
  profileComplete: boolean;
  role: Role | null;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for assigning role
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal for editing role permissions
  const [editRoleModal, setEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editRolePermIds, setEditRolePermIds] = useState<number[]>([]);

  // Modal for creating a new role
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<number[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal for viewing user profile
  const [viewUserModal, setViewUserModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const headers = useCallback(() => ({
    'Authorization': `Bearer ${session?.accessToken}`,
    'Content-Type': 'application/json',
  }), [session?.accessToken]);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: headers() }),
        fetch(`${API_URL}/roles`, { headers: headers() }),
        fetch(`${API_URL}/permissions`, { headers: headers() }),
      ]);

      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        console.error('Users fetch failed:', usersRes.status, await usersRes.text());
      }
      if (rolesRes.ok) {
        setRoles(await rolesRes.json());
      } else {
        console.error('Roles fetch failed:', rolesRes.status, await rolesRes.text());
      }
      if (permsRes.ok) {
        setPermissions(await permsRes.json());
      } else {
        console.error('Permissions fetch failed:', permsRes.status, await permsRes.text());
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, headers]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      if (!hasPermission('roles:manage')) {
        router.push('/dashboard');
        return;
      }
      fetchData();
    }
  }, [status, router, hasPermission, fetchData]);

  const handleAssignRole = async () => {
    if (!selectedUser || selectedRoleId === null) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/roles/assign`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId: selectedUser.id, roleId: selectedRoleId }),
      });
      if (res.ok) {
        await fetchData();
        setAssignModalOpen(false);
        setSelectedUser(null);
        setSelectedRoleId(null);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRolePermissions = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ permissionIds: editRolePermIds }),
      });
      if (res.ok) {
        await fetchData();
        setEditRoleModal(false);
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setCreateError('El nombre del rol es obligatorio');
      return;
    }
    setSaving(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: newRoleName.trim().toLowerCase(),
          description: newRoleDescription.trim() || undefined,
          permissionIds: newRolePermIds,
        }),
      });
      if (res.ok) {
        await fetchData();
        setCreateRoleModal(false);
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermIds([]);
      } else {
        const data = await res.json();
        setCreateError(data.message || 'Error al crear el rol');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      setCreateError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (!confirm(`¿Eliminar el rol "${roleName}"? Los usuarios con este rol quedarán sin rol asignado.`)) return;
    try {
      const res = await fetch(`${API_URL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Error al eliminar el rol');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.id ?? null);
    setAssignModalOpen(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setEditRolePermIds(role.permissions.map(rp => rp.permission.id));
    setEditRoleModal(true);
  };

  const openCreateRoleModal = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRolePermIds([]);
    setCreateError(null);
    setCreateRoleModal(true);
  };

  const toggleNewRolePerm = (permId: number) => {
    setNewRolePermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const togglePermission = (permId: number) => {
    setEditRolePermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'supervisor': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      case 'empleado': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const tabs = [
    { id: 'users' as const, name: 'Usuarios', icon: UserGroupIcon, count: users.length },
    { id: 'roles' as const, name: 'Roles', icon: ShieldCheckIcon, count: roles.length },
    { id: 'permissions' as const, name: 'Permisos', icon: KeyIcon, count: permissions.length },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Administración del Sistema</h1>
        <p className="text-slate-600 mt-1">Gestiona usuarios, roles y permisos</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ========= USERS TAB ========= */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Gestión de Usuarios</h2>
                <p className="text-sm text-slate-600">Asigna roles a los usuarios del sistema</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cargo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => {
                      const roleColor = user.role ? getRoleColor(user.role.name) : null;
                      return (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{user.position || '—'}</td>
                          <td className="px-6 py-4">
                            {user.role ? (
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleColor?.bg} ${roleColor?.text}`}>
                                {user.role.name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Sin rol</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => { setViewingUser(user); setViewUserModal(true); }}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Ver
                              </button>
                              <button
                                onClick={() => openAssignModal(user)}
                                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Cambiar rol
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <UserGroupIcon className="mx-auto h-12 w-12 text-slate-300" />
                          <p className="mt-2 text-sm text-slate-500">No hay usuarios registrados</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========= ROLES TAB ========= */}
          {activeTab === 'roles' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Gestión de Roles</h2>
                  <p className="text-sm text-slate-600">Define los roles y sus permisos asociados</p>
                </div>
                <button
                  onClick={openCreateRoleModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Crear Rol
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => {
                  const color = getRoleColor(role.name);
                  return (
                    <div key={role.id} className={`border rounded-lg p-5 hover:shadow-md transition-all ${color.border}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${color.bg}`}>
                            <ShieldCheckIcon className={`h-5 w-5 ${color.text}`} />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900 capitalize">{role.name}</h3>
                            <p className="text-xs text-slate-500">{role.description}</p>
                          </div>
                        </div>
                        {role.name !== 'admin' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditRoleModal(role)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Editar permisos"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Eliminar rol"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {role.permissions.slice(0, 4).map((rp) => (
                          <span key={rp.permission.id} className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-mono">
                            {rp.permission.name}
                          </span>
                        ))}
                        {role.permissions.length > 4 && (
                          <span className="text-xs text-slate-400">+{role.permissions.length - 4} más</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">{role.permissions.length} permisos</span>
                        <span className="text-xs text-slate-500">{role._count?.users ?? 0} usuarios</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========= PERMISSIONS TAB ========= */}
          {activeTab === 'permissions' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Permisos del Sistema</h2>
                <p className="text-sm text-slate-600">Todos los permisos disponibles organizados por módulo</p>
              </div>

              <div className="space-y-4">
                {Object.entries(permissionsByModule).map(([module, perms]) => (
                  <div key={module} className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                      Módulo: {module}
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-mono text-slate-900">{perm.name}</span>
                            {perm.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{perm.description}</p>
                            )}
                          </div>
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded capitalize">
                            {perm.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========= MODAL: Assign Role ========= */}
      {assignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setAssignModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Asignar Rol</h3>
              <button onClick={() => setAssignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Usuario: <strong>{selectedUser.name || selectedUser.email}</strong>
            </p>

            <div className="space-y-2 mb-6">
              {roles.map((role) => {
                const color = getRoleColor(role.name);
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full flex items-center p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected ? `${color.border} ${color.bg}` : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <ShieldCheckIcon className={`h-5 w-5 mr-3 ${isSelected ? color.text : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium capitalize ${isSelected ? color.text : 'text-slate-900'}`}>{role.name}</p>
                      <p className="text-xs text-slate-500">{role.description}</p>
                    </div>
                    {isSelected && <CheckIcon className={`h-5 w-5 ${color.text}`} />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignRole}
                disabled={saving || selectedRoleId === null}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Asignar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= MODAL: Edit Role Permissions ========= */}
      {editRoleModal && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditRoleModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Permisos de <span className="capitalize">{editingRole.name}</span>
              </h3>
              <button onClick={() => setEditRoleModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(permissionsByModule).map(([module, perms]) => (
                <div key={module}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{module}</h4>
                  <div className="space-y-1">
                    {perms.map((perm) => (
                      <label key={perm.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRolePermIds.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                        />
                        <span className="ml-3 text-sm font-mono text-slate-700">{perm.name}</span>
                        {perm.description && (
                          <span className="ml-2 text-xs text-slate-400">— {perm.description}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
              <button
                onClick={() => setEditRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRolePermissions}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= MODAL: Create Role ========= */}
      {createRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setCreateRoleModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Crear Nuevo Rol</h3>
              <button onClick={() => setCreateRoleModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {createError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Rol *</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="ej: vendedor, soporte, gerente"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Breve descripción del rol"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permisos ({newRolePermIds.length} seleccionados)
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{module}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const modulePermIds = perms.map(p => p.id);
                            const allSelected = modulePermIds.every(id => newRolePermIds.includes(id));
                            if (allSelected) {
                              setNewRolePermIds(prev => prev.filter(id => !modulePermIds.includes(id)));
                            } else {
                              setNewRolePermIds(prev => [...new Set([...prev, ...modulePermIds])]);
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {perms.every(p => newRolePermIds.includes(p.id)) ? 'Quitar todos' : 'Seleccionar todos'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-center p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRolePermIds.includes(perm.id)}
                              onChange={() => toggleNewRolePerm(perm.id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                            />
                            <span className="ml-2 text-sm font-mono text-slate-700">{perm.name}</span>
                            {perm.description && (
                              <span className="ml-2 text-xs text-slate-400">— {perm.description}</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
              <button
                onClick={() => setCreateRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRole}
                disabled={saving || !newRoleName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Creando...' : 'Crear Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= MODAL: View User Profile ========= */}
      {viewUserModal && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewUserModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Perfil del Usuario</h3>
              <button onClick={() => setViewUserModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* User header */}
            <div className="flex items-center mb-6 pb-4 border-b border-slate-200">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-600">
                  {(viewingUser.name?.[0] || viewingUser.email[0]).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold text-slate-900">
                  {viewingUser.name || ''} {viewingUser.lastName || ''}
                </p>
                <p className="text-sm text-slate-500">{viewingUser.email}</p>
                {viewingUser.role && (
                  <span className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleColor(viewingUser.role.name).bg} ${getRoleColor(viewingUser.role.name).text}`}>
                    {viewingUser.role.name}
                  </span>
                )}
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Nombre</p>
                <p className="text-sm text-slate-900 mt-0.5">{viewingUser.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Apellido</p>
                <p className="text-sm text-slate-900 mt-0.5">{viewingUser.lastName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Cédula</p>
                <p className="text-sm text-slate-900 mt-0.5">{viewingUser.cedula || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Teléfono</p>
                <p className="text-sm text-slate-900 mt-0.5">{viewingUser.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Fecha de Nacimiento</p>
                <p className="text-sm text-slate-900 mt-0.5">
                  {viewingUser.birthDate
                    ? new Date(viewingUser.birthDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Cargo</p>
                <p className="text-sm text-slate-900 mt-0.5">{viewingUser.position || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Perfil Completo</p>
                <p className="text-sm mt-0.5">
                  {viewingUser.profileComplete
                    ? <span className="text-green-600 font-medium">Sí</span>
                    : <span className="text-amber-600 font-medium">No</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Registrado</p>
                <p className="text-sm text-slate-900 mt-0.5">
                  {new Date(viewingUser.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Permissions */}
            {viewingUser.role && viewingUser.role.permissions.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Permisos ({viewingUser.role.permissions.length})</p>
                <div className="flex flex-wrap gap-1">
                  {viewingUser.role.permissions.map((rp) => (
                    <span key={rp.permission.id} className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono">
                      {rp.permission.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setViewUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
