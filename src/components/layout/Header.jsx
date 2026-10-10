import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import AuthButton from '../auth/AuthButton';

export default function Header({ currentScreen, setCurrentScreen, onOpenNewTask }) {
  const { isDark, toggleTheme } = useTheme();
  const { totalFocusCount, completedFocusCount } = useTasks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Hoje' },
    { id: 'focus', label: 'Sessão de Foco' },
    { id: 'night', label: 'Revisão Noturna' },
    { id: 'weekly', label: 'Visão Semanal' },
    { id: 'onboarding', label: 'Configurações' }
  ];

  const handleNavClick = (screenId) => {
    setCurrentScreen(screenId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-[#243048] shadow-[0_1px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.25)] transition-colors duration-200">
      <div className="h-16 max-w-7xl mx-auto px-2.5 min-[380px]:px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 min-[380px]:gap-3 sm:gap-4">
        
        {/* Brand Logo (SVG includes FocoUm logotype) */}
        <div 
          onClick={() => handleNavClick('home')} 
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavClick('home');
            }
          }}
          className="flex items-center flex-shrink-0 cursor-pointer select-none py-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg"
          title="FocoUm — Ir para Hoje"
          aria-label="FocoUm — Ir para a página inicial Hoje"
        >
          <img
            alt="FocoUm"
            className="h-7 min-[380px]:h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            src={isDark ? '/assets/logo-dark.svg' : '/assets/logo-light.svg'}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  isActive
                    ? 'bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6]'
                    : 'text-gray-700 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-[#182238]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions Cluster */}
        <div className="flex items-center gap-1 min-[380px]:gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Status Badge: Active Capacity */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-[#182238] border border-gray-200/80 dark:border-[#243048] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#14B8A6] animate-pulse"></span>
            <span className="text-gray-800 dark:text-[#CBD5E1] font-semibold tracking-wide">
              {totalFocusCount}/3 Prioridades
            </span>
          </div>

          {/* Quick Action: Nova Tarefa */}
          <button
            onClick={onOpenNewTask}
            aria-label="Adicionar nova tarefa"
            className="flex items-center justify-center gap-1.5 h-9 w-9 min-[380px]:w-auto px-2 min-[380px]:px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 transition-all flex-shrink-0"
            title="Adicionar nova tarefa"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            <span className="hidden sm:inline">Nova Tarefa</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#182238] hover:text-gray-900 dark:hover:text-[#F8FAFC] border border-transparent hover:border-gray-200 dark:hover:border-[#243048] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all flex-shrink-0"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Google Auth / Profile Avatar */}
          <AuthButton />

          {/* Mobile Hamburger Trigger (visible on lg:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#182238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors flex-shrink-0"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#131B2E] border-b border-gray-200 dark:border-[#243048] px-3 min-[380px]:px-4 py-3 flex flex-col gap-1.5 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#243048]">
            <span>Navegação FocoUm</span>
            <span className="font-semibold text-[#0D9488] dark:text-[#14B8A6]">
              {totalFocusCount}/3 Prioridades Hoje
            </span>
          </div>
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  isActive
                    ? 'bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182238]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
