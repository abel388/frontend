'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
          <BellIcon className="h-6 w-6" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {session?.user?.image ? (
              <div className="relative h-8 w-8">
                <Image
                  src={session.user.image}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                <span className="text-sm font-semibold text-slate-600">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <span className="hidden md:block">{session?.user?.name || 'Usuario'}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-200 px-4 py-2">
                  <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); router.push('/dashboard/profile'); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Mi Perfil
                </button>
                <button
                  onClick={() => { setShowDropdown(false); router.push('/dashboard/settings'); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Configuración
                </button>
                <div className="border-t border-slate-200 mt-1 pt-1">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
