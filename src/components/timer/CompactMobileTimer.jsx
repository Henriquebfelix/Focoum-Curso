import React, { useState, useRef } from 'react';
import { useTimer } from '../../context/TimerContext';
import TaskDetailModal from './TaskDetailModal';

export default function CompactMobileTimer({ onOpenFocusSession }) {
  const {
    mode,
    timeLeft,
    isRunning,
    isPaused,
    activeTask,
    progressPercentage,
    startTimer,
    pauseTimer,
    formatTime
  } = useTimer();

  const [showFullTitleModal, setShowFullTitleModal] = useState(false);
  const activeTriggerRef = useRef(null);
  const mobileTriggerBtnRef = useRef(null);

  const handleOpenModal = (e) => {
    activeTriggerRef.current = e?.currentTarget || mobileTriggerBtnRef.current || document.activeElement;
    setShowFullTitleModal(true);
  };

  const modeLabel =
    mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';

  const taskTitle = activeTask ? activeTask.title : 'Foco Avulso';

  return (
    <>
      {/* Floating Bottom Bar for Mobile Only */}
      <aside
        aria-label="Controle compacto do cronômetro de foco"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border-t border-gray-200/90 dark:border-[#243048] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-2.5 min-[380px]:px-4 py-2.5 min-[380px]:py-3 transition-all"
      >
        {/* Subtle Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-[#0D9488] dark:bg-[#14B8A6] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="max-w-md mx-auto flex items-center justify-between gap-2 min-[380px]:gap-3">
          {/* Left: Status dot + Task name (clickable to see full name) */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isRunning
                  ? 'bg-emerald-500 animate-pulse'
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-[#0D9488] dark:bg-[#14B8A6]'
              }`}
              aria-hidden="true"
            ></span>

            <button
              ref={mobileTriggerBtnRef}
              type="button"
              onClick={handleOpenModal}
              aria-label={`Ver detalhes da tarefa: ${taskTitle}`}
              aria-haspopup="dialog"
              className="text-left min-w-0 flex-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg p-0.5 min-[380px]:p-1"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block leading-tight truncate">
                {modeLabel} • Detalhes
              </span>
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#0D9488] dark:group-hover:text-[#14B8A6]">
                {taskTitle}
              </p>
            </button>
          </div>

          {/* Center: Numeric Countdown */}
          <div className="text-right flex-shrink-0">
            <span className="text-base min-[380px]:text-lg font-bold text-gray-900 dark:text-white timer-nums select-none tracking-tight">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 min-[380px]:gap-1.5 flex-shrink-0">
            {/* Play/Pause Button */}
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              aria-label={
                isRunning ? 'Pausar cronômetro' : isPaused ? 'Continuar cronômetro' : 'Iniciar cronômetro'
              }
              className={`min-h-[44px] min-w-[44px] px-2.5 min-[380px]:px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#0D9488] hover:bg-[#0b7c72] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {isRunning ? 'pause' : 'play_arrow'}
              </span>
              <span className="hidden min-[360px]:inline text-xs">
                {isRunning ? 'Pausar' : isPaused ? 'Continuar' : 'Foco'}
              </span>
            </button>

            {/* Immersive Fullscreen trigger */}
            <button
              onClick={onOpenFocusSession}
              aria-label="Abrir cronômetro em tela cheia"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                fullscreen
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Diálogo Modal Acessível com Focus Trap, Escape e Devolução de Foco */}
      <TaskDetailModal
        isOpen={showFullTitleModal}
        onClose={() => setShowFullTitleModal(false)}
        task={activeTask}
        triggerRef={activeTriggerRef}
      />
    </>
  );
}
