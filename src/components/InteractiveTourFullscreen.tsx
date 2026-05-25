import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Users, Zap, TrendingUp, Shield, Lock, 
  ChevronRight, ChevronLeft, Award, Sparkles, CheckCircle, 
  Eye, Activity, HelpCircle, X, Search, Sliders, Play, FileText, LockKeyhole
} from 'lucide-react';
import { useTranslation } from './LanguageSelector';

interface InteractiveTourFullscreenProps {
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  teamCount: number;
}

export default function InteractiveTourFullscreen({ onClose, activeTab, setActiveTab, teamCount }: InteractiveTourFullscreenProps) {
  const { t, language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const steps = [
    {
      id: "dashboard",
      tab: "dashboard",
      title: t('tourStep1Title'),
      desc: t('tourStep1Desc'),
      icon: Compass,
      color: "text-[#c5a059]",
      bgGradient: "from-[#c5a059]/10 via-neutral-950 to-neutral-950",
      accentColor: "#c5a059",
      tip: t('tourStep1Tip'),
      highlights: [
        { id: "h1", x: "25%", y: "20%", name: language === 'DE' ? 'Käufer-Quotient' : 'HNW Interest Quotient', desc: language === 'DE' ? 'Gesamtvolumen des flüssigen Kapitals aktiver Suchanfragen auf Mallorca.' : 'Sum of active buyer search volumes inquiring luxury properties.' },
        { id: "h2", x: "65%", y: "45%", name: language === 'DE' ? 'Live-Echtzeitanzeige' : 'Real-Time Sync Monitor', desc: language === 'DE' ? 'Zeigt die Anzahl aktiver Team-Sitzungen an.' : 'Signals connected partner nodes currently synchronized.' },
        { id: "h3", x: "45%", y: "75%", name: language === 'DE' ? 'Gold-Performance-Chart' : 'Golden Trends Chart', desc: language === 'DE' ? 'Entwicklung der generierten Leads über die letzten Monate.' : 'Monthly customer acquisition trends and conversions graph.' }
      ]
    },
    {
      id: "crm",
      tab: "crm",
      title: t('tourStep2Title'),
      desc: t('tourStep2Desc'),
      icon: Users,
      color: "text-blue-400",
      bgGradient: "from-blue-500/10 via-neutral-950 to-neutral-950",
      accentColor: "#3b82f6",
      tip: t('tourStep2Tip'),
      highlights: [
        { id: "h4", x: "15%", y: "30%", name: language === 'DE' ? 'Suche & Portfolio-Filter' : 'High-End Filters', desc: language === 'DE' ? 'Filtert Kapitalgeber nach genauen Budgets (z. B. 10 Mio €).' : 'Filters profiles strictly by liquidity parameters and property clusters.' },
        { id: "h5", x: "50%", y: "50%", name: language === 'DE' ? 'Käufer-Akte' : 'Investor Dossier Folder', desc: language === 'DE' ? 'Detailreiche Einsicht in Wünsche, Budgets, Historie und Notizen.' : 'Rich parameters detailing budgets, villas matching interest, and communication logs.' },
        { id: "h6", x: "80%", y: "75%", name: language === 'DE' ? 'Gemini AI Follow-Up' : 'Gemini AI Autopilot Writer', desc: language === 'DE' ? 'Schreibt maßgeschneiderte E-Mails per Knopfdruck.' : 'One-click AI follow-ups mimicking Moritz and Sebastian\'s communication styles.' }
      ]
    },
    {
      id: "ai-gen",
      tab: "ai-gen",
      title: t('tourStep3Title'),
      desc: t('tourStep3Desc'),
      icon: Zap,
      color: "text-amber-400",
      bgGradient: "from-amber-400/10 via-neutral-950 to-neutral-950",
      accentColor: "#f59e0b",
      tip: t('tourStep3Tip'),
      highlights: [
        { id: "h7", x: "30%", y: "25%", name: language === 'DE' ? 'Kampagnen-Zielkriterien' : 'Campaign Targets Config', desc: language === 'DE' ? 'Bestimmt die Nische (z. B. Deutsche Yachtbesitzer oder Münchner Unternehmer).' : 'Targets precise luxury client niches across social algorithms.' },
        { id: "h8", x: "70%", y: "45%", name: language === 'DE' ? 'KI-Autopilot Schalter' : 'Autopilot Switcher', desc: language === 'DE' ? 'Aktiviert das periodische Scannen von Social-Media-Kanälen im Hintergrund.' : 'Funnels live background sweeps directly into the CRM database.' },
        { id: "h9", x: "50%", y: "82%", name: language === 'DE' ? 'Scraper-Telemetrie' : 'Social Bot Telemetry', desc: language === 'DE' ? 'Zeigt die Live-Aktivität und Systemprotokolle der Scraping-Maschine.' : 'Displays live telemetry logs showing background system sweeping status.' }
      ]
    },
    {
      id: "analytics",
      tab: "analytics",
      title: t('tourStep4Title'),
      desc: t('tourStep4Desc'),
      icon: TrendingUp,
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/10 via-neutral-950 to-neutral-950",
      accentColor: "#6366f1",
      tip: t('tourStep4Tip'),
      highlights: [
        { id: "h10", x: "50%", y: "30%", name: language === 'DE' ? 'Diagnose-Trigger-Button' : 'AI Analysis Trigger', desc: language === 'DE' ? 'Bootet die Gemini-Brain Engine zur Analyse aller Vertriebsprozesse.' : 'Triggers comprehensive qualitative assessment analytics using deep AI model synthesis.' },
        { id: "h11", x: "50%", y: "75%", name: language === 'DE' ? 'Führungskräfte-Zusammenfassung' : 'Executive Overview Report', desc: language === 'DE' ? 'Erstellt Berichte zu Akquisitionskosten und qualitativen Analysen.' : 'Displays rich generated audits detailing financial conversion metrics and recommendations.' }
      ]
    },
    {
      id: "team",
      tab: "team",
      title: t('tourStep5Title'),
      desc: t('tourStep5Desc'),
      icon: Shield,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/10 via-neutral-950 to-neutral-950",
      accentColor: "#10b981",
      tip: t('tourStep5Tip'),
      highlights: [
        { id: "h12", x: "20%", y: "35%", name: language === 'DE' ? 'Virtuelles Onboarding' : 'Secure Agent Provisioning', desc: language === 'DE' ? 'Erhöht oder verringert Berechtigungen, erstellt neue Akten.' : 'Administrators can securely provision credentials and configure email-based operational roles.' },
        { id: "h13", x: "50%", y: "55%", name: language === 'DE' ? 'Identitäts-Impersonation' : 'Impersonation Matrix', desc: language === 'DE' ? 'Wechselt die aktive Identität, um rollenbasierte Einschränkungen zu simulieren.' : 'Instantly switch user sessions to experience custom permission-locked actions.' },
        { id: "h14", x: "80%", y: "80%", name: language === 'DE' ? 'Auditsystem & Log-Buch' : 'Immutable Ledger Logs', desc: language === 'DE' ? 'Protokolliert unbefugte Dateizugriffe in Echtzeit.' : 'Documents and displays any restricted CRM accesses cleanly.' }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    setActiveHighlight(null);
    const nextIdx = (currentStep + 1) % steps.length;
    setCurrentStep(nextIdx);
    setActiveTab(steps[nextIdx].tab as any);
  };

  const handlePrev = () => {
    setActiveHighlight(null);
    const prevIdx = (currentStep - 1 + steps.length) % steps.length;
    setCurrentStep(prevIdx);
    setActiveTab(steps[prevIdx].tab as any);
  };

  const currentHighlightData = currentStepData.highlights.find(h => h.id === activeHighlight);

  return (
    <div className="fixed inset-0 z-110 flex flex-col bg-black/95 select-none font-sans overflow-hidden">
      {/* Decorative Golden Starfield / Network Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#c5a059]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header Grid Area */}
      <header className="h-16 border-b border-neutral-900 flex items-center justify-between px-6 bg-neutral-950 shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1 px-2 border border-[#c5a059]/40 bg-[#c5a059]/10 rounded-md">
            <Award className="w-4 h-4 text-[#c5a059] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-serif font-bold text-white uppercase tracking-wider">{t('tourTitle')}</h2>
            <p className="text-[10px] text-neutral-500 font-mono tracking-widest">{t('tourSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1 text-[11px] text-neutral-400">
            <Activity className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Interactive Live Simulation Mode</span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 hover:text-rose-400 rounded-lg transition-all text-neutral-400 cursor-pointer select-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Two-Column Showcase Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 relative">
        
        {/* Left Interactive Blueprint Simulator Column (Col-7) */}
        <div className="lg:col-span-7 bg-[#050505] p-6 lg:p-10 flex flex-col justify-center items-center relative min-h-0 border-r border-neutral-900/60">
          
          {/* Active Highlight Annotator Box Floating */}
          <AnimatePresence>
            {activeHighlight && currentHighlightData && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-6 left-6 right-6 z-30 bg-neutral-950 border border-[#c5a059]/40 p-4 rounded-xl shadow-2xl flex items-start gap-3"
              >
                <div className="p-1 px-1.5 bg-[#c5a059]/10 text-[#c5a059] font-mono text-[9px] font-bold rounded">
                  PORTAL
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">{currentHighlightData.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{currentHighlightData.desc}</p>
                </div>
                <button 
                  onClick={() => setActiveHighlight(null)}
                  className="text-neutral-500 hover:text-white p-1 select-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Device Virtualizer */}
          <div className="w-full max-w-2xl aspect-[16/10] bg-neutral-950 border border-neutral-800 rounded-2xl relative overflow-hidden shadow-2xl flex flex-col group">
            
            {/* Top Device Bar */}
            <div className="h-9 bg-neutral-900 px-4 border-b border-neutral-800/80 flex items-center justify-between text-neutral-500 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
              </div>
              <div className="bg-neutral-950 border border-neutral-800/60 rounded px-4 py-0.5 text-[#c5a059] font-bold">
                https://mallorcaagents.cloud/node-1/crm
              </div>
              <div className="flex items-center gap-1 select-none">
                <span>100% SECURE</span>
              </div>
            </div>

            {/* Simulated Live View Box with Glowing Highlights */}
            <div className={`flex-1 relative bg-gradient-to-b ${currentStepData.bgGradient} p-5 flex flex-col justify-between overflow-hidden transition-all duration-700`}>
              
              {/* Pulse Hotspots overlays */}
              {currentStepData.highlights.map((spot) => {
                const isSelected = activeHighlight === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => setActiveHighlight(spot.id)}
                    style={{ left: spot.x, top: spot.y }}
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer select-none group"
                  >
                    <span className={`absolute inline-flex h-7 w-7 rounded-full animate-ping opacity-75 ${
                      isSelected ? 'bg-[#c5a059]' : 'bg-white/40'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-4 w-4 border items-center justify-center font-bold text-[9px] ${
                      isSelected ? 'bg-black border-[#c5a059] text-[#c5a059]' : 'bg-neutral-950 border-neutral-700 text-white'
                    }`}>
                      +
                    </span>
                    <span className="absolute top-1/2 left-6 -translate-y-1/2 bg-black/90 border border-neutral-800 text-[10px] font-mono text-neutral-300 font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all">
                      {spot.name}
                    </span>
                  </button>
                );
              })}

              {/* Blueprint Mock Screen Designs based on Step */}
              {currentStep === 0 && (
                <div className="space-y-4 flex-1 flex flex-col justify-between opacity-80 mt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-900 border border-[#c5a059]/20 p-3 rounded-lg text-center space-y-1">
                      <p className="text-[9px] text-neutral-500 font-mono">LIQUID REVENUE</p>
                      <h5 className="text-md font-serif text-[#c5a059] font-bold">€94.2M</h5>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-center space-y-1">
                      <p className="text-[9px] text-neutral-500 font-mono">AVG PROPERTY PREFERENCE</p>
                      <h5 className="text-md font-serif text-white font-bold">€8.9M</h5>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-center space-y-1">
                      <p className="text-[9px] text-neutral-500 font-mono">RUNNING SWEEPER BOTS</p>
                      <h5 className="text-md font-serif text-white font-bold">3 ACTIVE</h5>
                    </div>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-3 flex-1 flex flex-col justify-end">
                    <div className="h-16 flex items-end gap-2.5 px-2">
                      <div className="w-1/6 h-1/4 bg-neutral-800 rounded-t" />
                      <div className="w-1/6 h-2/5 bg-neutral-800 rounded-t" />
                      <div className="w-1/6 h-1/2 bg-[#c5a059]/40 rounded-t" />
                      <div className="w-1/6 h-3/5 bg-neutral-800 rounded-t" />
                      <div className="w-1/6 h-3/4 bg-neutral-800 rounded-t" />
                      <div className="w-1/6 h-[90%] bg-gradient-to-t from-[#c5a059] to-[#d6b36e] rounded-t animate-pulse" />
                    </div>
                    <div className="border-t border-neutral-850 mt-1.5 pt-1 flex justify-between text-[8px] font-mono text-neutral-600">
                      <span>DEC</span><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-3 flex-1 flex flex-col justify-between opacity-80 mt-2">
                  <div className="flex gap-3 h-full">
                    {/* CRM Left List */}
                    <div className="w-[40%] bg-neutral-950 border border-neutral-800/80 rounded-lg p-2.5 space-y-2">
                      <div className="flex items-center gap-1 border-b border-neutral-800 pb-1.5">
                        <Search className="w-2.5 h-2.5 text-neutral-500" />
                        <div className="w-full h-2 bg-neutral-800 rounded" />
                      </div>
                      <div className="p-1 px-1.5 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded">
                        <div className="w-[60%] h-2 bg-[#c5a059] rounded" />
                        <div className="w-[30%] h-1 bg-neutral-600 rounded mt-1" />
                      </div>
                      <div className="p-1 rounded bg-neutral-900">
                        <div className="w-[80%] h-2 bg-neutral-700 rounded" />
                        <div className="w-[40%] h-1 bg-neutral-800 rounded mt-1" />
                      </div>
                    </div>
                    {/* CRM Right Dossier Folder */}
                    <div className="flex-1 bg-neutral-900 border border-neutral-850 rounded-lg p-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-[#c5a059] font-bold">DOSSIER FILE</span>
                          <span className="text-neutral-500">HNW_VON_BOROWSKI</span>
                        </div>
                        <h6 className="text-[11px] font-bold text-white uppercase tracking-wider font-serif">Maria von Borowski</h6>
                        <div className="text-[8px] text-neutral-400 font-mono">PREF: DE | BUDGET: €12,500,000</div>
                        <div className="h-6 overflow-hidden bg-neutral-950 p-1.5 rounded text-[8px] text-neutral-400 border border-neutral-800">
                          Looking for beachfront views in Port d'Andratx with a guest mansion.
                        </div>
                      </div>
                      {/* Generative triggers */}
                      <div className="flex justify-between gap-1.5">
                        <div className="flex-1 h-5 bg-neutral-950 border border-neutral-850 rounded flex items-center justify-center text-[8px] text-neutral-500">
                          Follow-Up Simulator
                        </div>
                        <div className="flex-1 h-5 bg-[#c5a059]/20 border border-[#c5a059]/50 rounded flex items-center justify-center text-[8px] text-[#c5a059]">
                          Auth Gemini Mailer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3 flex-1 flex flex-col justify-between opacity-80 mt-2">
                  <div className="grid grid-cols-2 gap-3 h-[40%]">
                    <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-center space-y-1 flex flex-col justify-center">
                      <p className="text-[8px] text-neutral-500 font-mono">TARGET MATRIX</p>
                      <h6 className="text-[10px] font-serif text-white font-bold uppercase truncate">German Yacht Owners</h6>
                    </div>
                    <div className="bg-neutral-950 border border-[#f59e0b]/40 p-2.5 rounded-lg flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[8px] text-neutral-400 font-mono">AI AUTO-SWEEPER</p>
                        <p className="text-[10px] text-white font-bold">{language === 'DE' ? 'AUTOPILOT: AKTIV' : 'AUTOPILOT: ACTIVE'}</p>
                      </div>
                      <div className="w-7 h-4 bg-[#f59e0b]/20 border border-[#f59e0b] rounded-full p-0.5 flex justify-end">
                        <div className="w-2.5 h-2.5 bg-[#f59e0b] rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* System Terminal Telemetry Mock */}
                  <div className="bg-black/90 border border-neutral-850 rounded-lg p-2 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 border-b border-neutral-850 pb-1 text-[8px] text-neutral-500 font-mono font-bold">
                      <Play className="w-2 h-2 text-amber-500" />
                      <span>HUNTER SYSTEM SCANS ACTIVATED</span>
                    </div>
                    <div className="flex-1 font-mono text-[8.5px] text-neutral-400 p-1 space-y-0.5 overflow-hidden">
                      <p className="text-emerald-500">[OK] Mimicking social algorithms sweep (Hamburg/Munich grids)...</p>
                      <p className="text-neutral-500">[INFO] Scraping Instagram luxury yacht catalog tags...</p>
                      <p className="text-[#f59e0b]">[FOUND] S. von Klitzing (Direct Budget €11M in Son Vida) → funneled!</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3 flex-1 flex flex-col justify-between opacity-80 mt-2">
                  <div className="flex justify-center py-2">
                    <div className="bg-neutral-900 border border-indigo-500/30 p-2.5 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors max-w-xs text-center select-none shadow-[#6366f1]/5 shadow-lg">
                      <TrendingUp className="w-4 h-4 text-indigo-400 animate-bounce" />
                      <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Generate Executive Audit with Gemini</span>
                    </div>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-850 rounded-lg p-3 flex-1 flex flex-col justify-between text-left">
                    <div className="space-y-1.5">
                      <div className="w-20 h-2 bg-indigo-500/20 rounded" />
                      <p className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Security & Performance Diagnostics Model</p>
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-neutral-800 rounded" />
                        <div className="w-[90%] h-1.5 bg-neutral-800 rounded" />
                        <div className="w-[85%] h-1.5 bg-neutral-800 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2 text-[8px] font-mono text-neutral-500 border-t border-neutral-850 pt-2">
                      <span>• Conversions: 98.4%</span>
                      <span>• Audited Nodes: All OK</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-3 flex-1 flex flex-col justify-between opacity-80 mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 border border-[#10b981] bg-neutral-950/60 rounded-lg relative">
                      <div className="w-5 h-5 rounded bg-[#10b981] text-neutral-950 flex items-center justify-center font-bold text-[8px] mb-1.5">SH</div>
                      <div className="w-[80%] h-2 bg-white rounded" />
                      <div className="w-[40%] h-1 bg-neutral-600 rounded mt-1" />
                    </div>
                    <div className="p-2 border border-neutral-850 bg-neutral-950/60 rounded-lg">
                      <div className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[8px] mb-1.5">ER</div>
                      <div className="w-[80%] h-2 bg-neutral-500 rounded" />
                      <div className="w-[40%] h-1 bg-neutral-700 rounded mt-1" />
                    </div>
                    <div className="p-2 border border-neutral-850 bg-neutral-950/60 rounded-lg">
                      <div className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-[8px] mb-1.5">MG</div>
                      <div className="w-[80%] h-2 bg-neutral-500 rounded" />
                      <div className="w-[40%] h-1 bg-neutral-700 rounded mt-1" />
                    </div>
                  </div>

                  {/* Audit Logs simulations */}
                  <div className="bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 space-y-2 text-left">
                    <p className="text-[8px] font-mono font-bold text-rose-400 flex items-center gap-1">
                      <LockKeyhole className="w-2.5 h-2.5" /> DECOMMISSION ENTRANCE ATTEMPT RECORDED
                    </p>
                    <div className="text-[8.5px] font-mono text-neutral-500 leading-snug">
                      <span className="text-white">Elena Ramos (Sales Agent)</span> attempted to revoke CRM user keys. Action Blocked. Signatures compiled.
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Instructions Help Alert inside the device */}
              <div className="bg-black/80 border border-neutral-800/80 rounded-xl p-2.5 flex items-center gap-2 cursor-pointer relative z-20">
                <span className="text-[#c5a059] font-bold text-[10px] shrink-0">✨ {language === 'DE' ? 'Lernakademie-Info:' : 'Academy Tip:'}</span>
                <span className="text-[9.5px] text-neutral-300 truncate leading-relaxed">
                  {language === 'DE' ? 'Klicken Sie auf die blinkenden Punkte (+) für tiefere Erläuterungen.' : 'Click any of the pulsing points (+) to audit specific platform segments.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Information / Guide Narrative Column (Col-5) */}
        <div className="lg:col-span-5 bg-neutral-950 p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-6">
            <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase tracking-widest bg-[#c5a059]/10 px-3 py-1 border border-[#c5a059]/20 rounded-full inline-block">
              {language === 'DE' ? `Lerneinheit ${currentStep + 1} von ${steps.length}` : language === 'ES' ? `Módulo ${currentStep + 1} de ${steps.length}` : `Training Step ${currentStep + 1} of ${steps.length}`}
            </span>
            
            <div className="flex items-center gap-3.5 mt-2">
              <div className={`p-3 bg-neutral-900 border border-neutral-800 rounded-2xl ${currentStepData.color}`}>
                <StepIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight">{currentStepData.title}</h3>
                <p className="text-[10px] text-neutral-500 font-mono tracking-widest">{t('encryptedText').toUpperCase()}</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed font-sans pt-2">
              {currentStepData.desc}
            </p>

            <div className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-4 space-y-2.5">
              <h5 className="text-[11px] font-mono text-[#c5a059] uppercase tracking-wider font-bold">🎯 {t('agentProTip')}</h5>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {currentStepData.tip}
              </p>
            </div>

            <div className="border-t border-neutral-900 pt-5 space-y-3">
              <h5 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Course Navigation</h5>
              <div className="flex gap-2.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveHighlight(null);
                      setCurrentStep(idx);
                      setActiveTab(steps[idx].tab as any);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentStep === idx 
                        ? "w-8 bg-[#c5a059]" 
                        : "w-2 bg-neutral-800 hover:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t('statusRoster')}:</span>
              <span className="text-[#c5a059] font-bold">{teamCount} Professionals</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 py-3 rounded-xl text-xs text-neutral-300 font-semibold transition-all cursor-pointer select-none"
              >
                {t('previous')}
              </button>
              
              <button
                onClick={currentStep === steps.length - 1 ? onClose : handleNext}
                className="flex-1 bg-gradient-to-r from-[#c5a059] to-[#d6b36e] text-black hover:brightness-110 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-[#c5a059]/10"
              >
                <span>{currentStep === steps.length - 1 ? (language === 'DE' ? 'Lernportal betreten' : language === 'ES' ? 'Ingresar al CRM' : 'Enter Suite Portal') : t('nextStep')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors text-center cursor-pointer select-none"
            >
              Skip interactive academy walkthrough & load database directly →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
