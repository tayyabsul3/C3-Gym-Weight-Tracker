import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, MoveRight,
  BarChart2, Activity, Zap, Target, Award,
  ChevronDown, LineChartIcon
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface WeightLog {
  week: string;
  weight?: number;
  reps?: string;
  time?: number;
}
interface Exercise {
  name: string; reps: string; alt: string;
  bodyweight?: boolean; type?: string;
  _key: string; _isBuiltIn: boolean;
}
interface WorkoutDay {
  day: string; feel: string; _key: string; exercises: any[];
}
interface ProgressPageProps {
  days: WorkoutDay[];
  getExercisesForDay: (dayIdx: number) => Exercise[];
  weightLogs: { [key: string]: WeightLog[] };
}
type MetricMode = 'weight' | 'reps' | 'time' | 'volume';
type ChartType = 'area' | 'bar';

// ─── Helpers ────────────────────────────────────────────────────────────────
const METRIC_UNITS: Record<MetricMode, string> = {
  weight: 'kg', reps: '', time: 's', volume: ''
};
const METRIC_LABELS: Record<MetricMode, string> = {
  weight: 'Weight (kg)', reps: 'Reps', time: 'Duration (s)', volume: 'Volume'
};
const ACCENT_COLORS: Record<MetricMode, string> = {
  weight: '#F97316', reps: '#818CF8', time: '#22C55E', volume: '#F59E0B'
};

function getVal(l: WeightLog, mode: MetricMode): number {
  if (mode === 'volume') return (parseFloat(String(l.weight || 0)) * parseInt(l.reps || '0')) || 0;
  if (mode === 'time') return l.time || 0;
  if (mode === 'weight') return l.weight || 0;
  return parseInt(l.reps || '0') || 0;
}

function fmtWeek(w: string) {
  const part = w.split('-W')[1];
  return part ? `W${part}` : w.slice(-3);
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const color = payload[0]?.color || '#F97316';
  return (
    <div className="bg-surface border border-border/60 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[9px] font-mono text-textSecondary uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-textPrimary">
        {typeof val === 'number' ? (mode === 'weight' || mode === 'volume' ? val.toFixed(1) : Math.round(val)) : val}
        <span className="text-xs font-mono ml-1" style={{ color }}>{METRIC_UNITS[mode as MetricMode]}</span>
      </p>
    </div>
  );
};

// ─── Sparkline (tiny inline chart for exercise cards) ───────────────────────
const Sparkline: React.FC<{ vals: number[]; color: string }> = ({ vals, color }) => {
  if (vals.length < 2) return <div className="w-14 h-6" />;
  const data = vals.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={56} height={24}>
      <LineChart data={data}>
        <Line dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export const ProgressPage: React.FC<ProgressPageProps> = ({
  days, getExercisesForDay, weightLogs
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [focusedExKey, setFocusedExKey] = useState('');
  const [metricMode, setMetricMode] = useState<MetricMode>('reps');
  const [chartType, setChartType] = useState<ChartType>('area');

  const day = days[selectedDayIdx];
  const exercises = day ? getExercisesForDay(selectedDayIdx) : [];

  // ── Build stats list ──────────────────────────────────────────────────────
  const statsList = exercises.reduce<any[]>((acc, ex) => {
    const logs = weightLogs[ex._key] || [];
    if (logs.length < 1) return acc; // show even with 1 entry

    const sorted = [...logs].sort((a, b) => a.week.localeCompare(b.week));
    const last = sorted[sorted.length - 1];
    const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
    const type = ex.type || (ex.bodyweight ? 'bodyweight' : 'weighted');

    let pVal = 0, cVal = 0, unit = '', modeLabel = '';
    if (type === 'timed') {
      pVal = prev?.time ?? 0; cVal = last.time ?? 0; unit = 's'; modeLabel = 'Duration';
    } else if (type === 'weighted') {
      pVal = prev?.weight ?? 0; cVal = last.weight ?? 0; unit = 'kg'; modeLabel = 'Weight';
    } else {
      pVal = parseInt(prev?.reps ?? '0') || 0;
      cVal = parseInt(last.reps ?? '0') || 0;
      unit = ' reps'; modeLabel = 'Reps';
    }

    const dir: 'up' | 'down' | 'flat' = !prev ? 'flat' : cVal > pVal ? 'up' : cVal < pVal ? 'down' : 'flat';
    const allVals = sorted.map(l => {
      if (type === 'timed') return l.time ?? 0;
      if (type === 'weighted') return l.weight ?? 0;
      return parseInt(l.reps ?? '0') || 0;
    });
    const pr = Math.max(...allVals, 0);

    acc.push({ ex, logs, sorted, prev, last, type, pVal, cVal, dir, unit, modeLabel, allVals, pr });
    return acc;
  }, []);

  const improvingCount = statsList.filter(s => s.dir === 'up').length;
  const steadyCount = statsList.filter(s => s.dir === 'flat').length;
  const decliningCount = statsList.filter(s => s.dir === 'down').length;

  // ── Auto-focus ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (statsList.length > 0) setFocusedExKey(statsList[0].ex._key);
  }, [selectedDayIdx]);

  useEffect(() => {
    if (!focusedExKey && statsList.length > 0) setFocusedExKey(statsList[0].ex._key);
  }, [statsList.length]);

  const focusedItem = statsList.find(c => c.ex._key === focusedExKey);

  // ── Available modes ────────────────────────────────────────────────────
  const availModes: MetricMode[] = [];
  if (focusedItem) {
    const { ex, sorted } = focusedItem;
    if (ex.type !== 'timed' && sorted.some((l: any) => l.weight)) availModes.push('weight');
    if (sorted.some((l: any) => l.reps)) availModes.push('reps');
    if (ex.type === 'timed' || sorted.some((l: any) => l.time)) availModes.push('time');
    if (ex.type !== 'timed' && sorted.some((l: any) => l.weight && l.reps)) availModes.push('volume');
  }

  useEffect(() => {
    if (focusedItem && availModes.length > 0 && !availModes.includes(metricMode)) {
      setMetricMode(availModes[0]);
    }
  }, [focusedExKey]);

  // ── Chart data ─────────────────────────────────────────────────────────
  const chartData = focusedItem
    ? focusedItem.sorted
        .filter((l: any) => getVal(l, metricMode) > 0)
        .map((l: any) => ({
          week: fmtWeek(l.week),
          value: getVal(l, metricMode),
        }))
    : [];

  const accent = ACCENT_COLORS[metricMode];

  // trend stats
  const trend = focusedItem?.dir ?? 'flat';
  const trendPct = focusedItem && focusedItem.pVal > 0
    ? Math.abs(((focusedItem.cVal - focusedItem.pVal) / focusedItem.pVal) * 100)
    : 0;
  const avgVal = chartData.length
    ? chartData.reduce((s: number, d: any) => s + d.value, 0) / chartData.length
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-black text-textPrimary">Progress</h2>
        </div>
        <p className="text-xs text-textSecondary ml-11">Visualize your strength gains over time</p>
      </div>

      {/* Day selector */}
      {days.length > 0 ? (
        <div className="relative mb-5">
          <select
            value={selectedDayIdx}
            onChange={e => { setSelectedDayIdx(parseInt(e.target.value)); setFocusedExKey(''); }}
            className="w-full h-11 rounded-xl border border-border bg-surface px-4 pr-10 text-sm font-semibold text-textPrimary outline-none focus:border-primary appearance-none cursor-pointer"
          >
            {days.map((d, i) => (
              <option key={d._key} value={i}>{d.day.replace('DAY ', 'Routine ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl text-textSecondary text-sm mb-6">
          No routines. Create a workout first.
        </div>
      )}

      {/* Overview stats */}
      {day && statsList.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Improving', val: improvingCount, color: 'text-green-400', bg: 'bg-green-400/10', icon: <TrendingUp className="w-3 h-3" /> },
            { label: 'Steady', val: steadyCount, color: 'text-textSecondary', bg: 'bg-white/5', icon: <MoveRight className="w-3 h-3" /> },
            { label: 'Needs work', val: decliningCount, color: 'text-red-400', bg: 'bg-red-400/10', icon: <TrendingDown className="w-3 h-3" /> },
            { label: 'Tracked', val: statsList.length, color: 'text-primary', bg: 'bg-primary/10', icon: <Target className="w-3 h-3" /> },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-border/30 rounded-xl p-2.5 flex flex-col gap-1`}>
              <div className={`flex items-center gap-1 ${s.color}`}>{s.icon}<span className="text-[9px] font-mono uppercase">{s.label}</span></div>
              <span className={`text-lg font-black ${s.color}`}>{s.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Recharts Chart Card ─────────────────────────────────────────── */}
      {focusedItem ? (
        <div
          className="rounded-2xl border mb-5 overflow-hidden"
          style={{ borderColor: `${accent}35`, background: '#0F0F11' }}
        >
          {/* Card header */}
          <div className="px-4 pt-4 pb-3 border-b border-border/20">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-display text-sm font-bold text-textPrimary">{focusedItem.ex.name}</h3>
                <p className="text-[10px] text-textSecondary mt-0.5">{focusedItem.sorted.length} session{focusedItem.sorted.length !== 1 ? 's' : ''} logged</p>
              </div>
              {focusedItem.pr > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-2.5 py-1">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-mono font-bold text-yellow-300">PR: {focusedItem.pr}{focusedItem.unit}</span>
                </div>
              )}
            </div>

            {/* Trend pill + avg */}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                trend === 'up' ? 'bg-green-400/15 text-green-400'
                : trend === 'down' ? 'bg-red-400/15 text-red-400'
                : 'bg-white/5 text-textSecondary'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <MoveRight className="w-3 h-3" />}
                {trend === 'flat' ? 'No change yet' : `${trendPct.toFixed(1)}% ${trend === 'up' ? 'increase' : 'decrease'}`}
              </div>
              {avgVal > 0 && (
                <span className="text-[10px] text-textSecondary">
                  Avg: <span className="text-textPrimary font-semibold">
                    {metricMode === 'weight' || metricMode === 'volume' ? avgVal.toFixed(1) : Math.round(avgVal)}{METRIC_UNITS[metricMode]}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-border/10">
            {/* Metric mode tabs */}
            <div className="flex items-center gap-1">
              {availModes.map(m => (
                <button
                  key={m}
                  onClick={() => setMetricMode(m)}
                  className="h-7 px-2.5 rounded-lg text-[10px] font-semibold capitalize transition-all duration-150"
                  style={metricMode === m
                    ? { background: accent, color: '#fff' }
                    : { color: 'rgba(148,163,184,0.8)' }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setChartType('area')}
                className={`h-6 w-7 rounded-md flex items-center justify-center transition-all ${chartType === 'area' ? 'bg-surface text-primary shadow' : 'text-textSecondary'}`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`h-6 w-7 rounded-md flex items-center justify-center transition-all ${chartType === 'bar' ? 'bg-surface text-primary shadow' : 'text-textSecondary'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="px-2 pt-4 pb-3">
            {chartData.length >= 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${metricMode}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={accent} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10, fontFamily: 'monospace' }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontFamily: 'monospace' }}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                    />
                    {avgVal > 0 && (
                      <ReferenceLine
                        y={avgVal}
                        stroke={accent}
                        strokeDasharray="5 4"
                        strokeOpacity={0.4}
                        strokeWidth={1}
                      />
                    )}
                    <Tooltip content={<CustomTooltip mode={metricMode} />} cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={accent}
                      strokeWidth={2.5}
                      fill={`url(#grad-${metricMode})`}
                      dot={{ fill: accent, r: 4, strokeWidth: 2, stroke: '#0F0F11' }}
                      activeDot={{ r: 6, fill: accent, strokeWidth: 2, stroke: '#0F0F11' }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10, fontFamily: 'monospace' }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9, fontFamily: 'monospace' }}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                    />
                    {avgVal > 0 && (
                      <ReferenceLine
                        y={avgVal}
                        stroke={accent}
                        strokeDasharray="5 4"
                        strokeOpacity={0.4}
                        strokeWidth={1}
                      />
                    )}
                    <Tooltip content={<CustomTooltip mode={metricMode} />} cursor={{ fill: `${accent}15` }} />
                    <Bar
                      dataKey="value"
                      fill={accent}
                      opacity={0.85}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center gap-2 text-textSecondary border border-dashed border-border/30 rounded-xl">
                <BarChart2 className="w-7 h-7 opacity-20" />
                <p className="text-xs opacity-50">Log this exercise to see your chart</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-4 pb-3 flex items-center gap-4 text-[9px] font-mono text-textSecondary">
            <span className="flex items-center gap-1.5">
              <span className="w-6 border-t border-dashed" style={{ borderColor: accent }} />
              Average
            </span>
            <span className="ml-auto opacity-40">Hover over data points for details</span>
          </div>
        </div>
      ) : (
        day && (
          <div className="h-44 flex flex-col items-center justify-center gap-2 text-textSecondary border border-dashed border-border rounded-2xl mb-5 px-4">
            <Activity className="w-6 h-6 opacity-25" />
            <span className="text-xs opacity-50 text-center">Log workouts to start seeing progress charts</span>
          </div>
        )
      )}

      {/* ── Exercise list cards ─────────────────────────────────────────── */}
      {day && statsList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-textSecondary mb-3">All exercises</p>
          {statsList.map(c => {
            const isFocused = c.ex._key === focusedExKey;
            const delta = c.cVal - c.pVal;
            const diffSign = delta > 0 ? '+' : '';
            const deltaColor = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-textSecondary';
            const barPct = Math.round((c.cVal / (Math.max(c.pVal, c.cVal) || 1)) * 100);
            const prevPct = Math.round((c.pVal / (Math.max(c.pVal, c.cVal) || 1)) * 100);
            const sparkColor = c.dir === 'up' ? '#22C55E' : c.dir === 'down' ? '#EF4444' : '#64748B';

            return (
              <button
                key={c.ex._key}
                onClick={() => setFocusedExKey(c.ex._key)}
                className="w-full text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer flex flex-col gap-2.5"
                style={{
                  background: isFocused ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
                  borderColor: isFocused ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-textPrimary truncate">{c.ex.name}</h4>
                    <p className="text-[9px] text-textSecondary">{c.modeLabel} · {c.sorted.length} session{c.sorted.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Sparkline vals={c.allVals} color={sparkColor} />
                    <span className={`text-xs font-bold font-mono ${deltaColor}`}>
                      {c.pVal > 0 ? `${diffSign}${delta}${c.unit}` : `${c.cVal}${c.unit}`}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      c.dir === 'up' ? 'bg-green-400/15' : c.dir === 'down' ? 'bg-red-400/15' : 'bg-white/5'
                    }`}>
                      {c.dir === 'up' ? <TrendingUp className="w-3 h-3 text-green-400" />
                        : c.dir === 'down' ? <TrendingDown className="w-3 h-3 text-red-400" />
                        : <MoveRight className="w-3 h-3 text-textSecondary" />}
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-primary w-7 shrink-0">NOW</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, background: '#F97316' }} />
                    </div>
                    <span className="text-[9px] font-mono text-textPrimary w-10 text-right shrink-0">{c.cVal}{c.unit}</span>
                  </div>
                  {c.pVal > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-textSecondary w-7 shrink-0">PREV</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${prevPct}%`, background: 'rgba(148,163,184,0.3)' }} />
                      </div>
                      <span className="text-[9px] font-mono text-textSecondary w-10 text-right shrink-0">{c.pVal}{c.unit}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        day && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Zap className="w-7 h-7 text-primary/25 mx-auto mb-2" />
            <p className="text-textSecondary text-xs">Log this routine's exercises to see progress cards here</p>
          </div>
        )
      )}
    </div>
  );
};
