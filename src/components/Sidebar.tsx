'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import {
  HomeIcon,
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  KeyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: { name: string; href: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[];
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, role } = usePermissions();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Administración']);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  // Build navigation based on permissions
  const navigation: MenuItem[] = [
    // Dashboard - everyone with dashboard:view
    ...(hasPermission('dashboard:view')
      ? [{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon }]
      : []),
    // Profile - everyone with profile:view
    ...(hasPermission('profile:view')
      ? [{ name: 'Mi Perfil', href: '/dashboard/profile', icon: UserIcon }]
      : []),
    // Users - need users:view
    ...(hasPermission('users:view')
      ? [{ name: 'Usuarios', href: '/dashboard/users', icon: UsersIcon }]
      : []),
    // Stats - need stats:view
    ...(hasPermission('stats:view')
      ? [{ name: 'Estadísticas', href: '/dashboard/stats', icon: ChartBarIcon }]
      : []),
    // Settings - need settings:view
    ...(hasPermission('settings:view')
      ? [{ name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon }]
      : []),
    // Admin panel with submenu - need roles:manage
    ...(hasPermission('roles:manage')
      ? [{
          name: 'Administración',
          icon: ShieldCheckIcon,
          children: [
            { name: 'Panel Admin', href: '/dashboard/admin', icon: ShieldCheckIcon },
            { name: 'Roles', href: '/dashboard/admin', icon: UserGroupIcon },
            { name: 'Permisos', href: '/dashboard/admin', icon: KeyIcon },
          ]
        }]
      : []),
  ];

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const isActive = item.href ? pathname === item.href : item.children?.some(c => pathname === c.href);

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            title={collapsed ? item.name : undefined}
            className={`
              w-full group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all
              ${collapsed ? 'justify-center px-2' : 'px-3 justify-between'}
              ${isActive ? 'bg-pink-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <div className="flex items-center">
              <item.icon
                className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              {!collapsed && <span>{item.name}</span>}
            </div>
            {!collapsed && (
              isExpanded 
                ? <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                : <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            )}
          </button>
          
          {/* Submenu */}
          {!collapsed && isExpanded && item.children && (
            <div className="mt-1 ml-4 space-y-1 border-l border-slate-700/60 pl-3">
              {item.children.map((child) => {
                const childActive = pathname === child.href;
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={`
                      group flex items-center rounded-lg py-2 px-3 text-sm transition-all
                      ${childActive ? 'bg-pink-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <child.icon className={`h-4 w-4 mr-2 ${childActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href!}
        title={collapsed ? item.name : undefined}
        className={`
          group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all
          ${collapsed ? 'justify-center px-2' : 'px-3'}
          ${isActive ? 'bg-pink-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
        `}
      >
        <item.icon
          className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
          }`}
        />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div
      className={`flex h-full flex-col bg-slate-900 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        {collapsed ? (
          <button
            onClick={onToggle}
            className="mx-auto rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Expandir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        ) : (
          <div className="flex w-full items-center justify-between">
              <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-white">SanValentin</h1>
            </div>
            <button
              onClick={onToggle}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Colapsar menú"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 py-4 ${collapsed ? 'px-2' : 'px-3'} overflow-y-auto`}>
        {navigation.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        {role && !collapsed && (
          <div className="mb-2 flex items-center justify-center">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
              ${role === 'admin' ? 'bg-red-900/50 text-red-300' : ''}
              ${role === 'supervisor' ? 'bg-purple-900/50 text-purple-300' : ''}
              ${role === 'empleado' ? 'bg-blue-900/50 text-blue-300' : ''}
              ${!['admin', 'supervisor', 'empleado'].includes(role) ? 'bg-slate-700 text-slate-300' : ''}
            `}>
              {role}
            </span>
          </div>
        )}
        <p className="text-xs text-slate-500 text-center truncate">
          {collapsed ? '© 2026' : '© 2026 Restaurante San Valentín'}
        </p>
      </div>
    </div>
  );
}
