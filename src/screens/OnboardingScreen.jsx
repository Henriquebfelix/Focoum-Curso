import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

export default function OnboardingScreen({ onComplete }) {
  const { projects, setProjects, userConfig, setUserConfig, showNotification } = useTasks();

  const [reviewTime, setReviewTime] = useState(userConfig.reviewTime || '21:30');
  const [dailyGoalBlocks, setDailyGoalBlocks] = useState(userConfig.dailyGoalBlocks || 6);
  const [newProjectName, setNewProjectName] = useState('');
  const [localProjects, setLocalProjects] = useState(projects);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    if (localProjects.some((p) => p.name.toLowerCase() === newProjectName.trim().toLowerCase())) {
      showNotification('Esse projeto ou matéria já existe.', 'warning');
      return;
    }

    const newP = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      color: '#0D9488',
      active: true
    };
    setLocalProjects([...localProjects, newP]);
    setNewProjectName('');
  };

  const handleRemoveProject = (id) => {
    if (localProjects.length <= 1) {
      showNotification('Mantenha ao menos um projeto ativo.', 'warning');
      return;
    }
    setLocalProjects(localProjects.filter((p) => p.id !== id));
  };

  const handleSaveAndContinue = () => {
    setProjects(localProjects);
    setUserConfig({
      ...userConfig,
      reviewTime,
      dailyGoalBlocks: Number(dailyGoalBlocks),
      onboardingCompleted: true
    });
    showNotification('Configurações salvas com sucesso!', 'success');
    onComplete();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 min-[380px]:px-6 py-6 sm:py-8 animate-fade-in flex flex-col gap-6 sm:gap-8">
      {/* Intro Header */}
      <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] dark:text-[#14B8A6] flex items-center justify-center mx-auto mb-2">
          <span className="material-symbols-outlined text-[28px]">adjust</span>
        </div>
        <h1 className="text-2xl min-[380px]:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Configuração & Princípios
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          O FocoUm foi desenhado para eliminar a ilusão de produtividade de listas infinitas. Ajuste suas áreas de dedicação e seu ritual noturno.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-[#131B2E] border border-gray-200/80 dark:border-[#243048] rounded-2xl p-4 min-[380px]:p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        {/* Section 1: Projects */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                1. Seus Projetos Ativos
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Evite espalhar energia em muitas frentes ao mesmo tempo.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              {localProjects.length} ativos
            </span>
          </div>

          {/* Project Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {localProjects.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-800 dark:text-gray-200"
              >
                <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(p.id)}
                  aria-label={`Remover projeto ${p.name}`}
                  className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
                </button>
              </span>
            ))}
          </div>

          {/* Add Project Input */}
          <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row gap-2 pt-2">
            <label htmlFor="new-project-input" className="sr-only">
              Nome do novo projeto
            </label>
            <input
              id="new-project-input"
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Adicionar novo projeto ou matéria..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] transition-colors flex items-center justify-center gap-1 min-h-[38px]"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
              <span>Adicionar</span>
            </button>
          </form>
        </div>

        <hr className="border-gray-100 dark:border-[#243048]" />

        {/* Section 2: Nightly Review Hour */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              2. Horário da Revisão Noturna (1 min)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Momento do dia em que você desliga o trabalho e organiza o dia seguinte.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 min-[380px]:gap-2">
            {['21:00', '21:30', '22:00'].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setReviewTime(time)}
                aria-pressed={reviewTime === time}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  reviewTime === time
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
            <input
              type="time"
              aria-label="Horário personalizado da revisão noturna"
              value={reviewTime}
              onChange={(e) => setReviewTime(e.target.value)}
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs text-gray-800 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-[#243048]" />

        {/* Section 3: Daily Pomodoro Goal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              3. Meta Diária de Blocos de Foco
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              6 blocos de 25 min equivalem a 2h30 de foco intencional intercalado com pausas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 min-[380px]:gap-2 w-full sm:w-auto">
            {[4, 6, 8].map((blocks) => (
              <button
                key={blocks}
                type="button"
                onClick={() => setDailyGoalBlocks(blocks)}
                aria-pressed={dailyGoalBlocks === blocks}
                className={`min-h-[40px] px-2 min-[380px]:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
                  dailyGoalBlocks === blocks
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{blocks}x</span>
                <span className="text-[10px] min-[380px]:text-xs opacity-80">({blocks * 25}m)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-gray-100 dark:border-[#243048] flex justify-end">
          <button
            onClick={handleSaveAndContinue}
            aria-label="Salvar configurações e ir para o foco de hoje"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Salvar & Ir para o Foco de Hoje</span>
            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
