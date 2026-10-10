import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useTasks } from './TaskContext';
import { useAuth } from './AuthContext';
import { sessionService } from '../services/sessionService';

const TimerContext = createContext();

const INITIAL_SESSIONS = [
  { id: 's-1', taskId: 't-1', taskTitle: 'Arquitetura do Design System', project: 'Engenharia', durationMinutes: 25, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 's-2', taskId: 't-1', taskTitle: 'Arquitetura do Design System', project: 'Engenharia', durationMinutes: 25, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 's-3', taskId: 't-3', taskTitle: 'Revisão bibliográfica para tese', project: 'Estudos', durationMinutes: 25, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 's-4', taskId: 't-3', taskTitle: 'Revisão bibliográfica para tese', project: 'Estudos', durationMinutes: 25, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 's-5', taskId: 't-2', taskTitle: 'Validação de endpoints da API', project: 'Engenharia', durationMinutes: 25, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 's-6', taskId: 't-sec-1', taskTitle: 'Estruturação de Wireframes', project: 'Design', durationMinutes: 25, timestamp: new Date(Date.now() - 86400000 * 4).toISOString() }
];

export function TimerProvider({ children }) {
  const { tasks, projects, incrementTaskPomodoro, showNotification } = useTasks();
  const { user } = useAuth();

  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [durationMap] = useState({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  });

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(() => {
    const firstActive = tasks.find((t) => (t.isFocus || t.type === 'foco') && !t.completed);
    return firstActive ? firstActive.id : (tasks[0]?.id || null);
  });

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('focoum_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const timerRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const elapsedSecondsRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('focoum_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Subscribe to cloud sessions when user is logged in
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = sessionService.subscribeToUserSessions(
      user.uid,
      (cloudSessions) => {
        if (cloudSessions && cloudSessions.length > 0) {
          const normalized = cloudSessions.map((s) => {
            const rawDate = s.endedAt || s.startedAt || s.timestamp;
            const dateObj = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate || Date.now());
            const durationSec = s.durationSeconds || (s.durationMinutes ? s.durationMinutes * 60 : 1500);
            return {
              ...s,
              durationSeconds: durationSec,
              durationMinutes: Math.max(1, Math.round(durationSec / 60)),
              timestamp: dateObj.toISOString(),
              project: s.project || s.projectId || 'Geral'
            };
          });
          setSessions(normalized);
        }
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Keep active task valid if tasks change
  useEffect(() => {
    if (!activeTaskId && tasks.length > 0) {
      const firstFocus = tasks.find((t) => t.isFocus && !t.completed);
      setActiveTaskId(firstFocus ? firstFocus.id : tasks[0].id);
    }
  }, [tasks, activeTaskId]);

  // Audio chime using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (mode === 'focus') {
          elapsedSecondsRef.current += 1;
        }
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            setTimeout(() => {
              handleTimerComplete();
            }, 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerRef.current = interval;
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activeTaskId]);

  const handleTimerComplete = async () => {
    playChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#14B8A6', '#4FDCB8', '#111827']
    });

    if (mode === 'focus') {
      const currentTask = tasks.find((t) => t.id === activeTaskId);
      const matchedProj = projects?.find(
        (p) => p.id === currentTask?.projectId || p.name === currentTask?.project || p.id === currentTask?.project
      );
      const targetProjectId = currentTask?.projectId || matchedProj?.id || currentTask?.project || 'eng';

      const endedAt = new Date();
      const measuredSeconds = elapsedSecondsRef.current;
      const durationSeconds = measuredSeconds >= 5 ? Math.min(14400, measuredSeconds) : durationMap.focus;
      const startedAt =
        sessionStartTimeRef.current && sessionStartTimeRef.current < endedAt
          ? sessionStartTimeRef.current
          : new Date(endedAt.getTime() - durationSeconds * 1000);

      const newSession = {
        id: `sess-${Date.now()}`,
        taskId: activeTaskId || 'generic',
        projectId: targetProjectId,
        taskTitle: currentTask ? currentTask.title : 'Foco Avulso',
        project: matchedProj?.name || currentTask?.project || 'Geral',
        startedAt,
        endedAt,
        durationSeconds,
        durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
        timestamp: endedAt.toISOString(),
        status: 'completed'
      };

      setSessions((prev) => [newSession, ...prev]);

      if (user?.uid) {
        try {
          await sessionService.recordSession(user.uid, {
            taskId: activeTaskId || 'generic',
            projectId: targetProjectId,
            taskTitle: currentTask ? currentTask.title : 'Foco Avulso',
            startedAt,
            endedAt,
            durationSeconds,
            status: 'completed'
          });
        } catch (err) {
          console.warn('[TimerContext] Sessão salva em cache local:', err);
        }
      }

      sessionStartTimeRef.current = null;
      elapsedSecondsRef.current = 0;

      if (activeTaskId) {
        incrementTaskPomodoro(activeTaskId);
      }

      showNotification('Sessão de foco concluída! Hora de uma pausa revigorante.', 'success');
      switchMode('shortBreak');
    } else {
      showNotification('Pausa finalizada. Pronto para retomar a atenção plena?', 'info');
      switchMode('focus');
    }
  };

  const startTimer = () => {
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    sessionStartTimeRef.current = null;
    elapsedSecondsRef.current = 0;
    setTimeLeft(durationMap[mode]);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    sessionStartTimeRef.current = null;
    elapsedSecondsRef.current = 0;
    setMode(newMode);
    setTimeLeft(durationMap[newMode]);
  };

  const completeSessionManually = () => {
    // Conclui a sessão corrente e transiciona para o próximo modo sem sobrescrever o tempo
    handleTimerComplete();
  };

  // Helper formatting mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(
    ((durationMap[mode] - timeLeft) / durationMap[mode]) * 100
  );

  const isPaused = !isRunning && timeLeft < durationMap[mode] && timeLeft > 0;
  const isInitial = !isRunning && timeLeft === durationMap[mode];

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        durationMap,
        isRunning,
        isPaused,
        isInitial,
        activeTaskId,
        activeTask,
        sessions,
        progressPercentage,
        startTimer,
        pauseTimer,
        resetTimer,
        switchMode,
        setActiveTaskId,
        completeSessionManually,
        formatTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
}
