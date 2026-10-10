import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import confetti from 'canvas-confetti';

export default function NightReviewScreen({ onClose, onGoToHome }) {
  const {
    tasks,
    projects,
    focusTasks,
    finishNightReview,
    rolloverTasksToTomorrow,
    archiveUnfinishedTasks,
    toggleTaskComplete,
    showNotification
  } = useTasks();

  const [step, setStep] = useState(1); // 1: Reflexão, 2: Destino de Pendências, 3: Prioridades de Amanhã
  const [reflectionChecked, setReflectionChecked] = useState([false, false, false]);

  const unfinishedFocusTasks = focusTasks.filter((t) => !t.completed);
  const completedFocusTasks = focusTasks.filter((t) => t.completed);

  // Mapeamento de decisões explícitas por tarefa: 'tomorrow' | 'secondary' | 'complete'
  // Garante desde o primeiro instante que no MÁXIMO 3 tarefas recebam 'tomorrow'
  const [taskDecisions, setTaskDecisions] = useState(() => {
    const initial = {};
    let tomorrowCount = 0;
    unfinishedFocusTasks.forEach((t) => {
      if (tomorrowCount < 3) {
        initial[t.id] = 'tomorrow';
        tomorrowCount++;
      } else {
        initial[t.id] = 'secondary';
      }
    });
    return initial;
  });

  // Lista selecionada para amanhã (no passo 3), com teto estrito de 3 tarefas
  const [selectedForTomorrow, setSelectedForTomorrow] = useState(() => {
    return unfinishedFocusTasks.map((t) => t.id).slice(0, 3);
  });

  const handleDecisionChange = (taskId, newDecision) => {
    if (newDecision === 'tomorrow') {
      const currentTomorrowCount = Object.entries(taskDecisions).filter(
        ([id, dec]) => dec === 'tomorrow' && id !== taskId
      ).length;

      if (currentTomorrowCount >= 3) {
        showNotification('Limite de 3 prioridades para amanhã atingido. Altere outra para secundária primeiro.', 'warning');
        return;
      }
    }

    setTaskDecisions((prev) => ({
      ...prev,
      [taskId]: newDecision
    }));

    // Mantém sincronizada a lista de amanhã garantindo no máximo 3
    if (newDecision === 'tomorrow') {
      setSelectedForTomorrow((prev) => {
        if (prev.includes(taskId)) return prev;
        if (prev.length >= 3) {
          showNotification('Limite de 3 prioridades para amanhã atingido.', 'warning');
          return prev;
        }
        return [...prev, taskId];
      });
    } else {
      setSelectedForTomorrow((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const toggleSelectTomorrow = (id) => {
    if (selectedForTomorrow.includes(id)) {
      setSelectedForTomorrow(selectedForTomorrow.filter((itemId) => itemId !== id));
      if (taskDecisions[id] === 'tomorrow') {
        setTaskDecisions((prev) => ({ ...prev, [id]: 'secondary' }));
      }
    } else {
      if (selectedForTomorrow.length >= 3) {
        showNotification('Você pode selecionar no máximo 3 prioridades para amanhã.', 'warning');
        return;
      }
      setSelectedForTomorrow([...selectedForTomorrow, id]);
      setTaskDecisions((prev) => ({ ...prev, [id]: 'tomorrow' }));
    }
  };

  const handleFinishReview = async () => {
    // 1. Processar tarefas que o usuário marcou para concluir
    const toComplete = [];
    for (const [taskId, decision] of Object.entries(taskDecisions)) {
      if (decision === 'complete') {
        toComplete.push(taskId);
      }
    }

    // 2. Processar tarefas enviadas para amanhã (limite rígido e inquebrável de 3)
    const toTomorrow = selectedForTomorrow.slice(0, 3);

    // 3. Processar tarefas movidas para lista secundária
    const toSecondary = Object.entries(taskDecisions)
      .filter(([id, dec]) => dec === 'secondary' && !toTomorrow.includes(id))
      .map(([id]) => id);

    // Também mover tarefas não finalizadas que não foram selecionadas para amanhã nem concluídas
    const unselectedPending = unfinishedFocusTasks
      .filter((t) => !toTomorrow.includes(t.id) && taskDecisions[t.id] !== 'complete')
      .map((t) => t.id);

    const allToSecondary = Array.from(new Set([...toSecondary, ...unselectedPending]));

    // Operação atômica que garante que apenas no máximo 3 tarefas sejam foco ativo
    await finishNightReview({
      tomorrowTaskIds: toTomorrow,
      completedTaskIds: toComplete,
      secondaryTaskIds: allToSecondary
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#14B8A6', '#89F5E7']
    });

    onGoToHome();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 min-[380px]:px-4 sm:px-6 py-8 animate-fade-in flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200/90 dark:border-[#243048]">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            <span className="text-[#0D9488] dark:text-[#14B8A6] font-bold uppercase tracking-widest">
              Fechamento do Dia
            </span>
            <span>•</span>
            <span>1 minuto</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Revisão Noturna
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Feche suas pendências com intenção e prepare as prioridades de amanhã para uma noite de descanso sem preocupações.
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar revisão noturna"
          className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      {/* Step Indicators com versão compacta em 320px */}
      <nav aria-label="Etapas da revisão noturna" className="grid grid-cols-3 gap-2">
        {[
          { num: 1, title: 'Reflexão Rápida', shortTitle: 'Reflexão' },
          { num: 2, title: 'Destino de Pendências', shortTitle: 'Pendências' },
          { num: 3, title: 'Prioridades de Amanhã', shortTitle: 'Amanhã' }
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            aria-current={step === s.num ? 'step' : undefined}
            className={`min-h-[52px] p-2 min-[380px]:p-3 rounded-xl border text-left flex flex-col justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
              step === s.num
                ? 'border-[#0D9488] bg-[#0D9488]/10 dark:bg-[#14B8A6]/15 ring-1 ring-[#0D9488]'
                : 'border-gray-200 dark:border-[#243048] bg-white dark:bg-[#131B2E] opacity-80 hover:opacity-100'
            }`}
          >
            <span className="text-[10px] min-[380px]:text-[11px] uppercase font-bold text-gray-600 dark:text-gray-400">
              Passo {s.num}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              <span className="min-[380px]:hidden">{s.shortTitle}</span>
              <span className="hidden min-[380px]:inline">{s.title}</span>
            </span>
          </button>
        ))}
      </nav>

      {/* Passo 1: Reflexão Rápida */}
      {step === 1 && (
        <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-gray-100 dark:border-[#243048]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              1. Fechamento das Prioridades do Dia
            </h2>
            <span className="text-xs text-[#0D9488] dark:text-[#14B8A6] font-semibold">
              {completedFocusTasks.length} de {focusTasks.length} prioridades concluídas
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              'Dediquei atenção ao que era prioritário hoje?',
              'Fiz pausas necessárias para renovar minha clareza?',
              'Reconheço o que foi realizado e desapego do que ficou fora do meu alcance.'
            ].map((question, qIdx) => (
              <label
                key={qIdx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#0D9488]"
              >
                <input
                  type="checkbox"
                  checked={reflectionChecked[qIdx]}
                  onChange={() => {
                    const next = [...reflectionChecked];
                    next[qIdx] = !next[qIdx];
                    setReflectionChecked(next);
                  }}
                  className="w-5 h-5 mt-0.5 rounded text-[#0D9488] focus:ring-[#0D9488] border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <span className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                  {question}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              <span>Avançar para Destino de Pendências</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Passo 2: Destino de Pendências com Opções Explícitas */}
      {step === 2 && (
        <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              2. O que fazer com o que não foi concluído?
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Escolha uma ação para cada pendência. As opções estão explícitas abaixo e serão aplicadas ao concluir a revisão.
            </p>
          </div>

          {/* Aviso sobre o momento em que as alterações são salvas */}
          <div className="p-3.5 rounded-xl bg-[#0D9488]/10 dark:bg-[#14B8A6]/10 border border-[#0D9488]/30 dark:border-[#14B8A6]/30 flex items-start gap-2.5 text-xs text-gray-800 dark:text-gray-200">
            <span className="material-symbols-outlined text-[18px] text-[#0D9488] dark:text-[#14B8A6] flex-shrink-0 mt-0.5" aria-hidden="true">
              schedule
            </span>
            <span>
              <strong>Momento de salvamento:</strong> As opções selecionadas serão salvas de forma definitiva ao confirmar no <strong>Passo 3</strong> e clicar em <em>Concluir Revisão e Salvar Alterações</em>.
            </span>
          </div>

          {unfinishedFocusTasks.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <span className="material-symbols-outlined text-[32px] text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                sentiment_very_satisfied
              </span>
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mt-2">
                Todas as 3 prioridades de hoje foram concluídas!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Ficha limpa hoje. Você pode definir tranquilamente as 3 prioridades de amanhã.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {unfinishedFocusTasks.map((task) => {
                const currentDecision = taskDecisions[task.id] || 'secondary';
                const projName = task.project || projects?.find((p) => p.id === task.projectId)?.name || 'Geral';

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#182238]/40 flex flex-col gap-3"
                  >
                    <div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                        {task.title}
                      </span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300">
                        Projeto: {projName} • {task.pomodoroCount || 0} blocos realizados
                      </span>
                    </div>

                    {/* 3 Opções Explícitas com Seleção Visível e Acessível */}
                    <div
                      role="radiogroup"
                      aria-label={`Destino da pendência: ${task.title}`}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1"
                    >
                      {/* Opção 1: Enviar para amanhã */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={currentDecision === 'tomorrow'}
                        onClick={() => handleDecisionChange(task.id, 'tomorrow')}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                          currentDecision === 'tomorrow'
                            ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-[#0D9488]'
                        }`}
                      >
                        {currentDecision === 'tomorrow' && (
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                            check
                          </span>
                        )}
                        <span>Enviar para amanhã</span>
                      </button>

                      {/* Opção 2: Mover para lista secundária */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={currentDecision === 'secondary'}
                        onClick={() => handleDecisionChange(task.id, 'secondary')}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                          currentDecision === 'secondary'
                            ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-[#0D9488]'
                        }`}
                      >
                        {currentDecision === 'secondary' && (
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                            check
                          </span>
                        )}
                        <span>Mover para lista secundária</span>
                      </button>

                      {/* Opção 3: Concluir tarefa */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={currentDecision === 'complete'}
                        onClick={() => handleDecisionChange(task.id, 'complete')}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                          currentDecision === 'complete'
                            ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-[#0D9488]'
                        }`}
                      >
                        {currentDecision === 'complete' && (
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                            check
                          </span>
                        )}
                        <span>Concluir tarefa</span>
                      </button>
                    </div>

                    {/* Feedback textual da opção selecionada */}
                    <div className="text-[11px] text-gray-600 dark:text-gray-300">
                      Status selecionado:{' '}
                      <strong className="text-gray-900 dark:text-white">
                        {currentDecision === 'tomorrow'
                          ? 'Será enviada para as prioridades de amanhã'
                          : currentDecision === 'secondary'
                          ? 'Será movida para a lista secundária'
                          : 'Será marcada como concluída'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              ← Voltar ao Passo 1
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              <span>Avançar para Foco de Amanhã</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Passo 3: Prioridades de Amanhã com Controles Adequados e Teclado */}
      {step === 3 && (
        <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                3. Selecione até 3 Prioridades para Amanhã
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6]">
                {selectedForTomorrow.length}/3 selecionadas
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Defina com calma o foco de amanhã. Use o teclado (Espaço ou Enter) para marcar ou desmarcar.
            </p>
          </div>

          {/* Lista de candidatas com inputs de checkbox acessíveis */}
          <div className="flex flex-col gap-2.5" role="group" aria-label="Lista de tarefas para priorizar amanhã">
            {tasks
              .filter((t) => !t.completed && taskDecisions[t.id] !== 'complete')
              .map((task) => {
                const isSelected = selectedForTomorrow.includes(task.id);
                const projName = task.project || projects?.find((p) => p.id === task.projectId)?.name || 'Geral';

                return (
                  <label
                    key={task.id}
                    className={`min-h-[48px] p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[#0D9488] ${
                      isSelected
                        ? 'border-[#0D9488] bg-[#0D9488]/10 dark:bg-[#14B8A6]/15 ring-1 ring-[#0D9488]'
                        : 'border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#182238]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        aria-checked={isSelected}
                        onChange={() => toggleSelectTomorrow(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSelectTomorrow(task.id);
                          }
                        }}
                        className="w-5 h-5 rounded text-[#0D9488] focus:ring-[#0D9488] border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
                        aria-label={`Priorizar amanhã: ${task.title}`}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-gray-600 dark:text-gray-300">
                          {projName}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {isSelected
                        ? `Prioridade ${selectedForTomorrow.indexOf(task.id) + 1} de 3`
                        : 'Secundária'}
                    </span>
                  </label>
                );
              })}
          </div>

          {/* Aviso sobre salvamento imediato na conclusão */}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Ao clicar no botão abaixo, todas as alterações serão gravadas no aplicativo e a tela inicial será atualizada.
          </p>

          {/* Completion Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#243048]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              ← Voltar ao Passo 2
            </button>
            <button
              type="button"
              onClick={handleFinishReview}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                bedtime
              </span>
              <span>Concluir Revisão e Salvar Alterações</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
