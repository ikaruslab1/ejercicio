import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RestTimerBar } from './components/layout/RestTimerBar';
import { LiveWorkoutModal } from './components/workout/LiveWorkoutModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoutineView } from './components/workout/RoutineView';
import { PRTrackerView } from './components/prs/PRTrackerView';
import { HistoryView } from './components/history/HistoryView';
import { NutritionView } from './components/nutrition/NutritionView';
import { OptimizationView } from './components/optimization/OptimizationView';
import { ContingencyView } from './components/contingency/ContingencyView';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useWorkout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contingencySearchQuery, setContingencySearchQuery] = useState('');

  const handleOpenContingencyWithExercise = (exerciseName: string) => {
    setContingencySearchQuery(exerciseName);
    setActiveTab('contingency');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex">
      {/* Sidebar Desktop & Drawer Mobile */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky App Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic Route/View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab.startsWith('d') && (
            <RoutineView 
              dayId={activeTab} 
              onOpenContingencyWithExercise={handleOpenContingencyWithExercise}
            />
          )}
          {activeTab === 'prs' && <PRTrackerView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'nutrition' && <NutritionView />}
          {activeTab === 'optimization' && <OptimizationView />}
          {activeTab === 'contingency' && (
            <ContingencyView initialSearchQuery={contingencySearchQuery} />
          )}

          {/* Inspirational UNAM & Mead Footer */}
          <footer className="mt-16 pt-8 border-t border-zinc-900 text-center text-zinc-500 text-xs sm:text-sm">
            <p className="max-w-2xl mx-auto leading-relaxed">
              Para rendir en la investigación, dar tus clases con excelencia en la UNAM y experimentar con tus hidromieles por las noches, el cuerpo debe responder.
              <br />
              <span className="text-yellow-500/90 font-mono font-bold mt-2 inline-block uppercase tracking-wider">
                ⚡ La adherencia supera a la perfección.
              </span>
            </p>
          </footer>
        </main>
      </div>

      {/* Global Modals & Floating Rest Timer */}
      <LiveWorkoutModal />
      <RestTimerBar />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <MainLayout />
    </WorkoutProvider>
  );
}
