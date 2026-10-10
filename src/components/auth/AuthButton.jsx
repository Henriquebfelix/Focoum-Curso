import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthButton() {
  const { user, loading, syncStatus, isConfigured, loginWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0D9488] animate-spin"
        role="status"
        aria-label="Carregando autenticação"
      ></div>
    );
  }

  // Not logged in: Show Google Connect button
  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="h-9 min-w-[36px] min-[380px]:min-w-0 flex items-center justify-center gap-1.5 px-2 min-[380px]:px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-[#0D9488] bg-white dark:bg-[#131B2E] text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex-shrink-0"
        title={isConfigured ? 'Fazer login com o Google' : 'Entrar com o Google (Modo Local/Demo)'}
        aria-label="Conectar conta do Google para sincronização"
      >
        {/* Google 'G' Icon */}
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="hidden sm:inline">Sincronização</span>
        <span className="hidden min-[380px]:inline text-[11px] text-[#0D9488] dark:text-[#14B8A6] font-bold">
          {isConfigured ? 'Nuvem' : 'Local'}
        </span>
      </button>
    );
  }

  // Logged in: Avatar + Sync indicator + Menu
  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu do perfil e status de sincronização"
        aria-expanded={isOpen}
        className="h-9 w-9 flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-[#0D9488]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all select-none flex-shrink-0"
      >
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300 dark:ring-gray-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white font-semibold text-xs flex items-center justify-center">
              {user.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
          )}
          {/* Cloud Sync status dot */}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#0B1120] ${
              syncStatus === 'synced'
                ? 'bg-emerald-500'
                : syncStatus === 'syncing'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-gray-400'
            }`}
            title={
              syncStatus === 'synced'
                ? 'Sincronização ativa (Firestore)'
                : syncStatus === 'syncing'
                ? 'Sincronizando...'
                : 'Sincronização offline'
            }
            aria-hidden="true"
          ></span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-white dark:bg-[#131B2E] border border-gray-200 dark:border-[#243048] rounded-2xl p-4 shadow-xl z-50 animate-fade-in text-xs">
          {/* User info */}
          <div className="pb-3 border-b border-gray-100 dark:border-[#243048]">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
              {user.email || 'Conta Conectada'}
            </p>
            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]" aria-hidden="true"></span>
              <span>{isConfigured ? 'Sincronização na Nuvem' : 'Modo Local / Demonstração'}</span>
            </div>
          </div>

          {/* Sync details */}
          <div className="py-2.5 text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-1.5">
            <span className="flex items-center justify-between">
              <span>Sincronização:</span>
              <strong className="text-gray-900 dark:text-white font-semibold">
                {syncStatus === 'synced' ? 'Online & Sincronizado' : 'Offline (Cache Ativo)'}
              </strong>
            </span>
          </div>

          {/* Logout button */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#243048]">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-800 dark:text-gray-200 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                logout
              </span>
              <span>Desconectar Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
