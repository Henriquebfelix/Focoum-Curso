import { functions, isFirebaseConfigured } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

/**
 * Serviço de tarefas desacoplado do front-end:
 * Todas as operações de leitura, escrita e exclusão são delegadas
 * exclusivamente para as rotas do backend serverless (Firebase Cloud Functions).
 */
export const taskService = {
  // Obter tarefas do usuário através da Cloud Function no backend
  async fetchUserTasks(userId) {
    if (!isFirebaseConfigured || !functions || !userId) {
      return [];
    }

    try {
      const getTasksFn = httpsCallable(functions, 'getTasks');
      const response = await getTasksFn();
      return response.data?.tasks || [];
    } catch (err) {
      console.warn('[taskService] Erro ao buscar tarefas no backend:', err);
      return [];
    }
  },

  // Consulta inicial delegada ao backend
  subscribeToUserTasks(userId, onData, onError) {
    if (!isFirebaseConfigured || !functions || !userId) {
      return () => {};
    }

    let active = true;
    this.fetchUserTasks(userId)
      .then((tasks) => {
        if (active && tasks && tasks.length > 0) {
          onData(tasks);
        }
      })
      .catch((err) => {
        if (active && onError) onError(err);
      });

    return () => {
      active = false;
    };
  },

  // Criar ou atualizar tarefa no backend
  async upsertTask(userId, task) {
    if (!isFirebaseConfigured || !functions || !userId) return task;

    try {
      const saveTaskFn = httpsCallable(functions, 'saveTask');
      const response = await saveTaskFn({ task });
      return response.data?.task || task;
    } catch (err) {
      console.warn('[taskService] Erro ao salvar tarefa no backend:', err);
      return task;
    }
  },

  // Atualizar campos específicos de uma tarefa no backend
  async updateTaskFields(userId, taskId, fields) {
    if (!isFirebaseConfigured || !functions || !userId) return;

    try {
      const saveTaskFn = httpsCallable(functions, 'saveTask');
      await saveTaskFn({ task: { id: taskId, ...fields } });
    } catch (err) {
      console.warn('[taskService] Erro ao atualizar tarefa no backend:', err);
    }
  },

  // Remover tarefa no backend
  async removeTask(userId, taskId) {
    if (!isFirebaseConfigured || !functions || !userId) return;

    try {
      const deleteTaskFn = httpsCallable(functions, 'deleteTask');
      await deleteTaskFn({ taskId });
    } catch (err) {
      console.warn('[taskService] Erro ao remover tarefa no backend:', err);
    }
  }
};
