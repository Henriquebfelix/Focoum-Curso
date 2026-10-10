import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthGateScreen() {
  const { loginWithGoogle, isConfigured } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
    } catch (error) {
      console.warn('[AuthGate] Erro ou cancelamento no login do Google:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de login do Google foi fechada antes de concluir.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Solicitação de login cancelada.');
      } else {
        setErrorMessage('Não foi possível autenticar com o Google. Tente novamente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] dark:bg-[#0B1120] text-[#151C27] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-[#0D9488]/20 transition-colors duration-200">
      {/* Top Bar Minimalista */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={isDark ? '/assets/logo-dark.svg' : '/assets/logo-light.svg'}
            alt="FocoUm Logo"
            className="h-7 w-auto"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#182238] border border-gray-200 dark:border-[#243048] hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      {/* Conteúdo Central: Card de Login Sereno */}
      <main className="flex-1 flex items-center justify-center px-3 min-[380px]:px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-3xl p-5 min-[380px]:p-8 sm:p-10 shadow-xl dark:shadow-2xl flex flex-col gap-6 animate-fade-in relative overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#0D9488]"></div>

          {/* Cabeçalho do Card */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                lock_open
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-[#0D9488] dark:text-[#14B8A6] font-bold">
                Acesso Restrito
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Entrar no FocoUm
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs">
              Conecte sua conta do Google para carregar suas 3 prioridades, sincronizar sessões de foco e acessar seu histórico.
            </p>
          </div>

          {/* Destaque das 3 Regras de Ouro */}
          <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-gray-50/70 dark:bg-[#182238]/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
              <span><strong>3 prioridades vitais:</strong> Sem listas infinitas.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
              <span><strong>Pomodoro sereno:</strong> Blocos de 25m com pausas.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
              <span><strong>Revisão noturna:</strong> Desligue a mente ao fim do dia.</span>
            </div>
          </div>

          {/* Mensagem de Erro (se houver) */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-rose-600 dark:text-rose-400 flex-shrink-0" aria-hidden="true">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botão Oficial: Login com Google */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              aria-label="Entrar com conta do Google"
              className="w-full min-h-[50px] px-5 py-3 rounded-2xl bg-white dark:bg-[#1A263D] hover:bg-gray-50 dark:hover:bg-[#202E4A] border border-gray-300 dark:border-gray-600 hover:border-[#0D9488] dark:hover:border-[#14B8A6] text-gray-900 dark:text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#0D9488] animate-spin" aria-hidden="true"></div>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
              )}
              <span>{isLoggingIn ? 'Autenticando...' : 'Entrar com o Google'}</span>
            </button>

            <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-1">
              {isConfigured
                ? 'Autenticação segura via Firebase Authentication'
                : 'Sincronização em nuvem segura para proteção dos seus dados'}
            </p>
          </div>
        </div>
      </main>

      {/* Rodapé Sereno */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-200/60 dark:border-[#243048]/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">FocoUm</span>
          <span>— Atenção intencional, um foco por vez</span>
        </div>
        <span>Ambiente protegido • 2026</span>
      </footer>
    </div>
  );
}
