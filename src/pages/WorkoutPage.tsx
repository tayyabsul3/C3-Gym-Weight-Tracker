import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Plus, Trash2, Video, ExternalLink, RefreshCw } from 'lucide-react';

interface WeightLog {
  week: string;
  weight?: number;
  reps?: string;
  time?: number;
}

interface Exercise {
  name: string;
  reps: string;
  alt: string;
  bodyweight?: boolean;
  type?: string;
  _key: string; // Dynamic unique key
  _isBuiltIn: boolean;
  _builtInIdx?: number;
  _customIdx?: number;
}

interface WorkoutDay {
  day: string;
  feel: string;
  _key: string;
  _isBuiltIn: boolean;
  _builtInIdx?: number;
  _customIdx?: number;
}

interface WorkoutPageProps {
  days: WorkoutDay[];
  selectedDay: number;
  setSelectedDay: (index: number) => void;
  getExercisesForDay: (dayIdx: number) => Exercise[];
  weightLogs: { [key: string]: WeightLog[] };
  logExercise: (key: string, data: Partial<WeightLog>) => void;
  deleteExercise: (dayIdx: number, ex: Exercise) => void;
  addExercise: (dayIdx: number, ex: Omit<Exercise, '_key' | '_isBuiltIn'> & { type: string }) => void;
  deleteDay: (dayIdx: number) => void;
  addDay: (name: string, feel: string) => void;
  videoLinks: { [key: string]: string };
  saveVideoLink: (key: string, link: string) => void;
  exerciseTypes: { [key: string]: 'weighted' | 'bodyweight' | 'timed' };
  cycleExerciseType: (key: string, current: 'weighted' | 'bodyweight' | 'timed') => void;
  weekId: string;
  fmtWeek: (weekId: string) => string;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  days,
  selectedDay,
  setSelectedDay,
  getExercisesForDay,
  weightLogs,
  logExercise,
  deleteExercise,
  addExercise,
  deleteDay,
  addDay,
  videoLinks,
  saveVideoLink,
  exerciseTypes,
  cycleExerciseType,
  weekId,
  fmtWeek
}) => {
  const [showAddExForm, setShowAddExForm] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExReps, setNewExReps] = useState('');
  const [newExAlt, setNewExAlt] = useState('');
  const [newExType, setNewExType] = useState<'weighted' | 'bodyweight' | 'timed'>('weighted');

  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const [newDayFeel, setNewDayFeel] = useState('');

  const [expandedVideos, setExpandedVideos] = useState<{ [key: string]: boolean }>({});
  const [videoInputs, setVideoInputs] = useState<{ [key: string]: string }>({});

  const [logInputs, setLogInputs] = useState<{ [key: string]: { weight?: string; reps?: string; time?: string } }>({});

  const day = days[selectedDay];
  const exercises = day ? getExercisesForDay(selectedDay) : [];

  const handleLogSubmit = (exKey: string, type: 'weighted' | 'bodyweight' | 'timed') => {
    const inputs = logInputs[exKey] || {};
    const weightVal = inputs.weight?.trim() || '';
    const repsVal = inputs.reps?.trim() || '';
    const timeVal = inputs.time?.trim() || '';

    if (!weightVal && !repsVal && !timeVal) return;

    const logData: Partial<WeightLog> = {};
    if (type === 'timed') {
      if (timeVal && !isNaN(parseInt(timeVal))) logData.time = parseInt(timeVal);
      if (repsVal) logData.reps = repsVal; // Sets logged as reps
    } else if (type === 'bodyweight') {
      if (repsVal) logData.reps = repsVal;
    } else {
      if (weightVal && !isNaN(parseFloat(weightVal))) logData.weight = parseFloat(weightVal);
      if (repsVal) logData.reps = repsVal;
    }

    logExercise(exKey, logData);
    
    // Clear inputs except weights for quick logging
    setLogInputs(prev => ({
      ...prev,
      [exKey]: {
        ...prev[exKey],
        reps: '',
        time: ''
      }
    }));
  };

  const handleInputChange = (exKey: string, field: 'weight' | 'reps' | 'time', val: string) => {
    setLogInputs(prev => ({
      ...prev,
      [exKey]: {
        ...(prev[exKey] || {}),
        [field]: val
      }
    }));
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const p = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const r of p) {
      const m = url.trim().match(r);
      if (m) return m[1];
    }
    return null;
  };

  const toggleVideo = (exKey: string) => {
    setExpandedVideos(prev => ({ ...prev, [exKey]: !prev[exKey] }));
    const existingLink = videoLinks[exKey] || '';
    setVideoInputs(prev => ({ ...prev, [exKey]: existingLink }));
  };

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDayName.trim()) return;
    addDay(newDayName.trim(), newDayFeel.trim() || 'Focus on progressive overload');
    setNewDayName('');
    setNewDayFeel('');
    setShowAddDayModal(false);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    addExercise(selectedDay, {
      name: newExName.trim(),
      reps: newExReps.trim() || '3x10',
      alt: newExAlt.trim(),
      type: newExType
    });
    setNewExName('');
    setNewExReps('');
    setNewExAlt('');
    setNewExType('weighted');
    setShowAddExForm(false);
  };

  const getDayIcon = (name: string) => {
    const u = name.toUpperCase();
    if (u.includes('PUSH')) return '💪';
    if (u.includes('PULL')) return '🔥';
    if (u.includes('CORE') || u.includes('CARDIO')) return '❤️';
    if (u.includes('LEGS')) return '🦵';
    return '📋';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-body">
      
      {/* Dynamic Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-textPrimary tracking-wide">
            Workout Desk
          </h2>
          <p className="text-xs text-textSecondary font-mono tracking-widest mt-1 uppercase">
            Week of {fmtWeek(weekId)} ({weekId})
          </p>
        </div>
        {day && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm(`Delete "${day.day}" and all its logs?`)) {
                deleteDay(selectedDay);
              }
            }}
            className="mt-2 md:mt-0 text-danger hover:text-danger hover:border-danger/30 text-xs border-border"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Routine
          </Button>
        )}
      </div>

      {/* Routine Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {days.map((d, idx) => {
          const isActive = idx === selectedDay;
          const short = d.day.replace(/DAY \d - /, '');
          return (
            <button
              key={d._key}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-black font-extrabold shadow-glow' 
                  : 'bg-surface border border-border text-textSecondary hover:text-textPrimary hover:border-textSecondary/35'
              }`}
            >
              <span>{getDayIcon(short)}</span>
              {short}
            </button>
          );
        })}
        
        <button
          onClick={() => setShowAddDayModal(true)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-surface border border-border hover:border-primary/50 text-textSecondary hover:text-primary flex items-center justify-center transition-all duration-200"
          title="Add New Workout Day"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Routine Detail Card */}
      {day ? (
        <div className="mb-6 bg-surface border-l-4 border-primary p-4 rounded-r-xl border border-y-border border-r-border">
          <div className="font-mono text-xs font-semibold text-primary uppercase mb-1">{day.day}</div>
          <p className="text-sm text-textSecondary italic">💡 {day.feel}</p>
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-textSecondary text-sm mb-4">No workout routines defined. Add a day to start logging.</p>
          <Button variant="primary" onClick={() => setShowAddDayModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Workout Routine
          </Button>
        </Card>
      )}

      {/* Exercises List */}
      {day && (
        <div className="space-y-4">
          {exercises.map((ex) => {
            const logs = weightLogs[ex._key] || [];
            const curLog = logs.find(l => l.week === weekId);
            
            // Determine dynamic exercise type
            const exType = exerciseTypes[ex._key] || ex.type || (ex.bodyweight ? 'bodyweight' : 'weighted');
            
            // Get previous logs sorted
            const sortedLogs = [...logs].sort((a, b) => b.week.localeCompare(a.week));
            const lastLog = sortedLogs.find(l => l.weight || l.reps || l.time);
            
            let lastDisplay = '';
            if (lastLog) {
              if (lastLog.weight && exType === 'weighted') lastDisplay += `${lastLog.weight}kg`;
              if (exType === 'timed' && lastLog.time) lastDisplay += `${lastLog.time}s`;
              if (lastLog.reps) lastDisplay += `${lastDisplay ? ' × ' : ''}${lastLog.reps}`;
              
              if (lastLog.weight && lastLog.reps && exType === 'weighted') {
                const vol = parseFloat(lastLog.weight as any) * parseInt(lastLog.reps);
                if (!isNaN(vol)) {
                  lastDisplay += ` (Vol: ${vol})`;
                }
              }
            }

            const inputs = logInputs[ex._key] || {};
            const weightVal = inputs.weight ?? (curLog?.weight?.toString() || '');
            const repsVal = inputs.reps ?? (curLog?.reps || '');
            const timeVal = inputs.time ?? (curLog?.time?.toString() || '');

            const isVideoOpen = !!expandedVideos[ex._key];
            const hasVideo = !!videoLinks[ex._key];

            return (
              <Card key={ex._key} className="relative hover:border-border/70 group">
                
                {/* Card Top / Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display text-base font-bold text-textPrimary uppercase tracking-wide">
                        {ex.name}
                      </h4>
                      <button
                        onClick={() => cycleExerciseType(ex._key, exType)}
                        className="px-2 py-0.5 bg-surface2 hover:bg-surface border border-border text-[9px] font-mono font-bold text-primary rounded-full uppercase cursor-pointer select-none active:scale-95 transition-all"
                        title="Click to cycle tracker type (Weighted -> Bodyweight -> Timed)"
                      >
                        <RefreshCw className="w-2.5 h-2.5 inline-block mr-1 animate-spin-slow" />
                        {{ weighted: 'W', bodyweight: 'BW', timed: '⏱' }[exType]}
                      </button>
                    </div>
                    <div className="text-xs text-textSecondary mt-1">
                      Target: <span className="text-textPrimary font-mono">{ex.reps}</span>
                      {ex.alt && <span className="ml-2">| Alt: <span className="text-primary/70 italic font-medium">{ex.alt}</span></span>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove "${ex.name}" from this list?`)) {
                        deleteExercise(selectedDay, ex);
                      }
                    }}
                    className="text-textSecondary hover:text-danger hover:bg-surface2 rounded-lg p-1.5 active:scale-95 transition-all cursor-pointer"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Last Session Highlight */}
                {lastDisplay && (
                  <div className="mb-4 text-xs font-mono bg-surface2/60 border border-border/40 px-3 py-1.5 rounded-lg flex justify-between items-center">
                    <span className="text-textSecondary">PREVIOUS SESSION:</span>
                    <span className="text-secondary font-bold">{lastDisplay}</span>
                  </div>
                )}

                {/* Input Fields Logging Row */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {exType === 'timed' ? (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <span className="text-[10px] font-mono font-bold text-textSecondary uppercase">Sec:</span>
                        <Input
                          type="number"
                          placeholder="e.g. 60"
                          value={timeVal}
                          onChange={(e) => handleInputChange(ex._key, 'time', e.target.value)}
                          className="w-full text-center"
                          onKeyDown={(e) => e.key === 'Enter' && handleLogSubmit(ex._key, exType)}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <span className="text-[10px] font-mono font-bold text-textSecondary uppercase">Sets:</span>
                        <Input
                          type="text"
                          placeholder="e.g. 3"
                          value={repsVal}
                          onChange={(e) => handleInputChange(ex._key, 'reps', e.target.value)}
                          className="w-full text-center"
                          onKeyDown={(e) => e.key === 'Enter' && handleLogSubmit(ex._key, exType)}
                        />
                      </div>
                    </>
                  ) : exType === 'bodyweight' ? (
                    <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                      <span className="text-[10px] font-mono font-bold text-textSecondary uppercase">Reps:</span>
                      <Input
                        type="text"
                        placeholder="e.g. 12"
                        value={repsVal}
                        onChange={(e) => handleInputChange(ex._key, 'reps', e.target.value)}
                        className="w-full text-center"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogSubmit(ex._key, exType)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <span className="text-[10px] font-mono font-bold text-textSecondary uppercase">Wt (kg):</span>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g. 20"
                          value={weightVal}
                          onChange={(e) => handleInputChange(ex._key, 'weight', e.target.value)}
                          className="w-full text-center text-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleLogSubmit(ex._key, exType)}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                        <span className="text-[10px] font-mono font-bold text-textSecondary uppercase">Reps:</span>
                        <Input
                          type="text"
                          placeholder="e.g. 10"
                          value={repsVal}
                          onChange={(e) => handleInputChange(ex._key, 'reps', e.target.value)}
                          className="w-full text-center"
                          onKeyDown={(e) => e.key === 'Enter' && handleLogSubmit(ex._key, exType)}
                        />
                      </div>
                    </>
                  )}
                  
                  <Button
                    variant={curLog ? "secondary" : "primary"}
                    onClick={() => handleLogSubmit(ex._key, exType)}
                    className="w-full sm:w-auto min-w-[90px] uppercase font-bold text-xs"
                  >
                    {curLog ? 'Update' : 'Log Set'}
                  </Button>
                </div>

                {/* History Log Pills */}
                {logs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[...logs].sort((a,b)=>b.week.localeCompare(a.week)).slice(0, 4).map((log) => {
                      let text = fmtWeek(log.week);
                      let content = '';
                      if (log.weight && exType === 'weighted') content += `${log.weight}kg`;
                      if (exType === 'timed' && log.time) content += `${log.time}s`;
                      if (log.reps) content += `${content ? ' × ' : ''}${log.reps}`;
                      
                      let volDisplay = '';
                      if (log.weight && log.reps && exType === 'weighted') {
                        const vVal = parseFloat(log.weight as any) * parseInt(log.reps);
                        if (!isNaN(vVal)) volDisplay = ` ⤴${vVal}`;
                      }

                      return (
                        <div 
                          key={log.week}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface2/60 border border-border/30 text-[10px] font-mono"
                        >
                          <span className="text-textSecondary">{text}</span>
                          <span className="text-secondary font-bold">{content}</span>
                          {volDisplay && <span className="text-primary font-semibold">{volDisplay}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* YouTube Link / Video Drawer */}
                <div className="mt-3">
                  <button
                    onClick={() => toggleVideo(ex._key)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      hasVideo ? 'text-primary' : 'text-textSecondary hover:text-textPrimary'
                    } transition-colors`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Guide {isVideoOpen ? '▲' : '▼'}</span>
                  </button>

                  {isVideoOpen && (
                    <div className="mt-3 border border-border bg-surface2/50 rounded-lg p-3 animate-in fade-in duration-200">
                      {hasVideo ? (
                        <div className="space-y-3">
                          {extractYouTubeId(videoLinks[ex._key]) ? (
                            <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-black border border-border">
                              <iframe
                                src={`https://www.youtube.com/embed/${extractYouTubeId(videoLinks[ex._key])}`}
                                allowFullScreen
                                loading="lazy"
                                className="absolute inset-0 w-full h-full border-0"
                              />
                            </div>
                          ) : (
                            <div className="text-[11px] text-danger font-mono">Invalid YouTube Link</div>
                          )}
                          
                          <div className="flex items-center gap-3 flex-wrap">
                            <a
                              href={videoLinks[ex._key]}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Open YouTube link <ExternalLink className="w-3 h-3" />
                            </a>
                            
                            <button
                              onClick={() => {
                                if (window.confirm("Remove this video link?")) saveVideoLink(ex._key, '');
                              }}
                              className="text-[11px] text-danger hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-[11px] text-textSecondary mb-2">No video guide registered for this exercise.</p>
                        </div>
                      )}

                      {/* URL input form */}
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Paste YouTube video URL here..."
                          value={videoInputs[ex._key] || ''}
                          onChange={(e) => setVideoInputs(prev => ({ ...prev, [ex._key]: e.target.value }))}
                          className="flex-1 min-h-[36px] text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const val = videoInputs[ex._key]?.trim() || '';
                            if (val && !extractYouTubeId(val)) {
                              alert("Please enter a valid YouTube link.");
                              return;
                            }
                            saveVideoLink(ex._key, val);
                          }}
                          className="min-h-[36px]"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

              </Card>
            );
          })}

          {/* Add Exercise form */}
          {showAddExForm ? (
            <Card className="border border-primary/50 animate-in fade-in duration-200">
              <form onSubmit={handleAddExercise} className="space-y-4">
                <h4 className="font-display text-sm font-bold text-textPrimary uppercase tracking-wide">
                  New Exercise Specs
                </h4>
                
                <div>
                  <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                    Exercise Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dumbbell Bicep Curl"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                      Sets x Reps Target
                    </label>
                    <Input
                      placeholder="e.g. 4x12"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                      Alternative Exercise
                    </label>
                    <Input
                      placeholder="e.g. Cable Hammer Curl"
                      value={newExAlt}
                      onChange={(e) => setNewExAlt(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                    Tracking Mode
                  </label>
                  <select
                    value={newExType}
                    onChange={(e) => setNewExType(e.target.value as any)}
                    className="w-full h-11 rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-textPrimary outline-none transition-all duration-200 focus:border-primary focus:shadow-focus"
                  >
                    <option value="weighted">Weighted (track weight in kg &amp; reps)</option>
                    <option value="bodyweight">Bodyweight (track reps only)</option>
                    <option value="timed">Timed (track duration in seconds)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="primary" className="flex-1 uppercase font-bold text-xs">
                    Add Exercise
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 uppercase font-bold text-xs"
                    onClick={() => setShowAddExForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowAddExForm(true)}
              className="w-full border-dashed border-2 border-border/70 hover:border-primary/50 text-textSecondary hover:text-primary py-4 rounded-xl flex items-center justify-center transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Exercise Card
            </Button>
          )}

        </div>
      )}

      {/* Add Day Dialog (Radix-Free) */}
      <Dialog
        isOpen={showAddDayModal}
        onClose={() => setShowAddDayModal(false)}
        title="Add Workout Routine Day"
      >
        <form onSubmit={handleAddDay} className="space-y-4 text-textPrimary">
          <div>
            <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
              Routine Day Name
            </label>
            <Input
              required
              placeholder="e.g. DAY 7 - ABS &amp; CARDIO"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              className="font-display font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
              Focus / Feel Objective
            </label>
            <Input
              placeholder="e.g. Core burn, high heart rate, sweat"
              value={newDayFeel}
              onChange={(e) => setNewDayFeel(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1 uppercase font-bold text-xs">
              Create Day
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 uppercase font-bold text-xs"
              onClick={() => setShowAddDayModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};
