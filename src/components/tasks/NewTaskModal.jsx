import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../context/TaskContext';

export default function NewTaskModal({ isOpen, onClose }) {
  const { addTask, projects, totalFocusCount, completedFocusCount, isAtFocusLimit } = useTasks();

  const [title, setTitle] = useState('');
  const [project, setProject] = useState(projects[0]?.name || 'Engenharia');
  const [isFocus, setIsFocus] = useState(!isAtFocusLimit);
  const [targetBlocks, setTargetBlocks] = useState(2);
  const [note, setNote] = useState('');

  const modalRef = useRef(null);
  const originElementRef = useRef(null);

  // Sincroniza estado inicial sempre que o modal abre e registra elemento disparador
  useEffect(() => {
    if (isOpen) {
      originElementRef.current = document.activeElement;
      setIsFocus(!isAtFocusLimit);
      setTitle('');
      setNote('');
      setTargetBlocks(2);
      if (projects[0]?.name) {
        setProject(projects[0].name);
      }
    }
  }, [isOpen, isAtFocusLimit, projects]);

  // Fechamento infalível com tecla Escape (captura global) e Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && (document.activeElement === first || !modalRef.current.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (document.activeElement === last || !modalRef.current.contains(document.activeElement))) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      const target = originElementRef.current;
      if (target && typeof target.focus === 'function') {
        setTimeout(() => target.focus(), 15);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Se estiver no limite e tentar marcar como prioridade, direciona para secundária
    const finalIsFocus = isFocus && !isAtFocusLimit;

    const selectedProj = projects.find((p) => p.name === project || p.id === project);
    const projectId = selectedProj?.id || 'eng';
    const projectName = selectedProj?.name || project;

    const success = addTask({
      title,
      project: projectName,
      projectId,
      type: finalIsFocus ? 'foco' : 'leve',
      isFocus: finalIsFocus,
      targetBlocks,
      note
    });

    if (success) {
      setTitle('');
      setNote('');
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 min-[380px]:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#131B2E] border border-gray-200 dark:border-[#243048] rounded-2xl p-4 min-[380px]:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#243048]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]" aria-hidden="true"></span>
            <h2 id="modal-title" className="text-base font-semibold text-gray-900 dark:text-white">
              Nova Tarefa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Concluir especificações da API..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Projeto */}
            <div>
              <label
                htmlFor="task-project-select"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5"
              >
                Projeto
              </label>
              <select
                id="task-project-select"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimativa Pomodoro */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                Estimativa Pomodoro (25m)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((blocks) => (
                  <button
                    type="button"
                    key={blocks}
                    onClick={() => setTargetBlocks(blocks)}
                    aria-label={`Estimativa de ${blocks} bloco${blocks > 1 ? 's' : ''} (${blocks * 25} minutos)`}
                    className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                      targetBlocks === blocks
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {blocks}x ({blocks * 25}m)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Destino da Tarefa: Prioridade vs Lista Secundária */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-2">
              Destino da Tarefa
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isAtFocusLimit}
                onClick={() => setIsFocus(true)}
                className={`min-h-[72px] p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  isAtFocusLimit
                    ? 'opacity-60 bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 cursor-not-allowed'
                    : isFocus
                    ? 'border-[#0D9488] bg-[#0D9488]/10 dark:bg-[#14B8A6]/15 ring-1 ring-[#0D9488]'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
                    Prioridades de hoje
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {totalFocusCount}/3
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                  {isAtFocusLimit
                    ? `Capacidade diária preenchida (${completedFocusCount > 0 ? `${completedFocusCount} concluída(s)` : '3 ativas'})`
                    : 'Ocupa uma das 3 vagas vitais do dia.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsFocus(false)}
                className={`min-h-[72px] p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  !isFocus || isAtFocusLimit
                    ? 'border-[#0D9488] bg-[#0D9488]/10 dark:bg-[#14B8A6]/15 ring-1 ring-[#0D9488]'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400" aria-hidden="true"></span>
                    Lista Secundária
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    Sem limite
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                  Demandas adicionais para depois das prioridades.
                </p>
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label
              htmlFor="task-note-input"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Observação (Opcional)
            </label>
            <textarea
              id="task-note-input"
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Algum detalhe ou próximo passo físico para iniciar?"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            ></textarea>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#243048]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                check
              </span>
              <span>Adicionar Tarefa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
