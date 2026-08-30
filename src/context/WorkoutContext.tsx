import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  WorkoutSession, 
  PersonalRecord, 
  UserProfile, 
  MuscleGroup, 
  WorkoutExerciseLog 
} from '../types/workout';
import { routineData } from '../data/routineData';
import confetti from 'canvas-confetti';

interface RestTimerState {
  isRunning: boolean;
  remainingSeconds: number;
  initialSeconds: number;
  exerciseName?: string;
}

interface ActiveSessionState {
  dayId: string;
  startTime: string;
  elapsedSeconds: number;
  exercises: WorkoutExerciseLog[];
}

interface WorkoutContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  completedExercises: Record<string, boolean>;
  toggleExerciseCompletion: (dayId: string, exerciseId: string) => void;
  
  // Active Workout Mode
  activeSession: ActiveSessionState | null;
  startLiveWorkout: (dayId: string) => void;
  finishLiveWorkout: (notes?: string, rating?: number) => void;
  cancelLiveWorkout: () => void;
  updateLiveSet: (exerciseId: string, setIndex: number, weight: number, reps: number, rir?: number, completed?: boolean) => void;
  addLiveSet: (exerciseId: string) => void;
  removeLiveSet: (exerciseId: string, setIndex: number) => void;

  // PRs / Tops
  personalRecords: Record<string, PersonalRecord>;
  recordPR: (exerciseId: string, exerciseName: string, muscleGroup: MuscleGroup, weight: number, reps: number, customDate?: string) => { isNewPR: boolean; old1RM: number; new1RM: number };
  deletePR: (exerciseId: string) => void;

  // Workout History
  workoutHistory: WorkoutSession[];
  deleteWorkoutSession: (sessionId: string) => void;

  // Rest Timer
  restTimer: RestTimerState;
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  resetRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;

  // Profile & Nutrición
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Backup & Restore
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // Live Modal Controls
  isLiveModalOpen: boolean;
  setIsLiveModalOpen: (open: boolean) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Formulas para 1RM
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  // Formula de Epley
  const epley = weight * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Ikaru (UNAM)',
  age: 27,
  weightKg: 90,
  heightCm: 175,
  goal: 'hipertrofia_limpia',
  activityFactor: 1.55,
};

// Seed initial PRs for the exercises from routine data so the app isn't empty on day 1
const INITIAL_PRS: Record<string, PersonalRecord> = {
  '1-1': {
    exerciseId: '1-1',
    exerciseName: 'Chest Press',
    muscleGroup: 'Pectorales',
    maxWeight: 75,
    repsAtMaxWeight: 8,
    estimated1RM: calculate1RM(75, 8),
    achievedDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    history: [
      { date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], weight: 70, reps: 10, estimated1RM: calculate1RM(70, 10) },
      { date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], weight: 75, reps: 8, estimated1RM: calculate1RM(75, 8) }
    ]
  },
  '2-1': {
    exerciseId: '2-1',
    exerciseName: 'Lat Pulldown',
    muscleGroup: 'Espalda',
    maxWeight: 68,
    repsAtMaxWeight: 10,
    estimated1RM: calculate1RM(68, 10),
    achievedDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    history: [
      { date: new Date(Date.now() - 13 * 86400000).toISOString().split('T')[0], weight: 63.5, reps: 12, estimated1RM: calculate1RM(63.5, 12) },
      { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], weight: 68, reps: 10, estimated1RM: calculate1RM(68, 10) }
    ]
  },
  '4-1': {
    exerciseId: '4-1',
    exerciseName: 'Linear Hack Squat',
    muscleGroup: 'Piernas',
    maxWeight: 120,
    repsAtMaxWeight: 8,
    estimated1RM: calculate1RM(120, 8),
    achievedDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    history: [
      { date: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0], weight: 110, reps: 10, estimated1RM: calculate1RM(110, 10) },
      { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], weight: 120, reps: 8, estimated1RM: calculate1RM(120, 8) }
    ]
  },
  '3-1': {
    exerciseId: '3-1',
    exerciseName: 'Shoulder Press',
    muscleGroup: 'Hombros',
    maxWeight: 45,
    repsAtMaxWeight: 10,
    estimated1RM: calculate1RM(45, 10),
    achievedDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    history: [
      { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], weight: 45, reps: 10, estimated1RM: calculate1RM(45, 10) }
    ]
  },
  '5-1': {
    exerciseId: '5-1',
    exerciseName: 'Copa con Mancuerna',
    muscleGroup: 'Brazos',
    maxWeight: 28,
    repsAtMaxWeight: 12,
    estimated1RM: calculate1RM(28, 12),
    achievedDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    history: [
      { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], weight: 28, reps: 12, estimated1RM: calculate1RM(28, 12) }
    ]
  }
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('sf_active_tab') || 'dashboard';
  });

  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sf_completed_exercises');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [personalRecords, setPersonalRecords] = useState<Record<string, PersonalRecord>>(() => {
    try {
      const saved = localStorage.getItem('sf_personal_records');
      return saved ? JSON.parse(saved) : INITIAL_PRS;
    } catch {
      return INITIAL_PRS;
    }
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem('sf_workout_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sf_user_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(() => {
    try {
      const saved = localStorage.getItem('sf_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(false);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isRunning: false,
    remainingSeconds: 0,
    initialSeconds: 90,
    exerciseName: undefined
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('sf_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sf_completed_exercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem('sf_personal_records', JSON.stringify(personalRecords));
  }, [personalRecords]);

  useEffect(() => {
    localStorage.setItem('sf_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem('sf_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('sf_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('sf_active_session');
    }
  }, [activeSession]);

  // Active workout elapsed timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeSession) {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession !== null]);

  // Rest Timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (restTimer.isRunning && restTimer.remainingSeconds > 0) {
      timer = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            // Sound beep or notification
            try {
              const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.35);
            } catch (e) {
              console.warn('Audio not supported:', e);
            }

            return {
              ...prev,
              isRunning: false,
              remainingSeconds: 0
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [restTimer.isRunning, restTimer.remainingSeconds]);

  const toggleExerciseCompletion = (dayId: string, exerciseId: string) => {
    const key = `${dayId}-${exerciseId}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const startLiveWorkout = (dayId: string) => {
    const day = routineData[dayId];
    if (!day) return;

    const initialExercises: WorkoutExerciseLog[] = day.exercises.map(ex => {
      // Look up previous PR or default weight
      const currentPr = personalRecords[ex.id];
      const defaultWeight = currentPr ? currentPr.maxWeight : 20;

      const sets = Array.from({ length: ex.targetSets }).map((_, i) => ({
        setNumber: i + 1,
        weight: defaultWeight,
        reps: 10,
        rir: Number(ex.rir) || 2,
        completed: false,
        timestamp: new Date().toISOString()
      }));

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        machine: ex.machine,
        sets
      };
    });

    const newSession: ActiveSessionState = {
      dayId,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      exercises: initialExercises
    };

    setActiveSession(newSession);
    setIsLiveModalOpen(true);
  };

  const updateLiveSet = (
    exerciseId: string, 
    setIndex: number, 
    weight: number, 
    reps: number, 
    rir?: number, 
    completed?: boolean
  ) => {
    if (!activeSession) return;

    setActiveSession(prev => {
      if (!prev) return null;
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;

        const updatedSets = [...ex.sets];
        const oldSet = updatedSets[setIndex] || { setNumber: setIndex + 1, timestamp: new Date().toISOString() };
        
        const isNowCompleted = completed !== undefined ? completed : oldSet.completed;

        updatedSets[setIndex] = {
          ...oldSet,
          weight: Math.max(0, weight),
          reps: Math.max(0, reps),
          rir: rir !== undefined ? rir : oldSet.rir,
          completed: isNowCompleted,
          timestamp: new Date().toISOString()
        };

        return { ...ex, sets: updatedSets };
      });

      return {
        ...prev,
        exercises: updatedExercises
      };
    });

    // Check if set is completed and might trigger PR or rest timer
    if (completed) {
      // Auto-start rest timer
      startRestTimer(90);
    }
  };

  const addLiveSet = (exerciseId: string) => {
    if (!activeSession) return;
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNumber: newSetNumber,
              weight: lastSet ? lastSet.weight : 20,
              reps: lastSet ? lastSet.reps : 10,
              rir: lastSet ? lastSet.rir : 2,
              completed: false,
              timestamp: new Date().toISOString()
            }
          ]
        };
      });
      return { ...prev, exercises: updated };
    });
  };

  const removeLiveSet = (exerciseId: string, setIndex: number) => {
    if (!activeSession) return;
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const filtered = ex.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
          ...s,
          setNumber: idx + 1
        }));
        return { ...ex, sets: filtered };
      });
      return { ...prev, exercises: updated };
    });
  };

  const recordPR = (
    exerciseId: string, 
    exerciseName: string, 
    muscleGroup: MuscleGroup, 
    weight: number, 
    reps: number,
    customDate?: string
  ) => {
    const calculated1RM = calculate1RM(weight, reps);
    const dateStr = customDate || new Date().toISOString().split('T')[0];
    const existing = personalRecords[exerciseId];

    let isNewPR = false;
    let old1RM = existing ? existing.estimated1RM : 0;

    if (!existing || calculated1RM > existing.estimated1RM || (calculated1RM === existing.estimated1RM && weight > existing.maxWeight)) {
      isNewPR = true;
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }
    }

    const historyEntry = {
      date: dateStr,
      weight,
      reps,
      estimated1RM: calculated1RM
    };

    const newPRRecord: PersonalRecord = {
      exerciseId,
      exerciseName,
      muscleGroup,
      maxWeight: isNewPR ? weight : (existing ? existing.maxWeight : weight),
      repsAtMaxWeight: isNewPR ? reps : (existing ? existing.repsAtMaxWeight : reps),
      estimated1RM: isNewPR ? calculated1RM : (existing ? existing.estimated1RM : calculated1RM),
      achievedDate: isNewPR ? dateStr : (existing ? existing.achievedDate : dateStr),
      history: existing ? [...existing.history, historyEntry] : [historyEntry]
    };

    setPersonalRecords(prev => ({
      ...prev,
      [exerciseId]: newPRRecord
    }));

    return { isNewPR, old1RM, new1RM: calculated1RM };
  };

  const deletePR = (exerciseId: string) => {
    setPersonalRecords(prev => {
      const copy = { ...prev };
      delete copy[exerciseId];
      return copy;
    });
  };

  const finishLiveWorkout = (notes?: string, rating: number = 5) => {
    if (!activeSession) return;

    const day = routineData[activeSession.dayId];
    let totalVolume = 0;
    let totalSetsCount = 0;

    // Check PRs on all completed sets
    activeSession.exercises.forEach(exLog => {
      const exerciseDef = day?.exercises.find(e => e.id === exLog.exerciseId);
      const muscleGroup = exerciseDef?.muscleGroup || 'Full Body';

      exLog.sets.forEach(s => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          totalVolume += s.weight * s.reps;
          totalSetsCount += 1;
          // Auto evaluate PR
          recordPR(exLog.exerciseId, exLog.exerciseName, muscleGroup, s.weight, s.reps);
        }
      });
    });

    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      dayId: activeSession.dayId,
      dayTitle: day ? day.title : 'Sesión Personalizada',
      startTime: activeSession.startTime,
      endTime: new Date().toISOString(),
      durationSeconds: activeSession.elapsedSeconds,
      exercises: activeSession.exercises,
      totalVolumeKg: totalVolume,
      totalSetsCompleted: totalSetsCount,
      notes,
      rating
    };

    setWorkoutHistory(prev => [session, ...prev]);

    // Mark exercises as completed for today
    if (day) {
      day.exercises.forEach(ex => {
        setCompletedExercises(prev => ({
          ...prev,
          [`${day.id}-${ex.id}`]: true
        }));
      });
    }

    setActiveSession(null);
    setIsLiveModalOpen(false);

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch {
      // confetti fallback
    }
  };

  const cancelLiveWorkout = () => {
    if (window.confirm('¿Seguro que deseas cancelar la sesión actual? Se descartarán los registros no guardados.')) {
      setActiveSession(null);
      setIsLiveModalOpen(false);
      resetRestTimer();
    }
  };

  const deleteWorkoutSession = (sessionId: string) => {
    setWorkoutHistory(prev => prev.filter(s => s.id !== sessionId));
  };

  // Rest Timer handlers
  const startRestTimer = (seconds: number, exerciseName?: string) => {
    setRestTimer({
      isRunning: true,
      remainingSeconds: seconds,
      initialSeconds: seconds,
      exerciseName
    });
  };

  const pauseRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resumeRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isRunning: true }));
  };

  const resetRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isRunning: false, remainingSeconds: 0 }));
  };

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimer(prev => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + deltaSeconds)
    }));
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const exportDataJSON = () => {
    const backupData = {
      version: '2.0-acsm2026',
      exportedAt: new Date().toISOString(),
      userProfile,
      personalRecords,
      workoutHistory,
      completedExercises
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (parsed.personalRecords) setPersonalRecords(parsed.personalRecords);
      if (parsed.workoutHistory) setWorkoutHistory(parsed.workoutHistory);
      if (parsed.completedExercises) setCompletedExercises(parsed.completedExercises);
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  };

  const resetAllData = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a los valores iniciales?')) {
      setUserProfile(INITIAL_PROFILE);
      setPersonalRecords(INITIAL_PRS);
      setWorkoutHistory([]);
      setCompletedExercises({});
      setActiveSession(null);
      resetRestTimer();
    }
  };

  return (
    <WorkoutContext.Provider value={{
      activeTab,
      setActiveTab,
      completedExercises,
      toggleExerciseCompletion,
      activeSession,
      startLiveWorkout,
      finishLiveWorkout,
      cancelLiveWorkout,
      updateLiveSet,
      addLiveSet,
      removeLiveSet,
      personalRecords,
      recordPR,
      deletePR,
      workoutHistory,
      deleteWorkoutSession,
      restTimer,
      startRestTimer,
      pauseRestTimer,
      resumeRestTimer,
      resetRestTimer,
      adjustRestTimer,
      userProfile,
      updateUserProfile,
      exportDataJSON,
      importDataJSON,
      resetAllData,
      isLiveModalOpen,
      setIsLiveModalOpen
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
