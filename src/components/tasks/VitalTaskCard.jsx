import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';

export default function VitalTaskCard({ task, onOpenFocusSession }) {
  const { projects, toggleTaskComplete, demoteToSecondary, deleteTask } = useTasks();
  const { activeTaskId, setActiveTaskId, isRunning, isPaused, startTimer, pauseTimer } = useTimer();

  const isCurrentActive = activeTaskId === task.id;
  const isCompleted = task.completed;

  const projectName =
    task.project || projects?.find((p) => p.id === task.projectId)?.name || task.projectId || 'Engenharia';

  const projectColorMap = {
    Engenharia: 'text-[#0D9488] bg-[#0D9488]/10 dark:text-[#14B8A6] dark:bg-[#14B8A6]/15',
    Design: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40',
    Estudos: 'text-emerald-800 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40',
    Saúde: 'text-teal-800 bg-teal-50 dark:text-teal-300 dark:bg-teal-950/40'
  };

  const projectStyle =
    projectColorMap[projectName] || 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-800';

  return (
    <article
      className={`relative flex flex-col gap-4 p-5 md:p-6 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-gray-50/80 dark:bg-[#131B2E]/50 border-gray-300 dark:border-gray-800'
          : isCurrentActive
          ? 'bg-white dark:bg-[#131B2E] border-[#0D9488] dark:border-[#14B8A6] shadow-md ring-1 ring-[#0D9488]/50 dark:ring-[#14B8A6]/50'
          : 'bg-white dark:bg-[#131B2E] border-gray-200/90 dark:border-[#243048] hover:border-gray-300 dark:hover:border-gray-700 shadow-sm'
      }`}
    >
      {/* Left Active Accent Pill */}
      {isCurrentActive && !isCompleted && (
        <div
          className="absolute top-0 left-0 w-1.5 h-full bg-[#0D9488] dark:bg-[#14B8A6] rounded-l-2xl"
          aria-hidden="true"
        ></div>
      )}

      {/* Top Metadata Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${projectStyle}`}>
            {projectName}
          </span>
          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-gray-500 dark:text-gray-400" aria-hidden="true">
              timer
            </span>
            <span>
              {task.pomodoroCount || 0}/{task.targetBlocks || 2} blocos ({((task.targetBlocks || 2) * 25)} min)
            </span>
          </span>

          {/* Differentiated State Badges */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[15px] text-[#0D9488] dark:text-[#14B8A6]" aria-hidden="true">
                check_circle
              </span>
              Concluída (Vaga ocupada)
            </span>
          ) : isCurrentActive ? (
            isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                Em execução
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-900 dark:text-amber-200 text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></span>
                Pausada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D9488]/15 dark:bg-[#14B8A6]/20 text-[#0D9488] dark:text-[#14B8A6] text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]" aria-hidden="true"></span>
                Ativa no cronômetro
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-medium">
              Prioridade pendente
            </span>
          )}
        </div>

        {/* Card Actions menu (com touch targets min 44x44px no mobile) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => demoteToSecondary(task.id)}
            title="Mover para lista secundária"
            aria-label={`Mover tarefa "${task.title}" para lista secundária`}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              arrow_downward
            </span>
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            title="Excluir tarefa"
            aria-label={`Excluir tarefa "${task.title}"`}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-600 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              delete
            </span>
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          aria-label={
            isCompleted
              ? `Marcar "${task.title}" como pendente`
              : `Marcar "${task.title}" como concluída`
          }
          className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]`}
        >
          <div
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-[#0D9488] border-[#0D9488] text-white shadow-sm'
                : 'border-gray-400 dark:border-gray-500 hover:border-[#0D9488] dark:hover:border-[#14B8A6]'
            }`}
          >
            {isCompleted && (
              <span className="material-symbols-outlined text-[18px] font-bold" aria-hidden="true">
                check
              </span>
            )}
          </div>
        </button>

        {/* Title & Notes */}
        <div className="flex-1 min-w-0 pt-1">
          <h3
            onClick={() => {
              setActiveTaskId(task.id);
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTaskId(task.id);
              }
            }}
            className={`text-base font-semibold leading-snug cursor-pointer transition-colors break-words focus-visible:outline-none focus-visible:underline ${
              isCompleted
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white hover:text-[#0D9488] dark:hover:text-[#14B8A6]'
            }`}
          >
            {task.title}
          </h3>
          {task.note && (
            <p className="mt-1.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words">
              {task.note}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Focus Row */}
      {!isCompleted && (
        <div className="pt-3 mt-1 border-t border-gray-100 dark:border-[#243048]/80 flex flex-wrap items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5" aria-label={`Progresso: ${task.pomodoroCount || 0} de ${task.targetBlocks || 2} blocos`}>
            {Array.from({ length: task.targetBlocks || 2 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx < (task.pomodoroCount || 0)
                    ? 'bg-[#0D9488] dark:bg-[#14B8A6]'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                title={`Bloco ${idx + 1}`}
                aria-hidden="true"
              ></span>
            ))}
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium ml-1">
              {task.pomodoroCount || 0} de {task.targetBlocks || 2} blocos
            </span>
          </div>

          {/* Quick Focus Button */}
          <div className="flex items-center gap-2">
            {isCurrentActive ? (
              <button
                onClick={() => {
                  if (isRunning) {
                    pauseTimer();
                  } else {
                    startTimer();
                  }
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isRunning ? 'Pausar' : isPaused ? 'Continuar' : 'Iniciar foco'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTaskId(task.id);
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-[#0D9488] hover:text-[#0D9488] dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6] text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  radio_button_checked
                </span>
                <span>Selecionar para foco</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTaskId(task.id);
                onOpenFocusSession();
              }}
              title="Abrir cronômetro em tela cheia"
              aria-label={`Abrir cronômetro em tela cheia para "${task.title}"`}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                fullscreen
              </span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
