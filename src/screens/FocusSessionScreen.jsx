import React, { useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';

export default function FocusSessionScreen({ onClose }) {
  const {
    mode,
    timeLeft,
    isRunning,
    isPaused,
    activeTask,
    progressPercentage,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    completeSessionManually
  } = useTimer();

  const { toggleTaskComplete, projects } = useTasks();

  // Atalhos de teclado (Espaço para alternar timer, Esc para retornar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (isRunning) pauseTimer();
        else startTimer();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, onClose, pauseTimer, startTimer]);

  const projectName =
    activeTask?.project ||
    projects?.find((p) => p.id === activeTask?.projectId)?.name ||
    activeTask?.projectId ||
    'Foco';

  return (
    <div
      role="region"
      aria-label="Sessão de foco imersiva"
      className="fixed inset-0 z-[70] bg-[#F9F9FF] dark:bg-[#0B1120] flex flex-col justify-between p-3.5 min-[380px]:p-6 sm:p-12 transition-colors duration-300 animate-fade-in overflow-y-auto"
    >
      {/* Top Bar: Return Button & Zen Tag */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          aria-label="Voltar para a tela inicial"
          className="flex items-center gap-1.5 px-3 min-[380px]:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-[#243048] bg-white/90 dark:bg-[#131B2E]/90 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white text-xs font-semibold backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all min-h-[40px] sm:min-h-[44px]"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_back
          </span>
          <span>Voltar (Esc)</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 min-[380px]:px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#131B2E]/80 border border-gray-200 dark:border-[#243048] text-[11px] sm:text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-[#0D9488] dark:bg-[#14B8A6]'
            }`}
            aria-hidden="true"
          ></span>
          <span className="text-gray-800 dark:text-gray-200 font-semibold truncate max-w-[130px] sm:max-w-none">
            {isRunning ? 'Em execução' : isPaused ? 'Pausado' : 'Pronto'}
          </span>
        </div>
      </div>

      {/* Center: Immersive Timer & Active Task Display */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto text-center my-auto py-4">
        {/* Task Title in Focus */}
        <div className="mb-6 sm:mb-8 max-w-full px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0D9488]/10 dark:bg-[#14B8A6]/15 text-[#0D9488] dark:text-[#14B8A6] text-xs font-semibold mb-2 sm:mb-3">
            {projectName}
          </div>
          <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight leading-tight break-words px-2">
            {activeTask?.title || 'Sessão de Foco Livre'}
          </h1>
          {activeTask?.note && (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-lg mx-auto break-words leading-relaxed px-2">
              {activeTask.note}
            </p>
          )}
        </div>

        {/* Circular Countdown Ring & Numeric Display (adaptado para 320px) */}
        <div className="relative w-60 h-60 min-[380px]:w-72 min-[380px]:h-72 sm:w-88 sm:h-88 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240" aria-hidden="true">
            {/* Background Ring */}
            <circle
              cx="120"
              cy="120"
              r="100"
              className="text-gray-200 dark:text-[#1E293B]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="120"
              cy="120"
              r="100"
              className="text-[#0D9488] dark:text-[#14B8A6] transition-all duration-500"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercentage / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center select-none" aria-live="polite">
            <span className="text-5xl min-[380px]:text-6xl sm:text-7xl font-extralight tracking-tighter text-gray-900 dark:text-white timer-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 mt-1.5 sm:mt-2 font-semibold">
              {mode === 'focus' ? 'Bloco de Foco' : mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>
        </div>

        {/* Main Immersive Action Controls */}
        <div className="flex items-center justify-center gap-2.5 min-[380px]:gap-4 mt-6 sm:mt-10">
          <button
            onClick={resetTimer}
            title="Reiniciar cronômetro"
            aria-label="Reiniciar cronômetro para o tempo inicial"
            className="min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-gray-300 dark:border-[#243048] bg-white dark:bg-[#131B2E] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex items-center justify-center shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]" aria-hidden="true">
              refresh
            </span>
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            aria-label={isRunning ? 'Pausar foco' : isPaused ? 'Continuar foco' : 'Iniciar foco'}
            className={`min-h-[46px] sm:min-h-[52px] px-6 min-[380px]:px-10 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base flex items-center gap-2 sm:gap-3 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#0D9488] hover:bg-[#0b7c72] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[26px]" aria-hidden="true">
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Pausar' : isPaused ? 'Continuar' : 'Iniciar'}</span>
          </button>

          <button
            onClick={completeSessionManually}
            title="Concluir sessão e salvar tempo"
            aria-label="Concluir bloco de foco manualmente"
            className="min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-gray-300 dark:border-[#243048] bg-white dark:bg-[#131B2E] text-[#0D9488] dark:text-[#14B8A6] hover:bg-[#0D9488]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex items-center justify-center shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]" aria-hidden="true">
              check
            </span>
          </button>
        </div>

        {/* Complete Task Directly Button */}
        {activeTask && !activeTask.completed && (
          <button
            onClick={() => {
              toggleTaskComplete(activeTask.id);
              onClose();
            }}
            aria-label={`Marcar a tarefa "${activeTask.title}" como concluída`}
            className="min-h-[44px] mt-6 text-xs text-gray-700 hover:text-[#0D9488] dark:text-gray-300 dark:hover:text-[#14B8A6] flex items-center gap-1.5 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-xl px-3 py-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              task_alt
            </span>
            <span>Marcar tarefa como concluída</span>
          </button>
        )}
      </div>

      {/* Bottom Quiet Footer */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
        <span>FocoUm • Atenção intencional, um foco por vez</span>
        <span>Atalhos: [Espaço] para alternar • [Esc] para retornar</span>
      </footer>
    </div>
  );
}
