import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, 
  TrendingDown, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Compass,
  Briefcase
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';

interface FunnelChartProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  activeAgentId?: string;
}

interface FunnelStageData {
  stage: LeadStatus;
  label: string;
  description: string;
  color: string;
  gradient: string;
  count: number;
  cumulativeCount: number;
  cumulativePercentage: number;
  dropOffRate: number;
  totalVolume: number;
  avgBudget: number;
  currentInventory: number;
  leadsInStage: Lead[];
}

export default function FunnelChart({ leads, onSelectLead }: FunnelChartProps) {
  // Segmentation Filter Configs
  const [budgetTier, setBudgetTier] = useState<'all' | 'high' | 'ultra'>('all'); // all, €3M+ (High), €7M+ (Ultra)
  const [funnelMode, setFunnelMode] = useState<'cumulative' | 'inventory'>('cumulative'); // conversion vs raw inventory
  const [hoveredStageIndex, setHoveredStageIndex] = useState<number | null>(null);
  const [selectedStageName, setSelectedStageName] = useState<LeadStatus | null>(null);

  // Budget thresholds
  const budgetThresholds = {
    all: 0,
    high: 3000000,
    ultra: 7000000,
  };

  // 1. Map stages in conversion progression sequence
  const STAGE_SEQUENCE: { stage: LeadStatus; label: string; desc: string; color: string; gradient: string }[] = [
    { 
      stage: 'New', 
      label: 'New Lead Capture', 
      desc: 'Initial inbound inquiry or AI-scouted prospects', 
      color: '#a3a3a3',
      gradient: 'from-neutral-600 to-neutral-500' 
    },
    { 
      stage: 'Contacted', 
      label: 'Qualified Contacted', 
      desc: 'Active direct engagement and preferences verified', 
      color: '#c5a059',
      gradient: 'from-amber-600/90 to-amber-500/80' 
    },
    { 
      stage: 'Showing Scheduled', 
      label: 'Exclusive Property Showing', 
      desc: 'Bespoke on-site or dynamic aerial viewings scheduled', 
      color: '#d97706',
      gradient: 'from-[#c5a059] to-amber-600' 
    },
    { 
      stage: 'Offer Pending', 
      label: 'Offer & Contract Pending', 
      desc: 'Written purchase offers and legal escrow negotiations', 
      color: '#b45309',
      gradient: 'from-[#d2b174] to-[#c5a059]' 
    },
    { 
      stage: 'Closed Won', 
      label: 'Closed Deal Won', 
      desc: 'Deed finalized and commission securely settled', 
      color: '#10b981',
      gradient: 'from-emerald-600 to-emerald-500' 
    }
  ];

  // 2. Perform dynamic filtration and D3-style custom math computation
  const { funnelData, activeSummary } = useMemo(() => {
    // Filter active leads based on current segment choice
    const threshold = budgetThresholds[budgetTier];
    const filteredLeads = leads.filter(l => l.budget >= threshold && l.status !== 'Cold');
    const totalLeadsInSegment = filteredLeads.length;

    // Compile counts for each individual stage
    const currentInventoryMap = STAGE_SEQUENCE.reduce((acc, current) => {
      acc[current.stage] = filteredLeads.filter(l => l.status === current.stage).length;
      return acc;
    }, {} as Record<LeadStatus, number>);

    // Dynamic lists of concrete leads sitting in this stage or later (for cumulative math)
    const activeLeadsByStage: Record<LeadStatus, Lead[]> = {} as any;
    STAGE_SEQUENCE.forEach((s) => {
      activeLeadsByStage[s.stage] = filteredLeads.filter(l => l.status === s.stage);
    });

    // To represent a standard D3 conversion funnel, we calculate cumulative flow:
    // A lead is assumed to have crossed stage S if it is currently in S or any of the subsequent stages in sequence.
    let cumulativeArr: FunnelStageData[] = [];
    let previousCount = 0;

    for (let i = 0; i < STAGE_SEQUENCE.length; i++) {
      const stageMeta = STAGE_SEQUENCE[i];
      const stageName = stageMeta.stage;

      // Extract leads currently in this stage or further along
      const reachedStages = STAGE_SEQUENCE.slice(i).map(x => x.stage);
      const leadsReachedAtLeastThisFar = filteredLeads.filter(l => reachedStages.includes(l.status));
      const cumulativeCount = leadsReachedAtLeastThisFar.length;
      
      const currentInventory = currentInventoryMap[stageName] || 0;
      const totalVolume = leadsReachedAtLeastThisFar.reduce((sum, l) => sum + l.budget, 0);
      const avgBudget = cumulativeCount > 0 ? (totalVolume / cumulativeCount) : 0;

      // Cumulative conversion percentage relative to first stage
      const firstStageCount = filteredLeads.length;
      const cumulativePercentage = firstStageCount > 0 
        ? Math.round((cumulativeCount / firstStageCount) * 100) 
        : 0;

      // Drop-off rate relative to previous stage
      let dropOffRate = 0;
      if (i > 0) {
        const prevStageCount = cumulativeArr[i - 1].cumulativeCount;
        if (prevStageCount > 0) {
          dropOffRate = Math.round(((prevStageCount - cumulativeCount) / prevStageCount) * 100);
        }
      }

      cumulativeArr.push({
        stage: stageName,
        label: stageMeta.label,
        description: stageMeta.desc,
        color: stageMeta.color,
        gradient: stageMeta.gradient,
        count: currentInventory,
        currentInventory,
        cumulativeCount,
        cumulativePercentage,
        dropOffRate,
        totalVolume,
        avgBudget,
        leadsInStage: filteredLeads.filter(l => l.status === stageName)
      });
    }

    // Dynamic diagnostic variables to highlight where the highest value is dropping off
    let majorBottleneckStage = '';
    let highestDropOffRate = 0;
    
    for (let i = 1; i < cumulativeArr.length; i++) {
      if (cumulativeArr[i].dropOffRate > highestDropOffRate) {
        highestDropOffRate = cumulativeArr[i].dropOffRate;
        majorBottleneckStage = STAGE_SEQUENCE[i].label;
      }
    }

    return {
      funnelData: cumulativeArr,
      activeSummary: {
        totalLeadsInSegment,
        majorBottleneckStage,
        highestDropOffRate,
        totalActiveVolume: filteredLeads.reduce((s, l) => s + l.budget, 0)
      }
    };
  }, [leads, budgetTier]);

  // Set the default detail display to the bottleneck stage if nothing is chosen
  const activeDetailStage = useMemo(() => {
    if (selectedStageName) {
      return funnelData.find(f => f.stage === selectedStageName);
    }
    // Default to the highest drop-off stage
    return funnelData.find(f => f.dropOffRate === activeSummary.highestDropOffRate) || funnelData[1];
  }, [selectedStageName, funnelData, activeSummary]);

  return (
    <div className="space-y-6">
      {/* 1. Header Control Panel */}
      <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#c5a059]">
            <Compass className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold font-serif italic text-white">Conversion Funnel Diagnostics</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Investigating lead conversions & off-market drops</p>
          </div>
        </div>

        {/* Dynamic Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black border border-neutral-850 p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => {
                setBudgetTier('all');
                setSelectedStageName(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                budgetTier === 'all' 
                  ? 'bg-neutral-800 text-[#c5a059]' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              All Budgets
            </button>
            <button 
              onClick={() => {
                setBudgetTier('high');
                setSelectedStageName(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                budgetTier === 'high' 
                  ? 'bg-neutral-800 text-[#c5a059]' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Elite (€3M+)
            </button>
            <button 
              onClick={() => {
                setBudgetTier('ultra');
                setSelectedStageName(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                budgetTier === 'ultra' 
                  ? 'bg-neutral-800 text-[#c5a059]' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              UHNW (€7M+)
            </button>
          </div>

          <div className="bg-black border border-neutral-850 p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setFunnelMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                funnelMode === 'cumulative' 
                  ? 'bg-amber-500/10 text-[#c5a059]' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Calculates total prospective leads reaching each respective depth in sequence"
            >
              Funnel Conversion
            </button>
            <button 
              onClick={() => setFunnelMode('inventory')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                funnelMode === 'inventory' 
                  ? 'bg-amber-500/10 text-[#c5a059]' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Displays leads currently sitting at this specific status checkpoint"
            >
              Stage Inventory
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Funnel Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive SVG Funnel (D3 Scaling Simulation) */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider">
              {funnelMode === 'cumulative' ? 'Cumulative Pipeline Conversion' : 'Active CRM Stage Capacities'}
            </span>
            <span className="text-[10px] font-mono text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded-full border border-[#c5a059]/20">
              {budgetTier === 'all' ? 'All Live Channels' : budgetTier === 'high' ? 'High-End Target Segment' : 'Ultra High-Net Worth Focus'}
            </span>
          </div>

          <div className="py-6 relative flex flex-col items-center">
            {/* High fidelity inline responsive SVG */}
            <div className="w-full max-w-[480px] h-[350px] relative">
              <svg 
                viewBox="0 0 500 350" 
                className="w-full h-full overflow-visible"
              >
                {/* 
                  Let's draw a professional stack of custom modular responsive SVG trapezoid slices 
                  Width is relative to:
                  - For Cumulative conversion: stage cumulative percentage (New starts at 100%, and we scale down smoothly)
                  - For Inventory capacity: percentage of maximum stage inventory count
                */}
                {funnelData.map((stage, idx) => {
                  // Determine relative scale
                  const maxCount = Math.max(...funnelData.map(f => funnelMode === 'cumulative' ? f.cumulativeCount : f.count), 1);
                  const valueToScale = funnelMode === 'cumulative' ? stage.cumulativeCount : stage.count;
                  
                  // Compute widths using simple D3-like linear interpolation
                  // Standardized top and bottom width of slice
                  const segmentHeight = 52;
                  const segmentGap = 12;
                  
                  const startY = idx * (segmentHeight + segmentGap);
                  const endY = startY + segmentHeight;

                  // Define outer coordinates (trapezoid corners centered about X=250)
                  const basePercentage = valueToScale / maxCount;
                  // Guard against zero elements to maintain a thin visual trace line
                  const factor = Math.max(basePercentage, 0.08); 
                  
                  // Interpolated width at top and bottom of segment to create smooth neck-down
                  const topWidth = 400 * (idx === 0 ? 1 : Math.max(funnelData[idx - 1][funnelMode === 'cumulative' ? 'cumulativeCount' : 'count'] / maxCount, 0.08));
                  const bottomWidth = 400 * factor;
                  
                  // Compute left and right margins center anchored on X=250
                  const x1 = 250 - topWidth / 2;
                  const x2 = 250 + topWidth / 2;
                  const x3 = 250 + bottomWidth / 2;
                  const x4 = 250 - bottomWidth / 2;
                  
                  const shapePath = `M ${x1} ${startY} L ${x2} ${startY} L ${x3} ${endY} L ${x4} ${endY} Z`;
                  
                  // Color highlights
                  const isHovered = hoveredStageIndex === idx;
                  const isSelected = selectedStageName === stage.stage || (!selectedStageName && activeDetailStage?.stage === stage.stage);

                  return (
                    <g 
                      key={stage.stage}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredStageIndex(idx)}
                      onMouseLeave={() => setHoveredStageIndex(null)}
                      onClick={() => setSelectedStageName(stage.stage)}
                    >
                      {/* Connection liquid flow shadow beneath path */}
                      {idx < funnelData.length - 1 && funnelMode === 'cumulative' && (
                        <path
                          d={`M ${x4} ${endY} L ${x3} ${endY} L ${250 + (400 * Math.max(funnelData[idx+1].cumulativeCount / maxCount, 0.04)) / 2} ${endY + segmentGap} L ${250 - (400 * Math.max(funnelData[idx+1].cumulativeCount / maxCount, 0.04)) / 2} ${endY + segmentGap} Z`}
                          fill="url(#flowGradient)"
                          opacity="0.12"
                        />
                      )}

                      {/* Trapezoid Core Polygons */}
                      <path
                        d={shapePath}
                        fill={isSelected ? 'url(#activeTrapezoid)' : isHovered ? 'url(#hoveredTrapezoid)' : 'url(#baseTrapezoid)'}
                        stroke={isSelected ? '#c5a059' : isHovered ? '#d2b174' : '#1f1f1f'}
                        strokeWidth={isSelected ? 1.5 : 1}
                        className="transition-all duration-300"
                      />

                      {/* Inner stage level visual bars indicator */}
                      <line 
                        x1={x1 + 6}
                        y1={startY + segmentHeight / 2}
                        x2={x2 - 6}
                        y2={startY + segmentHeight / 2}
                        stroke={isHovered || isSelected ? '#ffffff' : '#404040'}
                        strokeWidth="1"
                        strokeDasharray="2, 6"
                        opacity={idx === 4 ? 0 : 0.4}
                      />

                      {/* Stage core description inside the SVG slice */}
                      <text
                        x="250"
                        y={startY + segmentHeight / 2 - 2}
                        textAnchor="middle"
                        className={`text-[10px] uppercase font-mono tracking-widest leading-none font-bold select-none transition-all duration-200 fill-white`}
                      >
                        {stage.stage === 'Showing Scheduled' ? 'SHOWING' : stage.stage.toUpperCase()}
                      </text>

                      {/* Segment metric counter value text (centered coordinate) */}
                      <text
                        x="250"
                        y={startY + segmentHeight / 2 + 12}
                        textAnchor="middle"
                        className={`text-[9px] font-mono leading-none font-bold select-none transition-all duration-200 ${
                          isSelected ? 'fill-[#c5a059]' : 'fill-neutral-400'
                        }`}
                      >
                        {funnelMode === 'cumulative'
                          ? `REACHED: ${stage.cumulativeCount} (${stage.cumulativePercentage}%)`
                          : `IN STAGE: ${stage.count} (Val: €${(stage.leadsInStage.reduce((s, x) => s + x.budget, 0)/1000000).toFixed(1)}M)`
                        }
                      </text>

                      {/* Left side: conversion rates or indicators */}
                      {idx > 0 && funnelMode === 'cumulative' && (
                        <g transform={`translate(${Math.min(x1, x4) - 38}, ${startY + 15})`} className="select-none">
                          <rect 
                            x="0" 
                            y="0" 
                            width="28" 
                            height="16" 
                            rx="4" 
                            fill={stage.dropOffRate > 40 ? '#ef4444/10' : '#171717'} 
                            stroke={stage.dropOffRate > 40 ? '#ef4444/30' : '#262626'} 
                            strokeWidth="1" 
                          />
                          <text 
                            x="14" 
                            y="11" 
                            textAnchor="middle" 
                            className={`text-[8px] font-mono font-bold ${
                              stage.dropOffRate > 40 ? 'fill-red-400' : 'fill-[#c5a059]'
                            }`}
                          >
                            -{stage.dropOffRate}%
                          </text>
                        </g>
                      )}

                      {/* Right side: volume summaries */}
                      <g transform={`translate(${Math.max(x2, x3) + 12}, ${startY + segmentHeight/2 + 3})`}>
                        <text 
                          x="0" 
                          y="0" 
                          className="text-[10px] font-mono font-bold fill-[#c5a059] text-left"
                        >
                          €{( (funnelMode === 'cumulative' ? stage.totalVolume : stage.leadsInStage.reduce((sum, l) => sum + l.budget,0) ) / 1000000).toFixed(1)}M
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* SVG Definitions for Luxury Textures & Gradients */}
                <defs>
                  {/* High Quality Flow Connector Gradient */}
                  <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c5a059" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Elegant Charcoal Solid Base Trapezoid */}
                  <linearGradient id="baseTrapezoid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#141414" />
                    <stop offset="100%" stopColor="#0d0d0d" />
                  </linearGradient>

                  {/* Dark-Gold Glossy Hover State */}
                  <linearGradient id="hoveredTrapezoid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c1913" />
                    <stop offset="100%" stopColor="#1f180f" />
                  </linearGradient>

                  {/* High End Metallic Gold Selection State */}
                  <linearGradient id="activeTrapezoid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2c2415" />
                    <stop offset="100%" stopColor="#1f180c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Custom Interactive Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-[9px] font-mono text-neutral-500 uppercase tracking-widest pt-2 w-full border-t border-neutral-900 mt-4 select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-neutral-900 border border-neutral-800" /> BASE VALUE
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded bg-[#1c1913] border border-[#d2b174]" /> HOVER DISCOVER
              </span>
              <span className="flex items-center gap-1.5 text-[#c5a059]">
                <span className="w-2 h-2 rounded bg-[#2c2415] border border-[#c5a059]" /> CURRENT FOCUS
              </span>
            </div>
          </div>
        </div>

        {/* Right Active Stage Intelligence Deck */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Diagnostic Metrics Sheet */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h4 className="text-xs font-bold font-mono text-[#c5a059] uppercase tracking-wider flex items-center justify-between">
              <span>Stage Intelligence: {activeDetailStage?.stage}</span>
              <span className="text-[10px] text-neutral-400 font-normal">Details Grid</span>
            </h4>

            {activeDetailStage ? (
              <div className="space-y-4">
                <p className="text-xs text-neutral-400 italic">
                  "{activeDetailStage.description}"
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">Count Inventory</span>
                    <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#c5a059] shrink-0" />
                      {activeDetailStage.currentInventory} Buyers
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">Cumulative Flow</span>
                    <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
                      <Target className="w-4 h-4 text-[#c5a059] shrink-0" />
                      {activeDetailStage.cumulativeCount} Candidates
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">Volume Portfolio</span>
                    <span className="text-sm font-bold font-mono text-[#c5a059] flex items-center gap-1">
                      <Coins className="w-4 h-4 text-[#c5a059] shrink-0" />
                      €{(activeDetailStage.totalVolume / 1000000).toFixed(1)}M
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">Average Budget</span>
                    <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      €{(activeDetailStage.avgBudget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                {/* Drop off indicators */}
                {activeDetailStage.stage !== 'New' && (
                  <div className="p-3.5 rounded-xl bg-black border border-neutral-850 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Stage Drop-Off Rate:</span>
                    <span className={`font-mono font-bold flex items-center gap-1 ${
                      activeDetailStage.dropOffRate > 40 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                      {activeDetailStage.dropOffRate}% of prospects lost here
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">Select a stage to view metrics.</p>
            )}
          </div>

          {/* Leads trapped in current Stage list */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#c5a059]" />
                Prospects Stuck Here ({activeDetailStage?.leadsInStage.length || 0})
              </h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed mb-4">
                These buyer profiles are currently waiting action inside the <strong>{activeDetailStage?.stage}</strong> inventory lane. Let's inspect and follow-up.
              </p>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {!activeDetailStage || activeDetailStage.leadsInStage.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-neutral-900 rounded-xl bg-black/20 text-xs italic text-neutral-500">
                    No active buyers registered in this inventory step.
                  </div>
                ) : (
                  activeDetailStage.leadsInStage.map((lead) => (
                    <div 
                      key={lead.id} 
                      onClick={() => onSelectLead && onSelectLead(lead)}
                      className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl flex items-center justify-between text-xs hover:border-[#c5a059]/40 hover:bg-neutral-900/40 transition-all cursor-pointer group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-neutral-200 group-hover:text-white transition-colors">{lead.fullName}</p>
                        <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5">Source: {lead.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-[#c5a059]">€{(lead.budget/1000000).toFixed(1)}M</p>
                        <span className="text-[9px] font-serif italic text-neutral-500 uppercase tracking-widest font-bold">Follow up: {lead.nextFollowUpDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-900 pt-3 flex gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              <span>Click on any profile above to instantly load their dossier, trigger multi-lingual luxury outreach, or reschedule showings.</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. AI Funnel Diagnostics Analysis Deck */}
      <div className="bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Absolute ambient light accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl select-none" />

        <div className="flex gap-4 items-start flex-col md:flex-row text-left">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-full text-[#c5a059] shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-serif italic text-white uppercase tracking-wider flex items-center gap-2">
              AI Conversion Diagnostics Report
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                BOTTLENECK DETECTED: {activeSummary.highestDropOffRate}%
              </span>
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Analyzing active lead logs against target districts. Currently, the most severe drop-off is at the <span className="text-[#c5a059] font-bold font-mono">"{activeSummary.majorBottleneckStage}"</span> stage, losing <span className="text-red-400 font-bold font-mono">{activeSummary.highestDropOffRate}%</span> of prospective buyers who reach the preceding stage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-1.5">
                <p className="text-[9px] font-mono text-red-400 uppercase tracking-wider font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> High-End Drop-Off Origin
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {activeSummary.majorBottleneckStage === 'Exclusive Property Showing' ? (
                    '🔑 HNW luxury buyers expressing interest fail to attend live tours. This represents a breakdown in immediate localized follow-up, agent scheduling conflict, or travel friction to Son Vida.'
                  ) : activeSummary.majorBottleneckStage === 'Offer & Contract Pending' ? (
                    '🤝 Showings are highly rated but fail to convert to formal bids. High-end clients indicates overvaluation of active lists, lack of tailored developer finance terms, or insufficient legal presentation.'
                  ) : (
                    '📧 Cold leads and qualified initial inquiries stall before deep profiling. Outreach templates fail to immediately offer exclusive market insights, discouraging high-discretion clients.'
                  )}
                </p>
              </div>

              <div className="bg-neutral-950 p-4 border border-[#c5a059]/20 rounded-xl space-y-1.5 shadow-lg">
                <p className="text-[9px] font-mono text-[#c5a059] uppercase tracking-wider font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" /> AI Strategic Corrective Playbook
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {activeSummary.majorBottleneckStage === 'Exclusive Property Showing' ? (
                    '💡 deploy immediate virtual drone video previews. Use Gemini to write a bespoke invitation offering private helicopter transfers from Palma Marine Lounge straight to Son Vida.'
                  ) : activeSummary.majorBottleneckStage === 'Offer & Contract Pending' ? (
                    '💡 Introduce off-market historical transaction logs to demonstrate ROI security. Draft customized escrow guarantee booklets in German (DE) and English (EN) automatically.'
                  ) : (
                    '💡 Standardize automated 15-second autopilot scout follow-ups. Include real-time market stats showing top district pricing trends to prompt high-touch consultations.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
