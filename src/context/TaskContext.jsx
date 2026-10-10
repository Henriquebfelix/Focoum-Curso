import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { taskService } from '../services/taskService';
import { migrationService } from '../services/migrationService';

const TaskContext = createContext();

const INITIAL_PROJECTS = [
  { id: 'eng', name: 'Engenharia', color: '#0D9488', active: true },
  { id: 'design', name: 'Design', color: '#3B82F6', active: true },
  { id: 'estudos', name: 'Estudos', color: '#8B5CF6', active: true },
  { id: 'saude', name: 'Saúde', color: '#10B981', active: false }
];

const INITIAL_TASKS = [
  {
    id: 't-1',
    title: 'Arquitetura do Design System e documentação de componentes',
    project: 'Engenharia',
    isFocus: true,
    completed: false,
    pomodoroCount: 2,
    targetBlocks: 3,
    note: 'Consolidar tokens de cor, tipografia e espaçamento alinhados com o Serene Focus.'
  },
  {
    id: 't-2',
    title: 'Validação de endpoints da API de Sincronização offline',
    project: 'Engenharia',
    isFocus: true,
    completed: false,
    pomodoroCount: 0,
    targetBlocks: 2,
    note: 'Garantir idempotência na reconciliação de timers.'
  },
  {
    id: 't-3',
    title: 'Revisão bibliográfica para tese de pós-graduação',
    project: 'Estudos',
    isFocus: true,
    completed: true,
    pomodoroCount: 2,
    targetBlocks: 2,
    note: 'Capítulos 3 e 4 concluídos com anotações.'
  },
  {
    id: 't-sec-1',
    title: 'Responder e-mails da coordenação acadêmica',
    project: 'Estudos',
    isFocus: false,
    completed: false,
    pomodoroCount: 0,
    targetBlocks: 1,
    note: 'Apenas confirmar presença no comitê de ética.'
  },
  {
    id: 't-sec-2',
    title: 'Organizar pastas e limpar downloads semanais',
    project: 'Engenharia',
    isFocus: false,
    completed: false,
    pomodoroCount: 0,
    targetBlocks: 1,
    note: 'Backup dos arquivos brutos de testes.'
  },
  {
    id: 't-sec-3',
    title: 'Agendar consulta preventiva periódica',
    project: 'Saúde',
    isFocus: false,
    completed: false,
    pomodoroCount: 0,
    targetBlocks: 1,
    note: 'Verificar disponibilidade na sexta-feira.'
  }
];

export function TaskProvider({ children }) {
  const { user, setSyncStatus } = useAuth();

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('focoum_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('focoum_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [userConfig, setUserConfig] = useState(() => {
    const saved = localStorage.getItem('focoum_config');
    return saved
      ? JSON.parse(saved)
      : {
          reviewTime: '21:30',
          dailyGoalBlocks: 6,
          userName: 'Henrique',
          onboardingCompleted: true
        };
  });

  const [notification, setNotification] = useState(null);

  // Sync to local storage as fallback and cache
  useEffect(() => {
    localStorage.setItem('focoum_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('focoum_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('focoum_config', JSON.stringify(userConfig));
  }, [userConfig]);

  // Firestore Real-Time Listener & Migration when User logs in
  useEffect(() => {
    if (!user?.uid) return;

    // Migrate any legacy local storage data to Firestore once
    migrationService.migrateLocalDataToCloud(user.uid);

    // Subscribe to Firestore changes
    setSyncStatus('syncing');
    const unsubscribe = taskService.subscribeToUserTasks(
      user.uid,
      (cloudTasks) => {
        if (cloudTasks && cloudTasks.length > 0) {
          setTasks(cloudTasks);
        }
        setSyncStatus('synced');
      },
      (error) => {
        console.warn('[TaskContext] Sincronização offline ativa:', error);
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Prioridades do Dia (limite de até 3 prioridades planejadas para o dia)
  const focusTasks = tasks.filter((t) => t.isFocus);
  const totalFocusCount = focusTasks.length;
  const completedFocusCount = focusTasks.filter((t) => t.completed).length;
  const pendingFocusCount = focusTasks.filter((t) => !t.completed).length;
  const isAtFocusLimit = totalFocusCount >= 3;
  const secondaryTasks = tasks.filter((t) => !t.isFocus);

  // Adicionar nova tarefa com validação estrita do limite de 3 prioridades
  const addTask = async ({ title, project = 'Engenharia', isFocus = false, targetBlocks = 2, note = '' }) => {
    if (!title.trim()) return false;

    if (isFocus && totalFocusCount >= 3) {
      showNotification(
        'Limite de 3 prioridades de hoje atingido. Para focar em uma nova tarefa, transfira uma prioridade atual para a lista secundária.',
        'warning'
      );
      return false;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      project,
      isFocus,
      completed: false,
      pomodoroCount: 0,
      targetBlocks: Number(targetBlocks) || 1,
      note,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    setTasks((prev) => [newTask, ...prev]);

    if (user?.uid) {
      try {
        await taskService.upsertTask(user.uid, newTask);
      } catch (err) {
        console.warn('[TaskContext] Tarefa salva localmente (offline):', err);
      }
    }

    showNotification(`Tarefa adicionada ${isFocus ? 'ao Foco do Dia' : 'à lista secundária'}.`, 'success');
    return true;
  };

  // Toggle task completion
  const toggleTaskComplete = async (taskId) => {
    let targetTask = null;
    let nextCompleted = false;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextCompleted = !t.completed;
          targetTask = {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null
          };

          if (nextCompleted && t.isFocus) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#0D9488', '#14B8A6', '#89F5E7']
            });
          }
          return targetTask;
        }
        return t;
      })
    );

    if (user?.uid && targetTask) {
      try {
        await taskService.updateTaskFields(user.uid, taskId, {
          completed: nextCompleted,
          completedAt: targetTask.completedAt
        });
      } catch (err) {
        console.warn('[TaskContext] Atualização salva em cache offline:', err);
      }
    }
  };

  // Promover tarefa da lista secundária para o Foco do Dia (com validação estrita de 3 vagas)
  const promoteToFocus = async (taskId) => {
    if (totalFocusCount >= 3) {
      showNotification(
        'Limite de 3 prioridades de hoje atingido. Mova uma prioridade atual para a lista secundária para abrir espaço.',
        'warning'
      );
      return false;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isFocus: true } : t))
    );

    if (user?.uid) {
      try {
        await taskService.updateTaskFields(user.uid, taskId, { isFocus: true });
      } catch (err) {
        console.warn('[TaskContext] Atualização em cache offline:', err);
      }
    }

    showNotification('Tarefa definida como uma das 3 prioridades de hoje!', 'success');
    return true;
  };

  // Demote focus task to secondary
  const demoteToSecondary = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isFocus: false } : t))
    );

    if (user?.uid) {
      try {
        await taskService.updateTaskFields(user.uid, taskId, { isFocus: false });
      } catch (err) {
        console.warn('[TaskContext] Atualização em cache offline:', err);
      }
    }

    showNotification('Tarefa movida para a lista secundária. 1 vaga de prioridade liberada!', 'info');
  };

  // Delete task
  const deleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (user?.uid) {
      try {
        await taskService.removeTask(user.uid, taskId);
      } catch (err) {
        console.warn('[TaskContext] Exclusão em cache offline:', err);
      }
    }

    showNotification('Tarefa removida.', 'info');
  };

  // Increment completed pomodoro block for a task
  const incrementTaskPomodoro = async (taskId) => {
    let nextCount = 1;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextCount = (t.pomodoroCount || 0) + 1;
          return { ...t, pomodoroCount: nextCount };
        }
        return t;
      })
    );

    if (user?.uid) {
      try {
        await taskService.updateTaskFields(user.uid, taskId, { pomodoroCount: nextCount });
      } catch (err) {
        console.warn('[TaskContext] Incremento em cache offline:', err);
      }
    }
  };

  // Night Review actions - Operação atômica que garante teto rígido de 3 prioridades
  const finishNightReview = async ({ tomorrowTaskIds = [], completedTaskIds = [], secondaryTaskIds = [] }) => {
    const validTomorrow = tomorrowTaskIds.slice(0, 3);
    const completedSet = new Set(completedTaskIds);
    const tomorrowSet = new Set(validTomorrow);

    let updatedTasks = [];
    setTasks((prev) => {
      updatedTasks = prev.map((t) => {
        if (tomorrowSet.has(t.id)) {
          return { ...t, isFocus: true, completed: false };
        }
        if (completedSet.has(t.id)) {
          return { ...t, completed: true, isFocus: false, completedAt: t.completedAt || new Date().toISOString() };
        }
        // TODAS as outras tarefas do sistema deixam de ser foco para preservar estritamente o limite de 3
        return { ...t, isFocus: false };
      });
      return updatedTasks;
    });

    if (user?.uid) {
      for (const t of updatedTasks) {
        try {
          await taskService.updateTaskFields(user.uid, t.id, {
            isFocus: t.isFocus,
            completed: t.completed,
            ...(t.completedAt ? { completedAt: t.completedAt } : {})
          });
        } catch {
          // Cached in offline persistence
        }
      }
    }

    showNotification('Revisão noturna concluída e prioridades de amanhã salvas (máximo 3)!', 'success');
  };

  const rolloverTasksToTomorrow = async (taskIds) => {
    const validTomorrowIds = taskIds.slice(0, 3);
    const validSet = new Set(validTomorrowIds);

    let updatedTasks = [];
    setTasks((prev) => {
      updatedTasks = prev.map((t) => {
        if (validSet.has(t.id)) {
          return { ...t, isFocus: true, completed: false };
        }
        // Todas as outras tarefas deixam de ser foco para preservar estritamente o limite de 3
        return { ...t, isFocus: false };
      });
      return updatedTasks;
    });

    if (user?.uid) {
      for (const t of updatedTasks) {
        try {
          await taskService.updateTaskFields(user.uid, t.id, {
            isFocus: t.isFocus,
            completed: t.completed
          });
        } catch {
          // Cached in offline persistence
        }
      }
    }

    showNotification('Prioridades de amanhã definidas com sucesso (máximo 3)!', 'success');
  };

  const archiveUnfinishedTasks = async (taskIds) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (taskIds.includes(t.id)) {
          return { ...t, isFocus: false };
        }
        return t;
      })
    );

    if (user?.uid) {
      for (const id of taskIds) {
        try {
          await taskService.updateTaskFields(user.uid, id, { isFocus: false });
        } catch {
          // Cached in offline persistence
        }
      }
    }

    showNotification('Tarefas movidas para o backlog secundário.', 'info');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        focusTasks,
        totalFocusCount,
        completedFocusCount,
        pendingFocusCount,
        isAtFocusLimit,
        activeFocusCount: totalFocusCount,
        secondaryTasks,
        projects,
        setProjects,
        userConfig,
        setUserConfig,
        notification,
        showNotification,
        addTask,
        toggleTaskComplete,
        promoteToFocus,
        demoteToSecondary,
        deleteTask,
        incrementTaskPomodoro,
        rolloverTasksToTomorrow,
        finishNightReview,
        archiveUnfinishedTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
}
