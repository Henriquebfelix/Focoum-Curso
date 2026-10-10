import { functions, isFirebaseConfigured } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

/**
 * Serviço de migração desacoplado do front-end:
 * O envio dos dados legados locais para o banco é processado em lote
 * pelo backend serverless via Cloud Functions.
 */
export const migrationService = {
  async migrateLocalDataToCloud(userId) {
    if (!isFirebaseConfigured || !functions || !userId) return false;

    const migrationKey = `focoum_migrated_${userId}`;
    if (localStorage.getItem(migrationKey)) {
      return false; // Já migrado para este usuário
    }

    try {
      // Ler tarefas locais
      const localTasksStr = localStorage.getItem('focoum_tasks');
      const localTasks = localTasksStr ? JSON.parse(localTasksStr) : [];

      // Ler sessões locais
      const localSessionsStr = localStorage.getItem('focoum_sessions');
      const localSessions = localSessionsStr ? JSON.parse(localSessionsStr) : [];

      if (localTasks.length === 0 && localSessions.length === 0) {
        localStorage.setItem(migrationKey, 'true');
        return false;
      }

      // Envia os dados para a Cloud Function no backend processar e gravar no banco
      const migrateFn = httpsCallable(functions, 'migrateUserData');
      await migrateFn({ tasks: localTasks, sessions: localSessions });

      localStorage.setItem(migrationKey, 'true');
      console.info(`[migrationService] Migração de ${localTasks.length} tarefas e ${localSessions.length} sessões concluída com sucesso via backend.`);
      return true;
    } catch (err) {
      console.warn('[migrationService] Falha ao processar migração no backend:', err);
      return false;
    }
  }
};
