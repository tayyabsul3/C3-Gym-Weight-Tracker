import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { Dumbbell, Calendar, BarChart3, Settings, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'liftlog_data';

const DEFAULT_WORKOUT_ROUTINES = [
  {
    day: "DAY 1 - PUSH",
    feel: "Pump in upper chest, side delts, and triceps",
    exercises: [
      { name: "Incline Dumbbell Press", reps: "4x10", alt: "Smith Incline Press" },
      { name: "Flat Bench Press", reps: "4x8-10", alt: "Chest Press Machine" },
      { name: "Machine Chest Fly", reps: "3x12", alt: "Cable Crossover" },
      { name: "Overhead Dumbbell Press", reps: "3x10", alt: "Seated Machine Press" },
      { name: "Dumbbell Lateral Raise", reps: "4x15", alt: "Cable Lateral Raise" },
      { name: "Triceps Pushdown", reps: "4x12", alt: "Overhead DB Extension" },
      { name: "Bench Dips", reps: "3 sets to failure", alt: "Assisted Dip Machine", bodyweight: true },
      { name: "Dead Hang", reps: "3x30 sec", alt: "", type: "timed" }
    ]
  },
  {
    day: "DAY 2 - PULL",
    feel: "Squeeze in lats, burn in biceps",
    exercises: [
      { name: "Lat Pulldown", reps: "4x10", alt: "Band-Assisted Pull-Up" },
      { name: "Seated Cable Row", reps: "4x10", alt: "One Arm DB Row" },
      { name: "Rear Delt Fly", reps: "3x12", alt: "Face Pull" },
      { name: "Barbell Curl", reps: "4x10", alt: "EZ Bar or Dumbbell Curl" },
      { name: "Hammer Curl", reps: "3x12", alt: "Cable Rope Curl" },
      { name: "Shrugs", reps: "4x15", alt: "" },
      { name: "Face Pulls", reps: "3x15", alt: "" },
      { name: "Plank", reps: "3x30 sec", alt: "", type: "timed" }
    ]
  },
  {
    day: "DAY 3 - CORE + CARDIO",
    feel: "Sweat, abs on fire, lungs working hard",
    exercises: [
      { name: "Hanging Leg Raise", reps: "4x15", alt: "Lying Leg Raise" },
      { name: "Weighted Decline Sit-Ups", reps: "4x12", alt: "Crunch Machine" },
      { name: "Cable Woodchoppers", reps: "3x12", alt: "Russian Twist" },
      { name: "Mountain Climbers", reps: "3x30 sec", alt: "", type: "timed" },
      { name: "Bicycle Crunches", reps: "3x20", alt: "", bodyweight: true },
      { name: "High Knees", reps: "3x30 sec", alt: "", type: "timed" },
      { name: "Plank with Shoulder Tap", reps: "3x30 sec", alt: "", type: "timed" },
      { name: "Treadmill or Skipping", reps: "15 min high pace", alt: "", type: "timed" }
    ]
  },
  {
    day: "DAY 4 - PUSH 2",
    feel: "Burn in side delts and triceps",
    exercises: [
      { name: "Standing Overhead Barbell Press", reps: "4x8", alt: "Machine Shoulder Press" },
      { name: "Arnold Press", reps: "3x10", alt: "DB Press Neutral Grip" },
      { name: "Cable Lateral Raise", reps: "3x12 each side", alt: "" },
      { name: "Landmine Chest Press", reps: "3x10", alt: "Incline Machine Press" },
      { name: "Dumbbell Front Raise", reps: "3x12", alt: "Plate Raise" },
      { name: "Skull Crushers", reps: "3x10", alt: "DB Overhead Extension" },
      { name: "Rope Pushdowns", reps: "3x12", alt: "" },
      { name: "Plank to Push-Up", reps: "3x10", alt: "", bodyweight: true }
    ]
  },
  {
    day: "DAY 5 - PULL 2",
    feel: "Pump in arms, lats stretched, rear delts engaged",
    exercises: [
      { name: "Pull-Ups", reps: "3x Max", alt: "Close-Grip Pulldown", bodyweight: true },
      { name: "Barbell Bent Row", reps: "4x8-10", alt: "Machine Row" },
      { name: "Concentration Curls", reps: "3x12", alt: "" },
      { name: "Incline Dumbbell Curls", reps: "3x10", alt: "Cable Curl" },
      { name: "Cable Face Pulls", reps: "3x15", alt: "" },
      { name: "Rear Delt Machine", reps: "3x12", alt: "" },
      { name: "Barbell Shrugs", reps: "3x15", alt: "Trap Bar Shrugs" },
      { name: "Forearm Roller or Reverse Curls", reps: "3x12", alt: "" }
    ]
  },
  {
    day: "DAY 6 - LEGS + NECK + FOREARMS",
    feel: "Strong foundation, balanced aesthetics",
    exercises: [
      { name: "Leg Press", reps: "4x10", alt: "Goblet Squat" },
      { name: "Seated Hamstring Curl", reps: "4x12", alt: "DB RDL" },
      { name: "Standing Calf Raise Machine", reps: "4x15", alt: "" },
      { name: "Seated Calf Raise", reps: "4x15", alt: "" },
      { name: "Neck Flexion", reps: "3x15", alt: "" },
      { name: "Neck Extension", reps: "3x15", alt: "Resistance Band" },
      { name: "Wrist Curls", reps: "3x15", alt: "" },
      { name: "Reverse Wrist Curls", reps: "3x15", alt: "" }
    ]
  }
];

interface WeightLog {
  week: string;
  weight?: number;
  reps?: string;
  time?: number;
}

interface Profile {
  name: string;
  goal: string;
}

interface WorkoutDay {
  day: string;
  feel: string;
  exercises: any[];
  _key: string;
  _isBuiltIn: boolean;
  _builtInIdx?: number;
  _customIdx?: number;
}

interface AppState {
  selectedDay: number;
  weightLogs: { [key: string]: WeightLog[] };
  videoLinks: { [key: string]: string };
  deletedExercises: { [dayIdx: number]: number[] };
  customExercises: { [dayIdx: number]: any[] };
  attendance: { [date: string]: 'workout' | 'rest' | 'missed' };
  profile: Profile;
  currentPage: 'landing' | 'workout' | 'calendar' | 'progress' | 'settings';
  deletedDays: number[];
  customDays: any[];
  showOnboard: boolean;
  exerciseTypes: { [key: string]: 'weighted' | 'bodyweight' | 'timed' };
}

const ONBOARDING_STEPS = [
  {
    icon: '🏋️',
    title: 'Welcome to LiftLog',
    desc: 'Track your workouts week by week. Log weights and reps for every exercise, and watch your strength grow over time.'
  },
  {
    icon: '📅',
    title: 'Track Attendance',
    desc: 'Use the calendar to log workout days, rest days, and missed days. See your monthly consistency at a glance.'
  },
  {
    icon: '📈',
    title: 'Progress Charts',
    desc: 'View weight, rep, and volume trends over time. Every data point you log builds a chart of your progress.'
  },
  {
    icon: '⚙️',
    title: 'Customize Your Plan',
    desc: "Add or remove exercises, create custom workout days, and export your data anytime. It's your workout — your way."
  }
];

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            selectedDay: parsed.selectedDay ?? 0,
            weightLogs: parsed.weightLogs ?? {},
            videoLinks: parsed.videoLinks ?? {},
            deletedExercises: parsed.deletedExercises ?? {},
            customExercises: parsed.customExercises ?? {},
            attendance: parsed.attendance ?? {},
            profile: parsed.profile ?? { name: "Trainee", goal: "Build muscle, get stronger" },
            currentPage: parsed.currentPage ?? 'landing',
            deletedDays: parsed.deletedDays ?? [],
            customDays: parsed.customDays ?? [],
            showOnboard: parsed.showOnboard ?? true,
            exerciseTypes: parsed.exerciseTypes ?? {}
          };
        }
      }
    } catch (e) {}

    return {
      selectedDay: 0,
      weightLogs: {},
      videoLinks: {},
      deletedExercises: {},
      customExercises: {},
      attendance: {},
      profile: { name: "Trainee", goal: "Build muscle, get stronger" },
      currentPage: 'landing',
      deletedDays: [],
      customDays: [],
      showOnboard: true,
      exerciseTypes: {}
    };
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('ServiceWorker registration successful with scope: ', reg.scope);
        }).catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  // Save state helper
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Compute active week id: YYYY-Wxx
  const getWeekId = () => {
    const now = new Date();
    const s = new Date(now.getFullYear(), 0, 1);
    const d = (now.getTime() - s.getTime() + (s.getTimezoneOffset() - now.getTimezoneOffset()) * 60000) / 86400000;
    return now.getFullYear() + '-W' + String(Math.ceil((d + s.getDay() + 1) / 7)).padStart(2, '0');
  };

  const fmtWeek = (weekIdStr: string) => {
    const p = weekIdStr.split('-W');
    if (p.length !== 2) return weekIdStr;
    const m = new Date(new Date(parseInt(p[0]), 0, 1).getTime() + (parseInt(p[1]) - 1) * 7 * 86400000);
    const d = m.getDay();
    m.setDate(m.getDate() - d + (d === 0 ? -6 : 1));
    return m.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const weekId = getWeekId();

  // Helper selectors
  const getAllDays = (): WorkoutDay[] => {
    const del = state.deletedDays || [];
    const builtIn = DEFAULT_WORKOUT_ROUTINES.map((d, i) => ({
      day: d.day,
      feel: d.feel,
      exercises: d.exercises,
      _key: `d_${i}`,
      _isBuiltIn: true,
      _builtInIdx: i
    })).filter(d => !del.includes(d._builtInIdx));

    const custom = (state.customDays || []).map((d, i) => ({
      day: d.day,
      feel: d.feel,
      exercises: d.exercises || [],
      _key: `dc_${i}`,
      _isBuiltIn: false,
      _customIdx: i
    }));

    return [...builtIn, ...custom] as WorkoutDay[];
  };

  const getExercisesForDay = (dayIdx: number) => {
    const daysList = getAllDays();
    const activeDay = daysList[dayIdx];
    if (!activeDay) return [];

    if (activeDay._isBuiltIn) {
      const bIdx = activeDay._builtInIdx as number;
      const origin = DEFAULT_WORKOUT_ROUTINES[bIdx];
      const del = state.deletedExercises[bIdx] || [];
      const builtInEx = origin.exercises.map((e, i) => ({
        name: e.name,
        reps: e.reps,
        alt: e.alt,
        bodyweight: (e as any).bodyweight,
        type: (e as any).type,
        _key: `${bIdx}_${i}`,
        _isBuiltIn: true,
        _builtInIdx: i
      })).filter(e => !del.includes(e._builtInIdx));

      const customEx = (state.customExercises[bIdx] || []).map((e, i) => ({
        name: e.name,
        reps: e.reps,
        alt: e.alt,
        bodyweight: e.bodyweight,
        type: e.type,
        _key: `${bIdx}_c_${i}`,
        _isBuiltIn: false,
        _customIdx: i
      }));

      return [...builtInEx, ...customEx] as any[];
    } else {
      const cIdx = activeDay._customIdx as number;
      return (activeDay.exercises || []).map((e: any, i: number) => ({
        name: e.name,
        reps: e.reps,
        alt: e.alt,
        bodyweight: e.bodyweight,
        type: e.type,
        _key: `dc_${cIdx}_${i}`,
        _isBuiltIn: false,
        _customIdx: i
      }));
    }
  };

  // State Mutators
  const logExercise = (exKey: string, logData: Partial<WeightLog>) => {
    setState(prev => {
      const logs = prev.weightLogs[exKey] ? [...prev.weightLogs[exKey]] : [];
      const idx = logs.findIndex(l => l.week === weekId);
      
      const newEntry = { week: weekId, ...logData };
      if (idx >= 0) {
        logs[idx] = { ...logs[idx], ...newEntry };
      } else {
        logs.push(newEntry as WeightLog);
      }

      return {
        ...prev,
        weightLogs: {
          ...prev.weightLogs,
          [exKey]: logs
        }
      };
    });
  };

  const deleteExercise = (dayIdx: number, ex: any) => {
    setState(prev => {
      const daysList = getAllDays();
      const activeDay = daysList[dayIdx];
      if (!activeDay) return prev;

      if (activeDay._isBuiltIn) {
        const bIdx = activeDay._builtInIdx as number;
        if (ex._isBuiltIn) {
          const deleted = prev.deletedExercises[bIdx] || [];
          return {
            ...prev,
            deletedExercises: {
              ...prev.deletedExercises,
              [bIdx]: [...deleted, ex._builtInIdx]
            }
          };
        } else {
          const custom = prev.customExercises[bIdx] || [];
          const filtered = custom.filter((_, i) => i !== ex._customIdx);
          return {
            ...prev,
            customExercises: {
              ...prev.customExercises,
              [bIdx]: filtered
            }
          };
        }
      } else {
        const cIdx = activeDay._customIdx as number;
        const customDays = [...prev.customDays];
        customDays[cIdx] = {
          ...customDays[cIdx],
          exercises: (customDays[cIdx].exercises || []).filter((_: any, i: number) => i !== ex._customIdx)
        };
        return {
          ...prev,
          customDays
        };
      }
    });
  };

  const addExercise = (dayIdx: number, newEx: any) => {
    setState(prev => {
      const daysList = getAllDays();
      const activeDay = daysList[dayIdx];
      if (!activeDay) return prev;

      const obj: any = { name: newEx.name, reps: newEx.reps, alt: newEx.alt };
      if (newEx.type === 'bodyweight') obj.bodyweight = true;
      else if (newEx.type === 'timed') obj.type = 'timed';

      if (activeDay._isBuiltIn) {
        const bIdx = activeDay._builtInIdx as number;
        const list = prev.customExercises[bIdx] ? [...prev.customExercises[bIdx]] : [];
        list.push(obj);
        return {
          ...prev,
          customExercises: {
            ...prev.customExercises,
            [bIdx]: list
          }
        };
      } else {
        const cIdx = activeDay._customIdx as number;
        const customDays = [...prev.customDays];
        const list = customDays[cIdx].exercises ? [...customDays[cIdx].exercises] : [];
        list.push(obj);
        customDays[cIdx] = { ...customDays[cIdx], exercises: list };
        return { ...prev, customDays };
      }
    });
  };

  const deleteDay = (dayIdx: number) => {
    setState(prev => {
      const daysList = getAllDays();
      const activeDay = daysList[dayIdx];
      if (!activeDay) return prev;

      if (activeDay._isBuiltIn) {
        const bIdx = activeDay._builtInIdx as number;
        return {
          ...prev,
          deletedDays: [...prev.deletedDays, bIdx],
          selectedDay: 0
        };
      } else {
        const cIdx = activeDay._customIdx as number;
        const filtered = prev.customDays.filter((_, i) => i !== cIdx);
        return {
          ...prev,
          customDays: filtered,
          selectedDay: 0
        };
      }
    });
  };

  const addDay = (name: string, feel: string) => {
    setState(prev => {
      const customDays = [...prev.customDays];
      customDays.push({ day: name, feel, exercises: [] });
      const nextIdx = getAllDays().length; // The index of the new custom day in the combined list
      return {
        ...prev,
        customDays,
        selectedDay: nextIdx
      };
    });
  };

  const saveVideoLink = (exKey: string, link: string) => {
    setState(prev => {
      const links = { ...prev.videoLinks };
      if (link.trim()) {
        links[exKey] = link.trim();
      } else {
        delete links[exKey];
      }
      return { ...prev, videoLinks: links };
    });
  };

  const cycleExerciseType = (exKey: string, current: 'weighted' | 'bodyweight' | 'timed') => {
    const cycle = { weighted: 'bodyweight', bodyweight: 'timed', timed: 'weighted' } as const;
    const next = cycle[current];
    setState(prev => ({
      ...prev,
      exerciseTypes: {
        ...prev.exerciseTypes,
        [exKey]: next
      }
    }));
  };

  const toggleAttendance = (dateStr: string) => {
    setState(prev => {
      const attendance = { ...prev.attendance };
      const cur = attendance[dateStr];
      const cycle = { workout: 'rest', rest: 'missed', missed: '' } as const;
      
      const next = cur ? cycle[cur] : 'workout';
      if (next) {
        attendance[dateStr] = next;
      } else {
        delete attendance[dateStr];
      }
      return { ...prev, attendance };
    });
  };

  const updateProfile = (profile: Profile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const exportData = () => {
    const exercises: any = {};
    const days: any = {};
    for (const key in state.weightLogs) { (exercises[key] || (exercises[key] = {})).logs = state.weightLogs[key]; }
    for (const key in state.videoLinks) { (exercises[key] || (exercises[key] = {})).video = state.videoLinks[key]; }
    for (const key in state.exerciseTypes) { (exercises[key] || (exercises[key] = {})).type = state.exerciseTypes[key]; }
    for (const idx in state.customExercises) { const d = days[idx] || (days[idx] = {}); d.custom = state.customExercises[idx]; }
    for (const idx in state.deletedExercises) { const d = days[idx] || (days[idx] = {}); d.deleted = state.deletedExercises[idx]; }

    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      exercises,
      days,
      attendance: state.attendance
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liftlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    if (!data || typeof data !== 'object') return false;
    
    setState(prev => {
      let weightLogs = { ...prev.weightLogs };
      let videoLinks = { ...prev.videoLinks };
      let exerciseTypes = { ...prev.exerciseTypes };
      let customExercises = { ...prev.customExercises };
      let deletedExercises = { ...prev.deletedExercises };
      let profile = { ...prev.profile };
      let attendance = { ...prev.attendance };

      if (data.version === 2 && data.exercises) {
        for (const key in data.exercises) {
          const ex = data.exercises[key];
          if (ex.logs) weightLogs[key] = ex.logs;
          if (ex.video) videoLinks[key] = ex.video;
          if (ex.type) exerciseTypes[key] = ex.type;
        }
        for (const idx in data.days) {
          const d = data.days[idx];
          if (d.custom) customExercises[idx as any] = d.custom;
          if (d.deleted) deletedExercises[idx as any] = d.deleted;
        }
        if (data.profile) profile = data.profile;
        if (data.attendance) attendance = data.attendance;
      } else {
        // Flat Import Legacy format
        if (data.weightLogs) weightLogs = data.weightLogs;
        if (data.videoLinks) videoLinks = data.videoLinks;
        if (data.deletedExercises) deletedExercises = data.deletedExercises;
        if (data.customExercises) customExercises = data.customExercises;
        if (data.exerciseTypes) exerciseTypes = data.exerciseTypes;
        if (data.attendance) attendance = data.attendance;
        if (data.profile) profile = data.profile;
      }

      return {
        ...prev,
        weightLogs,
        videoLinks,
        exerciseTypes,
        customExercises,
        deletedExercises,
        profile,
        attendance
      };
    });
    return true;
  };

  const clearAllData = () => {
    setState({
      selectedDay: 0,
      weightLogs: {},
      videoLinks: {},
      deletedExercises: {},
      customExercises: {},
      attendance: {},
      profile: { name: "Trainee", goal: "Build muscle, get stronger" },
      currentPage: 'workout',
      deletedDays: [],
      customDays: [],
      showOnboard: false,
      exerciseTypes: {}
    });
  };

  const loadDemoSeedData = () => {
    // Standard baseline values to show charts immediately
    const demoData = {
      profile: { name: "Aesthetic Lifter", goal: "Hypertrophy & Progressive Strength" },
      exercises: {
        "0_0": { logs: [{ week: "2026-W23", weight: 10, reps: "10" }, { week: "2026-W24", weight: 12, reps: "10" }, { week: "2026-W25", weight: 14, reps: "12" }] },
        "0_1": { logs: [{ week: "2026-W23", weight: 15, reps: "8" }, { week: "2026-W24", weight: 17.5, reps: "10" }, { week: "2026-W25", weight: 20, reps: "10" }] },
        "0_2": { logs: [{ week: "2026-W23", weight: 25, reps: "12" }, { week: "2026-W24", weight: 30, reps: "12" }, { week: "2026-W25", weight: 35, reps: "10" }] }
      },
      days: {
        "2": { deleted: [2, 3] }
      },
      attendance: {
        "2026-06-15": "workout", "2026-06-16": "workout", "2026-06-17": "rest", "2026-06-18": "workout", "2026-06-19": "workout"
      }
    };

    importData(demoData);
  };

  // Nav actions
  const navigateTo = (page: AppState['currentPage']) => {
    setState(prev => ({ ...prev, currentPage: page }));
    setDrawerOpen(false);
  };

  // Skip landing page if already "logged in/active" in workspace
  const handleEnterApp = () => {
    navigateTo('workout');
  };

  // Render Onboarding Modal Steps
  const renderOnboardingModal = () => {
    if (!state.showOnboard) return null;
    const step = ONBOARDING_STEPS[onboardStep];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-body">
        <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl text-center">
          <div className="text-5xl mb-4">{step.icon}</div>
          <h3 className="font-display text-xl font-black uppercase text-textPrimary tracking-wide mb-2">
            {step.title}
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed mb-6">
            {step.desc}
          </p>

          <div className="flex justify-center gap-1.5 mb-6">
            {ONBOARDING_STEPS.map((_, i) => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === onboardStep ? 'bg-primary w-4' : 'bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {onboardStep > 0 && (
              <button
                onClick={() => setOnboardStep(prev => prev - 1)}
                className="flex-1 h-11 border border-border rounded-lg text-xs font-bold uppercase tracking-wider text-textSecondary hover:text-textPrimary hover:bg-surface2 transition-all active:scale-95 cursor-pointer"
              >
                Back
              </button>
            )}
            
            <button
              onClick={() => {
                if (onboardStep < ONBOARDING_STEPS.length - 1) {
                  setOnboardStep(prev => prev + 1);
                } else {
                  setState(prev => ({ ...prev, showOnboard: false }));
                }
              }}
              className="flex-1 h-11 bg-primary text-black rounded-lg text-xs font-extrabold uppercase tracking-wider hover:opacity-90 hover:shadow-glow transition-all active:scale-95 cursor-pointer"
            >
              {onboardStep < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Got it!'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If on landing page, display standard landing layout
  if (state.currentPage === 'landing') {
    return (
      <div className="bg-background min-h-screen text-textPrimary">
        <LandingPage onEnterApp={handleEnterApp} />
      </div>
    );
  }

  const daysList = getAllDays();

  return (
    <div className="bg-background min-h-screen text-textPrimary flex selection:bg-primary selection:text-black">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-52 bg-surface border-r border-border px-3 py-5 h-screen sticky top-0 font-body select-none shrink-0">
        <div>
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2 px-2 mb-6 cursor-pointer group"
          >
            <span className="text-lg">🏋️</span>
            <span className="font-display text-lg font-black text-textPrimary group-hover:text-primary transition-colors">
              Lift<span className="text-primary">Log</span>
            </span>
          </button>

          <nav className="space-y-0.5">
            <button
              onClick={() => navigateTo('workout')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                state.currentPage === 'workout'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/60'
              }`}
            >
              <Dumbbell className="w-4 h-4 shrink-0" />
              Workout
            </button>

            <button
              onClick={() => navigateTo('calendar')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                state.currentPage === 'calendar'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/60'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Attendance
            </button>

            <button
              onClick={() => navigateTo('progress')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                state.currentPage === 'progress'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              Progress
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                state.currentPage === 'settings'
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surface2/60'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </button>
          </nav>
        </div>

        {/* Profile bottom */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-primary text-black font-bold text-xs flex items-center justify-center shrink-0">
              {(state.profile.name[0] || 'T').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-textPrimary truncate">{state.profile.name}</div>
              <div className="text-[10px] text-textSecondary truncate">{state.profile.goal}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-56 h-full bg-surface border-r border-border px-3 py-5 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex justify-between items-center mb-6 px-1">
                <span className="font-display text-lg font-black text-textPrimary">
                  🏋️ Lift<span className="text-primary">Log</span>
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-textSecondary hover:text-textPrimary p-1 rounded-lg active:scale-90 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-0.5">
                <button
                  onClick={() => navigateTo('workout')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    state.currentPage === 'workout' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-textSecondary'
                  }`}
                >
                  <Dumbbell className="w-4 h-4 shrink-0" />
                  Workout
                </button>

                <button
                  onClick={() => navigateTo('calendar')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    state.currentPage === 'calendar' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-textSecondary'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  Attendance
                </button>

                <button
                  onClick={() => navigateTo('progress')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    state.currentPage === 'progress' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-textSecondary'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  Progress
                </button>

                <button
                  onClick={() => navigateTo('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    state.currentPage === 'settings' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-textSecondary'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-8 h-8 rounded-full bg-primary text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {(state.profile.name[0] || 'T').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-textPrimary truncate">{state.profile.name}</div>
                  <div className="text-[10px] text-textSecondary truncate">{state.profile.goal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Mobile/Tablet Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center justify-between shadow-md">
          <h1 className="font-display text-xl font-black uppercase text-textPrimary" onClick={() => navigateTo('landing')}>
            🏋️ Lift<span className="text-primary">Log</span>
          </h1>
          
          <button 
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 bg-surface2 border border-border rounded-lg text-textPrimary flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Route views Render */}
        <main className="flex-1 overflow-y-auto">
          {state.currentPage === 'workout' && (
            <WorkoutPage
              days={daysList}
              selectedDay={state.selectedDay}
              setSelectedDay={(idx) => setState(prev => ({ ...prev, selectedDay: idx }))}
              getExercisesForDay={getExercisesForDay}
              weightLogs={state.weightLogs}
              logExercise={logExercise}
              deleteExercise={deleteExercise}
              addExercise={addExercise}
              deleteDay={deleteDay}
              addDay={addDay}
              videoLinks={state.videoLinks}
              saveVideoLink={saveVideoLink}
              exerciseTypes={state.exerciseTypes}
              cycleExerciseType={cycleExerciseType}
              weekId={weekId}
              fmtWeek={fmtWeek}
            />
          )}

          {state.currentPage === 'calendar' && (
            <CalendarPage
              attendance={state.attendance}
              toggleAttendance={toggleAttendance}
            />
          )}

          {state.currentPage === 'progress' && (
            <ProgressPage
              days={daysList}
              getExercisesForDay={getExercisesForDay}
              weightLogs={state.weightLogs}
            />
          )}

          {state.currentPage === 'settings' && (
            <SettingsPage
              profile={state.profile}
              updateProfile={updateProfile}
              exportData={exportData}
              importData={importData}
              clearAllData={clearAllData}
              loadDemoSeedData={loadDemoSeedData}
            />
          )}
        </main>

      </div>

      {/* Onboarding tour flow */}
      {renderOnboardingModal()}

    </div>
  );
}
