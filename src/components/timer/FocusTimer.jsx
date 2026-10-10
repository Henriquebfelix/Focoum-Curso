import React, { useState, useRef } from 'react';
import { useTimer } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';
import TaskDetailModal from './TaskDetailModal';

export default function FocusTimer({ onOpenFocusSession }) {
  const {
    mode,
    timeLeft,
    isRunning,
    isPaused,
    isInitial,
    activeTask,
    progressPercentage,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    formatTime,
    completeSessionManually
  } = useTimer();

  const { focusTasks } = useTasks();
  const [showFullNameModal, setShowFullNameModal] = useState(false);
  const activeTriggerRef = useRef(null);
  const titleTriggerBtnRef = useRef(null);
  const infoTriggerBtnRef = useRef(null);

  const handleOpenFromTitle = (e) => {
    activeTriggerRef.current = e?.currentTarget || titleTriggerBtnRef.current || document.activeElement;
    setShowFullNameModal(true);
  };

  const handleOpenFromInfo = (e) => {
    activeTriggerRef.current = e?.currentTarget || infoTriggerBtnRef.current || document.activeElement;
    setShowFullNameModal(true);
  };

  const taskTitle = activeTask ? activeTask.title : 'Selecione uma tarefa abaixo';

  return (
    <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      {/* Header with Mode Toggles */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#243048]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-[#0D9488] dark:bg-[#14B8A6]'
            }`}
            aria-hidden="true"
          ></span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Cronômetro de Foco
          </span>
          {isRunning && (
            <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
              Em execução
            </span>
          )}
          {isPaused && (
            <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
              Pausado
            </span>
          )}
        </div>
        <button
          onClick={onOpenFocusSession}
          aria-label="Abrir cronômetro em modo imersivo de tela cheia"
          className="min-h-[36px] text-xs text-[#0D9488] dark:text-[#14B8A6] hover:underline font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg px-2 py-1"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            open_in_full
          </span>
          <span>Modo Imersivo</span>
        </button>
      </div>

      {/* Mode Selector Segmented Controls */}
      <div
        role="group"
        aria-label="Seleção de modo do cronômetro"
        className="grid grid-cols-3 gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60"
      >
        <button
          type="button"
          onClick={() => switchMode('focus')}
          aria-pressed={mode === 'focus'}
          className={`min-h-[40px] py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
            mode === 'focus'
              ? 'bg-[#0D9488] text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Foco (25m)
        </button>
        <button
          type="button"
          onClick={() => switchMode('shortBreak')}
          aria-pressed={mode === 'shortBreak'}
          className={`min-h-[40px] py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
            mode === 'shortBreak'
              ? 'bg-[#0D9488] text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pausa Curta (5m)
        </button>
        <button
          type="button"
          onClick={() => switchMode('longBreak')}
          aria-pressed={mode === 'longBreak'}
          className={`min-h-[40px] py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
            mode === 'longBreak'
              ? 'bg-[#0D9488] text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pausa Longa (15m)
        </button>
      </div>

      {/* Main Countdown Visual */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          className="text-6xl font-light tracking-tight text-gray-900 dark:text-white timer-nums select-none"
          aria-live="polite"
        >
          {formatTime(timeLeft)}
        </div>

        {/* Active Task Link with Full Name Inspection Ability */}
        <div className="mt-3 text-center max-w-xs px-2 w-full">
          <span className="text-[11px] uppercase tracking-wider text-gray-600 dark:text-gray-300 font-bold block">
            TAREFA ATIVA
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <button
              ref={titleTriggerBtnRef}
              type="button"
              onClick={handleOpenFromTitle}
              aria-label={`Nome da tarefa: ${taskTitle}. Clique para consultar detalhes.`}
              aria-haspopup="dialog"
              className="text-sm font-semibold text-[#0D9488] dark:text-[#14B8A6] truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-md px-1 py-0.5 text-center max-w-[240px]"
            >
              {taskTitle}
            </button>
            {activeTask && (
              <button
                ref={infoTriggerBtnRef}
                type="button"
                onClick={handleOpenFromInfo}
                title="Consultar detalhes da tarefa ativa"
                aria-label="Consultar detalhes da tarefa ativa"
                aria-haspopup="dialog"
                className="min-h-[36px] min-w-[36px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  info
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-5">
          <div
            className="bg-[#0D9488] dark:bg-[#14B8A6] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Controls with accessible sizes (min 44x44px touch targets) */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={resetTimer}
          title="Reiniciar cronômetro"
          aria-label="Reiniciar cronômetro para o tempo inicial"
          className="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            refresh
          </span>
        </button>

        <button
          onClick={isRunning ? pauseTimer : startTimer}
          aria-label={
            isRunning
              ? 'Pausar sessão de foco'
              : isPaused
              ? 'Continuar sessão de foco'
              : 'Iniciar bloco de foco'
          }
          className={`min-h-[48px] px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 transition-all ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-[#0D9488] hover:bg-[#0b7c72] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
          <span>{isRunning ? 'Pausar' : isPaused ? 'Continuar' : 'Iniciar foco'}</span>
        </button>

        <button
          onClick={completeSessionManually}
          title="Concluir bloco de foco e registrar sessão"
          aria-label="Concluir bloco de foco manualmente e salvar tempo"
          className="w-12 h-12 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#0D9488] hover:border-[#0D9488] dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            check
          </span>
        </button>
      </div>

      {/* Filosofia sem jargões inflados */}
      <div className="bg-gray-50/70 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/80 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          💡 <strong>Princípio FocoUm:</strong> Atenção voltada para uma única tarefa por vez. Faça as pausas para renovar sua clareza mental.
        </p>
      </div>

      {/* Diálogo Modal Acessível com Focus Trap e Escape */}
      <TaskDetailModal
        isOpen={showFullNameModal}
        onClose={() => setShowFullNameModal(false)}
        task={activeTask}
        triggerRef={activeTriggerRef}
      />
    </div>
  );
}
