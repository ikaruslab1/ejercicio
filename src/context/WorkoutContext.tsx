import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  WorkoutSession, 
  PersonalRecord, 
  UserProfile, 
  MuscleGroup, 
  WorkoutExerciseLog,
  BodyWeightLog
} from '../types/workout';
import { routineData } from '../data/routineData';
import confetti from 'canvas-confetti';
import {
  checkNeonHealth,
  cloudFetchProfile,
  cloudSaveProfile,
  cloudFetchPRs,
  cloudSavePR,
  cloudDeletePR,
  cloudFetchWorkoutHistory,
  cloudSaveWorkoutSession,
  cloudDeleteWorkoutSession,
  cloudFetchBodyWeightLogs,
  cloudSaveBodyWeightLog,
  cloudDeleteBodyWeightLog
} from '../lib/neon';

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

  // Body Weight Logs
  bodyWeightLogs: BodyWeightLog[];
  addBodyWeightLog: (weightKg: number, date?: string, notes?: string) => void;
  deleteBodyWeightLog: (id: string) => void;

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

  // Cloud Sync (Neon PostgreSQL)
  isCloudConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncWithNeonCloud: () => Promise<boolean>;

  // Backup & Restore
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  exportDataCSV: (startDate?: string, endDate?: string, type?: 'workouts' | 'bodyweight' | 'all') => void;
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

const INITIAL_BW_LOGS: BodyWeightLog[] = [
  {
    id: 'bw_seed_1',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weightKg: 91.5,
    notes: 'Inicio de seguimiento'
  },
  {
    id: 'bw_seed_2',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    weightKg: 90.8,
    notes: 'En ayunas'
  },
  {
    id: 'bw_seed_3',
    date: new Date().toISOString().split('T')[0],
    weightKg: 90.0,
    notes: 'Calibración actual'
  }
];

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

  const [bodyWeightLogs, setBodyWeightLogs] = useState<BodyWeightLog[]>(() => {
    try {
      const saved = localStorage.getItem('sf_body_weight_logs');
      return saved ? JSON.parse(saved) : INITIAL_BW_LOGS;
    } catch {
      return INITIAL_BW_LOGS;
    }
  });

  // Active Live Workout Session state with Crash-Resistant Reload Restoration
  const [activeSession, setActiveSession] = useState<ActiveSessionState | null>(() => {
    try {
      const saved = localStorage.getItem('sf_active_session');
      if (!saved) return null;
      const parsed: ActiveSessionState = JSON.parse(saved);
      // Recalculate accurate elapsed seconds since start
      if (parsed.startTime) {
        const startTimestamp = new Date(parsed.startTime).getTime();
        if (!isNaN(startTimestamp)) {
          parsed.elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Auto restore modal state if there is an active workout
  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(() => {
    try {
      const hasActiveSession = !!localStorage.getItem('sf_active_session');
      if (hasActiveSession) return true;
      return localStorage.getItem('sf_is_live_modal_open') === 'true';
    } catch {
      return false;
    }
  });

  // Cloud Sync State (Neon PostgreSQL)
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('sf_last_synced_at') || null;
  });

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isRunning: false,
    remainingSeconds: 0,
    initialSeconds: 90,
    exerciseName: undefined
  });

  // Save changes to LocalStorage immediately
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
    localStorage.setItem('sf_body_weight_logs', JSON.stringify(bodyWeightLogs));
  }, [bodyWeightLogs]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('sf_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('sf_active_session');
    }
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('sf_is_live_modal_open', String(isLiveModalOpen));
  }, [isLiveModalOpen]);

  // Window beforeunload prompt if in active workout
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeSession) {
        e.preventDefault();
        e.returnValue = 'Tienes un entrenamiento en curso. ¿Deseas salir?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeSession]);

  // Active workout elapsed timer (Calculates from startTime so page reloads never lose time)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeSession) {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          const startTimestamp = new Date(prev.startTime).getTime();
          const elapsed = isNaN(startTimestamp) 
            ? prev.elapsedSeconds + 1 
            : Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
          return {
            ...prev,
            elapsedSeconds: elapsed
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession?.startTime]);

  // Rest timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (restTimer.isRunning && restTimer.remainingSeconds > 0) {
      timer = setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            // Play acoustic beep using Web Audio API
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } catch {
              // audio fallback
            }

            return { ...prev, isRunning: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [restTimer.isRunning, restTimer.remainingSeconds]);

  // Sync with Neon Cloud
  const syncWithNeonCloud = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const health = await checkNeonHealth();
      if (!health.ok) {
        setIsCloudConnected(false);
        setIsSyncing(false);
        return false;
      }
      setIsCloudConnected(true);

      // Fetch cloud data
      const [cloudPrs, cloudHistory, cloudProfile, cloudBw] = await Promise.all([
        cloudFetchPRs(),
        cloudFetchWorkoutHistory(),
        cloudFetchProfile(),
        cloudFetchBodyWeightLogs()
      ]);

      // Set Cloud PRs as authoritative
      if (cloudPrs && Object.keys(cloudPrs).length > 0) {
        setPersonalRecords(cloudPrs);
        localStorage.setItem('sf_personal_records', JSON.stringify(cloudPrs));
      } else if (Object.keys(personalRecords).length > 0) {
        Object.values(personalRecords).forEach(pr => cloudSavePR(pr));
      }

      // Set Cloud Workout History as authoritative
      if (cloudHistory && cloudHistory.length > 0) {
        setWorkoutHistory(cloudHistory);
        localStorage.setItem('sf_workout_history', JSON.stringify(cloudHistory));
      } else if (workoutHistory.length > 0) {
        workoutHistory.forEach(s => cloudSaveWorkoutSession(s));
      }

      // Set Cloud Profile as authoritative
      if (cloudProfile) {
        setUserProfile(cloudProfile);
        localStorage.setItem('sf_user_profile', JSON.stringify(cloudProfile));
      } else {
        cloudSaveProfile(userProfile);
      }

      // Set Cloud Body Weight Logs as authoritative
      if (cloudBw && cloudBw.length > 0) {
        setBodyWeightLogs(cloudBw);
        localStorage.setItem('sf_body_weight_logs', JSON.stringify(cloudBw));
      } else if (bodyWeightLogs.length > 0) {
        bodyWeightLogs.forEach(b => cloudSaveBodyWeightLog(b));
      }

      const syncTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(syncTime);
      localStorage.setItem('sf_last_synced_at', syncTime);
      setIsSyncing(false);
      return true;
    } catch (e) {
      console.error('Error syncing with Neon:', e);
      setIsCloudConnected(false);
      setIsSyncing(false);
      return false;
    }
  }, [personalRecords, workoutHistory, userProfile, bodyWeightLogs]);


  // Initial mount sync
  useEffect(() => {
    syncWithNeonCloud();
  }, []);

  const toggleExerciseCompletion = (dayId: string, exerciseId: string) => {
    const key = `${dayId}-${exerciseId}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const startLiveWorkout = (dayId: string) => {
    const routine = routineData[dayId];
    if (!routine) return;

    const initialExerciseLogs: WorkoutExerciseLog[] = routine.exercises.map(ex => {
      const targetSetsCount = ex.targetSets || 3;
      const sets = Array.from({ length: targetSetsCount }, (_, idx) => ({
        setNumber: idx + 1,
        weight: personalRecords[ex.id]?.maxWeight || 0,
        reps: parseInt(ex.targetReps.split('-')[0]) || 10,
        rir: 2,
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
      exercises: initialExerciseLogs
    };

    setActiveSession(newSession);
    setActiveTab(dayId);
    setIsLiveModalOpen(true);
    localStorage.setItem('sf_active_session', JSON.stringify(newSession));
    localStorage.setItem('sf_is_live_modal_open', 'true');
  };

  const updateLiveSet = (
    exerciseId: string,
    setIndex: number,
    weight: number,
    reps: number,
    rir: number = 2,
    completed?: boolean
  ) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const updatedSets = [...ex.sets];
        const prevSet = updatedSets[setIndex] || {
          setNumber: setIndex + 1,
          weight: 0,
          reps: 0,
          rir: 2,
          completed: false,
          timestamp: new Date().toISOString()
        };

        const isNewlyCompleted = completed !== undefined ? completed : prevSet.completed;

        updatedSets[setIndex] = {
          ...prevSet,
          weight,
          reps,
          rir,
          completed: isNewlyCompleted,
          timestamp: new Date().toISOString()
        };

        // If just marked completed, trigger rest timer
        if (!prevSet.completed && isNewlyCompleted) {
          startRestTimer(90, ex.exerciseName);
        }

        return { ...ex, sets: updatedSets };
      });

      const nextState: ActiveSessionState = {
        ...prev,
        exercises: updatedExercises
      };
      // Immediately write to local storage
      localStorage.setItem('sf_active_session', JSON.stringify(nextState));
      return nextState;
    });
  };

  const addLiveSet = (exerciseId: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = prev.exercises.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const newSet = {
          setNumber: newSetNumber,
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 10,
          rir: 2,
          completed: false,
          timestamp: new Date().toISOString()
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet]
        };
      });
      const nextState = { ...prev, exercises: updated };
      localStorage.setItem('sf_active_session', JSON.stringify(nextState));
      return nextState;
    });
  };

  const removeLiveSet = (exerciseId: string, setIndex: number) => {
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
      const nextState = { ...prev, exercises: updated };
      localStorage.setItem('sf_active_session', JSON.stringify(nextState));
      return nextState;
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

    // Async save to Neon Cloud
    cloudSavePR(newPRRecord).catch(err => console.error('Cloud PR save failed:', err));

    return { isNewPR, old1RM, new1RM: calculated1RM };
  };

  const deletePR = (exerciseId: string) => {
    setPersonalRecords(prev => {
      const copy = { ...prev };
      delete copy[exerciseId];
      return copy;
    });
    cloudDeletePR(exerciseId).catch(err => console.error('Cloud PR delete failed:', err));
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

    // Async save workout session to Neon Cloud
    cloudSaveWorkoutSession(session).catch(err => console.error('Cloud session save failed:', err));

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
    localStorage.removeItem('sf_active_session');
    localStorage.setItem('sf_is_live_modal_open', 'false');

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
      localStorage.removeItem('sf_active_session');
      localStorage.setItem('sf_is_live_modal_open', 'false');
      resetRestTimer();
    }
  };

  const deleteWorkoutSession = (sessionId: string) => {
    setWorkoutHistory(prev => prev.filter(s => s.id !== sessionId));
    cloudDeleteWorkoutSession(sessionId).catch(err => console.error('Cloud session delete failed:', err));
  };

  // Body Weight Tracker Handlers
  const addBodyWeightLog = (weightKg: number, date?: string, notes?: string) => {
    const entryDate = date || new Date().toISOString().split('T')[0];
    const newLog: BodyWeightLog = {
      id: `bw_${Date.now()}`,
      date: entryDate,
      weightKg,
      notes,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    setBodyWeightLogs(prev => [newLog, ...prev.filter(b => b.date !== entryDate)]);
    
    // Also update active profile weight so Mifflin-St Jeor calculators react immediately
    updateUserProfile({ weightKg });

    // Save to Neon Cloud
    cloudSaveBodyWeightLog(newLog).catch(err => console.error('Cloud body weight save failed:', err));
  };

  const deleteBodyWeightLog = (id: string) => {
    setBodyWeightLogs(prev => prev.filter(b => b.id !== id));
    cloudDeleteBodyWeightLog(id).catch(err => console.error('Cloud body weight delete failed:', err));
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
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    cloudSaveProfile(updated).catch(err => console.error('Cloud profile save failed:', err));
  };

  const exportDataJSON = () => {
    const backupData = {
      version: '2.0-acsm2026',
      exportedAt: new Date().toISOString(),
      userProfile,
      personalRecords,
      workoutHistory,
      completedExercises,
      bodyWeightLogs
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
      if (parsed.bodyWeightLogs) setBodyWeightLogs(parsed.bodyWeightLogs);
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  };

  // CSV Exporter by Date Range
  const exportDataCSV = (startDate?: string, endDate?: string, type: 'workouts' | 'bodyweight' | 'all' = 'all') => {
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

    if (type === 'workouts' || type === 'all') {
      // Filter sessions
      const filteredSessions = workoutHistory.filter(s => {
        const time = new Date(s.startTime).getTime();
        return time >= start && time <= end;
      });

      let csv = '\uFEFFFecha,Dia_ID,Rutina,Duracion_Minutos,Volumen_Total_KG,Series_Totales,Ejercicio,Maquina,Serie_Numero,Peso_KG,Repeticiones,RIR,1RM_Estimado_KG,Volumen_Serie_KG,Completada,Rating_Sesion,Notas\n';

      filteredSessions.forEach(session => {
        const dateFormatted = new Date(session.startTime).toISOString().split('T')[0];
        const durationMin = (session.durationSeconds / 60).toFixed(1);
        const notesClean = (session.notes || '').replace(/"/g, '""');

        session.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            const e1rm = calculate1RM(set.weight, set.reps);
            const setVolume = (set.weight * set.reps).toFixed(1);
            csv += `"${dateFormatted}","${session.dayId}","${session.dayTitle}",${durationMin},${session.totalVolumeKg},${session.totalSetsCompleted},"${ex.exerciseName}","${ex.machine}",${set.setNumber},${set.weight},${set.reps},${set.rir ?? ''},${e1rm},${setVolume},${set.completed ? 'SI' : 'NO'},${session.rating || 5},"${notesClean}"\n`;
          });
        });
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartfit_entrenamientos_${startDate || 'inicio'}_a_${endDate || 'hoy'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (type === 'bodyweight' || type === 'all') {
      const filteredBw = bodyWeightLogs.filter(b => {
        const time = new Date(b.date).getTime();
        return time >= start && time <= end;
      });

      let csvBw = '\uFEFFFecha,Peso_KG,Altura_CM,IMC_Calculado,Notas\n';
      filteredBw.forEach(b => {
        const heightM = userProfile.heightCm / 100;
        const imc = heightM > 0 ? (b.weightKg / (heightM * heightM)).toFixed(1) : '';
        const notesClean = (b.notes || '').replace(/"/g, '""');
        csvBw += `"${b.date}",${b.weightKg},${userProfile.heightCm},${imc},"${notesClean}"\n`;
      });

      const blob = new Blob([csvBw], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartfit_peso_corporal_${startDate || 'inicio'}_a_${endDate || 'hoy'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const resetAllData = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a los valores iniciales?')) {
      setUserProfile(INITIAL_PROFILE);
      setPersonalRecords(INITIAL_PRS);
      setWorkoutHistory([]);
      setBodyWeightLogs(INITIAL_BW_LOGS);
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
      bodyWeightLogs,
      addBodyWeightLog,
      deleteBodyWeightLog,
      restTimer,
      startRestTimer,
      pauseRestTimer,
      resumeRestTimer,
      resetRestTimer,
      adjustRestTimer,
      userProfile,
      updateUserProfile,
      isCloudConnected,
      isSyncing,
      lastSyncedAt,
      syncWithNeonCloud,
      exportDataJSON,
      importDataJSON,
      exportDataCSV,
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
