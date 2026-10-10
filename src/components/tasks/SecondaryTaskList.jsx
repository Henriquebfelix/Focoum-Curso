import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';

export default function SecondaryTaskList({ onOpenNewTask }) {
  const { projects, secondaryTasks, toggleTaskComplete, promoteToFocus, deleteTask, isAtFocusLimit } = useTasks();
  const [isOpen, setIsOpen] = useState(true);

  const completedCount = secondaryTasks.filter((t) => t.completed).length;

  return (
    <section className="bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-[#243048] rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all overflow-hidden">
      {/* Header with collapse trigger */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#243048]">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="secondary-task-list-content"
          aria-label={isOpen ? 'Recolher lista secundária' : 'Expandir lista secundária'}
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[44px] flex items-center gap-2 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-xl px-1.5 sm:px-2 py-1 text-left"
        >
          <span
            className="material-symbols-outlined text-[20px] text-gray-600 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white transition-transform duration-200 flex-shrink-0"
            aria-hidden="true"
          >
            {isOpen ? 'expand_more' : 'chevron_right'}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Lista Secundária
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
              {secondaryTasks.length - completedCount} pendentes
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenNewTask}
          aria-label="Adicionar nova tarefa na lista secundária"
          className="min-h-[44px] text-xs text-[#0D9488] dark:text-[#14B8A6] hover:underline font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-xl px-2.5 sm:px-3 py-1.5 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            add
          </span>
          <span>Adicionar</span>
        </button>
      </div>

      {/* Descrição limpa */}
      <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
        Tarefas complementares reservadas para quando as 3 prioridades do dia já estiverem concluídas.
      </p>

      {/* Task List */}
      {isOpen && (
        <div id="secondary-task-list-content" className="mt-4 flex flex-col gap-2.5">
          {secondaryTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-600 dark:text-gray-400">
              Nenhuma tarefa secundária no momento. Adicione quando surgirem demandas extras.
            </div>
          ) : (
            secondaryTasks.map((task) => {
              const projName = task.project || projects?.find((p) => p.id === task.projectId)?.name || 'Geral';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all ${
                    task.completed
                      ? 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/80 opacity-70'
                      : 'bg-white dark:bg-gray-800/40 border-gray-200/90 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Bloco de conteúdo: Checkbox + Título com quebra natural de linha (sem truncate) */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      aria-label={
                        task.completed
                          ? `Marcar "${task.title}" como pendente`
                          : `Marcar "${task.title}" como concluída`
                      }
                      className="min-h-[44px] min-w-[44px] -ml-2 -mt-1 sm:mt-0 rounded-xl flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-[#0D9488] border-[#0D9488] text-white'
                            : 'border-gray-400 dark:border-gray-500 hover:border-[#0D9488]'
                        }`}
                      >
                        {task.completed && (
                          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                            check
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                      <span
                        className={`text-xs font-semibold block break-words leading-snug ${
                          task.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 block mt-0.5">
                        Projeto: {projName}
                      </span>
                    </div>
                  </div>

                  {/* Bloco de Ações: Reorganizado para celular sem espremer o texto */}
                  <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/80">
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => promoteToFocus(task.id)}
                        title={
                          isAtFocusLimit
                            ? 'Limite de 3 prioridades atingido hoje (vagas completas)'
                            : 'Promover para as prioridades de hoje'
                        }
                        aria-label={`Promover "${task.title}" para as prioridades de hoje`}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                          isAtFocusLimit
                            ? 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                            : 'border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-[#0D9488] hover:text-[#0D9488]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                          arrow_upward
                        </span>
                        <span>Promover</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      title="Excluir tarefa"
                      aria-label={`Excluir tarefa "${task.title}"`}
                      className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
