import React from 'react';
import { useTasks } from '../../context/TaskContext';

export default function Toast() {
  const { notification } = useTasks();

  if (!notification) return null;

  const isWarning = notification.type === 'warning';
  const isSuccess = notification.type === 'success';

  return (
    <div
      role={isWarning ? 'alert' : 'status'}
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in transition-all"
    >
      <div
        className={`px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 backdrop-blur-md ${
          isWarning
            ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : isSuccess
            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-white/95 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5" aria-hidden="true">
          {isWarning ? 'info' : isSuccess ? 'check_circle' : 'notifications'}
        </span>
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
