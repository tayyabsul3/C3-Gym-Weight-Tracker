import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import {
  TrendingUp, TrendingDown, MoveRight, BarChart2,
  LineChart, Activity, Zap, Target, Award, ChevronDown
} from 'lucide-react';

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
  _key: string;
  _isBuiltIn: boolean;
}

interface WorkoutDay {
  day: string;
  feel: string;
  _key: string;
  exercises: any[];
}

interface ProgressPageProps {
  days: WorkoutDay[];
  getExercisesForDay: (dayIdx: number) => Exercise[];
  weightLogs: { [key: string]: WeightLog[] };
}

type MetricMode = 'weight' | 'reps' | 'time' | 'volume';
type ChartType = 'line' | 'bar';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  val: number;
  week: string;
  idx: number;
}

const METRIC_LABELS: Record<MetricMode, string> = {
  weight: 'Weight (kg)',
  reps: 'Reps',
  time: 'Duration (s)',
  volume: 'Volume (kg×reps)',
};

const METRIC_UNITS: Record<MetricMode, string> = {
  weight: 'kg',
  reps: '',
  time: 's',
  volume: '',
};

function formatVal(val: number, mode: MetricMode) {
  if (mode === 'volume' && val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return mode === 'weight' || mode === 'volume' ? val.toFixed(1) : Math.round(val).toString();
}

// ─── Dynamic Animated SVG Chart ────────────────────────────────────────────
const AnimatedChart: React.FC<{
  logs: WeightLog[];
  mode: MetricMode;
  chartType: ChartType;
  accentColor: string;
}> = ({ logs, mode, chartType, accentColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, val: 0, week: '', idx: -1
  });
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number>(0);

  // Responsive width
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width || 400);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Animate in on mount / data change
  useEffect(() => {
    setAnimProgress(0);
    const start = performance.now();
    const duration = 700;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setAnimProgress(ease(t));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [logs, mode]);

  const filtered = logs.filter(l => {
    if (mode === 'volume') return l.weight && l.reps;
    if (mode === 'time') return l.time;
    if (mode === 'weight') return l.weight;
    return l.reps && !isNaN(parseInt(l.reps));
  });

  const vals = filtered.map(l => {
    if (mode === 'volume') return parseFloat(String(l.weight)) * parseInt(l.reps!);
    if (mode === 'time') return l.time!;
    if (mode === 'weight') return l.weight!;
    return parseInt(l.reps!);
  });

  if (vals.length < 2) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-textSecondary gap-2 border border-dashed border-border/40 rounded-xl">
        <BarChart2 className="w-8 h-8 opacity-25" />
        <p className="text-[11px] font-mono uppercase tracking-wider opacity-50">
          Log at least 2 weeks to view chart
        </p>
      </div>
    );
  }

  const H = 220;
  const pad = { top: 24, bot: 42, left: 50, right: 16 };
  const chartW = width - pad.left - pad.right;
  const chartH = H - pad.top - pad.bot;

  const minV = Math.max(0, Math.min(...vals) * 0.85);
  const maxV = Math.max(...vals) * 1.1;
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.left + (i / (filtered.length - 1)) * chartW;
  const toY = (v: number) => pad.top + (1 - (v - minV) / range) * chartH;

  const points = vals.map((v, i) => ({ x: toX(i), y: toY(v), val: v, week: filtered[i].week }));

  // Animated points — expand from left
  const animPoints = points.map((p, i) => {
    const pct = i / (points.length - 1);
    const visible = animProgress >= pct;
    return { ...p, visible };
  });

  // Line path (animated)
  const animLen = Math.floor(animProgress * (points.length - 1));
  const partialPoints = points.slice(0, animLen + 2).map((p, i) => ({
    ...p,
    x: i <= animLen ? p.x : p.x * animProgress + points[0].x * (1 - animProgress),
  }));

  let linePath = '';
  let areaPath = '';

  if (partialPoints.length >= 2) {
    // Smooth bezier curves
    linePath = `M ${partialPoints[0].x} ${partialPoints[0].y}`;
    for (let i = 1; i < partialPoints.length; i++) {
      const prev = partialPoints[i - 1];
      const curr = partialPoints[i];
      const cpx = (prev.x + curr.x) / 2;
      linePath += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    const last = partialPoints[partialPoints.length - 1];
    const first = partialPoints[0];
    areaPath = `${linePath} L ${last.x} ${H - pad.bot} L ${first.x} ${H - pad.bot} Z`;
  }

  // Grid rows
  const gridRows = Array.from({ length: 4 }, (_, i) => {
    const frac = i / 3;
    const y = pad.top + frac * chartH;
    const v = minV + (1 - frac) * range;
    return { y, label: formatVal(v, mode) };
  });

  // Bar width
  const barW = Math.max(6, Math.min(32, (chartW / filtered.length) * 0.55));

  const maxVal = Math.max(...vals);
  const peakIdx = vals.indexOf(maxVal);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    let closest = -1;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - mx);
      if (d < closestDist) { closestDist = d; closest = i; }
    });

    if (closest >= 0 && closestDist < 40) {
      setTooltip({
        visible: true,
        x: points[closest].x,
        y: points[closest].y,
        val: points[closest].val,
        week: points[closest].week,
        idx: closest,
      });
    } else {
      setTooltip(t => ({ ...t, visible: false }));
    }
  }, [points]);

  const handleMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));

  const weekLabel = (w: string) => {
    const part = w.split('-W')[1] || w.slice(-2);
    return `W${part}`;
  };

  const gradId = `grad-${mode}`;
  const glowId = `glow-${mode}`;
  const clipId = `clip-${mode}`;

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        width="100%"
        height={H}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="overflow-visible cursor-crosshair"
        style={{ touchAction: 'none' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={accentColor} floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={clipId}>
            <rect x={pad.left} y={pad.top - 10} width={chartW * animProgress} height={chartH + 20} />
          </clipPath>
        </defs>

        {/* Grid */}
        {gridRows.map((row, i) => (
          <g key={i}>
            <line
              x1={pad.left} y1={row.y}
              x2={width - pad.right} y2={row.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={pad.left - 8} y={row.y + 4}
              fill="rgba(148,163,184,0.7)"
              fontSize={9}
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="end"
            >
              {row.label}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x} y={H - 6}
            fill="rgba(148,163,184,0.6)"
            fontSize={8}
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            {weekLabel(p.week)}
          </text>
        ))}

        {/* Avg line */}
        {(() => {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          const ay = toY(avg);
          return (
            <line
              x1={pad.left} y1={ay}
              x2={width - pad.right} y2={ay}
              stroke={accentColor}
              strokeWidth={1}
              strokeDasharray="5 4"
              opacity={0.3}
            />
          );
        })()}

        {chartType === 'line' ? (
          <g clipPath={`url(#${clipId})`}>
            {/* Area */}
            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={accentColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Glow line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={accentColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.4}
                filter={`url(#${glowId})`}
              />
            )}
          </g>
        ) : (
          // Bar chart
          <>
            {points.map((p, i) => {
              const bH = Math.max(2, ((p.val - minV) / range) * chartH * animProgress);
              const bY = H - pad.bot - bH;
              const isHovered = tooltip.idx === i;
              const isPeak = i === peakIdx;
              return (
                <g key={i}>
                  {/* Bar glow backdrop */}
                  <rect
                    x={p.x - barW / 2 - 2}
                    y={bY - 2}
                    width={barW + 4}
                    height={bH + 2}
                    rx={4}
                    fill={accentColor}
                    opacity={isHovered ? 0.12 : 0.05}
                  />
                  <rect
                    x={p.x - barW / 2}
                    y={bY}
                    width={barW}
                    height={bH}
                    rx={4}
                    fill={isPeak ? '#22C55E' : isHovered ? accentColor : accentColor}
                    opacity={isPeak ? 1 : isHovered ? 0.95 : 0.7}
                    style={{ transition: 'opacity 0.15s' }}
                  />
                </g>
              );
            })}
          </>
        )}

        {/* Dots (line chart) */}
        {chartType === 'line' && animPoints.map((p, i) => {
          if (!p.visible) return null;
          const isPeak = i === peakIdx;
          const isHovered = tooltip.idx === i;
          return (
            <g key={i}>
              {isPeak && (
                <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#22C55E" strokeWidth={1} opacity={0.3} />
              )}
              {isHovered && (
                <circle cx={p.x} cy={p.y} r={12} fill={accentColor} opacity={0.12} />
              )}
              <circle
                cx={p.x} cy={p.y}
                r={isPeak ? 6 : isHovered ? 5 : 3.5}
                fill={isPeak ? '#22C55E' : accentColor}
                stroke="#0F0F11"
                strokeWidth={2}
                style={{ transition: 'r 0.1s' }}
              />
            </g>
          );
        })}

        {/* Tooltip vertical line */}
        {tooltip.visible && (
          <line
            x1={tooltip.x} y1={pad.top}
            x2={tooltip.x} y2={H - pad.bot}
            stroke={accentColor}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}
      </svg>

      {/* Floating Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-20 bg-surface border border-border/60 rounded-xl px-3 py-2 shadow-xl"
          style={{
            left: Math.min(tooltip.x, width - 110),
            top: Math.max(tooltip.y - 60, 0),
            transform: 'translateX(-50%)',
            minWidth: 100,
          }}
        >
          <p className="text-[9px] font-mono text-textSecondary uppercase tracking-widest mb-0.5">
            {tooltip.week.replace('-W', ' · Week ')}
          </p>
          <p className="text-sm font-black font-display text-textPrimary">
            {formatVal(tooltip.val, mode)}
            <span className="text-xs font-mono text-primary ml-1">{METRIC_UNITS[mode]}</span>
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Personal Record Badge ─────────────────────────────────────────────────
const PRBadge: React.FC<{ val: number; unit: string }> = ({ val, unit }) => (
  <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/25 rounded-lg px-2.5 py-1">
    <Award className="w-3.5 h-3.5 text-yellow-400" />
    <span className="text-[10px] font-mono font-bold text-yellow-300 uppercase tracking-wider">
      PR: {val}{unit}
    </span>
  </div>
);

// ─── Stat Pill ─────────────────────────────────────────────────────────────
const StatPill: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = 'text-textPrimary' }) => (
  <div className="flex-1 min-w-0 bg-surface2/60 border border-border/40 rounded-xl p-3 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-textSecondary">
      {icon}
      <span className="text-[9px] font-mono uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-base font-black font-display ${color}`}>{value}</span>
  </div>
);

// ─── Sparkline (tiny inline chart) ─────────────────────────────────────────
const Sparkline: React.FC<{ vals: number[]; color: string; width?: number }> = ({
  vals, color, width = 64
}) => {
  if (vals.length < 2) return <div style={{ width }} />;
  const H = 24;
  const min = Math.min(...vals);
  const max = Math.max(...vals) || 1;
  const pts = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * width,
    y: H - 2 - ((v - min) / (max - min || 1)) * (H - 4),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cp} ${pts[i - 1].y} ${cp} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  return (
    <svg width={width} height={H}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export const ProgressPage: React.FC<ProgressPageProps> = ({
  days, getExercisesForDay, weightLogs
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [focusedExKey, setFocusedExKey] = useState('');
  const [metricMode, setMetricMode] = useState<MetricMode>('reps');
  const [chartType, setChartType] = useState<ChartType>('line');

  const day = days[selectedDayIdx];
  const exercises = day ? getExercisesForDay(selectedDayIdx) : [];

  // ── Build stats list ──────────────────────────────────────────────────────
  const statsList = exercises.reduce<any[]>((acc, ex) => {
    const logs = weightLogs[ex._key] || [];
    if (logs.length < 2) return acc;

    const sorted = [...logs].sort((a, b) => a.week.localeCompare(b.week));
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const type = ex.type || (ex.bodyweight ? 'bodyweight' : 'weighted');

    let pVal = 0, cVal = 0, unit = '', modeLabel = '';
    if (type === 'timed') {
      pVal = prev.time ?? 0; cVal = last.time ?? 0; unit = 's'; modeLabel = 'Duration';
    } else if (type === 'weighted') {
      pVal = prev.weight ?? 0; cVal = last.weight ?? 0; unit = 'kg'; modeLabel = 'Weight';
    } else {
      pVal = parseInt(prev.reps ?? '0') || 0;
      cVal = parseInt(last.reps ?? '0') || 0;
      unit = ' reps'; modeLabel = 'Reps';
    }

    const dir: 'up' | 'down' | 'flat' = cVal > pVal ? 'up' : cVal < pVal ? 'down' : 'flat';
    const allVals = sorted.map(l => {
      if (type === 'timed') return l.time ?? 0;
      if (type === 'weighted') return l.weight ?? 0;
      return parseInt(l.reps ?? '0') || 0;
    });
    const pr = Math.max(...allVals);

    acc.push({ ex, logs, sorted, prev, last, type, pVal, cVal, dir, unit, modeLabel, allVals, pr });
    return acc;
  }, []);

  const improvingCount = statsList.filter(s => s.dir === 'up').length;
  const steadyCount = statsList.filter(s => s.dir === 'flat').length;
  const decliningCount = statsList.filter(s => s.dir === 'down').length;

  // ── Auto-focus first exercise ─────────────────────────────────────────────
  useEffect(() => {
    if (!focusedExKey && statsList.length > 0) setFocusedExKey(statsList[0].ex._key);
  }, [statsList.length]);

  useEffect(() => { setFocusedExKey(''); }, [selectedDayIdx]);

  const focusedItem = statsList.find(c => c.ex._key === focusedExKey);

  // ── Available metric modes for focused exercise ───────────────────────────
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

  const accentColors: Record<MetricMode, string> = {
    weight: '#F97316',
    reps: '#818CF8',
    time: '#22C55E',
    volume: '#F59E0B',
  };
  const accent = accentColors[metricMode];

  // ── Trend computation for focused item ───────────────────────────────────
  let trend: 'up' | 'down' | 'flat' = 'flat';
  let trendPct = 0;
  let avgVal = 0;
  let prVal = 0;
  if (focusedItem) {
    const { pVal, cVal, pr, sorted, allVals } = focusedItem;
    trend = cVal > pVal ? 'up' : cVal < pVal ? 'down' : 'flat';
    trendPct = pVal > 0 ? Math.abs(((cVal - pVal) / pVal) * 100) : 0;
    avgVal = allVals.reduce((a: number, b: number) => a + b, 0) / allVals.length;
    prVal = pr;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 font-body">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase text-textPrimary tracking-tight">
            Progress
          </h2>
        </div>
        <p className="text-xs text-textSecondary font-mono tracking-widest ml-11 uppercase">
          Visualize your strength gains
        </p>
      </div>

      {/* ── Day Selector ───────────────────────────────────────────────── */}
      {days.length > 0 ? (
        <div className="relative mb-5">
          <select
            value={selectedDayIdx}
            onChange={e => {
              setSelectedDayIdx(parseInt(e.target.value));
              setFocusedExKey('');
            }}
            className="w-full h-11 rounded-xl border border-border bg-surface px-4 pr-10 text-sm font-semibold text-textPrimary outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
          >
            {days.map((d, i) => (
              <option key={d._key} value={i}>
                {d.day.replace('DAY ', 'Routine ')}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl text-textSecondary text-sm mb-6">
          No routines found. Create a workout first.
        </div>
      )}

      {/* ── Overview Pills ─────────────────────────────────────────────── */}
      {day && statsList.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <StatPill
            label="Improving"
            value={String(improvingCount)}
            icon={<TrendingUp className="w-3 h-3 text-success" />}
            color="text-success"
          />
          <StatPill
            label="Steady"
            value={String(steadyCount)}
            icon={<MoveRight className="w-3 h-3 text-textSecondary" />}
          />
          <StatPill
            label="Needs Work"
            value={String(decliningCount)}
            icon={<TrendingDown className="w-3 h-3 text-danger" />}
            color="text-danger"
          />
          <StatPill
            label="Tracked"
            value={String(statsList.length)}
            icon={<Target className="w-3 h-3 text-primary" />}
            color="text-primary"
          />
        </div>
      )}

      {/* ── Interactive Chart Card ──────────────────────────────────────── */}
      {focusedItem ? (
        <div
          className="rounded-2xl border mb-5 overflow-hidden transition-all duration-300"
          style={{ borderColor: `${accent}40`, background: 'rgba(15,15,17,0.95)' }}
        >
          {/* Chart header */}
          <div className="px-4 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-display text-base font-black text-textPrimary uppercase tracking-wide leading-tight">
                  {focusedItem.ex.name}
                </h3>
                <p className="text-[10px] font-mono text-textSecondary uppercase tracking-widest mt-0.5">
                  {focusedItem.sorted.length} sessions logged
                </p>
              </div>
              <PRBadge val={prVal} unit={focusedItem.unit} />
            </div>

            {/* Trend indicator */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full ${
                  trend === 'up'
                    ? 'bg-success/15 text-success'
                    : trend === 'down'
                    ? 'bg-danger/15 text-danger'
                    : 'bg-textSecondary/10 text-textSecondary'
                }`}
              >
                {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
                 trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
                 <MoveRight className="w-3.5 h-3.5" />}
                {trend === 'flat' ? 'No change' : `${trendPct.toFixed(1)}% ${trend === 'up' ? 'increase' : 'decrease'}`}
              </div>
              <div className="text-[10px] font-mono text-textSecondary">
                Avg: <span className="text-textPrimary font-bold">{formatVal(avgVal, metricMode)}{METRIC_UNITS[metricMode]}</span>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-border/20">
            {/* Metric tabs */}
            <div className="flex items-center gap-1">
              {availModes.map(m => (
                <button
                  key={m}
                  onClick={() => setMetricMode(m)}
                  className={`h-7 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                    metricMode === m
                      ? 'text-white'
                      : 'text-textSecondary hover:text-textPrimary bg-transparent'
                  }`}
                  style={metricMode === m ? { background: accent } : {}}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Chart type toggle */}
            <div className="flex items-center bg-surface2/80 rounded-lg p-0.5">
              <button
                onClick={() => setChartType('line')}
                className={`h-6 w-7 rounded-md flex items-center justify-center transition-all ${
                  chartType === 'line' ? 'bg-surface text-primary shadow' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`h-6 w-7 rounded-md flex items-center justify-center transition-all ${
                  chartType === 'bar' ? 'bg-surface text-primary shadow' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chart area */}
          <div className="px-3 pt-3 pb-1">
            <AnimatedChart
              logs={focusedItem.sorted}
              mode={metricMode}
              chartType={chartType}
              accentColor={accent}
            />
          </div>

          {/* Legend */}
          <div className="px-4 pb-3 flex items-center gap-4 text-[9px] font-mono text-textSecondary uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
              Peak
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 border-t border-dashed" style={{ borderColor: accent }} />
              Average
            </span>
            <span className="ml-auto opacity-50">Hover for details</span>
          </div>
        </div>
      ) : (
        day && (
          <div className="h-44 flex flex-col items-center justify-center text-textSecondary text-xs border border-dashed border-border rounded-2xl font-mono text-center mb-5 px-4 gap-2">
            <Activity className="w-6 h-6 opacity-30" />
            <span className="uppercase tracking-wider opacity-60">
              Log data across at least 2 weeks to view charts
            </span>
          </div>
        )
      )}

      {/* ── Exercise Cards List ─────────────────────────────────────────── */}
      {day && statsList.length > 0 ? (
        <div className="space-y-2.5">
          <p className="text-[10px] font-mono text-textSecondary uppercase tracking-widest mb-3">
            — All Exercises
          </p>
          {statsList.map(c => {
            const isFocused = c.ex._key === focusedExKey;
            const delta = c.cVal - c.pVal;
            const diffSign = delta > 0 ? '+' : '';
            const deltaColor = delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-textSecondary';
            const barPct = c.cVal / (Math.max(c.pVal, c.cVal) || 1) * 100;
            const prevBarPct = c.pVal / (Math.max(c.pVal, c.cVal) || 1) * 100;
            const sparkColor = c.dir === 'up' ? '#22C55E' : c.dir === 'down' ? '#EF4444' : '#64748B';

            return (
              <button
                key={c.ex._key}
                onClick={() => setFocusedExKey(c.ex._key)}
                className="w-full text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer group flex flex-col gap-2.5"
                style={{
                  background: isFocused ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
                  borderColor: isFocused ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)',
                  boxShadow: isFocused ? '0 0 0 1px rgba(249,115,22,0.15)' : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-textPrimary uppercase tracking-wide truncate">
                      {c.ex.name}
                    </h4>
                    <p className="text-[9px] font-mono text-textSecondary uppercase tracking-widest">
                      {c.modeLabel} · {c.sorted.length} entries
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Sparkline vals={c.allVals} color={sparkColor} width={56} />
                    <div className={`text-xs font-black font-mono ${deltaColor}`}>
                      {diffSign}{delta}{c.unit}
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      c.dir === 'up' ? 'bg-success/15' : c.dir === 'down' ? 'bg-danger/15' : 'bg-border/20'
                    }`}>
                      {c.dir === 'up'
                        ? <TrendingUp className="w-3 h-3 text-success" />
                        : c.dir === 'down'
                        ? <TrendingDown className="w-3 h-3 text-danger" />
                        : <MoveRight className="w-3 h-3 text-textSecondary" />}
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-primary w-8 shrink-0">NOW</span>
                    <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%`, background: '#F97316' }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-textPrimary w-12 text-right shrink-0">
                      {c.cVal}{c.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-textSecondary w-8 shrink-0">PREV</span>
                    <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${prevBarPct}%`, background: 'rgba(148,163,184,0.35)' }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-textSecondary w-12 text-right shrink-0">
                      {c.pVal}{c.unit}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        day && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Zap className="w-8 h-8 text-primary/30 mx-auto mb-3" />
            <p className="text-textSecondary text-xs font-mono uppercase tracking-wider">
              Log workouts across multiple weeks to see progress cards here
            </p>
          </div>
        )
      )}
    </div>
  );
};
