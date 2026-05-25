import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, Compass, Users, Zap, TrendingUp, Lock, Shield, ChevronRight, HelpCircle, X, Award } from 'lucide-react';
import { useTranslation } from './LanguageSelector';

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  teamCount: number;
}

export default function OnboardingTour({ activeTab, setActiveTab, teamCount }: OnboardingTourProps) {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('tourStep1Title'),
      description: t('tourStep1Desc'),
      targetTab: "dashboard",
      icon: Compass,
      color: "text-[#c5a059]",
      tip: t('tourStep1Tip')
    },
    {
      title: t('tourStep2Title'),
      description: t('tourStep2Desc'),
      targetTab: "crm",
      icon: Users,
      color: "text-blue-400",
      tip: t('tourStep2Tip')
    },
    {
      title: t('tourStep3Title'),
      description: t('tourStep3Desc'),
      targetTab: "ai-gen",
      icon: Zap,
      color: "text-amber-400",
      tip: t('tourStep3Tip')
    },
    {
      title: t('tourStep4Title'),
      description: t('tourStep4Desc'),
      targetTab: "analytics",
      icon: TrendingUp,
      color: "text-indigo-400",
      tip: t('tourStep4Tip')
    },
    {
      title: t('tourStep5Title'),
      description: t('tourStep5Desc'),
      targetTab: "team",
      icon: Shield,
      color: "text-emerald-400",
      tip: t('tourStep5Tip')
    }
  ];

  const handleNext = () => {
    const nextIdx = (currentStep + 1) % steps.length;
    setCurrentStep(nextIdx);
    setActiveTab(steps[nextIdx].targetTab);
  };

  const handlePrev = () => {
    const prevIdx = (currentStep - 1 + steps.length) % steps.length;
    setCurrentStep(prevIdx);
    setActiveTab(steps[prevIdx].targetTab);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-neutral-900 via-[#1a1814] to-neutral-950 border border-[#c5a059]/40 hover:border-[#c5a059] text-white p-3.5 rounded-full shadow-25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
      >
        <HelpCircle className="w-5 h-5 text-[#c5a059] animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider pr-1">{t('tourHintIcon')}</span>
      </button>
    );
  }

  const ActiveStepIcon = steps[currentStep].icon;

  const getProfessionalsText = () => {
    if (language === 'DE') return 'Experten';
    if (language === 'ES') return 'Profesionales';
    return 'Professionals';
  };

  // Replace utility placeholders
  const stepText = t('tourStepText')
    .replace('{current}', String(currentStep + 1))
    .replace('{total}', String(steps.length));

  const howDoesItWorkText = t('tourHowDoesItWork')
    .replace('{title}', steps[currentStep].title);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-gradient-to-r from-neutral-900 via-[#181613] to-neutral-950 border border-[#c5a059]/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl mb-8"
      >
        {/* Absolute Background Accent Decors */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-neutral-900 pointer-events-none rounded-full" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#c5a059]/10 rounded-lg">
              <Award className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">{t('tourTitle')}</h3>
              <p className="text-lg font-serif font-bold text-white mt-0.5">{t('tourSubtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Main Informational card */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                <ActiveStepIcon className={`w-6 h-6 ${steps[currentStep].color}`} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                  {stepText} • {steps[currentStep].title}
                </span>
                <h4 className="text-base font-serif font-semibold text-white mt-0.5">
                  {howDoesItWorkText}
                </h4>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed font-sans max-w-2xl">
              {steps[currentStep].description}
            </p>

            {/* Tip Box */}
            <div className="bg-neutral-950/80 border border-neutral-850/60 p-3 rounded-xl flex items-start gap-2 text-xs text-neutral-400 max-w-2xl">
              <span className="text-[#c5a059] font-bold">🎯 {t('agentProTip')}</span>
              <span>{steps[currentStep].tip}</span>
            </div>
          </div>

          {/* Quick Stats indicator / Action Portal */}
          <div className="lg:col-span-4 bg-neutral-950/60 border border-neutral-850/80 p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2">{t('statusTitle')}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>{t('statusCurrentTab')}</span>
                  <span className="font-semibold text-white capitalize bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">{activeTab}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>{t('statusRoster')}</span>
                  <span className="text-[#c5a059] font-bold">{teamCount} {getProfessionalsText()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>{t('statusProgress')}</span>
                  <span className="font-mono text-[11px] text-[#c5a059] font-bold">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}% {t('stepPercent')}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 text-xs font-semibold py-2.5 px-3 rounded-lg text-neutral-300 transition-all cursor-pointer text-center"
              >
                {t('previous')}
              </button>
              <button 
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-[#c5a059] to-[#d6b36e] text-black font-semibold text-xs py-2.5 px-3 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{currentStep === steps.length - 1 ? t('loopTour') : t('nextStep')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Steps visual track indicator points */}
        <div className="mt-5 pt-4 border-t border-neutral-850/40 flex items-center justify-between z-10 relative">
          <div className="flex gap-2.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setActiveTab(steps[idx].targetTab);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentStep === idx 
                    ? "w-8 bg-[#c5a059]" 
                    : "w-2.5 bg-neutral-800 hover:bg-neutral-700"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#c5a059]/80 font-mono">
            {t('tourInfoHint')}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
