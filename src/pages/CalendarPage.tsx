import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, HelpCircle, Activity } from 'lucide-react';

interface CalendarPageProps {
  attendance: { [date: string]: 'workout' | 'rest' | 'missed' };
  toggleAttendance: (date: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ attendance, toggleAttendance }) => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon etc
  const totalDays = lastDayOfMonth.getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calculate consistency stats for this month
  let workoutCount = 0;
  let restCount = 0;
  let missedCount = 0;

  for (const dateStr in attendance) {
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth) {
      const status = attendance[dateStr];
      if (status === 'workout') workoutCount++;
      else if (status === 'rest') restCount++;
      else if (status === 'missed') missedCount++;
    }
  }

  // Create grid cells
  const gridCells = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Pad previous month empty cells
  for (let i = 0; i < startDayIndex; i++) {
    gridCells.push(<div key={`empty-${i}`} className="aspect-square opacity-20 border border-border/20" />);
  }

  // Generate actual calendar cells
  for (let d = 1; d <= totalDays; d++) {
    const ds = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = attendance[ds];
    const isToday = ds === todayStr;

    let cellColorClass = 'bg-surface border-border hover:border-textSecondary/50';
    if (status === 'workout') cellColorClass = 'bg-success/20 text-success border-success shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]';
    else if (status === 'rest') cellColorClass = 'bg-warn/20 text-warn border-warn shadow-[inset_0_0_10px_rgba(255,193,7,0.1)]';
    else if (status === 'missed') cellColorClass = 'bg-danger/25 text-danger border-danger shadow-[inset_0_0_10px_rgba(255,180,171,0.15)]';

    gridCells.push(
      <button
        key={`day-${d}`}
        onClick={() => toggleAttendance(ds)}
        className={`aspect-square flex flex-col items-center justify-center border rounded-xl font-mono text-sm font-bold transition-all duration-200 active:scale-90 cursor-pointer ${cellColorClass} ${
          isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
        }`}
      >
        <span>{d}</span>
        {status && (
          <span className="text-[7px] font-display uppercase tracking-widest mt-1 scale-90">
            {status}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 font-body">
      
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6 text-center md:text-left">
        <h2 className="font-display text-2xl font-black uppercase text-textPrimary tracking-wide">
          Attendance Matrix
        </h2>
        <p className="text-xs text-textSecondary font-mono tracking-widest mt-1 uppercase">
          Track consistency &amp; rest routines
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-surface border border-border p-4 rounded-xl">
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-lg hover:bg-surface2 text-textPrimary flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-border/40"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="font-display text-lg font-bold uppercase text-textPrimary tracking-wide">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-lg hover:bg-surface2 text-textPrimary flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-border/40"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Consistency Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center border-success/40 bg-success/5">
          <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1.5" />
          <div className="font-mono text-lg font-bold text-success leading-none">{workoutCount}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold mt-1">Lifts</div>
        </Card>
        
        <Card className="p-3 text-center border-warn/40 bg-warn/5">
          <HelpCircle className="w-5 h-5 text-warn mx-auto mb-1.5" />
          <div className="font-mono text-lg font-bold text-warn leading-none">{restCount}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold mt-1">Rests</div>
        </Card>

        <Card className="p-3 text-center border-danger/40 bg-danger/5">
          <AlertCircle className="w-5 h-5 text-danger mx-auto mb-1.5" />
          <div className="font-mono text-lg font-bold text-danger leading-none">{missedCount}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold mt-1">Missed</div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface border border-border p-4 rounded-2xl mb-6">
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] font-mono font-bold text-textSecondary uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {gridCells}
        </div>
      </div>

      {/* Legend & Hint */}
      <Card className="p-4 bg-surface2/30 border border-border/50">
        <h4 className="font-display text-xs font-bold uppercase text-textPrimary tracking-wide mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary" /> Matrix Instructions
        </h4>
        <p className="text-xs text-textSecondary leading-relaxed mb-4">
          Tap any date cell to cycle its fitness state. Maintain consistency by balancing heavy workout days and critical recovery rest sessions.
        </p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 text-[10px] font-mono font-bold uppercase">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-success border border-success/50 inline-block" />
            <span className="text-textSecondary">Workout logged</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-warn border border-warn/50 inline-block" />
            <span className="text-textSecondary">Rest Routine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-danger border border-danger/50 inline-block" />
            <span className="text-textSecondary">Missed session</span>
          </div>
        </div>
      </Card>

    </div>
  );
};
