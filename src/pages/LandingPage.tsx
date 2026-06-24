import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  CloudOff, 
  FileJson, 
  ArrowRight, 
  Smartphone, 
  Laptop, 
  Tablet, 
  ChevronDown, 
  Check, 
  Sparkles,
  Info,
  Layers,
  Zap,
  Activity,
  Settings
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  // Simulator State
  const [simWeight, setSimWeight] = useState('60');
  const [simReps, setSimReps] = useState('10');
  const [simLogs, setSimLogs] = useState<Array<{ id: number; weight: number; reps: number; vol: number }>>([
    { id: 1, weight: 50, reps: 10, vol: 500 },
    { id: 2, weight: 55, reps: 10, vol: 550 }
  ]);
  const [simToast, setSimToast] = useState('');

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const handleSimLog = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(simWeight);
    const r = parseInt(simReps);
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return;

    const newLog = {
      id: Date.now(),
      weight: w,
      reps: r,
      vol: w * r
    };

    setSimLogs(prev => [newLog, ...prev].slice(0, 3));
    setSimToast(`Logged ${w}kg × ${r} (Vol: ${w * r}kg)`);
    setTimeout(() => setSimToast(''), 3000);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(prev => (prev === idx ? null : idx));
  };

  const faqs = [
    {
      q: "Does LiftLog store my data on a remote server?",
      a: "No. LiftLog is 100% serverless and private. All your logs are stored directly inside your browser's local sandbox storage (localStorage). There is no telemetry, no tracking, no ad cookies, and no account setup required."
    },
    {
      q: "How do I install LiftLog as a mobile application?",
      a: "Since LiftLog is a Progressive Web Application (PWA), you can run it full-screen just like a native app. On iOS Safari, tap the 'Share' icon and choose 'Add to Home Screen'. On Android Chrome, tap the browser menu button and select 'Install App'."
    },
    {
      q: "Can I transfer my logs to a new phone or tablet?",
      a: "Yes, easily. Head to the Settings Tools panel inside the console, click 'Export Workout Database' to download your database as a portable .json backup file, then import it on any other device."
    },
    {
      q: "What types of exercises does the logger support?",
      a: "LiftLog supports three exercise types: Weighted lifts (weight in kg + reps, which tracks progressive load volume), Bodyweight routines (reps only, e.g. Pull-Ups), and Timed sessions (durations in seconds, e.g. Planks)."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary flex flex-col items-center px-4 md:px-8 py-10 selection:bg-primary selection:text-black relative overflow-x-hidden font-body">
      
      {/* Absolute Decorative Glow Elements */}
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none opacity-25 bg-radial from-primary/35 to-transparent blur-[120px]" />
      <div aria-hidden="true" className="absolute top-[800px] -right-20 w-[400px] h-[400px] pointer-events-none opacity-10 bg-radial from-secondary/20 to-transparent blur-[100px]" />
      <div aria-hidden="true" className="absolute bottom-[300px] -left-20 w-[300px] h-[300px] pointer-events-none opacity-10 bg-radial from-primary/15 to-transparent blur-[80px]" />

      {/* Main Container */}
      <main id="main-content" className="w-full max-w-5xl flex flex-col items-center">
        
        {/* Navigation Navbar */}
        <header role="banner" className="w-full flex justify-between items-center py-4 border-b border-border mb-12 relative z-10">
          <a href="/" aria-label="LiftLog Home" className="font-display text-xl font-black uppercase text-textPrimary select-none hover:text-primary transition-colors">
            🏋️ Lift<span className="text-primary">Log</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface2 border border-border text-[10px] font-mono font-bold text-textSecondary uppercase tracking-widest leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              Console ready
            </span>
            <Button variant="outline" size="sm" onClick={onEnterApp} className="uppercase text-xs font-bold font-display px-4">
              Enter Console
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl my-8 md:my-12 flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2.5 bg-surface border border-border px-4 py-2 rounded-full mb-6 shadow-md select-none">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono text-[10px] md:text-xs font-bold tracking-wider text-textSecondary uppercase">
              HIGH-PERFORMANCE GYM COCKPIT
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-8xl font-black uppercase leading-[0.85] tracking-tight mb-6">
            PRACTICAL <span className="text-primary hover:shadow-glow transition-all duration-300">LOGGING</span>
          </h1>
          
          <p className="font-body text-sm md:text-base text-textSecondary max-w-xl leading-relaxed mb-8">
            An offline-first, high-contrast progressive overload tracker with large sweat-friendly inputs and zero friction. No remote database, no passwords, 100% private.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onEnterApp}
              className="w-full sm:w-auto group shadow-glow text-black font-extrabold uppercase px-8 tracking-wider"
            >
              Launch Console
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a 
              href="#demo"
              className="text-xs uppercase tracking-widest font-mono text-textSecondary hover:text-textPrimary transition-colors py-2"
            >
              Try Simulator Below
            </a>
          </div>
        </section>

        {/* Mock Platform Layout Indicators */}
        <section className="w-full max-w-3xl border border-border bg-surface p-4 rounded-2xl my-10 relative z-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-center border-b border-border/60 pb-3 mb-4">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/55" />
              <span className="w-2.5 h-2.5 rounded-full bg-warn/55" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/55" />
            </div>
            <div className="text-[10px] font-mono text-textSecondary uppercase tracking-widest">
              Responsive layout metrics
            </div>
          </div>
          
          <div className="flex items-center gap-6 md:gap-12 flex-wrap justify-center text-textSecondary py-2 font-mono text-xs font-semibold select-none">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span>MOBILE READY (375px)</span>
            </div>
            <div className="flex items-center gap-2">
              <Tablet className="w-4 h-4 text-secondary" />
              <span>TABLET OPTIMIZED (768px)</span>
            </div>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-primary" />
              <span>LAPTOP WORKSPACE (1440px)</span>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-12 relative z-10">
          
          {/* Bento Item 1: Logging */}
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-primary mb-6 group-hover:shadow-glow transition-all duration-300">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase mb-2 text-textPrimary">Adaptive Logging</h3>
              <p className="font-body text-xs text-textSecondary leading-relaxed">
                Log weighted reps, timed sets, or bodyweight targets. Swipe to access alternate exercises instantly when machines are busy.
              </p>
            </div>
          </div>

          {/* Bento Item 2: Calendar */}
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-secondary/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-secondary mb-6 group-hover:shadow-successGlow transition-all duration-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase mb-2 text-textPrimary">Consistency Grid</h3>
              <p className="font-body text-xs text-textSecondary leading-relaxed">
                A simple calendar dashboard to check consistency streaks. Toggle status instantly with single clicks.
              </p>
            </div>
          </div>

          {/* Bento Item 3: Progress */}
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-primary mb-6 group-hover:shadow-glow transition-all duration-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase mb-2 text-textPrimary">Progress Graphs</h3>
              <p className="font-body text-xs text-textSecondary leading-relaxed">
                Monitor progressive overload, accumulated volumes, and PRs with custom high-fidelity SVG Area Charts that reload instantly.
              </p>
            </div>
          </div>

          {/* Bento Item 4: Offline-First (Double width on desktop) */}
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center md:col-span-2 hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-primary mb-4 group-hover:shadow-glow transition-all duration-300">
                <CloudOff className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase mb-2 text-textPrimary">Offline-First Gym Isolation</h3>
              <p className="font-body text-xs text-textSecondary leading-relaxed max-w-md">
                Basement gym dungeons or airplane mode? LiftLog functions entirely offline. Static PWA caching keeps standard resources loaded on your device.
              </p>
            </div>
            <div className="bg-surface2 border border-border rounded-xl p-4 font-mono text-[10px] text-textSecondary self-stretch md:self-auto flex items-center justify-center min-w-[220px]">
              <div>
                <div className="text-primary font-bold">STATE: LOADED</div>
                <div>&gt; cache_status: ACTIVE</div>
                <div>&gt; local_db: LOCALSTORAGE</div>
                <div>&gt; active_sessions: OFFLINE</div>
              </div>
            </div>
          </div>

          {/* Bento Item 5: Export (Single Width) */}
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-secondary/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-secondary mb-6 group-hover:shadow-successGlow transition-all duration-300">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold uppercase mb-2 text-textPrimary">Local Sovereignty</h3>
              <p className="font-body text-xs text-textSecondary leading-relaxed">
                Complete data control. Export workout databases to JSON backups. Import back at any time to restore logs.
              </p>
            </div>
          </div>

        </section>

        {/* Interactive Simulator Section */}
        <section id="demo" className="w-full my-12 relative z-10 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-textPrimary tracking-wide">
              Live Logger Simulator
            </h2>
            <p className="text-xs text-textSecondary mt-2">
              Experience the fast cockpit touch target logging below. Fill in weight and reps, then simulate logging a set.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Interactive Form Card */}
            <Card className="border-primary/30 flex flex-col justify-between relative overflow-hidden">
              {simToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-success text-black text-xs font-mono font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-3">
                  <Check className="w-4 h-4" /> {simToast}
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                  <h4 className="font-display text-sm font-bold uppercase text-textPrimary tracking-wide">
                    Bench Press (Weighted)
                  </h4>
                  <span className="text-[9px] font-mono bg-surface2 border border-border text-primary font-bold px-2 py-0.5 rounded-full uppercase leading-none">
                    W
                  </span>
                </div>

                <div className="text-xs text-textSecondary font-mono bg-surface2/60 border border-border/40 px-3 py-2 rounded-lg flex justify-between items-center mb-6">
                  <span>PREV SESSION BEST:</span>
                  <span className="text-secondary font-bold">55kg × 10 (Vol: 550)</span>
                </div>

                <form onSubmit={handleSimLog} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                        Weight (kg)
                      </label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={simWeight}
                        onChange={(e) => setSimWeight(e.target.value)}
                        className="text-center font-bold text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-textSecondary uppercase mb-1">
                        Reps
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={simReps}
                        onChange={(e) => setSimReps(e.target.value)}
                        className="text-center font-bold text-textPrimary"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-full uppercase font-bold text-xs mt-2">
                    Simulate logging Set
                  </Button>
                </form>
              </div>

              <div className="border-t border-border pt-4 mt-6 flex items-center gap-2 text-[10px] font-mono text-textSecondary uppercase leading-relaxed">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Simulated volumes add weight x reps, tracking load indices.</span>
              </div>
            </Card>

            {/* Sim Logs Output */}
            <Card className="bg-surface2/30 border-border/50 flex flex-col justify-between">
              <div>
                <h4 className="font-display text-sm font-bold uppercase text-textPrimary tracking-wide border-b border-border/60 pb-3 mb-4">
                  Simulated Session Log
                </h4>
                
                {simLogs.length > 0 ? (
                  <div className="space-y-3 font-mono">
                    {simLogs.map((log, idx) => (
                      <div 
                        key={log.id} 
                        className="flex justify-between items-center text-xs p-3 rounded-lg border border-border bg-surface animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-textSecondary uppercase font-bold">SET {simLogs.length - idx}:</span>
                          <span className="text-textPrimary font-bold">{log.weight}kg × {log.reps}</span>
                        </div>
                        <div className="text-secondary font-bold">
                          VOL: {log.vol}kg
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-textSecondary text-xs font-mono border border-dashed border-border/40 rounded-xl">
                    No simulated sets recorded yet.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center text-[10px] font-mono border-t border-border pt-4 text-textSecondary uppercase">
                <span>SIM WORKSPACE DB</span>
                <span className="text-primary font-bold">ACTIVE WEEK</span>
              </div>
            </Card>

          </div>
        </section>

        {/* Feature Tour snapping slider */}
        <section className="w-full my-12 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-textPrimary tracking-wide">
              App Console Sections
            </h2>
            <p className="text-xs text-textSecondary mt-2">
              Explore the four focal workspace panels configured inside the app console.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tour Card 1: Workout */}
            <Card className="border-border/60 hover:border-primary/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-primary mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-display text-sm font-bold uppercase text-textPrimary mb-2">1. Workout Desk</h4>
                <p className="font-body text-xs text-textSecondary leading-relaxed">
                  Tabbed routine lists with collapsible inline video frames, target reps instructions, and dynamic history.
                </p>
              </div>
              <div className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest mt-4">
                ACTIVE STATE
              </div>
            </Card>

            {/* Tour Card 2: Calendar */}
            <Card className="border-border/60 hover:border-secondary/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-secondary mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-display text-sm font-bold uppercase text-textPrimary mb-2">2. Attendance</h4>
                <p className="font-body text-xs text-textSecondary leading-relaxed">
                  Consistency matrix mapping workouts, rests, and missed days with simple cyclic touch inputs.
                </p>
              </div>
              <div className="text-[9px] font-mono text-secondary font-bold uppercase tracking-widest mt-4">
                CONSISTENCY
              </div>
            </Card>

            {/* Tour Card 3: Progress */}
            <Card className="border-border/60 hover:border-primary/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-primary mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-display text-sm font-bold uppercase text-textPrimary mb-2">3. Progress charts</h4>
                <p className="font-body text-xs text-textSecondary leading-relaxed">
                  Responsive SVG Area graphs rendering weight, reps, time, or total load volumes over the weeks.
                </p>
              </div>
              <div className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest mt-4">
                ANALYTICS
              </div>
            </Card>

            {/* Tour Card 4: Settings */}
            <Card className="border-border/60 hover:border-secondary/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-secondary mb-4">
                  <Settings className="w-5 h-5" />
                </div>
                <h4 className="font-display text-sm font-bold uppercase text-textPrimary mb-2">4. Settings Console</h4>
                <p className="font-body text-xs text-textSecondary leading-relaxed">
                  Profile names, targets, database JSON exports, imports, reset defaults, and baseline seed loaders.
                </p>
              </div>
              <div className="text-[9px] font-mono text-secondary font-bold uppercase tracking-widest mt-4">
                CONFIGS
              </div>
            </Card>

          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="w-full max-w-3xl my-12 relative z-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-black uppercase text-textPrimary tracking-wide">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-textSecondary mt-2">
              Essential knowledge details on security, setups, and database capabilities.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className="bg-surface border border-border rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-4 text-left font-display text-sm font-bold uppercase text-textPrimary hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4.5 h-4.5 text-textSecondary transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-4 font-body text-xs text-textSecondary leading-relaxed border-t border-border/40 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Bottom Banner */}
        <section className="w-full max-w-3xl bg-surface border border-border rounded-3xl p-8 md:p-12 text-center my-12 relative z-10 overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-radial from-primary to-transparent blur-[50px]" />
          
          <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center text-primary mb-6 animate-bounce">
            <Activity className="w-6 h-6" />
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-textPrimary mb-4">
            NO EXCUSES. JUST PROGRESS.
          </h2>
          
          <p className="font-body text-xs md:text-sm text-textSecondary max-w-md leading-relaxed mb-8">
            Set your target, log your lifts, check your attendance, and overload progressively. Launch the console to establish your baseline today.
          </p>

          <Button 
            variant="primary" 
            size="lg" 
            onClick={onEnterApp}
            className="shadow-glow text-black font-extrabold uppercase px-10 tracking-widest"
          >
            Launch Console Desk
          </Button>
        </section>

        {/* Footer */}
        <footer role="contentinfo" className="w-full border-t border-border/60 py-6 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-textSecondary uppercase tracking-widest relative z-10">
          <div>
            <span>LiftLog © {new Date().getFullYear()}</span>
            <span className="mx-2 opacity-40">•</span>
            <span>All data saved locally on your device</span>
          </div>
          <nav aria-label="Footer navigation" className="flex gap-4 items-center">
            <a href="/sitemap.xml" rel="nofollow" className="hover:text-textPrimary transition-colors">Sitemap</a>
            <span className="opacity-30">|</span>
            <a href="/robots.txt" rel="nofollow" className="hover:text-textPrimary transition-colors">Robots</a>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> Offline PWA</span>
            <span>Secure Sandbox</span>
          </nav>
        </footer>

      </main>
    </div>
  );
};
