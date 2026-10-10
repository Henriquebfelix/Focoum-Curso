import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

/**
 * Helper para validar se o usuário está autenticado
 */
function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Ação permitida apenas para usuários autenticados.');
  }
  return request.auth.uid;
}

/**
 * Backend: Obter tarefas do usuário
 */
export const getTasks = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const tasksRef = db.collection('users').doc(uid).collection('tasks');
  const snapshot = await tasksRef.orderBy('createdAt', 'desc').get();

  const tasks = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  return { success: true, tasks };
});

/**
 * Backend: Criar ou atualizar tarefa
 */
export const saveTask = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const task = request.data?.task;

  if (!task || !task.id || !task.title) {
    throw new HttpsError('invalid-argument', 'Dados da tarefa inválidos ou incompletos.');
  }

  // Se a tarefa for marcada como prioridade ativa, valida o limite de 3 no backend
  if (task.isFocus && !task.completed) {
    const tasksRef = db.collection('users').doc(uid).collection('tasks');
    const activeSnapshot = await tasksRef
      .where('isFocus', '==', true)
      .where('completed', '==', false)
      .get();

    const otherActive = activeSnapshot.docs.filter((docSnap) => docSnap.id !== task.id);
    if (otherActive.length >= 3) {
      throw new HttpsError('failed-precondition', 'Limite de 3 prioridades do dia já foi atingido no servidor.');
    }
  }

  const cleanData = {
    title: String(task.title).trim(),
    project: task.project || 'Geral',
    isFocus: Boolean(task.isFocus),
    completed: Boolean(task.completed),
    pomodoroCount: Number(task.pomodoroCount) || 0,
    targetBlocks: Number(task.targetBlocks) || 1,
    note: task.note ? String(task.note).trim() : '',
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null,
    updatedAt: new Date().toISOString()
  };

  const taskDocRef = db.collection('users').doc(uid).collection('tasks').doc(task.id);
  await taskDocRef.set(cleanData, { merge: true });

  return { success: true, task: { id: task.id, ...cleanData } };
});

/**
 * Backend: Deletar tarefa
 */
export const deleteTask = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const taskId = request.data?.taskId;

  if (!taskId) {
    throw new HttpsError('invalid-argument', 'ID da tarefa obrigatório.');
  }

  const taskDocRef = db.collection('users').doc(uid).collection('tasks').doc(taskId);
  await taskDocRef.delete();

  return { success: true, taskId };
});

/**
 * Backend: Obter histórico de sessões de foco dos últimos 30 dias
 */
export const getSessions = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const sessionsRef = db.collection('users').doc(uid).collection('sessions');
  const snapshot = await sessionsRef.orderBy('timestamp', 'desc').limit(100).get();

  const sessions = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  return { success: true, sessions };
});

/**
 * Backend: Registrar nova sessão de foco concluída
 */
export const saveSession = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const session = request.data?.session;

  if (!session || !session.id) {
    throw new HttpsError('invalid-argument', 'Dados da sessão incompletos.');
  }

  const cleanData = {
    taskId: session.taskId || null,
    taskTitle: session.taskTitle || 'Foco Avulso',
    project: session.project || 'Geral',
    durationMinutes: Number(session.durationMinutes) || 25,
    durationSeconds: Number(session.durationSeconds) || (Number(session.durationMinutes) || 25) * 60,
    timestamp: session.timestamp || new Date().toISOString(),
    completed: session.completed !== undefined ? Boolean(session.completed) : true,
    createdAt: new Date().toISOString()
  };

  const sessionDocRef = db.collection('users').doc(uid).collection('sessions').doc(session.id);
  await sessionDocRef.set(cleanData, { merge: true });

  // Se a sessão está vinculada a uma tarefa, incrementa no backend
  if (session.taskId) {
    const taskDocRef = db.collection('users').doc(uid).collection('tasks').doc(session.taskId);
    await taskDocRef.set({
      pomodoroCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  return { success: true, session: { id: session.id, ...cleanData } };
});

/**
 * Backend: Migração de dados locais (rollover) para nuvem
 */
export const migrateUserData = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const { tasks = [], sessions = [] } = request.data || {};

  const batch = db.batch();

  for (const task of tasks) {
    if (task && task.id) {
      const taskRef = db.collection('users').doc(uid).collection('tasks').doc(task.id);
      batch.set(taskRef, {
        title: task.title || 'Sem título',
        project: task.project || 'Geral',
        isFocus: Boolean(task.isFocus),
        completed: Boolean(task.completed),
        pomodoroCount: Number(task.pomodoroCount) || 0,
        targetBlocks: Number(task.targetBlocks) || 1,
        note: task.note || '',
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  }

  for (const session of sessions) {
    if (session && session.id) {
      const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(session.id);
      batch.set(sessionRef, {
        taskId: session.taskId || null,
        taskTitle: session.taskTitle || 'Foco',
        project: session.project || 'Geral',
        durationMinutes: Number(session.durationMinutes) || 25,
        durationSeconds: Number(session.durationSeconds) || 1500,
        timestamp: session.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  }

  await batch.commit();

  return { success: true, migratedTasks: tasks.length, migratedSessions: sessions.length };
});
