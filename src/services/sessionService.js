import { functions, isFirebaseConfigured } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

/**
 * Serviço de sessões de foco desacoplado do front-end:
 * Leitura e gravação de blocos de foco delegadas exclusivamente
 * para o backend serverless (Firebase Cloud Functions).
 */
export const sessionService = {
  // Obter sessões do usuário através da Cloud Function no backend
  async fetchUserSessions(userId) {
    if (!isFirebaseConfigured || !functions || !userId) {
      return [];
    }

    try {
      const getSessionsFn = httpsCallable(functions, 'getSessions');
      const response = await getSessionsFn();
      return response.data?.sessions || [];
    } catch (err) {
      console.warn('[sessionService] Erro ao buscar sessões no backend:', err);
      return [];
    }
  },

  // Consulta inicial delegada ao backend
  subscribeToUserSessions(userId, onData, onError) {
    if (!isFirebaseConfigured || !functions || !userId) {
      return () => {};
    }

    let active = true;
    this.fetchUserSessions(userId)
      .then((sessions) => {
        if (active && sessions && sessions.length > 0) {
          onData(sessions);
        }
      })
      .catch((err) => {
        if (active && onError) onError(err);
      });

    return () => {
      active = false;
    };
  },

  // Registrar nova sessão de foco concluída no backend
  async recordSession(userId, session) {
    if (!isFirebaseConfigured || !functions || !userId) return session;

    try {
      const saveSessionFn = httpsCallable(functions, 'saveSession');
      const response = await saveSessionFn({ session });
      return response.data?.session || session;
    } catch (err) {
      console.warn('[sessionService] Erro ao registrar sessão no backend:', err);
      return session;
    }
  }
};
