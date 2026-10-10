import React, { useEffect, useRef } from 'react';

/**
 * Modal acessível para detalhes da tarefa ativa.
 * Implementa WAI-ARIA Dialog Modal com focus trap, fechamento via Escape
 * e devolução de foco ao elemento de origem.
 */
export default function TaskDetailModal({ isOpen, onClose, task, triggerRef }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const originElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Salva o elemento que disparou a abertura
      originElementRef.current = triggerRef?.current || document.activeElement;

      // Mover foco para o botão de fechar dentro do diálogo
      const focusTimer = setTimeout(() => {
        if (closeBtnRef.current) {
          closeBtnRef.current.focus();
        }
      }, 30);

      // Listener para tecla Escape e Focus Trap (Tab / Shift+Tab)
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);

        // Devolve o foco exatamente ao elemento que abriu o diálogo após o fechamento
        const targetToRestore = originElementRef.current || triggerRef?.current;
        if (targetToRestore && typeof targetToRestore.focus === 'function') {
          setTimeout(() => {
            targetToRestore.focus();
          }, 30);
        }
      };
    }
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !task) return null;

  const taskTitle = task.title || 'Tarefa Ativa';
  const projectName = task.project || 'Geral';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-task-detail-title"
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        // Fecha se clicar no backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-[#131B2E] border border-gray-200 dark:border-[#243048] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative animate-scale-up"
      >
        {/* Header do Diálogo */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#243048]">
          <h2
            id="active-task-detail-title"
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            Detalhes da Tarefa Ativa
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes da tarefa"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Conteúdo Principal com Título Completo */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Título Completo:
          </span>
          <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug break-words">
            {taskTitle}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6]">
              Projeto: {projectName}
            </span>
            {task.targetBlocks && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                Meta: {task.targetBlocks} bloco{task.targetBlocks > 1 ? 's' : ''} ({task.targetBlocks * 25} min)
              </span>
            )}
          </div>

          {task.note && (
            <div className="mt-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                Anotação / Próximo Passo:
              </span>
              <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed break-words">
                {task.note}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-3 border-t border-gray-100 dark:border-[#243048] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all"
          >
            Fechar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
