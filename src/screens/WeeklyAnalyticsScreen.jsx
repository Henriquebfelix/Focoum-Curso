import React, { useState, useMemo } from 'react';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import {
  formatDuration,
  formatDailyAverage,
  getSafeSessionDate,
  getSessionMinutes,
  getLocalLast7Days,
  isSameLocalDay
} from '../utils/formatters';

export default function WeeklyAnalyticsScreen() {
  const { sessions, startTimer } = useTimer();
  const { projects } = useTasks();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' ou nome do projeto
  const [showOlderHistory, setShowOlderHistory] = useState(false);

  // 1. Obter período dos últimos 7 dias no fuso horário local
  const last7Days = useMemo(() => getLocalLast7Days(new Date()), []);
  const periodStart = last7Days[0].start;
  const periodEnd = last7Days[6].end;

  const getSessionProjectName = (s) =>
    s.project || projects.find((p) => p.id === s.projectId)?.name || s.projectId || 'Geral';

  // 2. Filtrar estritamente as sessões dos últimos 7 dias
  const weekSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = getSafeSessionDate(s.endedAt || s.startedAt || s.timestamp);
      return sDate >= periodStart && sDate <= periodEnd;
    });
  }, [sessions, periodStart, periodEnd]);

  // Sessões anteriores (fora dos últimos 7 dias)
  const olderSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = getSafeSessionDate(s.endedAt || s.startedAt || s.timestamp);
      return sDate < periodStart || sDate > periodEnd;
    });
  }, [sessions, periodStart, periodEnd]);

  // 3. Totais dos últimos 7 dias (base unificada)
  const totalWeekMinutes = useMemo(() => {
    return weekSessions.reduce((acc, s) => acc + getSessionMinutes(s), 0);
  }, [weekSessions]);

  const totalWeekBlocks = weekSessions.length;

  // 4. Distribuição por projeto nos últimos 7 dias
  const projectStats = useMemo(() => {
    const stats = {};
    weekSessions.forEach((s) => {
      const proj = getSessionProjectName(s);
      stats[proj] = (stats[proj] || 0) + getSessionMinutes(s);
    });
    return stats;
  }, [weekSessions, projects]);

  // 5. Dados diários do gráfico para os últimos 7 dias
  const weekData = useMemo(() => {
    return last7Days.map((day) => {
      const daySessions = weekSessions.filter((s) => {
        const sDate = getSafeSessionDate(s.endedAt || s.startedAt || s.timestamp);
        return isSameLocalDay(sDate, day.start);
      });

      const dayMinutes = daySessions.reduce((acc, s) => acc + getSessionMinutes(s), 0);

      return {
        dayName: day.dayName,
        dateStr: day.dateStr,
        fullDateKey: day.fullDateKey,
        minutes: dayMinutes,
        sessionsCount: daySessions.length
      };
    });
  }, [last7Days, weekSessions]);

  const maxDayMinutes = Math.max(...weekData.map((w) => w.minutes), 60);

  // Sessões para a lista de histórico (filtradas por projeto e período)
  const displayedWeekSessions = useMemo(() => {
    if (activeFilter === 'all') return weekSessions;
    return weekSessions.filter((s) => getSessionProjectName(s) === activeFilter);
  }, [weekSessions, activeFilter, projects]);

  const displayedOlderSessions = useMemo(() => {
    if (activeFilter === 'all') return olderSessions;
    return olderSessions.filter((s) => getSessionProjectName(s) === activeFilter);
  }, [olderSessions, activeFilter, projects]);

  const hasSessionsInPeriod = totalWeekMinutes > 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 min-[380px]:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 max-w-xl">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          <span className="text-[#0D9488] dark:text-[#14B8A6] font-bold uppercase tracking-widest">
            Tempo & Foco
          </span>
          <span>•</span>
          <span>Últimos 7 dias ({last7Days[0].dateStr} a {last7Days[6].dateStr})</span>
        </div>
        <h1 className="text-2xl min-[380px]:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Visão Semanal
        </h1>
        <p className="text-xs min-[380px]:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Avalie onde sua atenção foi aplicada nos últimos sete dias e calibre seus próximos blocos de foco.
        </p>
      </div>

      {/* KPI Cards Row - Base Unificada dos Últimos 7 Dias (Adaptado para 320px) */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-3 min-[380px]:gap-4">
        {/* Total Focado */}
        <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-3.5 min-[380px]:p-5 shadow-sm">
          <span className="text-[11px] min-[380px]:text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
            Total Focado
          </span>
          <div className="mt-1.5 min-[380px]:mt-2 text-2xl min-[380px]:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {formatDuration(totalWeekMinutes)}
          </div>
          <span className="text-[11px] min-[380px]:text-xs text-gray-600 dark:text-gray-300 mt-1 block">
            {totalWeekMinutes} min nos últimos 7 dias
          </span>
        </div>

        {/* Sessões Pomodoro */}
        <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-3.5 min-[380px]:p-5 shadow-sm">
          <span className="text-[11px] min-[380px]:text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
            Sessões Pomodoro
          </span>
          <div className="mt-1.5 min-[380px]:mt-2 text-2xl min-[380px]:text-3xl font-semibold text-[#0D9488] dark:text-[#14B8A6] tracking-tight">
            {totalWeekBlocks}
          </div>
          <span className="text-[11px] min-[380px]:text-xs text-gray-600 dark:text-gray-300 mt-1 block">
            {totalWeekBlocks === 1 ? '1 bloco concluído' : `${totalWeekBlocks} blocos concluídos`}
          </span>
        </div>

        {/* Média Diária */}
        <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-3.5 min-[380px]:p-5 shadow-sm">
          <span className="text-[11px] min-[380px]:text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
            Média Diária
          </span>
          <div className="mt-1.5 min-[380px]:mt-2 text-2xl min-[380px]:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {formatDailyAverage(totalWeekMinutes, 7)}
          </div>
          <span className="text-[11px] min-[380px]:text-xs text-gray-600 dark:text-gray-300 mt-1 block">
            Calculada em 7 dias
          </span>
        </div>

        {/* Projetos Ativos */}
        <div className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-3.5 min-[380px]:p-5 shadow-sm">
          <span className="text-[11px] min-[380px]:text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
            Projetos Ativos
          </span>
          <div className="mt-1.5 min-[380px]:mt-2 text-2xl min-[380px]:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {Object.keys(projectStats).length}
          </div>
          <span className="text-[11px] min-[380px]:text-xs text-gray-600 dark:text-gray-300 mt-1 block">
            Com foco no período
          </span>
        </div>
      </div>

      {/* Main Bar Chart Component */}
      <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-3.5 min-[380px]:p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-[#243048] gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0D9488] dark:text-[#14B8A6] text-[20px]" aria-hidden="true">
              bar_chart
            </span>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Distribuição Diária de Foco
            </h2>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Tempo registrado por dia (últimos 7 dias)
          </span>
        </div>

        {/* Aviso amigável quando não houver sessões nos últimos 7 dias */}
        {!hasSessionsInPeriod ? (
          <div className="py-10 px-4 text-center rounded-xl bg-gray-50/80 dark:bg-[#182238]/60 border border-gray-200/70 dark:border-[#243048] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                hourglass_empty
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Nenhuma sessão de foco registrada nos últimos 7 dias
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
                Inicie um bloco de foco de 25 minutos para acompanhar seu ritmo de atenção e visualizar seus gráficos aqui.
              </p>
            </div>
          </div>
        ) : null}

        {/* Chart Visual com rolagem suave horizontal se necessário em < 300px */}
        <div className="pt-4 pb-2 overflow-x-auto" role="region" aria-label="Gráfico de barras de tempo focado por dia">
          <div className="h-56 min-w-[270px] flex items-end justify-between gap-1 min-[380px]:gap-2 sm:gap-6 px-1 min-[380px]:px-2 sm:px-6 border-b border-gray-200 dark:border-[#243048]">
            {weekData.map((d, idx) => {
              // Ajuste crucial: Se minutes === 0, altura é 0 (sem barra colorida sugerindo atividade)
              const hasActivity = d.minutes > 0;
              const barHeightPercent = hasActivity
                ? Math.max(8, Math.round((d.minutes / maxDayMinutes) * 100))
                : 0;

              const label = `${d.dayName}, ${d.dateStr}: ${hasActivity ? formatDuration(d.minutes) : 'Sem foco'}`;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 min-[380px]:gap-2 h-full justify-end group focus-within:outline-none"
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={label}
                >
                  {/* Tooltip / badge de duração */}
                  <span
                    className={`text-[10px] min-[380px]:text-[11px] font-semibold text-gray-700 dark:text-gray-300 transition-opacity ${
                      hasActivity ? 'opacity-0 group-hover:opacity-100 group-focus:opacity-100' : 'opacity-0'
                    }`}
                  >
                    {formatDuration(d.minutes)}
                  </span>

                  {/* Vertical Bar Container */}
                  <div className="w-full max-w-[42px] bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden h-full flex items-end">
                    {hasActivity ? (
                      <div
                        className="w-full bg-[#0D9488] dark:bg-[#14B8A6] group-hover:bg-[#0b7c72] transition-all duration-300 rounded-t-xl"
                        style={{ height: `${barHeightPercent}%` }}
                      ></div>
                    ) : (
                      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-t-sm" title="0 min"></div>
                    )}
                  </div>

                  {/* Day Label */}
                  <div className="text-center pt-2">
                    <span className="block text-[11px] min-[380px]:text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {d.dayName}
                    </span>
                    <span className="block text-[10px] min-[380px]:text-[11px] text-gray-500 dark:text-gray-400">
                      {d.dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Projects */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Tempo por Projeto (Últimos 7 dias)
            </h3>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs text-[#0D9488] dark:text-[#14B8A6] hover:underline font-semibold"
              >
                Limpar filtro ({activeFilter})
              </button>
            )}
          </div>

          {Object.keys(projectStats).length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-3">
              Nenhum projeto registrou blocos de foco nesta semana.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(projectStats).map(([proj, mins]) => {
                const pct = totalWeekMinutes > 0 ? Math.round((mins / totalWeekMinutes) * 100) : 0;
                const isSelected = activeFilter === proj;
                return (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => setActiveFilter(isSelected ? 'all' : proj)}
                    aria-pressed={isSelected}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                      isSelected
                        ? 'border-[#0D9488] bg-[#0D9488]/10 ring-1 ring-[#0D9488]'
                        : 'border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#182238]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {proj}
                      </span>
                      <span className="text-xs font-semibold text-[#0D9488] dark:text-[#14B8A6]">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0D9488] dark:bg-[#14B8A6] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 mt-2 block font-medium">
                      {formatDuration(mins)} acumulados
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* History of sessions */}
      <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Histórico dos Últimos 7 Dias ({displayedWeekSessions.length})
            </h2>
          </div>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-[#0D9488] dark:text-[#14B8A6] hover:underline"
            >
              Exibir todos os projetos
            </button>
          )}
        </div>

        {displayedWeekSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Nenhuma sessão registrada nos últimos 7 dias para este filtro.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayedWeekSessions.slice(0, 10).map((sess) => {
              const dateObj = getSafeSessionDate(sess.endedAt || sess.startedAt || sess.timestamp);
              const timeStr = dateObj.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const dateStr = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
              });
              const mins = getSessionMinutes(sess);
              const projName = getSessionProjectName(sess);
              return (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]" aria-hidden="true"></span>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {sess.taskTitle}
                      </span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300">
                        {projName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      +{mins} min
                    </span>
                    <span className="text-[11px]">{dateStr} às {timeStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Acesso transparente a sessões anteriores fora dos 7 dias */}
        {olderSessions.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-[#243048]">
            <button
              onClick={() => setShowOlderHistory(!showOlderHistory)}
              aria-expanded={showOlderHistory}
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-[#0D9488] dark:hover:text-[#14B8A6] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg p-1"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {showOlderHistory ? 'expand_less' : 'expand_more'}
              </span>
              <span>
                {showOlderHistory
                  ? 'Ocultar sessões anteriores a 7 dias'
                  : `Ver sessões anteriores fora deste período (${displayedOlderSessions.length})`}
              </span>
            </button>

            {showOlderHistory && (
              <div className="mt-3 flex flex-col gap-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Sessões mais antigas (não inclusas nas métricas dos últimos 7 dias):
                </span>
                {displayedOlderSessions.map((sess) => {
                  const dateObj = getSafeSessionDate(sess.endedAt || sess.startedAt || sess.timestamp);
                  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const mins = getSessionMinutes(sess);
                  return (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 text-xs flex items-center justify-between text-gray-600 dark:text-gray-300"
                    >
                      <span>{sess.taskTitle} ({getSessionProjectName(sess)})</span>
                      <span className="text-[11px]">{mins} min • {dateStr} às {timeStr}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
