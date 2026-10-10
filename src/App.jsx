import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { TimerProvider } from './context/TimerContext';
import Header from './components/layout/Header';
import Toast from './components/common/Toast';
import NewTaskModal from './components/tasks/NewTaskModal';

// Screens
import HomeScreen from './screens/HomeScreen';
import FocusSessionScreen from './screens/FocusSessionScreen';
import NightReviewScreen from './screens/NightReviewScreen';
import WeeklyAnalyticsScreen from './screens/WeeklyAnalyticsScreen';
import OnboardingScreen from './screens/OnboardingScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('screen') || 'home';
    }
    return 'home';
  });
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('modal') === 'new-task';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-[#151C27] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200">
      {/* Global Header */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 md:pt-24 pb-16">
        {currentScreen === 'home' && (
          <HomeScreen
            onOpenFocusSession={() => setCurrentScreen('focus')}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNightReview={() => setCurrentScreen('night')}
          />
        )}

        {currentScreen === 'focus' && (
          <FocusSessionScreen onClose={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'night' && (
          <NightReviewScreen
            onClose={() => setCurrentScreen('home')}
            onGoToHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'weekly' && <WeeklyAnalyticsScreen />}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={() => setCurrentScreen('home')} />
        )}
      </main>

      {/* Modals & Overlays */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />

      <Toast />

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 dark:border-[#243048]/80 py-6 text-center text-xs text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D9488]" aria-hidden="true"></span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">FocoUm</span>
            <span>— Atenção intencional, um foco por vez</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setCurrentScreen('onboarding')}
              className="hover:underline hover:text-[#0D9488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded p-1"
            >
              Configurações
            </button>
            <button
              onClick={() => setCurrentScreen('night')}
              className="hover:underline hover:text-[#0D9488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded p-1"
            >
              Revisão Noturna
            </button>
            <button
              onClick={() => setCurrentScreen('weekly')}
              className="hover:underline hover:text-[#0D9488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded p-1"
            >
              Visão Semanal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
