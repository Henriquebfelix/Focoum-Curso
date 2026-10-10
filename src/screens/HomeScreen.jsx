import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useTimer } from '../context/TimerContext';
import VitalTaskCard from '../components/tasks/VitalTaskCard';
import SecondaryTaskList from '../components/tasks/SecondaryTaskList';
import FocusTimer from '../components/timer/FocusTimer';
import CompactMobileTimer from '../components/timer/CompactMobileTimer';
import { formatDuration } from '../utils/formatters';

export default function HomeScreen({ onOpenFocusSession, onOpenNewTask, onOpenNightReview }) {
  const { focusTasks, totalFocusCount, completedFocusCount, pendingFocusCount, isAtFocusLimit } = useTasks();
  const { sessions } = useTimer();

  // Calcular estatísticas de foco de hoje no fuso horário local
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter((s) => {
    const raw = s.endedAt || s.startedAt || s.timestamp;
    const dateObj = raw?.toDate ? raw.toDate() : new Date(raw || Date.now());
    return dateObj >= todayStart;
  });

  const todayMinutes = todaySessions.reduce((acc, s) => {
    const mins = s.durationMinutes || (s.durationSeconds ? Math.round(s.durationSeconds / 60) : 0);
    return acc + mins;
  }, 0);

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 animate-fade-in pb-24 lg:pb-8">
      {/* Top Welcome & Capacity Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium">
            <span className="uppercase tracking-widest text-[#0D9488] dark:text-[#14B8A6] font-bold">
              Hoje
            </span>
            <span>•</span>
            <span>{capitalizedDate}</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Clareza antes da velocidade.
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Dedique sua atenção a no máximo três prioridades essenciais por dia.
          </p>
        </div>

        {/* 3 Slots Indicator com Diferenciação Visual Clara */}
        <div className="flex flex-col sm:items-end gap-1.5 bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] px-5 py-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Vagas do dia:
            </span>
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label={`${totalFocusCount} de 3 vagas ocupadas hoje: ${pendingFocusCount} ativas e ${completedFocusCount} concluídas`}
            >
              {[0, 1, 2].map((idx) => {
                const isFilled = idx < totalFocusCount;
                const isCompletedSlot = idx < completedFocusCount;

                return (
                  <span
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isFilled
                        ? isCompletedSlot
                          ? 'bg-emerald-600/80 dark:bg-emerald-400/80 ring-2 ring-emerald-500/30'
                          : 'bg-[#0D9488] dark:bg-[#14B8A6] shadow-[0_0_8px_rgba(13,148,136,0.6)]'
                        : 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent'
                    }`}
                    title={
                      isFilled
                        ? isCompletedSlot
                          ? `Vaga ${idx + 1}: Concluída (continua ocupando a vaga do dia)`
                          : `Vaga ${idx + 1}: Prioridade ativa`
                        : `Vaga ${idx + 1}: Disponível`
                    }
                  >
                    {isFilled && isCompletedSlot && (
                      <span className="material-symbols-outlined text-[10px] text-white font-bold" aria-hidden="true">
                        check
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {totalFocusCount}/3 vagas ocupadas ({pendingFocusCount} ativa{pendingFocusCount !== 1 ? 's' : ''}, {completedFocusCount} concluída{completedFocusCount !== 1 ? 's' : ''})
          </p>
        </div>
      </section>

      {/* Main Grid: 3 Vital Focuses + Ambient Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column on Desktop: Priorities + Secondary Backlog (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Header of Priorities Section */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Prioridades de hoje
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {totalFocusCount}/3
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#0D9488] dark:text-[#14B8A6]" aria-hidden="true">
                lock
              </span>
              Máximo 3 vagas/dia
            </span>
          </div>

          {/* List of Focus Tasks */}
          <div className="flex flex-col gap-4">
            {focusTasks.map((task) => (
              <VitalTaskCard
                key={task.id}
                task={task}
                onOpenFocusSession={onOpenFocusSession}
              />
            ))}

            {/* Empty Slot Card if < 3 */}
            {!isAtFocusLimit ? (
              <button
                type="button"
                onClick={onOpenNewTask}
                aria-label={`Definir prioridade ${totalFocusCount + 1} de 3`}
                className="p-5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#243048] hover:border-[#0D9488] dark:hover:border-[#14B8A6] bg-white dark:bg-[#131B2E]/30 text-gray-700 dark:text-gray-300 hover:text-[#0D9488] dark:hover:text-[#14B8A6] flex items-center justify-center gap-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all group min-h-[56px]"
              >
                <span className="w-6 h-6 rounded-full border border-gray-400 dark:border-gray-500 group-hover:border-[#0D9488] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    add
                  </span>
                </span>
                <span>Definir prioridade {totalFocusCount + 1} de 3</span>
              </button>
            ) : (
              /* Aviso Simplificado sobre o limite de 3 prioridades */
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#0D9488] dark:text-[#14B8A6] flex-shrink-0" aria-hidden="true">
                  verified
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Limite de 3 prioridades preenchido para hoje.</strong> Tarefas concluídas continuam ocupando vaga para manter o foco deliberado. Novas ideias podem ser guardadas na Lista Secundária.
                </p>
              </div>
            )}
          </div>

          {/* Secondary Tasks Backlog */}
          <SecondaryTaskList onOpenNewTask={onOpenNewTask} />
        </section>

        {/* Right Column on Desktop: Ambient Timer + Pulse Summary (5 Cols) */}
        <aside className="hidden lg:flex lg:col-span-5 flex-col gap-4 lg:sticky lg:top-24">
          <FocusTimer onOpenFocusSession={onOpenFocusSession} />

          {/* Mini Pulse Card */}
          <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Ritmo de Foco de Hoje
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#182238] border border-gray-200/90 dark:border-[#243048]">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatDuration(todayMinutes)}
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Foco acumulado hoje
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#182238] border border-gray-200/90 dark:border-[#243048]">
                <span className="text-2xl font-semibold text-[#0D9488] dark:text-[#14B8A6]">
                  {completedFocusCount}/3
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Prioridades concluídas
                </span>
              </div>
            </div>

            {/* Night Review Callout banner */}
            <div className="mt-2 p-3.5 rounded-xl bg-[#0D9488]/10 dark:bg-[#14B8A6]/10 border border-[#0D9488]/20 dark:border-[#14B8A6]/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                  Revisão Noturna (1 min)
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Feche o dia com tranquilidade e planeje amanhã
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenNightReview}
                aria-label="Iniciar revisão noturna de um minuto"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all whitespace-nowrap"
              >
                Iniciar
              </button>
            </div>
          </div>
        </aside>

        {/* On Mobile: Pulse Summary after Secondary List */}
        <div className="lg:hidden flex flex-col gap-4">
          <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Ritmo de Foco de Hoje
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#182238] border border-gray-200/90 dark:border-[#243048]">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatDuration(todayMinutes)}
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Foco acumulado hoje
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#182238] border border-gray-200/90 dark:border-[#243048]">
                <span className="text-2xl font-semibold text-[#0D9488] dark:text-[#14B8A6]">
                  {completedFocusCount}/3
                </span>
                <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Prioridades concluídas
                </span>
              </div>
            </div>

            {/* Night Review Callout banner */}
            <div className="mt-2 p-3.5 rounded-xl bg-[#0D9488]/10 dark:bg-[#14B8A6]/10 border border-[#0D9488]/20 dark:border-[#14B8A6]/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                  Revisão Noturna (1 min)
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Feche o dia com tranquilidade e planeje amanhã
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenNightReview}
                aria-label="Iniciar revisão noturna de um minuto"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all whitespace-nowrap"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controle Compacto do Cronômetro para Celular (Sem precisar rolar a página) */}
      <CompactMobileTimer onOpenFocusSession={onOpenFocusSession} />
    </div>
  );
}
