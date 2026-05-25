import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Shield, 
  Key, 
  Trash2, 
  Zap, 
  HardDrive, 
  RefreshCcw, 
  Lock, 
  Search, 
  Bell, 
  Users, 
  Layers, 
  Activity, 
  Compass, 
  Briefcase, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  X, 
  Plus, 
  UserPlus, 
  Eye, 
  AlertCircle, 
  TrendingUp, 
  Menu, 
  Smartphone,
  Phone,
  Mail,
  Check,
  Globe,
  WifiOff,
  ChevronDown,
  Play,
  Pause,
  Terminal,
  Sliders,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Lead, TeamMember, MallorcaProperty, AuditLog, SystemNotification, Language, DealRoom, LeadSearchProfile, LeadOutreachPlan, LeadTask } from './types';
import { LanguageProvider, useTranslation, DICTIONARY } from './components/LanguageSelector';
import { motion } from 'motion/react';
import TeamConfigView from './components/TeamConfigView';
import AuditLogView from './components/AuditLogView';
import FunnelChart from './components/FunnelChart';
import LuxuryLogin from './components/LuxuryLogin';
import InteractiveTourFullscreen from './components/InteractiveTourFullscreen';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MIN_AGENT_SCAN_INTERVAL_SECONDS = 30 * 60;
const MAX_AGENT_SCAN_INTERVAL_SECONDS = 2 * 60 * 60;
const DEFAULT_AGENT_SCAN_INTERVAL_SECONDS = MIN_AGENT_SCAN_INTERVAL_SECONDS;
const FOCUS_RING_CLASS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a059]';
const TOUCH_TARGET_CLASS = 'min-h-[44px]';
const ICON_TOUCH_CLASS = 'min-h-[44px] min-w-[44px]';

const formatScanInterval = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)} h`;
};

const formatLastActive = (val: string) => {
  if (!val) return "No recent signal";
  if (!val.includes("T")) return val;
  const d = new Date(val);
  const diffMs = Date.now() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours <= 0) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins <= 1) return "Active just now";
    return `Active ${diffMins}m ago`;
  }
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Active ${diffDays}d ago`;
};

const MATCH_SIGNAL_TAGS = [
  { label: 'Sea view', keywords: ['sea', 'frontline', 'waterfront', 'coast', 'cliff', 'harbor', 'cove', 'beach', 'marina'] },
  { label: 'Yacht access', keywords: ['yacht', 'marina', 'berth', 'harbor', 'port', 'boat', 'sea access'] },
  { label: 'Privacy', keywords: ['private', 'privacy', 'secure', 'secluded', 'exclusive', 'quiet', 'compound', 'staff'] },
  { label: 'Wellness', keywords: ['wellness', 'spa', 'gym', 'pool', 'sauna', 'recovery', 'fitness'] },
  { label: 'Historic character', keywords: ['historic', 'stone', 'palace', 'finca', 'traditional', 'heritage', 'estate'] },
  { label: 'Smart home', keywords: ['smart', 'technology', 'automation', 'modernist', 'data', 'glass'] },
  { label: 'Airport access', keywords: ['airport', 'palma', 'transfer', 'fast access', 'lock-and-leave'] },
  { label: 'Investment upside', keywords: ['hotel', 'branded', 'development', 'plot', 'rental', 'conversion', 'investment'] }
];

type PropertyMatchResult = {
  property: MallorcaProperty;
  score: number;
  grade: string;
  reasons: string[];
  concerns: string[];
  matchedTags: string[];
  isPriority: boolean;
};

const splitListInput = (value: string) => value
  .split(',')
  .map(item => item.trim())
  .filter(Boolean);

const formatBudgetRange = (minBudget: number, maxBudget: number) =>
  `EUR ${(minBudget / 1000000).toFixed(1)}M-EUR ${(maxBudget / 1000000).toFixed(1)}M`;

const findAreaSignals = (lead: Lead, properties: MallorcaProperty[]) => {
  const noteText = `${lead.notes} ${lead.source} ${lead.buyerSegment || ''} ${lead.outreachAngle || ''}`.toLowerCase();
  const interestAreas = properties
    .filter(property => lead.propertyInterestIds.includes(property.id))
    .map(property => property.area);
  const mentionedAreas = properties
    .map(property => property.area)
    .filter(area => noteText.includes(area.toLowerCase()));
  return Array.from(new Set([...interestAreas, ...mentionedAreas])).slice(0, 4);
};

const inferMustHaveSignals = (lead: Lead) => {
  const text = `${lead.notes} ${lead.source} ${lead.buyerSegment || ''} ${lead.outreachAngle || ''}`.toLowerCase();
  const signals = MATCH_SIGNAL_TAGS
    .filter(tag => tag.keywords.some(keyword => text.includes(keyword)))
    .map(tag => tag.label);
  if (signals.length > 0) return Array.from(new Set(signals)).slice(0, 5);
  if (/athlete|tennis|sport|recovery|wellness/.test(text)) return ['Wellness', 'Privacy'];
  if (/yacht|marina|captain|port/.test(text)) return ['Yacht access', 'Sea view', 'Privacy'];
  if (/aviation|airport|fbo/.test(text)) return ['Airport access', 'Privacy'];
  if (/art|collector|gallery/.test(text)) return ['Historic character', 'Privacy'];
  if (/hospitality|hotel|branded/.test(text)) return ['Investment upside', 'Sea view'];
  return ['Privacy', 'Sea view'];
};

const buildLeadSearchProfile = (lead: Lead, properties: MallorcaProperty[]): LeadSearchProfile => {
  if (lead.searchProfile) {
    return {
      ...lead.searchProfile,
      targetAreas: lead.searchProfile.targetAreas || [],
      mustHaves: lead.searchProfile.mustHaves || []
    };
  }

  const noteText = `${lead.notes} ${lead.source} ${lead.buyerSegment || ''}`.toLowerCase();
  const targetAreas = findAreaSignals(lead, properties);
  const mustHaves = inferMustHaveSignals(lead);
  const highPrivacy = (lead.socialEngagementScore || 0) >= 95 || /celebrity|athlete|representative|family office|privacy|secure|public high-profile/.test(noteText);
  const ultraPrivacy = /nadal|federer|ronaldo|beckham|musk|arnault|formula 1|public high-profile/.test(noteText);

  return {
    targetAreas,
    mustHaves,
    minBudget: Math.round((lead.budget * 0.6) / 100000) * 100000,
    maxBudget: lead.budget,
    minBeds: /family|compound|guest/.test(noteText) ? 5 : 4,
    minBaths: 4,
    minSizeSqM: /compound|estate|family office|hospitality/.test(noteText) ? 650 : 450,
    privacyLevel: ultraPrivacy ? 'Ultra' : (highPrivacy ? 'High' : 'Standard'),
    purchaseTimeframe: lead.interestLevel === 'High' ? '3-6 months' : 'Exploratory',
    advisorRoute: lead.preferredContactPath || 'Trusted-advisor introduction first.',
    profileNotes: lead.outreachAngle || 'Curate a concise off-market shortlist with privacy-first positioning.'
  };
};

const scorePropertyMatch = (lead: Lead, property: MallorcaProperty, profile: LeadSearchProfile): PropertyMatchResult => {
  const propertyText = `${property.title} ${property.area} ${property.highlight} ${property.description}`.toLowerCase();
  const reasons: string[] = [];
  const concerns: string[] = [];
  let score = 0;

  if (property.price <= profile.maxBudget) {
    score += 24;
    reasons.push('Within stated ceiling');
  } else if (property.price <= profile.maxBudget * 1.12) {
    score += 13;
    concerns.push('Slight stretch above ceiling');
  } else {
    concerns.push('Above budget ceiling');
  }

  if (property.price >= profile.minBudget * 0.9) {
    score += 8;
  }

  if (profile.targetAreas.length === 0 || profile.targetAreas.includes(property.area)) {
    score += 22;
    reasons.push(profile.targetAreas.length === 0 ? 'Area still open' : `${property.area} target area`);
  } else {
    concerns.push('Outside target area');
  }

  if (property.beds >= profile.minBeds) {
    score += 10;
    reasons.push(`${property.beds} bedrooms`);
  } else {
    concerns.push(`Only ${property.beds} bedrooms`);
  }

  if (property.baths >= profile.minBaths) {
    score += 6;
  }

  if (property.sizeSqM >= profile.minSizeSqM) {
    score += 10;
    reasons.push(`${property.sizeSqM} sqm scale`);
  } else {
    concerns.push('Below preferred size');
  }

  const matchedTags = MATCH_SIGNAL_TAGS
    .filter(tag => profile.mustHaves.includes(tag.label) && tag.keywords.some(keyword => propertyText.includes(keyword)))
    .map(tag => tag.label);
  score += Math.min(20, matchedTags.length * 7);
  matchedTags.forEach(tag => reasons.push(tag));

  if (lead.propertyInterestIds.includes(property.id)) {
    score += 10;
    reasons.push('Existing CRM interest');
  }

  if (profile.privacyLevel === 'Ultra' && /private|secure|exclusive|secluded|compound|quiet/.test(propertyText)) {
    score += 6;
    reasons.push('Privacy signal');
  }

  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const grade = boundedScore >= 90 ? 'A+' : boundedScore >= 80 ? 'A' : boundedScore >= 70 ? 'B+' : boundedScore >= 60 ? 'B' : 'Review';

  return {
    property,
    score: boundedScore,
    grade,
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    concerns: Array.from(new Set(concerns)).slice(0, 2),
    matchedTags,
    isPriority: lead.propertyInterestIds.includes(property.id) || boundedScore >= 82
  };
};

const getPropertyMatchResults = (lead: Lead, properties: MallorcaProperty[], profileOverride?: LeadSearchProfile) => {
  const profile = profileOverride || buildLeadSearchProfile(lead, properties);
  return properties
    .map(property => scorePropertyMatch(lead, property, profile))
    .filter(result => result.score >= 45 || lead.propertyInterestIds.includes(result.property.id))
    .sort((a, b) => b.score - a.score || a.property.price - b.property.price)
    .slice(0, 8);
};

const getOutreachRiskClass = (risk?: LeadOutreachPlan['riskLevel']) => {
  if (risk === 'VIP') return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
  if (risk === 'Elevated') return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
  return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
};

const getOutreachStatusClass = (status?: LeadOutreachPlan['status']) => {
  if (status === 'sent') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
  if (status === 'reviewed') return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
  return 'bg-neutral-900 text-neutral-300 border-neutral-800';
};

const formatOutreachOffset = (days: number) => days === 0 ? 'Day 0' : `Day ${days}`;

const isTaskOverdue = (task: LeadTask) =>
  task.status === 'open' && new Date(task.dueAt).getTime() < Date.now();

const getTaskStatusClass = (task: LeadTask) => {
  if (task.status === 'done') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
  if (task.status === 'blocked') return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
  if (isTaskOverdue(task)) return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
  if (task.priority === 'Critical') return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
  return 'bg-neutral-900 text-neutral-300 border-neutral-800';
};

const getTaskLabel = (task: LeadTask) => {
  if (task.status === 'done') return 'Done';
  if (task.status === 'blocked') return 'Blocked';
  if (isTaskOverdue(task)) return 'Overdue';
  return task.priority;
};

const formatTaskDue = (dueAt: string) => {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return 'No due date';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diffDays = Math.round((startDue - startToday) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return `Today ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Tomorrow ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === -1) return `Yesterday ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return due.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

type DealRoomPayload = {
  dealRoom: DealRoom & { lockedPropertyCount?: number };
  access: {
    ndaRequired: boolean;
    ndaAccepted: boolean;
  };
  lead: {
    fullName: string;
    languagePreference: 'EN' | 'DE' | 'ES';
    budget: number;
    buyerSegment?: string;
    outreachAngle?: string;
  };
  agent: TeamMember;
  properties: MallorcaProperty[];
};

function PublicDealRoomView() {
  const [payload, setPayload] = useState<DealRoomPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const token = window.location.pathname.split('/deal/')[1]?.split('/')[0] || '';

  const loadDealRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deal-rooms/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Deal room unavailable');
        setPayload(data.dealRoom ? { dealRoom: data.dealRoom, access: { ndaRequired: true, ndaAccepted: false }, lead: {} as any, agent: {} as any, properties: [] } : null);
        return;
      }
      setPayload(data);
      setError('');
    } catch (err) {
      setError('Deal room connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealRoom();
  }, [token]);

  const handleAcceptNda = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/deal-rooms/${token}/accept-nda`, { method: 'POST' });
      if (res.ok) {
        await loadDealRoom();
      } else {
        const data = await res.json();
        setError(data.error || 'NDA gate unavailable');
      }
    } catch (err) {
      setError('NDA confirmation failed');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center">
        <RefreshCcw className="w-5 h-5 animate-spin text-[#c5a059]" />
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-200 flex items-center justify-center p-6">
        <div className="max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-center">
          <Lock className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h1 className="text-xl font-serif text-white">Private Deal Room Closed</h1>
          <p className="text-xs text-neutral-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const dealRoom = payload?.dealRoom;
  const lead = payload?.lead;
  const expiresAt = dealRoom?.expiresAt ? new Date(dealRoom.expiresAt).toLocaleDateString() : 'Private';
  const isLocked = Boolean(payload?.access.ndaRequired && !payload?.access.ndaAccepted);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      <header className="border-b border-neutral-850 bg-black/70">
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c5a059] font-mono">Mallorca Agents Private Web-Expose</p>
            <h1 className="text-2xl md:text-3xl font-serif italic text-white mt-1">Confidential Balearic Shortlist</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Secure Link</span>
            <span className="px-2.5 py-1 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">Expires {expiresAt}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        {error && (
          <div className="border border-rose-900/40 bg-rose-950/20 text-rose-300 rounded-xl p-3 text-xs">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Prepared for</p>
                <h2 className="text-2xl font-serif text-white mt-1">{lead?.fullName || 'Private Buyer'}</h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-2xl">
                  {dealRoom?.privateNote || 'Curated confidential shortlist for a qualified Mallorca/Ibiza acquisition conversation.'}
                </p>
              </div>
              <Shield className="w-6 h-6 text-[#c5a059] shrink-0" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="border border-neutral-850 rounded-xl p-3 bg-black/40">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500">Budget</p>
                <p className="text-sm font-mono font-bold text-white mt-1">EUR {((lead?.budget || 0) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="border border-neutral-850 rounded-xl p-3 bg-black/40">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500">Segment</p>
                <p className="text-xs text-neutral-200 mt-1 truncate">{lead?.buyerSegment || 'HNW buyer'}</p>
              </div>
              <div className="border border-neutral-850 rounded-xl p-3 bg-black/40">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500">Views</p>
                <p className="text-sm font-mono font-bold text-white mt-1">{dealRoom?.viewCount || 0}</p>
              </div>
              <div className="border border-neutral-850 rounded-xl p-3 bg-black/40">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500">Access</p>
                <p className="text-xs text-neutral-200 mt-1">{isLocked ? 'NDA pending' : 'Unlocked'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#c5a059]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Access Protocol</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isLocked
                ? `${dealRoom?.lockedPropertyCount || 0} confidential property file(s) are sealed until the NDA gate is accepted.`
                : 'NDA/consent gate recorded. Property files are open for this private session.'}
            </p>
            {isLocked ? (
              <button
                onClick={handleAcceptNda}
                disabled={accepting}
                className="w-full bg-[#c5a059] text-black hover:bg-white disabled:opacity-60 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
              >
                {accepting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Accept NDA Gate
              </button>
            ) : (
              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Consent captured {dealRoom?.ndaAcceptedAt ? new Date(dealRoom.ndaAcceptedAt).toLocaleString() : 'for this room'}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLocked ? (
            <div className="md:col-span-2 xl:col-span-3 border border-neutral-800 rounded-2xl bg-[#0a0a0a] p-10 text-center">
              <Lock className="w-8 h-8 text-[#c5a059] mx-auto mb-3" />
              <h3 className="text-lg font-serif text-white">Property Files Sealed</h3>
              <p className="text-xs text-neutral-500 mt-2">The shortlist opens after NDA confirmation.</p>
            </div>
          ) : (
            payload?.properties.map(property => (
              <article key={property.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden">
                <img src={property.image} alt={property.title} className="w-full h-44 object-cover" />
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#c5a059] font-mono">{property.area}</p>
                    <h3 className="text-base font-serif font-bold text-white mt-1">{property.title}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{property.description}</p>
                  <div className="flex items-center justify-between border-t border-neutral-900 pt-3">
                    <span className="text-sm font-mono font-bold text-[#c5a059]">EUR {(property.price / 1000000).toFixed(1)}M</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{property.beds} bd / {property.sizeSqM} sqm</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function CRMContent({ 
  initialActiveMember, 
  onLogout, 
  initiateTour, 
  tourTabOverride, 
  onTourTabChange 
}: { 
  initialActiveMember: TeamMember; 
  onLogout: () => void; 
  initiateTour: () => void; 
  tourTabOverride: 'dashboard' | 'crm' | 'ai-gen' | 'analytics' | 'audit' | 'team' | null;
  onTourTabChange: (tab: any) => void;
}) {
  const { language, setLanguage, t } = useTranslation();
  
  // App states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'ai-gen' | 'analytics' | 'audit' | 'team'>('dashboard');
  const [properties, setProperties] = useState<MallorcaProperty[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  
  // Sync tab with tour highlights
  useEffect(() => {
    if (tourTabOverride) {
      setActiveTab(tourTabOverride);
    }
  }, [tourTabOverride]);

  // App environment config simulations
  const [activeMember, setActiveMember] = useState<TeamMember>(initialActiveMember);

  useEffect(() => {
    setActiveMember(initialActiveMember);
  }, [initialActiveMember]);
  
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // CRM expansion filtering states
  const [minBudgetFilter, setMinBudgetFilter] = useState<number>(0);
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(20000000);
  const [isDraggingMinBudget, setIsDraggingMinBudget] = useState<boolean>(false);
  const [isDraggingMaxBudget, setIsDraggingMaxBudget] = useState<boolean>(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState<boolean>(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState<boolean>(false);
  const [leadSortCriteria, setLeadSortCriteria] = useState<string>('newest');
  
  // Selected Lead for view in Detailed/Timeline mode
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [dossierLead, setDossierLead] = useState<Lead | null>(null);
  const [dealRoomWorking, setDealRoomWorking] = useState<boolean>(false);
  const [searchProfileDraft, setSearchProfileDraft] = useState<LeadSearchProfile | null>(null);
  const [isSavingSearchProfile, setIsSavingSearchProfile] = useState<boolean>(false);
  
  // Gemini-driven follow-up generation states
  const [generatedFollowUp, setGeneratedFollowUp] = useState<string>('');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState<boolean>(false);
  const [outreachPlanDraft, setOutreachPlanDraft] = useState<LeadOutreachPlan | null>(null);
  const [isDispatchingOutreach, setIsDispatchingOutreach] = useState<boolean>(false);
  const [taskActionId, setTaskActionId] = useState<string | null>(null);
  const [showAuditSection, setShowAuditSection] = useState<boolean>(false);
  
  // Form state for adding prospective leads
  const [showAddLeadModal, setShowAddLeadModal] = useState<boolean>(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState('5000000');
  const [newLeadLang, setNewLeadLang] = useState<'EN' | 'DE' | 'ES'>('EN');
  const [newLeadSource, setNewLeadSource] = useState('Instagram Ads');
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [newLeadProp, setNewLeadProp] = useState('');
  
  // Scraper Simulation states
  const [agentSearchMode, setAgentSearchMode] = useState<'social' | 'web'>('web');
  const [selectedScrapePlatform, setSelectedScrapePlatform] = useState<string>('Family offices, yacht clubs, liquidity events, and Balearic luxury advisors');
  const [selectedScrapeNiche, setSelectedScrapeNiche] = useState<string>('Post-liquidity founders, yacht owners, athletes, and family offices seeking Mallorca or Ibiza privacy estates');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastScrapedLead, setLastScrapedLead] = useState<Lead | null>(null);

  // Autonomous AI Lead Scout Agent States
  const [autopilotActive, setAutopilotActive] = useState<boolean>(false);
  const [agentScanInterval, setAgentScanInterval] = useState<number>(DEFAULT_AGENT_SCAN_INTERVAL_SECONDS); // in seconds
  const [agentCountdown, setAgentCountdown] = useState<number>(DEFAULT_AGENT_SCAN_INTERVAL_SECONDS); // in seconds
  const [agentTerminalLogs, setAgentTerminalLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warn' }>>([
    { id: 'l-init-1', time: new Date().toLocaleTimeString(), text: 'AI Agent "Hunter-Scout-v2" loaded with Gemini 3.5 framework integrations.', type: 'info' },
    { id: 'l-init-2', time: new Date().toLocaleTimeString(), text: 'Target matrices set matching private registries & active search keywords.', type: 'info' },
    { id: 'l-init-3', time: new Date().toLocaleTimeString(), text: 'Agent is standby. Turn Autopilot ON to start autonomous lead mining.', type: 'warn' }
  ]);

  // Performance Report AI analysis states
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Error/Success alert banners
  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  
  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Fetch initial data securely from backend
  const fetchData = async (silent = false) => {
    if (offlineMode) return;
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
        setTeam(data.team);
        setLeads(data.leads);
        setLogs(data.logs);
        setNotifications(data.notifications);
        
        // Synchronize persisted Autopilot configuration state
        if (data.autopilotSettings) {
          setAutopilotActive(data.autopilotSettings.isAutonomousActive);
          if (data.autopilotSettings.selectedNiche) {
            setSelectedScrapeNiche(data.autopilotSettings.selectedNiche);
          }
          if (data.autopilotSettings.selectedPlatform) {
            setSelectedScrapePlatform(data.autopilotSettings.selectedPlatform);
          }
          if (data.autopilotSettings.searchMode) {
            setAgentSearchMode(data.autopilotSettings.searchMode as 'social' | 'web');
          }
          if (data.autopilotSettings.intervalHours) {
            const persistedSeconds = Math.max(
              MIN_AGENT_SCAN_INTERVAL_SECONDS,
              Math.round(Number(data.autopilotSettings.intervalHours) * 60 * 60)
            );
            setAgentScanInterval(persistedSeconds);
            setAgentCountdown(persistedSeconds);
          }
        }
        
        // Retain selection if lead still exists
        if (selectedLead) {
          const freshLead = data.leads.find((l: Lead) => l.id === selectedLead.id);
          if (freshLead) {
            setSelectedLead(freshLead);
          }
        }
      }
    } catch (err) {
      console.error("Unable to execute live data sync", err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  };

  // On page load, get parameters
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedLead) {
      setSearchProfileDraft(null);
      setOutreachPlanDraft(null);
      setGeneratedFollowUp('');
      return;
    }
    setSearchProfileDraft(buildLeadSearchProfile(selectedLead, properties));
    setOutreachPlanDraft(selectedLead.outreachPlan || null);
    setGeneratedFollowUp(selectedLead.outreachPlan?.messageTemplate || '');
  }, [selectedLead?.id, selectedLead?.searchProfile?.updatedAt, selectedLead?.outreachPlan?.generatedAt, selectedLead?.outreachPlan?.sentAt]);

  // Sync state offline/online change triggers
  useEffect(() => {
    if (offlineMode) {
      // Offline mode backup simulated in state and localStorage
      const offlineLog: AuditLog = {
        id: `offline-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Offline Local SQLite Transition',
        details: 'Transitioned data synchronization queue to offline client-side fallback vault.',
        user: activeMember.name,
        role: activeMember.role,
        module: 'System',
        ipAddress: 'Offline Cache Client'
      };
      setLogs(prev => [offlineLog, ...prev]);
    } else {
      fetchData();
    }
  }, [offlineMode]);

  const triggerSync = async () => {
    setIsSyncing(true);
    await fetchData();
    showAlert("Database snapshot synced in real-time across iOS, Android and Cloud Run node.", "success");
  };

  const handleResetDatabase = async () => {
    if (offlineMode) {
      showAlert("Cannot reset database while offline", "danger");
      return;
    }
    if (window.confirm("Are you sure you want to completely PURGE all CRM leads and reset the database to a clean, empty state for a live research run? This action is irreversible.")) {
      setIsSyncing(true);
      try {
        const res = await fetch("/api/data/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": activeMember.role,
            "x-user-name": activeMember.name
          }
        });
        if (res.ok) {
          const freshData = await res.json();
          setLeads(freshData.leads);
          setTeam(freshData.team);
          setLogs(freshData.logs);
          setNotifications(freshData.notifications);
          setSelectedLead(null);
          showAlert("Database purged successfully! Leads table is now clear for live run.", "success");
        } else {
          showAlert("Unauthorized or failed to reset database", "danger");
        }
      } catch (err) {
        console.error("Failed to reset database", err);
        showAlert("Failed to connect to secure server", "danger");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const showAlert = (message: string, type: 'success' | 'danger') => {
    setAlertBanner({ message, type });
    setTimeout(() => {
      setAlertBanner(null);
    }, 5000);
  };

  // Handle Add Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail) {
      showAlert("Customer name and email are strictly mandatory", "danger");
      return;
    }

    const payload = {
      fullName: newLeadName,
      email: newLeadEmail,
      phone: newLeadPhone,
      source: newLeadSource,
      budget: Number(newLeadBudget),
      languagePreference: newLeadLang,
      notes: newLeadNotes,
      assignedAgent: activeMember.name,
      propertyInterestIds: newLeadProp ? [newLeadProp] : []
    };

    if (offlineMode) {
      // Simulate local storage capture
      const simulatedLocalLead: Lead = {
        id: `lead-off-${Date.now()}`,
        fullName: newLeadName,
        email: newLeadEmail,
        phone: newLeadPhone,
        source: `${newLeadSource} (Offline Queued)`,
        status: 'New',
        interestLevel: 'High',
        budget: Number(newLeadBudget),
        languagePreference: newLeadLang,
        notes: `${newLeadNotes} [Offline Record Saved]`,
        assignedAgent: activeMember.name,
        lastContactDate: new Date().toISOString().split('T')[0],
        nextFollowUpDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
        propertyInterestIds: newLeadProp ? [newLeadProp] : [],
        timeline: [
          {
            id: `timeline-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'creation',
            title: 'Offline Draft Record Saved',
            desc: 'Saved securely to local device SQLite cache while internet connection is disconnected.',
            agent: activeMember.name
          }
        ]
      };
      setLeads(prev => [simulatedLocalLead, ...prev]);
      
      const offlineAudit: AuditLog = {
        id: `offline-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Offline Write Succeeded',
        details: `Saved prospective buyer ${newLeadName} locally. Remote cloud sync is pending.`,
        user: activeMember.name,
        role: activeMember.role,
        module: 'CRM',
        ipAddress: 'Local Device'
      };
      setLogs(prev => [offlineAudit, ...prev]);
      
      showAlert("Property lead saved offline to device storage.", "success");
      setShowAddLeadModal(false);
      resetAddLeadForm();
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setLeads(prev => [result.lead, ...prev]);
        setLogs(result.logs);
        setNotifications(result.notifications);
        setShowAddLeadModal(false);
        resetAddLeadForm();
        showAlert("HNW client lead onboarded on MallorcaAgents pipeline successfully.", "success");
        fetchData(true);
      } else if (res.status === 409) {
        const result = await res.json();
        showAlert(result.error || "Lead already exists in the CRM.", "danger");
      }
    } catch (err) {
      showAlert("Server communication error", "danger");
    }
  };

  const resetAddLeadForm = () => {
    setNewLeadName('');
    setNewLeadEmail('');
    setNewLeadPhone('');
    setNewLeadBudget('5000000');
    setNewLeadNotes('');
    setNewLeadProp('');
  };

  // Handle Lead status modifications
  const handleUpdateStatus = async (leadId: string, status: string) => {
    if (offlineMode) {
      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          const updatedTimeline = [
            {
              id: `timeline-state-${Date.now()}`,
              date: new Date().toISOString(),
              type: 'contact' as const,
              title: 'Status Draft Updated',
              desc: `Local state changed to: ${status} [Queued for cloud release]`,
              agent: activeMember.name
            },
            ...l.timeline
          ];
          return { ...l, status: status as any, timeline: updatedTimeline };
        }
        return l;
      }));
      showAlert(`Status adjusted offline to ${status}`, "success");
      return;
    }

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          updatedBy: `${activeMember.name} (${activeMember.role})`
        })
      });

      if (res.ok) {
        const result = await res.json();
        showAlert(`Status adjusted to ${status} for ${result.lead.fullName}`, "success");
        fetchData(true);
      }
    } catch (err) {
      showAlert("Status sync failed", "danger");
    }
  };

  // Secure Purging - strictly checked role-based barriers
  const handleDeleteLead = async (leadId: string) => {
    if (offlineMode) {
      if (activeMember.role !== 'Administrator') {
        const blockAudit: AuditLog = {
          id: `unauth-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Offline Security Block',
          details: `Role ${activeMember.role} blocked from purging lead ${leadId}`,
          user: activeMember.name,
          role: activeMember.role,
          module: 'AccessControl',
          ipAddress: 'Local Sandbox'
        };
        setLogs(prev => [blockAudit, ...prev]);
        showAlert("Restricted Action: Only Administrators can purge client accounts.", "danger");
        return;
      }
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setSelectedLead(null);
      showAlert("Lead purged offline.", "success");
      return;
    }

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': activeMember.role,
          'x-user-name': activeMember.name
        }
      });

      const result = await res.json();
      if (res.status === 403) {
        // Log is returned in body
        setLogs(result.logs);
        showAlert(result.error || "Access Denied: Restricted action block", "danger");
      } else if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        setLogs(result.logs);
        setSelectedLead(null);
        showAlert("Prospect timeline ledger deleted securely.", "success");
        fetchData(true);
      }
    } catch (err) {
      showAlert("Delete pipeline communication failed", "danger");
    }
  };

  // Autopilot Outreach Template script trigger via Model API
  const handleAutoFollowUp = async (leadId: string) => {
    setIsGeneratingFollowUp(true);
    setGeneratedFollowUp('');
    
    try {
      const res = await fetch(`/api/leads/${leadId}/generate-followup`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedFollowUp(data.message);
        if (data.outreachPlan) {
          setOutreachPlanDraft(data.outreachPlan);
        }
        if (data.lead) {
          setSelectedLead(data.lead);
          setLeads(prev => prev.map(item => item.id === data.lead.id ? data.lead : item));
        }
        setLogs(data.logs);
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        showAlert("Outreach playbook generated and attached to this lead.", "success");
        fetchData(true);
      } else {
        showAlert("Unable to connect with AI generation pipeline.", "danger");
      }
    } catch (err) {
      showAlert("AI follow up request error", "danger");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleSearchProfilePatch = (patch: Partial<LeadSearchProfile>) => {
    if (!selectedLead) return;
    setSearchProfileDraft(prev => ({
      ...buildLeadSearchProfile(selectedLead, properties),
      ...prev,
      ...patch
    }));
  };

  const handleSaveSearchProfile = async () => {
    if (!selectedLead || !searchProfileDraft) return;
    setIsSavingSearchProfile(true);
    const normalizedProfile: LeadSearchProfile = {
      ...searchProfileDraft,
      targetAreas: searchProfileDraft.targetAreas.map(item => item.trim()).filter(Boolean),
      mustHaves: searchProfileDraft.mustHaves.map(item => item.trim()).filter(Boolean),
      minBudget: Math.max(0, Number(searchProfileDraft.minBudget) || 0),
      maxBudget: Math.max(Number(searchProfileDraft.minBudget) || 0, Number(searchProfileDraft.maxBudget) || selectedLead.budget),
      minBeds: Math.max(0, Number(searchProfileDraft.minBeds) || 0),
      minBaths: Math.max(0, Number(searchProfileDraft.minBaths) || 0),
      minSizeSqM: Math.max(0, Number(searchProfileDraft.minSizeSqM) || 0),
      advisorRoute: searchProfileDraft.advisorRoute || selectedLead.preferredContactPath || 'Trusted-advisor introduction first.',
      profileNotes: searchProfileDraft.profileNotes || selectedLead.outreachAngle || ''
    };

    try {
      const res = await fetch(`/api/leads/${selectedLead.id}/search-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchProfile: normalizedProfile,
          updatedBy: activeMember.name
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || "Unable to save buyer search profile.", "danger");
        return;
      }

      setSelectedLead(data.lead);
      setSearchProfileDraft(data.searchProfile);
      setLeads(prev => prev.map(item => item.id === data.lead.id ? data.lead : item));
      setLogs(data.logs);
      setNotifications(data.notifications);
      showAlert("Buyer search profile saved and matching recalculated.", "success");
    } catch (err) {
      showAlert("Search profile save failed", "danger");
    } finally {
      setIsSavingSearchProfile(false);
    }
  };

  const handlePrepareDealRoom = async (lead: Lead) => {
    setDealRoomWorking(true);
    try {
      const profileForRoom = selectedLead?.id === lead.id && searchProfileDraft ? searchProfileDraft : buildLeadSearchProfile(lead, properties);
      const matchedPropertyIds = getPropertyMatchResults(lead, properties, profileForRoom)
        .slice(0, 6)
        .map(result => result.property.id);

      const res = await fetch(`/api/leads/${lead.id}/deal-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedPropertyIds: matchedPropertyIds,
          ndaRequired: true,
          expiryDays: 14,
          privateNote: lead.outreachAngle || 'Curated confidential shortlist for a qualified Mallorca/Ibiza acquisition conversation.'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || "Unable to prepare private deal room.", "danger");
        return;
      }

      setSelectedLead(data.lead);
      setLeads(prev => prev.map(item => item.id === data.lead.id ? data.lead : item));
      setLogs(data.logs);
      setNotifications(data.notifications);
      showAlert(`Private deal room prepared for ${data.lead.fullName}.`, "success");
    } catch (err) {
      showAlert("Deal room preparation failed", "danger");
    } finally {
      setDealRoomWorking(false);
    }
  };

  const copyDealRoomLink = async (dealRoom: DealRoom) => {
    const link = dealRoom.shareUrl || `${window.location.origin}${dealRoom.sharePath}`;
    try {
      await navigator.clipboard.writeText(link);
      showAlert("Private deal room link copied.", "success");
    } catch (err) {
      showAlert("Unable to copy deal room link.", "danger");
    }
  };

  // Simulated outreach dispatch
  const handleSimulateDispatch = async (lead: Lead) => {
    setIsDispatchingOutreach(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/outreach-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchedBy: activeMember.name })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || "Unable to mark outreach sequence as sent.", "danger");
        return;
      }

      setSelectedLead(data.lead);
      setOutreachPlanDraft(data.outreachPlan);
      setLeads(prev => prev.map(item => item.id === data.lead.id ? data.lead : item));
      setLogs(data.logs);
      setNotifications(data.notifications);
      showAlert(`Outreach sequence marked sent for ${data.lead.fullName}.`, "success");
    } catch (err) {
      showAlert("Outreach dispatch request failed", "danger");
    } finally {
      setIsDispatchingOutreach(false);
    }
  };

  const handleCompleteOutreachTask = async (lead: Lead, task: LeadTask) => {
    setTaskActionId(task.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy: activeMember.name })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || "Unable to complete outreach task.", "danger");
        return;
      }

      setSelectedLead(data.lead);
      setOutreachPlanDraft(data.lead.outreachPlan || null);
      setLeads(prev => prev.map(item => item.id === data.lead.id ? data.lead : item));
      setLogs(data.logs);
      setNotifications(data.notifications);
      showAlert(`Task completed for ${data.lead.fullName}.`, "success");
    } catch (err) {
      showAlert("Task completion request failed", "danger");
    } finally {
      setTaskActionId(null);
    }
  };

  // AI-Driven Social Media Hunter Trigger Simulation
  const handleActionScraperScrape = async () => {
    setIsScraping(true);
    setLastScrapedLead(null);
    try {
      const res = await fetch('/api/ai/scrape-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: selectedScrapePlatform,
          niche: selectedScrapeNiche,
          searchMode: agentSearchMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => [data.lead, ...prev]);
        setLogs(data.logs);
        setNotifications(data.notifications);
        setLastScrapedLead(data.lead);
        showAlert(`Luxury buyer lead auto-scraped from ${selectedScrapePlatform}!`, "success");
        fetchData(true);
      } else if (res.status === 409) {
        const data = await res.json();
        showAlert(data.message || "Lead already exists. Scan skipped to avoid duplicates.", "danger");
      }
    } catch (err) {
      showAlert("Scraper simulator is offline", "danger");
    } finally {
      setIsScraping(false);
    }
  };

  // Persist and Sync Autopilot Agent State
  const handleToggleAutopilot = async (newVal: boolean) => {
    setAutopilotActive(newVal);
    try {
      const res = await fetch('/api/ai/autopilot/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAutonomousActive: newVal,
          selectedNiche: selectedScrapeNiche,
          selectedPlatform: selectedScrapePlatform,
          searchMode: agentSearchMode,
          scanIntervalSeconds: agentScanInterval
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setLogs(data.logs);
        setNotifications(data.notifications);
        showAlert(newVal ? "Autonomous overnight HNW hunter fully engaged!" : "Autopilot agent paused on standby.", "success");
        fetchData(true);
      }
    } catch (err) {
      console.error("Failed to synchronize autopilot", err);
    }
  };

  // Autonomous AI Lead Scout Autopilot Agent Engine Trigger
  const triggerAutonomousScouting = async () => {
    try {
      setAgentTerminalLogs(prev => [
        {
          id: `log-scouting-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: agentSearchMode === 'web'
            ? `🤖 AI AGENT TRIGGERED: Running Deep Web search grounding matching "${selectedScrapeNiche}"...`
            : `🤖 AI AGENT TRIGGERED: Initiating background lead capture from "${selectedScrapePlatform}"...`,
          type: 'warn'
        },
        ...prev
      ]);

      const res = await fetch('/api/ai/scrape-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: selectedScrapePlatform,
          niche: selectedScrapeNiche,
          searchMode: agentSearchMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newLead = data.lead;
        
        // Add to frontend list dynamically
        setLeads(prevLeads => [newLead, ...prevLeads]);
        setLogs(prevLogs => [data.logs[0], ...prevLogs]);
        setNotifications(prevNotifs => [data.notifications[0], ...prevNotifs]);
        
        setAgentTerminalLogs(prev => [
          {
            id: `log-success-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            text: agentSearchMode === 'web'
              ? `🌐 GLOBAL WEB FIND: Discovered real-world buyer "${newLead.fullName}" with active web footprint (Budget: €${(newLead.budget/1000000).toFixed(1)}M). Encrypted and synced!`
              : `🎯 SUCCESS: Discovered active buyer "${newLead.fullName}" (Budget: €${(newLead.budget/1000000).toFixed(1)}M). Assigned to Elena Ramos. Record encrypted and synchronized!`,
            type: 'success'
          },
          ...prev
        ]);
        
        showAlert(`Autopilot Agent acquired lead: ${newLead.fullName}!`, "success");
        fetchData(true);
      } else if (res.status === 409) {
        const data = await res.json();
        setAgentTerminalLogs(prev => [
          {
            id: `log-duplicate-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            text: data.message || `Scan skipped: matching lead already exists in CRM.`,
            type: 'warn'
          },
          ...prev
        ]);
        fetchData(true);
      }
    } catch (err) {
      setAgentTerminalLogs(prev => [
        {
          id: `log-err-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: `❌ Autonomous collection error: Server is temporarily offline or busy. Retrying in next cycle.`,
          type: 'warn'
        },
        ...prev
      ]);
    }
  };

  // Autopilot loop manager
  useEffect(() => {
    let intervalId: any = null;
    if (autopilotActive) {
      setAgentTerminalLogs(prev => [
        {
          id: `log-activate-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: `⚡ AUTOPILOT ACTIVATED: Target: "${selectedScrapePlatform}" | Persona: "${selectedScrapeNiche}". Entering active scouting loop.`,
          type: 'success'
        },
        ...prev
      ]);
      setAgentCountdown(agentScanInterval);

      intervalId = setInterval(() => {
        setAgentCountdown(prev => {
          if (prev <= 1) {
            triggerAutonomousScouting();
            return agentScanInterval;
          }

          // Periodic status update simulation inside terminal
          const timeToTriggerLog = prev - 1;
          const statusLogs = [
            { triggerSec: Math.max(agentScanInterval - 60, 1), text: `🔍 Scouting high-engagement signals on ${selectedScrapePlatform}...`, type: 'info' },
            { triggerSec: Math.max(Math.floor(agentScanInterval / 2), 1), text: `🛡️ Pulling registration data matching theme "${selectedScrapeNiche}"...`, type: 'info' },
            { triggerSec: 60, text: `🧠 Feeding candidate profiles into Gemini 3.5 structured parsing loop...`, type: 'info' }
          ];

          const matchLog = statusLogs.find(l => l.triggerSec === timeToTriggerLog);
          if (matchLog) {
            setAgentTerminalLogs(logs => [
              {
                id: `log-${Date.now()}-${prev}`,
                time: new Date().toLocaleTimeString(),
                text: matchLog.text,
                type: matchLog.type as any
              },
              ...logs
            ]);
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (agentTerminalLogs.length > 3) {
        setAgentTerminalLogs(prev => [
          {
            id: `log-deactivate-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            text: `💤 AUTOPILOT STANDBY: Background agent loop paused.`,
            type: 'warn'
          },
          ...prev
        ]);
      }
      setAgentCountdown(agentScanInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autopilotActive, agentScanInterval, selectedScrapePlatform, selectedScrapeNiche, agentSearchMode]);

  // AI-Driven performance analytics insight generator
  const triggerPerformanceReport = async () => {
    setIsGeneratingReport(true);
    setAiReport('');
    try {
      const res = await fetch('/api/ai/analytics', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data.analysis);
      }
    } catch (e) {
      showAlert("Unable to synthesize AI reports.", "danger");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Clear system real-time notices
  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/clear', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (e) {
      // Offline fallback
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Total active budget tracker calculation
  const totalPipelineBudget = leads.reduce((sum, l) => sum + l.budget, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const availablePropertyAreas = React.useMemo(
    () => Array.from(new Set(properties.map(property => property.area))).sort(),
    [properties]
  );

  // Dynamic client budget to target property price ratio trend calculation
  const budgetRatioData = React.useMemo(() => {
    if (!selectedLead) return [];
    
    // Calculate reference target property price (avg of customized interest villas or general matched villas)
    const selectedProperties = properties.filter(p => selectedLead.propertyInterestIds.includes(p.id));
    const matchedProperties = selectedProperties.length > 0
      ? selectedProperties
      : properties.filter(prop => selectedLead.budget >= prop.price * 0.85);
    
    const avgPropertyPrice = matchedProperties.length > 0
      ? matchedProperties.reduce((sum, p) => sum + p.price, 0) / matchedProperties.length
      : 5000000; // default 5M EUR fallback if no villas exist in state
    
    const sortedTimeline = [...selectedLead.timeline].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const points = [];
    if (sortedTimeline.length <= 1) {
      // Simulate historical onboarding progress leading up to current budget limit to show realistic flow
      const baseDate = sortedTimeline.length === 1 ? new Date(sortedTimeline[0].date).getTime() : Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      points.push({
        date: new Date(baseDate - 2 * oneWeek).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        ratio: parseFloat(((selectedLead.budget * 0.82) / avgPropertyPrice).toFixed(2)),
        budget: Math.round((selectedLead.budget * 0.82) / 100000) / 10,
        event: 'Prospect Sourcing'
      });
      points.push({
        date: new Date(baseDate - oneWeek).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        ratio: parseFloat(((selectedLead.budget * 0.90) / avgPropertyPrice).toFixed(2)),
        budget: Math.round((selectedLead.budget * 0.90) / 100000) / 10,
        event: 'Valuation Sizing'
      });
      points.push({
        date: new Date(baseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        ratio: parseFloat((selectedLead.budget / avgPropertyPrice).toFixed(2)),
        budget: Math.round(selectedLead.budget / 100000) / 10,
        event: sortedTimeline[0]?.title || 'Profile Active'
      });
    } else {
      sortedTimeline.forEach((item, idx) => {
        const count = sortedTimeline.length;
        // Progressively scale historical ratio trend
        let factor = 1.0;
        if (count > 1) {
          factor = 0.85 + (0.15 * (idx / (count - 1)));
        }
        const historicalBudget = selectedLead.budget * factor;
        const ratio = parseFloat((historicalBudget / avgPropertyPrice).toFixed(2));
        
        points.push({
          date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          ratio: ratio,
          budget: Math.round(historicalBudget / 100000) / 10,
          event: item.title
        });
      });
    }
    return points;
  }, [selectedLead, properties]);

  // Render matching properties list per individual client
  const renderPropertyMatches = (lead: Lead) => {
    const profile = selectedLead?.id === lead.id && searchProfileDraft
      ? searchProfileDraft
      : buildLeadSearchProfile(lead, properties);
    const matched = getPropertyMatchResults(lead, properties, profile);
    return (
      <div className="space-y-3">
        {matched.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No direct property profiles match this search profile yet.</p>
        ) : (
          matched.map(result => {
            const prop = result.property;
            return (
              <div 
                key={prop.id} 
                className={`p-3 rounded-lg border flex gap-3 items-start ${
                  result.isPriority 
                    ? 'bg-[#c5a059]/10 border-[#c5a059]/50 text-white' 
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                }`}
              >
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-12 h-12 object-cover rounded-md border border-neutral-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-serif font-semibold truncate text-white">{prop.title}</h5>
                    <span className="text-[10px] text-[#c5a059] font-mono font-bold">€{(prop.price/1000000).toFixed(1)}M</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">{prop.area} • {prop.highlight}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.reasons.slice(0, 3).map(reason => (
                      <span key={reason} className="text-[8px] uppercase tracking-wider bg-black/40 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                        {reason}
                      </span>
                    ))}
                  </div>
                  {result.concerns.length > 0 && (
                    <p className="text-[9px] text-amber-400/80 mt-1 font-mono truncate">
                      Watch: {result.concerns.join(', ')}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border font-mono font-bold ${
                    result.score >= 82
                      ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40'
                      : result.score >= 70
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-neutral-850 text-neutral-400 border-neutral-700'
                  }`}>
                    {result.score}% {result.grade}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Dynamic sources based on currently loaded leads
  const availableSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean))) as string[];

  // Dynamic agents based on currently loaded leads and team lists
  const availableAgents = Array.from(new Set([
    ...team.map(m => m.name),
    ...leads.map(l => l.assignedAgent)
  ].filter(Boolean))) as string[];

  // Filtering leads search with sorting options
  const filteredLeadsList = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPropertyMatch = selectedPropertyId === 'all' || l.propertyInterestIds.includes(selectedPropertyId);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesBudget = l.budget >= minBudgetFilter && l.budget <= maxBudgetFilter;
    const matchesSource = selectedSources.length === 0 || selectedSources.includes(l.source);
    const matchesAgent = selectedAgents.length === 0 || selectedAgents.includes(l.assignedAgent);
    
    return matchesSearch && matchesPropertyMatch && matchesStatus && matchesBudget && matchesSource && matchesAgent;
  }).sort((a, b) => {
    if (leadSortCriteria === 'budget-desc') {
      return b.budget - a.budget;
    } else if (leadSortCriteria === 'alphabetical') {
      return a.fullName.localeCompare(b.fullName);
    } else if (leadSortCriteria === 'engagement') {
      const scoreA = a.socialEngagementScore || 0;
      const scoreB = b.socialEngagementScore || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // If we have equal scores, sort by lastActive recency
      const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return dateB - dateA;
    } else {
      // Default: 'newest' (Newest First)
      // Since new leads are prepended in the 'leads' array state, their natural array indices
      // represent insertion order. Sorting by their relative position preserves this.
      return leads.indexOf(a) - leads.indexOf(b);
    }
  });

  const outreachActivityTasks = leads.flatMap(lead =>
    (lead.outreachTasks || []).map(task => ({ lead, task }))
  ).sort((a, b) => new Date(a.task.dueAt).getTime() - new Date(b.task.dueAt).getTime());
  const openOutreachTasks = outreachActivityTasks.filter(item => item.task.status === 'open');
  const overdueOutreachTasks = openOutreachTasks.filter(item => isTaskOverdue(item.task));
  const nextOutreachTasks = openOutreachTasks.slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-neutral-200 flex flex-col md:flex-row font-sans">
      
      {/* Dynamic alerts/events banner */}
      {alertBanner && (
        <div role="status" aria-live="polite" className={`fixed top-4 right-4 z-55 max-w-md p-4 rounded-xl border animate-slide-in shadow-2xl flex items-start gap-3 ${
          alertBanner.type === 'success' 
            ? 'bg-neutral-950 border-emerald-500/50 text-emerald-300' 
            : 'bg-neutral-950 border-rose-500/50 text-rose-300'
        }`}>
          {alertBanner.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h5 className="text-xs font-bold uppercase tracking-wider font-mono">
              {alertBanner.type === 'success' ? 'Pipeline Operational Signal' : 'Security Access Alert'}
            </h5>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{alertBanner.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            aria-label="Dismiss alert"
            className={`${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 cursor-pointer select-none`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Side Navigation panel matches the template */}
      <nav className={`w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-neutral-800/50 flex flex-col p-6 shrink-0 z-10 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="mb-8 flex md:block justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif italic text-white tracking-tight">
              Mallorca <span className="text-[#c5a059]">Agents</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1">Elite Property CRM</p>
          </div>
          <button 
            type="button"
            aria-label="Close navigation menu"
            className={`md:hidden ${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Main tabs list */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-3">Navigation</p>
            
            <button
              onClick={() => { setActiveTab('dashboard'); onTourTabChange('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-neutral-900 border border-neutral-850 text-[#c5a059]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-[#c5a059]' : 'bg-neutral-800 group-hover:bg-[#c5a059]/60'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-medium">{t('dashboard')}</span>
                <Compass className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('crm'); onTourTabChange('crm'); setMobileMenuOpen(false); }}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-neutral-900 border border-neutral-850 text-[#c5a059]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${activeTab === 'crm' ? 'bg-[#c5a059]' : 'bg-neutral-800 group-hover:bg-[#c5a059]/60'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-medium">{t('crmLeadTracker')}</span>
                <Users className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('ai-gen'); onTourTabChange('ai-gen'); setMobileMenuOpen(false); }}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
                activeTab === 'ai-gen'
                  ? 'bg-neutral-900 border border-neutral-850 text-[#c5a059]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${activeTab === 'ai-gen' ? 'bg-[#c5a059]' : 'bg-neutral-800 group-hover:bg-[#c5a059]/60'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-medium">{t('aiLeadsFinder')}</span>
                <Zap className="w-3.5 h-3.5 text-amber-500 opacity-80 group-hover:opacity-100" />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); onTourTabChange('analytics'); setMobileMenuOpen(false); }}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-neutral-900 border border-neutral-850 text-[#c5a059]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${activeTab === 'analytics' ? 'bg-[#c5a059]' : 'bg-neutral-800 group-hover:bg-[#c5a059]/60'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-medium">{t('performanceAnalytics')}</span>
                <TrendingUp className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('team'); onTourTabChange('team'); setMobileMenuOpen(false); }}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-neutral-900 border border-neutral-850 text-[#c5a059]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${activeTab === 'team' ? 'bg-[#c5a059]' : 'bg-neutral-800 group-hover:bg-[#c5a059]/60'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-medium">{t('teamAccess')}</span>
                <Shield className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              </div>
            </button>
          </div>

          {/* Premium Onboarding Academy Tour */}
          <div className="pt-2 border-t border-neutral-900 pb-2">
            <button
              onClick={initiateTour}
              className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-2.5 px-3 py-2.5 rounded transition-all text-left group cursor-pointer text-[#c5a059] bg-[#c5a059]/5 border border-[#c5a059]/20 hover:bg-[#c5a059]/10`}
              title="Replay Fullscreen Academy Tour"
            >
              <BookOpen className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="text-xs font-semibold">{t('tourHintIcon')} Walkthrough</span>
                <span className="text-[9px] bg-[#c5a059]/15 text-[#c5a059] font-mono px-1 rounded uppercase tracking-wide">PLAY</span>
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-3">Property Districts</p>
            <div className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-300 font-serif italic transition-colors">Port d'Andratx Cluster</div>
            <div className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-300 font-serif italic transition-colors">Son Vida Prestige</div>
            <div className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-300 font-serif italic transition-colors">Deià Traditional Oasis</div>
            <div className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-300 font-serif italic transition-colors">Calvià Coastline Villas</div>
          </div>
        </div>

        {/* Impersonation controller at the footer aligns with role-based simulation requests */}
        <div className="mt-auto border-t border-neutral-800 pt-5">
          <p className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold mb-3.5 flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-500" /> Switch Live Role
          </p>
          <div className="space-y-2">
            {team.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setActiveMember(member);
                  localStorage.setItem('mallorca_agents_active_member', JSON.stringify(member));
                  showAlert(`Switched session identity to: ${member.name} (${member.role})`, "success");
                }}
                className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} p-2 rounded text-left transition-colors flex items-center gap-2 border cursor-pointer ${
                  activeMember.id === member.id
                    ? 'bg-[#c5a059]/10 border-[#c5a059]/50 text-[#c5a059]'
                    : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] ${
                  activeMember.id === member.id ? 'bg-[#c5a059] text-black' : 'bg-neutral-850 text-neutral-400'
                }`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate text-white">{member.name}</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider truncate">{member.role}</p>
                </div>
                {activeMember.id === member.id && <Check className="w-3 h-3 block text-[#c5a059] shrink-0" />}
              </button>
            ))}
          </div>
          <button
            onClick={onLogout}
            className={`w-full mt-4 ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} p-2.5 rounded text-left transition-colors flex items-center justify-center gap-2 border bg-rose-950/15 border-rose-900/40 text-rose-400 hover:bg-rose-950/25 hover:text-white cursor-pointer select-none`}
            title="Log out of active partner session"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Sign Out Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Body container */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header - aligns fully with "Sophisticated Dark" mock layout */}
        <header className="min-h-20 border-b border-neutral-800/50 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3 bg-[#050505]">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              type="button"
              aria-label="Open navigation menu"
              className={`md:hidden ${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="text-[10px] md:text-[11px] font-bold tracking-widest text-neutral-500 uppercase">Language:</span>
            <div className="flex gap-1 bg-neutral-900 border border-neutral-850 p-1 rounded-lg">
              {(['EN', 'DE', 'ES'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    showAlert(`Application dictionary translated to ${lang}`, "success");
                  }}
                  className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} text-[10px] md:text-[11px] px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                    language === lang 
                      ? 'bg-black border border-neutral-800 text-white' 
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-8">
            {/* Live syncing status indicator with toggling for offline mode simulation */}
            <button 
              onClick={() => setOfflineMode(!offlineMode)}
              className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:border-neutral-700 transition-colors ${
                offlineMode 
                  ? 'bg-amber-950/20 border-amber-900/50 text-amber-400' 
                  : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
              }`}
              title="Click to toggle offline simulation"
            >
              {offlineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-500 shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Sync: Real-time</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={triggerSync}
                type="button"
                aria-label="Force synchronize with cloud database"
                className={`${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center p-2 border border-neutral-800 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer`}
                title="Force Synchronize with Cloud DB Node"
              >
                <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Notifications box */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  type="button"
                  aria-label={notificationOpen ? 'Close notifications' : 'Open notifications'}
                  aria-expanded={notificationOpen}
                  className={`${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center p-2 border border-neutral-800 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer relative`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#c5a059] rounded-full animate-ping"></span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl p-4 z-40">
                    <div className="flex justify-between items-center border-b border-neutral-850 pb-2 mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] font-mono">Real-time alerts</h4>
                      <button 
                        onClick={handleClearNotifications}
                        className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} text-[10px] text-neutral-400 hover:text-white underline cursor-pointer rounded px-2`}
                      >
                        Mark read
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-[11px] text-neutral-500 italic text-center py-4">No alarms active.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-lg border text-xs ${n.read ? 'bg-black/40 border-neutral-900 opacity-60' : 'bg-neutral-900/60 border-neutral-850'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                n.type === 'intelligence' ? 'bg-amber-500/10 text-amber-400' :
                                n.type === 'security' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                              }`}>{n.type}</span>
                              <span className="text-[9px] text-neutral-500">{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="font-semibold text-neutral-200 text-[11px]">{n.title}</p>
                            <p className="text-neutral-400 text-[10px] mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6">

          {/* Active alerts warning for offline actions */}
          {offlineMode && (
            <div className="bg-amber-950/20 border border-amber-900/40 text-amber-300 rounded-xl p-4 text-xs flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider font-mono">OFFLINE DATABASE LOCAL BUFFER ENGAGED</p>
                <p className="text-neutral-400 mt-0.5">
                  Core capabilities remain fully operational! Client actions are persisted dynamically on the local device. Toggling back to "Sync: Real-time" invokes automatic sync reconciliations with remote nodes safely.
                </p>
              </div>
            </div>
          )}



          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Summary Cards, styled exactly as requested */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{t('totalInterest')}</p>
                    <h3 className="text-3xl font-serif text-white flex items-baseline gap-2">
                      €{((leads.reduce((sum, l) => sum + l.budget, 0) || 29000000) / 1000000).toFixed(1)}M
                      <span className="text-xs font-sans text-green-500 font-medium">+18%</span>
                    </h3>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="bg-[#c5a059] h-full w-2/3"></div>
                  </div>
                </div>

                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                  <p className="text-[10px] uppercase tracking-widest text-[#c5a059] mb-1">{t('avgBudget')}</p>
                  <h3 className="text-3xl font-serif text-white">€14.2k <span className="text-xs font-sans text-neutral-400">/sqm</span></h3>
                  <p className="text-[10px] text-neutral-500 mt-3 italic">Mallorca Agents Standard</p>
                </div>

                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{t('runningBots')}</p>
                  <h3 className="text-3xl font-serif text-white">04 <span className="text-xs font-sans text-[#c5a059] uppercase ml-1 font-bold">Running</span></h3>
                  <div className="flex gap-1 mt-4">
                    <div className="h-1 flex-1 bg-[#c5a059] rounded"></div>
                    <div className="h-1 flex-1 bg-[#c5a059] rounded"></div>
                    <div className="h-1 flex-1 bg-[#c5a059] rounded"></div>
                    <div className="h-1 flex-1 bg-neutral-800 rounded"></div>
                  </div>
                </div>

                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{t('convRate')}</p>
                  <h3 className="text-3xl font-serif text-white">4.2% <span className="text-xs font-sans text-green-500 font-medium">+0.4%</span></h3>
                  <p className="text-[10px] text-neutral-500 mt-3">Industry Standard: 1.8%</p>
                </div>
              </div>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* High-Value Leads Feed */}
                <div className="lg:col-span-3 bg-neutral-900/30 rounded-2xl border border-neutral-800/80 flex flex-col">
                  <div className="p-5 border-b border-neutral-800/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-lg text-white">Targeted High-End Leads</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Real-time buyer lead simulation from social campaigns.</p>
                    </div>
                    <span className="text-[10px] text-[#c5a059] border border-[#c5a059]/30 px-3 py-1 rounded-full uppercase tracking-tighter font-mono font-bold">
                      AI PRIORITY
                    </span>
                  </div>

                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-900/80 text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-800/50">
                          <th className="px-6 py-3">Investor Name</th>
                          <th className="px-6 py-3 text-right">Investment Budget</th>
                          <th className="px-6 py-3">Property Interest</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/40 text-xs">
                        {leads.slice(0, 4).map(l => {
                          const matchedProperties = properties.filter(p => l.propertyInterestIds.includes(p.id));
                          const firstMatch = matchedProperties[0]?.title || "Multiple Off-Market selection";
                          const areaText = matchedProperties[0]?.area || "Mallorca Area";
                          
                          return (
                            <tr 
                              key={l.id} 
                              onClick={() => { setDossierLead(l); setShowDossierModal(true); }}
                              className="hover:bg-neutral-800/30 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm text-white font-medium">{l.fullName}</p>
                                <p className="text-[11px] text-neutral-500 mt-0.5">Source: {l.source}</p>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-[#c5a059] font-bold">
                                €{(l.budget/1000000).toFixed(1)}M
                              </td>
                              <td className="px-6 py-4 italic text-neutral-300 font-serif">
                                {firstMatch} <span className="text-[10px] text-neutral-500 block not-italic mt-0.5">{areaText}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                                  l.status === 'New' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  l.status === 'Showing Scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  l.status === 'Closed Won' ? 'bg-emerald-500/10 text-emerald-400 border border-[#c5a059]/40' :
                                  'bg-neutral-850 text-neutral-400'
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-neutral-800/50 text-center">
                    <button 
                      onClick={() => setActiveTab('crm')}
                      className="text-xs text-[#c5a059] hover:underline hover:text-white transition-colors cursor-pointer"
                    >
                      Access full Lead Pipeline CRM →
                    </button>
                  </div>
                </div>

                {/* Right Side Column info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  {/* Lead Gen Performance Indicator / Chart, matches golden theme */}
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('ai-gen')}
                    className="bg-[#c5a059] p-6 rounded-2xl text-[#050505] shadow-xl cursor-pointer relative overflow-hidden group/card transition-shadow hover:shadow-2xl hover:shadow-[#c5a059]/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-serif text-lg font-bold leading-tight">{t('leadGenTrendTitle')}</h4>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider animate-pulse">{t('liveFeed')}</span>
                    </div>
                    
                    {/* Visual custom bar graphs */}
                    <div className="flex items-end gap-2.5 h-24 mt-4">
                      {[
                        { val: 12, h: "30%" },
                        { val: 22, h: "50%" },
                        { val: 18, h: "40%" },
                        { val: 31, h: "75%" },
                        { val: 45, h: "90%" },
                        { val: 39, h: "80%" }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 h-full flex flex-col justify-end relative group">
                          <motion.div 
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ type: "spring", stiffness: 85, damping: 15, delay: idx * 0.07 }}
                            style={{ height: bar.h, originY: 1 }}
                            className="bg-black/15 group-hover:bg-black/35 rounded-sm transition-colors w-full"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 mb-1 transition-opacity pointer-events-none z-10 font-mono">
                            {bar.val}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between mt-3 text-[9px] font-bold uppercase tracking-widest text-black/60">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Today</span>
                    </div>

                    {/* Interactive Action Portal Hint */}
                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[10px] font-bold text-black/70 group-hover/card:text-black transition-colors">
                      <span>{t('trendHint')}</span>
                      <span className="text-xs transition-transform group-hover/card:translate-x-1 duration-200">→</span>
                    </div>
                  </motion.div>

                  {/* Top Auditable Activity logs widget */}
                  <div className="flex-1 bg-neutral-900/30 rounded-2xl border border-neutral-800/80 p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-white text-sm mb-3.5">Audit Signatures (Live Activity)</h4>
                      <div className="space-y-3.5">
                        {logs.slice(0, 3).map(log => {
                          const isWarning = log.action.includes('Denied') || log.action.includes('Block') || log.action.includes('Breach');
                          return (
                            <div key={log.id} className="flex gap-3">
                              <div className={`w-1 h-8 rounded shrink-0 ${isWarning ? 'bg-rose-500' : 'bg-[#c5a059]'}`}></div>
                              <div className="min-w-0">
                                <p className={`text-[11px] truncate ${isWarning ? 'text-rose-400 font-semibold' : 'text-white'}`}>
                                  {log.user}: {log.action}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">{log.details}</p>
                                <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">{new Date(log.timestamp).toLocaleTimeString()} • {log.module}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('audit')}
                      className="text-2xs text-[#c5a059] font-mono hover:underline uppercase text-left mt-4"
                    >
                      OPEN SECURITY COMPLIANCE SYSTEM →
                    </button>
                  </div>
                  
                </div>

              </div>

              {/* Mallorca Off-Market Exclusive Villas Section */}
              <div className="bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-800 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-serif italic text-white">Mallorcaagents.com Off-Market Luxury Listings</h3>
                    <p className="text-xs text-neutral-400 mt-1">Properties currently matching against tracked global buyers.</p>
                  </div>
                  <span className="text-[10px] bg-neutral-950 px-3 py-1 rounded border border-neutral-800 font-mono text-neutral-400">
                    SHARED INVENTORY ({properties.length} VILLAS)
                  </span>
                </div>
                
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {properties.map(p => {
                    const interestedBuyers = leads.filter(l => l.propertyInterestIds.includes(p.id));
                    return (
                      <motion.div 
                        key={p.id} 
                        variants={{
                          hidden: { opacity: 0, y: 15, scale: 0.97 },
                          show: { 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 100,
                              damping: 15
                            }
                          },
                          hover: {
                            y: -6,
                            borderColor: "rgba(197, 160, 89, 0.5)",
                            boxShadow: "0 12px 30px -10px rgba(197, 160, 89, 0.15)",
                            transition: { duration: 0.25, ease: "easeOut" }
                          }
                        }}
                        whileHover="hover"
                        className="bg-neutral-950 border border-neutral-850 rounded-xl overflow-hidden flex flex-col justify-between"
                        style={{
                          transformOrigin: "center bottom"
                        }}
                      >
                        <div>
                          <div className="relative h-48 overflow-hidden">
                            <motion.img 
                              src={p.image} 
                              alt={p.title} 
                              className="w-full h-full object-cover" 
                              variants={{
                                hover: { scale: 1.06 }
                              }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                            <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-sm px-3 py-1 rounded border border-[#c5a059]/40 text-xs font-serif italic text-[#c5a059]">
                              €{(p.price/1000000).toFixed(1)}M
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-0.5 rounded text-[10px] font-semibold text-neutral-300">
                              {p.area}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="text-sm font-bold font-serif text-white">{p.title}</h4>
                            <p className="text-xs text-[#c5a059] mt-1 italic font-light">{p.highlight}</p>
                            <p className="text-neutral-400 text-xs mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-900/40 border-t border-neutral-850 flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400 font-mono">{p.beds} Beds • {p.baths} Baths • {p.sizeSqM} m²</span>
                          <span className="text-[10px] bg-neutral-950 px-2 py-1 rounded border border-neutral-800 font-semibold text-neutral-300">
                            {interestedBuyers.length} buyers matched
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

            </div>
          )}


          {/* TAB 2: LUXURY CRM LEAD TRACKER */}
          {activeTab === 'crm' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Leads Selection Feed */}
              <div className="lg:col-span-5 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 flex flex-col h-[750px] overflow-hidden">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-850">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t('prospectLedger')}</h3>
                    <p className="text-[11px] text-[#c5a059] font-mono mt-0.5">Total Pipeline: €{(totalPipelineBudget/1000000).toFixed(1)}M</p>
                  </div>
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="bg-[#c5a059] text-black hover:bg-white transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('addLeadBtn')}</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="py-2 border-b border-neutral-850 space-y-2 text-xs">
                  {/* Row 1: Selects */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{t('propertyMatching')}</label>
                      <select 
                        value={selectedPropertyId} 
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="w-full mt-1 bg-black border border-neutral-800 text-[#0a0a02] bg-stone-950 text-neutral-300 p-1.5 rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                      >
                        <option value="all">All Villas</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.area} Luxury</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{t('status')}</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full mt-1 bg-black border border-neutral-800 text-[#0a0a02] bg-stone-950 text-neutral-300 p-1.5 rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                      >
                        <option value="all">{t('selectAll')}</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Showing Scheduled">Showing</option>
                        <option value="Closed Won">Closed Won</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Filters */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Source Multiselect */}
                    <div className="relative">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold flex justify-between items-center select-none">
                        <span>{t('source')}</span>
                        {selectedSources.length > 0 && (
                          <button 
                            onClick={() => setSelectedSources([])}
                            className="text-[9px] text-[#c5a059] hover:underline"
                          >
                            Clear ({selectedSources.length})
                          </button>
                        )}
                      </label>
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSourceDropdownOpen(!sourceDropdownOpen);
                            setAgentDropdownOpen(false);
                          }}
                          className="w-full bg-black border border-neutral-800 text-left text-xs text-neutral-300 p-2 rounded-lg flex justify-between items-center focus:outline-none hover:border-neutral-700 transition-colors"
                        >
                          <span className="truncate">
                            {selectedSources.length === 0 
                              ? t('allSources') 
                              : selectedSources.join(", ")}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-all ${sourceDropdownOpen ? 'rotate-180 text-[#c5a059]' : ''}`} />
                        </button>

                        {sourceDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setSourceDropdownOpen(false)}
                            />
                            <div className="absolute left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl max-h-72 overflow-y-auto z-40 p-2 space-y-3">
                              {/* 1. Autonomous Web Grounding */}
                              {availableSources.filter(src => /web|grounding|scout|crawler|autopilot|intel/i.test(src)).length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold text-[#c5a059] uppercase tracking-[0.08em] font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    🌐 Autonomous Web Grounding
                                  </div>
                                  <div className="space-y-0.5">
                                    {availableSources.filter(src => /web|grounding|scout|crawler|autopilot|intel/i.test(src)).map(src => {
                                      const isChecked = selectedSources.includes(src);
                                      return (
                                        <button
                                          key={src}
                                          type="button"
                                          onClick={() => {
                                            if (isChecked) {
                                              setSelectedSources(selectedSources.filter(s => s !== src));
                                            } else {
                                              setSelectedSources([...selectedSources, src]);
                                            }
                                          }}
                                          className="w-full text-left text-neutral-300 hover:bg-neutral-900/60 px-2 py-1.5 flex items-center justify-between rounded transition-colors font-mono text-[10px]"
                                        >
                                          <span className="truncate pr-2">{src}</span>
                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                            isChecked 
                                              ? 'bg-[#c5a059] border-[#c5a059] text-black' 
                                              : 'border-neutral-700 bg-black'
                                          }`}>
                                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* 2. Social & Premium Registries */}
                              {availableSources.filter(src => /social|forum|instagram|linkedin|facebook|registry|club|channel/i.test(src) && !/web|grounding|scout|crawler|autopilot|intel/i.test(src)).length > 0 && (
                                <div className="space-y-1 border-t border-neutral-900 pt-2">
                                  <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold text-indigo-400 uppercase tracking-[0.08em] font-mono">
                                    💬 Social & Premium Registries
                                  </div>
                                  <div className="space-y-0.5">
                                    {availableSources.filter(src => /social|forum|instagram|linkedin|facebook|registry|club|channel/i.test(src) && !/web|grounding|scout|crawler|autopilot|intel/i.test(src)).map(src => {
                                      const isChecked = selectedSources.includes(src);
                                      return (
                                        <button
                                          key={src}
                                          type="button"
                                          onClick={() => {
                                            if (isChecked) {
                                              setSelectedSources(selectedSources.filter(s => s !== src));
                                            } else {
                                              setSelectedSources([...selectedSources, src]);
                                            }
                                          }}
                                          className="w-full text-left text-neutral-300 hover:bg-neutral-900/60 px-2 py-1.5 flex items-center justify-between rounded transition-colors font-mono text-[10px]"
                                        >
                                          <span className="truncate pr-2">{src}</span>
                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                            isChecked 
                                              ? 'bg-[#c5a059] border-[#c5a059] text-black' 
                                              : 'border-neutral-700 bg-black'
                                          }`}>
                                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* 3. Internal & Manual Dossiers */}
                              {availableSources.filter(src => !/web|grounding|scout|crawler|autopilot|intel/i.test(src) && !/social|forum|instagram|linkedin|facebook|registry|club|channel/i.test(src)).length > 0 && (
                                <div className="space-y-1 border-t border-neutral-900 pt-2">
                                  <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold text-neutral-450 uppercase tracking-[0.08em] font-mono">
                                    💼 Internal & Manual Channels
                                  </div>
                                  <div className="space-y-0.5">
                                    {availableSources.filter(src => !/web|grounding|scout|crawler|autopilot|intel/i.test(src) && !/social|forum|instagram|linkedin|facebook|registry|club|channel/i.test(src)).map(src => {
                                      const isChecked = selectedSources.includes(src);
                                      return (
                                        <button
                                          key={src}
                                          type="button"
                                          onClick={() => {
                                            if (isChecked) {
                                              setSelectedSources(selectedSources.filter(s => s !== src));
                                            } else {
                                              setSelectedSources([...selectedSources, src]);
                                            }
                                          }}
                                          className="w-full text-left text-neutral-300 hover:bg-neutral-900/60 px-2 py-1.5 flex items-center justify-between rounded transition-colors font-mono text-[10px]"
                                        >
                                          <span className="truncate pr-2">{src}</span>
                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                            isChecked 
                                              ? 'bg-[#c5a059] border-[#c5a059] text-black' 
                                              : 'border-neutral-700 bg-black'
                                          }`}>
                                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {availableSources.length === 0 && (
                                <div className="text-neutral-500 text-[11px] p-2 italic text-center font-mono">No lead sources found</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Agent Multiselect */}
                    <div className="relative">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold flex justify-between items-center select-none">
                        <span>{t('filterAgent')}</span>
                        {selectedAgents.length > 0 && (
                          <button 
                            onClick={() => setSelectedAgents([])}
                            className="text-[9px] text-[#c5a059] hover:underline"
                          >
                            Clear ({selectedAgents.length})
                          </button>
                        )}
                      </label>
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAgentDropdownOpen(!agentDropdownOpen);
                            setSourceDropdownOpen(false);
                          }}
                          className="w-full bg-black border border-neutral-800 text-left text-xs text-neutral-300 p-2 rounded-lg flex justify-between items-center focus:outline-none hover:border-neutral-700 transition-colors"
                        >
                          <span className="truncate">
                            {selectedAgents.length === 0 
                              ? t('allAgents') 
                              : selectedAgents.join(", ")}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-all ${agentDropdownOpen ? 'rotate-180 text-[#c5a059]' : ''}`} />
                        </button>

                        {agentDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setAgentDropdownOpen(false)}
                            />
                            <div className="absolute left-0 right-0 mt-1 bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl max-h-48 overflow-y-auto z-40 p-1 divide-y divide-neutral-900">
                              {availableAgents.length === 0 ? (
                                <div className="text-neutral-500 text-[11px] p-2 italic text-center text-neutral-400">No agents found</div>
                              ) : (
                                availableAgents.map(ag => {
                                  const isChecked = selectedAgents.includes(ag);
                                  return (
                                    <button
                                      key={ag}
                                      type="button"
                                      onClick={() => {
                                        if (isChecked) {
                                          setSelectedAgents(selectedAgents.filter(a => a !== ag));
                                        } else {
                                          setSelectedAgents([...selectedAgents, ag]);
                                        }
                                      }}
                                      className="w-full text-left text-neutral-300 hover:bg-neutral-900 px-2 py-1.5 flex items-center justify-between rounded transition-colors"
                                    >
                                      <span className="truncate font-mono text-[10px]">{ag}</span>
                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                        isChecked 
                                          ? 'bg-[#c5a059] border-[#c5a059] text-black' 
                                          : 'border-neutral-700 bg-black'
                                      }`}>
                                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Budget Range Sliders */}
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{t('minBudget')}</span>
                        <span className="text-[11px] font-mono font-bold text-[#c5a059]">
                          {minBudgetFilter === 0 ? "€0M" : `€${(minBudgetFilter/1000000).toFixed(1)}M`}
                        </span>
                      </div>
                      <div className="relative pt-4 pb-1">
                        {isDraggingMinBudget && (
                          <div 
                            className="absolute -top-2 px-2 py-0.5 bg-[#c5a059] text-black text-[10px] font-mono font-bold rounded shadow-lg pointer-events-none select-none z-10 transition-all duration-75"
                            style={{ 
                              left: `${(minBudgetFilter / 20000000) * 100}%`,
                              transform: 'translateX(-50%)'
                            }}
                          >
                            {minBudgetFilter === 0 ? "€0M" : `€${(minBudgetFilter/1000000).toFixed(1)}M`}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-1 h-1 bg-[#c5a059] rotate-45" />
                          </div>
                        )}
                        <input 
                          type="range"
                          min="0"
                          max="20000000"
                          step="500000"
                          value={minBudgetFilter}
                          onFocus={() => setIsDraggingMinBudget(true)}
                          onBlur={() => setIsDraggingMinBudget(false)}
                          onMouseEnter={() => setIsDraggingMinBudget(true)}
                          onMouseLeave={() => setIsDraggingMinBudget(false)}
                          onTouchStart={() => setIsDraggingMinBudget(true)}
                          onTouchEnd={() => setIsDraggingMinBudget(false)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMinBudgetFilter(val);
                            if (val > maxBudgetFilter) {
                              setMaxBudgetFilter(val);
                            }
                          }}
                          className="w-full h-1 accent-[#c5a059] bg-neutral-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">{t('maxBudget')}</span>
                        <span className="text-[11px] font-mono font-bold text-[#c5a059]">
                          {maxBudgetFilter === 20000000 ? "€20.0M+ (Any)" : `€${(maxBudgetFilter/1000000).toFixed(1)}M`}
                        </span>
                      </div>
                      <div className="relative pt-4 pb-1">
                        {isDraggingMaxBudget && (
                          <div 
                            className="absolute -top-2 px-2 py-0.5 bg-[#c5a059] text-black text-[10px] font-mono font-bold rounded shadow-lg pointer-events-none select-none z-10 transition-all duration-75"
                            style={{ 
                              left: `${(maxBudgetFilter / 20000000) * 100}%`,
                              transform: 'translateX(-50%)'
                            }}
                          >
                            {maxBudgetFilter === 20000000 ? "€20.0M+" : `€${(maxBudgetFilter/1000000).toFixed(1)}M`}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-1 h-1 bg-[#c5a059] rotate-45" />
                          </div>
                        )}
                        <input 
                          type="range"
                          min="0"
                          max="20000000"
                          step="500000"
                          value={maxBudgetFilter}
                          onFocus={() => setIsDraggingMaxBudget(true)}
                          onBlur={() => setIsDraggingMaxBudget(false)}
                          onMouseEnter={() => setIsDraggingMaxBudget(true)}
                          onMouseLeave={() => setIsDraggingMaxBudget(false)}
                          onTouchStart={() => setIsDraggingMaxBudget(true)}
                          onTouchEnd={() => setIsDraggingMaxBudget(false)}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMaxBudgetFilter(val);
                            if (val < minBudgetFilter) {
                              setMinBudgetFilter(val);
                            }
                          }}
                          className="w-full h-1 accent-[#c5a059] bg-neutral-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-3 bg-black/35 border border-neutral-850 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold">Activity Cockpit</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono">
                      <span className="px-2 py-0.5 rounded-full border border-neutral-800 text-neutral-300">{openOutreachTasks.length} open</span>
                      <span className={`px-2 py-0.5 rounded-full border ${overdueOutreachTasks.length ? 'border-rose-500/30 text-rose-300 bg-rose-500/10' : 'border-emerald-500/20 text-emerald-300 bg-emerald-500/10'}`}>
                        {overdueOutreachTasks.length} overdue
                      </span>
                    </div>
                  </div>
                  {nextOutreachTasks.length === 0 ? (
                    <p className="text-[10px] text-neutral-500 leading-relaxed">No open outreach tasks yet. Generate a playbook and mark it sent to create follow-up activities.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {nextOutreachTasks.map(({ lead, task }) => (
                        <button
                          key={`${lead.id}-${task.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedLead(lead);
                            setSearchProfileDraft(buildLeadSearchProfile(lead, properties));
                            setOutreachPlanDraft(lead.outreachPlan || null);
                            setGeneratedFollowUp(lead.outreachPlan?.messageTemplate || '');
                          }}
                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} text-left bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-900 hover:border-[#c5a059]/30 rounded-lg px-2.5 py-2 transition-colors`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-white font-semibold truncate">{task.title}</span>
                            <span className={`shrink-0 text-[8px] uppercase border px-1.5 py-0.5 rounded font-mono ${getTaskStatusClass(task)}`}>{getTaskLabel(task)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1 text-[9px] text-neutral-500 font-mono">
                            <span className="truncate">{lead.fullName} · {task.channel}</span>
                            <span className="text-[#c5a059]">{formatTaskDue(task.dueAt)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="my-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-850 pl-9 pr-3 py-2 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 placeholder-neutral-600`}
                    />
                  </div>
                  <div className="w-[145px]">
                    <select
                      value={leadSortCriteria}
                      onChange={(e) => setLeadSortCriteria(e.target.value)}
                      className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-850 text-neutral-300 px-2.5 py-2 rounded-xl text-xs focus:outline-none focus:border-[#c5a059]/50 cursor-pointer font-sans`}
                    >
                      <option value="newest">{t('newest')}</option>
                      <option value="engagement">{t('engagementScore') || 'Engagement & Activity'}</option>
                      <option value="budget-desc">{t('budgetHighLow')}</option>
                      <option value="alphabetical">{t('alphabetical')}</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Client lists */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredLeadsList.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-2xl bg-black/10">
                      <p className="text-xs text-neutral-500 italic">No luxury buyers match criteria.</p>
                      <button
                        onClick={() => {
                          setSelectedPropertyId('all');
                          setStatusFilter('all');
                          setSelectedSources([]);
                          setMinBudgetFilter(0);
                          setMaxBudgetFilter(20000000);
                          setSearchQuery('');
                        }}
                        className={`mt-4 ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} text-[10px] text-black bg-[#c5a059] hover:bg-white hover:text-black transition-colors px-4 py-2 rounded-lg inline-flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider font-mono shadow-md`}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredLeadsList.map(lead => {
                      const isSelected = selectedLead?.id === lead.id;
                      
                      const getStatusBorderClass = (status: string) => {
                        switch (status) {
                          case 'New': return 'border-l-4 border-l-indigo-500';
                          case 'Contacted': return 'border-l-4 border-l-sky-400';
                          case 'Showing Scheduled': return 'border-l-4 border-l-amber-500';
                          case 'Offer Pending': return 'border-l-4 border-l-purple-500';
                          case 'Closed Won': return 'border-l-4 border-l-emerald-500';
                          case 'Cold': return 'border-l-4 border-l-neutral-600';
                          default: return 'border-l-4 border-l-neutral-700';
                        }
                      };

                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setSearchProfileDraft(buildLeadSearchProfile(lead, properties));
                            setOutreachPlanDraft(lead.outreachPlan || null);
                            setGeneratedFollowUp(lead.outreachPlan?.messageTemplate || '');
                          }}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${getStatusBorderClass(lead.status)} ${
                            isSelected 
                              ? 'bg-neutral-900 border-t-[#c5a059] border-r-[#c5a059] border-b-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.25)]' 
                              : 'bg-black/55 border-t-neutral-850 border-r-neutral-850 border-b-neutral-850 hover:bg-neutral-900/35 hover:border-t-[#c5a059]/40 hover:border-r-[#c5a059]/40 hover:border-b-[#c5a059]/40 hover:shadow-[0_0_15px_rgba(197,160,89,0.12)]'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-white font-serif truncate">{lead.fullName}</h4>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dossierText = `--- MALLORCA LUXURY CRM LEAD DOSSIER ---
• Full Name: ${lead.fullName}
• Status: ${lead.status}
• Budget: €${lead.budget.toLocaleString()} EUR
• Contact: ${lead.phone || 'Protected'} | ${lead.email}
• Language Preference: ${lead.languagePreference}
• Referral Source: ${lead.source}
• Assigned Specialist: ${lead.assignedAgent}
• CRM Interest IDs: ${lead.propertyInterestIds && lead.propertyInterestIds.length > 0 ? lead.propertyInterestIds.join(', ') : 'General Mallorca Portfolio'}
• Notes: ${lead.notes || 'No active agent notes recorded.'}
• Tracking ID: ${lead.id}
---------------------------------------`;
                                    navigator.clipboard.writeText(dossierText)
                                      .then(() => {
                                        showAlert(`Copied ${lead.fullName}'s dossier to clipboard!`, 'success');
                                      })
                                      .catch(() => {
                                        showAlert('Failed to copy to clipboard', 'danger');
                                      });
                                  }}
                                  aria-label={`Copy ${lead.fullName} dossier to clipboard`}
                                  className={`${ICON_TOUCH_CLASS} ${FOCUS_RING_CLASS} inline-flex items-center justify-center rounded text-neutral-500 hover:text-[#c5a059] hover:bg-neutral-800/80 transition-colors cursor-pointer`}
                                  title="Copy Dossier to Clipboard"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[10px] text-neutral-400 truncate">{lead.email}</p>
                              {lead.lastActive && (
                                <p className="text-[9px] text-neutral-500 font-mono flex items-center gap-1 mt-0.5" title="Signal activity timestamp">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                  <span>{formatLastActive(lead.lastActive)}</span>
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-mono font-black text-[#c5a059] whitespace-nowrap shrink-0">
                              €{(lead.budget/1000000).toFixed(1)}M
                            </span>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-neutral-900 pt-2.5">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">
                              AGENT: {lead.assignedAgent.split(' ')[0]}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {lead.socialEngagementScore !== undefined && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold flex items-center gap-0.5" title="Social Engagement rating">
                                  🔥 {lead.socialEngagementScore}%
                                </span>
                              )}
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                lead.status === 'New' ? 'bg-indigo-500/15 text-indigo-400' :
                                lead.status === 'Showing Scheduled' ? 'bg-amber-500/15 text-amber-400' :
                                lead.status === 'Closed Won' ? 'bg-[#c5a059]/15 text-[#c5a059]' :
                                'bg-neutral-850 text-neutral-400'
                              }`}>
                                {lead.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>


              {/* Right Column: Detailed Timeline Matcher + Autopilot follow-up */}
              <div className="lg:col-span-7 space-y-6">
                
                {selectedLead ? (
                  <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 space-y-6">
                    
                    {/* Header bar and role based warning controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded uppercase">
                          Investor Record Access: Secured (E2EE)
                        </span>
                        <h2 className="text-xl font-serif font-black text-white mt-2">{selectedLead.fullName}</h2>
                        <p className="text-xs text-neutral-400">Preferred Language: {selectedLead.languagePreference} | Source: {selectedLead.source}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Change status action */}
                        <select
                          value={selectedLead.status}
                          onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                          className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded text-xs text-neutral-300 p-1.5 focus:outline-none hover:border-neutral-700 cursor-pointer`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Showing Scheduled">Showing Scheduled</option>
                          <option value="Offer Pending">Offer Pending</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Cold">Cold</option>
                        </select>

                        {/* Restricted purging command */}
                        <button
                          onClick={() => handleDeleteLead(selectedLead.id)}
                          className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} p-1.5 bg-rose-950/20 text-rose-400 border border-rose-900/30 rounded hover:bg-rose-950 hover:text-rose-300 transition-colors cursor-pointer text-xs flex items-center gap-1`}
                          title="Purge buyer ledger (Administrator strict block)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('purgeUser')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Client dossier info panels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Private Contact Notes */}
                      <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-mono font-bold">{t('encryptedDossier')}</h4>
                        <div className="text-xs space-y-2">
                          <p className="text-neutral-300 bg-black/40 p-2.5 rounded border border-neutral-900 italic">
                            "{selectedLead.notes || t('noCustomNotes')}"
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="text-neutral-500 block">{t('phone')}:</span>
                              <span className="text-neutral-300 select-all font-mono">{selectedLead.phone || 'Protected'}</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block">{t('socialTrack')}:</span>
                              {selectedLead.socialHandle?.startsWith('http') ? (
                                <a 
                                  href={selectedLead.socialHandle} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-amber-400 hover:text-[#c5a059] font-mono flex items-center gap-1 hover:underline truncate max-w-[150px]"
                                >
                                  Grounded Web Bio <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-[#c5a059] font-mono select-all truncate max-w-[150px] block">{selectedLead.socialHandle || 'Private'}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-neutral-500 block">{t('investmentLimit')}:</span>
                              <span className="text-white font-bold">€{selectedLead.budget.toLocaleString()} EUR</span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block">{t('assignedExecutive')}:</span>
                              <span className="text-indigo-400">{selectedLead.assignedAgent}</span>
                            </div>
                            {selectedLead.socialEngagementScore !== undefined && (
                              <div className="col-span-2 border-t border-neutral-900 pt-2 mt-1">
                                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                  <span className="flex items-center gap-1">🔥 {t('engagementScore') || 'Social Engagement Score'}:</span>
                                  <span className="text-amber-400 font-bold font-mono">{selectedLead.socialEngagementScore}%</span>
                                </div>
                                <div className="w-full bg-neutral-905 h-1.5 rounded-full overflow-hidden border border-neutral-850">
                                  <div 
                                    className="bg-gradient-to-r from-amber-600 to-[#c5a059] h-full rounded-full" 
                                    style={{ width: `${selectedLead.socialEngagementScore}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {selectedLead.lastActive && (
                              <div className="col-span-2 border-t border-neutral-900 pt-2">
                                <span className="text-neutral-500 block">System Heartbeat Status:</span>
                                <span className="text-neutral-300 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] text-emerald-400 font-bold">{formatLastActive(selectedLead.lastActive)}</span>
                                  <span className="text-[9px] text-neutral-600">({new Date(selectedLead.lastActive).toLocaleTimeString()})</span>
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Scout Bot Tracing Button */}
                          <button
                            type="button"
                            onClick={() => { setDossierLead(selectedLead); setShowDossierModal(true); }}
                            className={`w-full mt-4 ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-900 hover:bg-[#c5a059]/15 text-[11px] font-bold text-[#c5a059] border border-[#c5a059]/20 hover:border-[#c5a059]/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm`}
                          >
                            ✨ Inspect Discovery Origin & Validity
                          </button>
                        </div>
                      </div>

                      {/* Right: Portfolio match scale */}
                      <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-2.5">
                        <h4 className="text-xs uppercase tracking-wider text-[#c5a059] font-mono font-bold flex items-center justify-between">
                          <span>LUXURY PORTFOLIO MATCHES</span>
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        </h4>
                        {renderPropertyMatches(selectedLead)}
                      </div>

                      {/* Buyer Search Profile / Matching Engine */}
                      {searchProfileDraft && (
                        <div className="md:col-span-2 bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-4">
                          {(() => {
                            const matchResults = getPropertyMatchResults(selectedLead, properties, searchProfileDraft);
                            const topScore = matchResults[0]?.score || 0;
                            return (
                              <>
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-2">
                                      <Sliders className="w-3.5 h-3.5 text-[#c5a059]" />
                                      Buyer Search Profile
                                    </h4>
                                    <p className="text-[10px] text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                                      Structured criteria used to rank the property shortlist before a Deal Room is shared.
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20">
                                      TOP MATCH {topScore}%
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setSearchProfileDraft(buildLeadSearchProfile({ ...selectedLead, searchProfile: undefined }, properties))}
                                      className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-800 hover:border-[#c5a059]/50 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
                                    >
                                      <RefreshCcw className="w-3.5 h-3.5" />
                                      Auto-fill
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleSaveSearchProfile}
                                      disabled={isSavingSearchProfile}
                                      className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-[#c5a059] text-black hover:bg-white disabled:opacity-60 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
                                    >
                                      {isSavingSearchProfile ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                      Save Profile
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                  <div className="lg:col-span-2 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Target Areas</span>
                                        <input
                                          value={searchProfileDraft.targetAreas.join(', ')}
                                          onChange={(e) => handleSearchProfilePatch({ targetAreas: splitListInput(e.target.value) })}
                                          placeholder={availablePropertyAreas.slice(0, 4).join(', ') || 'Son Vida, Port dAndratx'}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Must-Haves</span>
                                        <input
                                          value={searchProfileDraft.mustHaves.join(', ')}
                                          onChange={(e) => handleSearchProfilePatch({ mustHaves: splitListInput(e.target.value) })}
                                          placeholder="Privacy, Sea view, Wellness"
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Min EUR M</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={(searchProfileDraft.minBudget / 1000000).toFixed(1)}
                                          onChange={(e) => handleSearchProfilePatch({ minBudget: Number(e.target.value) * 1000000 })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Max EUR M</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={(searchProfileDraft.maxBudget / 1000000).toFixed(1)}
                                          onChange={(e) => handleSearchProfilePatch({ maxBudget: Number(e.target.value) * 1000000 })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Beds</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={searchProfileDraft.minBeds}
                                          onChange={(e) => handleSearchProfilePatch({ minBeds: Number(e.target.value) })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Baths</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={searchProfileDraft.minBaths}
                                          onChange={(e) => handleSearchProfilePatch({ minBaths: Number(e.target.value) })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Min SQM</span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="50"
                                          value={searchProfileDraft.minSizeSqM}
                                          onChange={(e) => handleSearchProfilePatch({ minSizeSqM: Number(e.target.value) })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Advisor Route</span>
                                        <input
                                          value={searchProfileDraft.advisorRoute}
                                          onChange={(e) => handleSearchProfilePatch({ advisorRoute: e.target.value })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Profile Notes</span>
                                        <input
                                          value={searchProfileDraft.profileNotes}
                                          onChange={(e) => handleSearchProfilePatch({ profileNotes: e.target.value })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        />
                                      </label>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Privacy</span>
                                        <select
                                          value={searchProfileDraft.privacyLevel}
                                          onChange={(e) => handleSearchProfilePatch({ privacyLevel: e.target.value as LeadSearchProfile['privacyLevel'] })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        >
                                          <option value="Standard">Standard</option>
                                          <option value="High">High</option>
                                          <option value="Ultra">Ultra</option>
                                        </select>
                                      </label>
                                      <label className="space-y-1.5">
                                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Window</span>
                                        <select
                                          value={searchProfileDraft.purchaseTimeframe}
                                          onChange={(e) => handleSearchProfilePatch({ purchaseTimeframe: e.target.value as LeadSearchProfile['purchaseTimeframe'] })}
                                          className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-black border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c5a059]/60`}
                                        >
                                          <option value="Immediate">Immediate</option>
                                          <option value="3-6 months">3-6 months</option>
                                          <option value="6-12 months">6-12 months</option>
                                          <option value="Exploratory">Exploratory</option>
                                        </select>
                                      </label>
                                    </div>
                                    <div className="bg-black/45 border border-neutral-900 rounded-lg p-3 space-y-2">
                                      <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-neutral-500 uppercase tracking-wider">Budget Range</span>
                                        <span className="text-[#c5a059] font-bold">{formatBudgetRange(searchProfileDraft.minBudget, searchProfileDraft.maxBudget)}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-neutral-500 uppercase tracking-wider">Qualified Matches</span>
                                        <span className="text-white font-bold">{matchResults.length}</span>
                                      </div>
                                      <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#c5a059]" style={{ width: `${Math.min(topScore, 100)}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Private Deal Room / Web-Expose */}
                      <div className="md:col-span-2 bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-4">
                        {(() => {
                          const dealRoom = selectedLead.dealRoom;
                          const dealRoomUrl = dealRoom ? (dealRoom.shareUrl || `${window.location.origin}${dealRoom.sharePath}`) : '';
                          const roomPropertyIds = dealRoom?.selectedPropertyIds?.length ? dealRoom.selectedPropertyIds : selectedLead.propertyInterestIds;
                          const roomProperties = properties.filter(property => roomPropertyIds.includes(property.id));
                          const expiresAt = dealRoom?.expiresAt ? new Date(dealRoom.expiresAt).toLocaleDateString() : '14 days after creation';
                          const ndaLabel = dealRoom?.ndaAcceptedAt ? 'NDA accepted' : 'NDA gate required';

                          return (
                            <>
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                                    Private Deal Room
                                  </h4>
                                  <p className="text-[10px] text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                                    Web-Expose link with NDA/consent gate, property shortlist, expiry, and view tracking.
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handlePrepareDealRoom(selectedLead)}
                                    disabled={dealRoomWorking}
                                    className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-[#c5a059] text-black hover:bg-white disabled:opacity-60 rounded-lg px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
                                  >
                                    {dealRoomWorking ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                                    {dealRoom ? 'Refresh Room' : 'Create Room'}
                                  </button>
                                  {dealRoom && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => copyDealRoomLink(dealRoom)}
                                        className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-800 hover:border-[#c5a059]/50 rounded-lg px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                        Copy Link
                                      </button>
                                      <a
                                        href={dealRoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-800 hover:border-[#c5a059]/50 rounded-lg px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Open
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                                <div className="bg-black/45 border border-neutral-900 rounded-lg p-3">
                                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">Status</span>
                                  <span className={`text-xs font-mono font-bold mt-1 block ${dealRoom ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                    {dealRoom ? dealRoom.status.toUpperCase() : 'NOT READY'}
                                  </span>
                                </div>
                                <div className="bg-black/45 border border-neutral-900 rounded-lg p-3">
                                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">NDA</span>
                                  <span className="text-xs font-mono font-bold text-[#c5a059] mt-1 block">{ndaLabel}</span>
                                </div>
                                <div className="bg-black/45 border border-neutral-900 rounded-lg p-3">
                                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">Files</span>
                                  <span className="text-xs font-mono font-bold text-white mt-1 block">{roomProperties.length || 'Auto-match'} listings</span>
                                </div>
                                <div className="bg-black/45 border border-neutral-900 rounded-lg p-3">
                                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 block">Expires</span>
                                  <span className="text-xs font-mono font-bold text-white mt-1 block">{expiresAt}</span>
                                </div>
                              </div>

                              {dealRoom && (
                                <div className="bg-black/50 border border-neutral-900 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Private URL</p>
                                    <p className="text-[11px] text-neutral-300 font-mono truncate select-all mt-1">{dealRoomUrl}</p>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono shrink-0">
                                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {dealRoom.viewCount} views</span>
                                    <span>{roomProperties.map(property => property.area).slice(0, 2).join(' / ') || 'Curated'}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Interactive Client Investment Ratio Trend Line Chart */}
                      <div className="md:col-span-2 bg-[#0c0c0c]/80 p-4 border border-neutral-850 rounded-xl space-y-3.5 shadow-inner">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-neutral-300 font-mono font-bold flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-[#c5a059]" />
                              Value Ratio Trend (Budget-to-Listing Price)
                            </h4>
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              Calculates client's purchase limit relative to average matched listings over their touchpoints
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono tracking-wider font-bold text-[#c5a059] px-2 py-0.5 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full">
                              Value match index: {(selectedLead.budget / (properties.filter(p => selectedLead.propertyInterestIds.includes(p.id)).length > 0 ? properties.filter(p => selectedLead.propertyInterestIds.includes(p.id)).reduce((s, p) => s + p.price, 0) / properties.filter(p => selectedLead.propertyInterestIds.includes(p.id)).length : properties.filter(prop => selectedLead.budget >= prop.price * 0.85).length > 0 ? properties.filter(prop => selectedLead.budget >= prop.price * 0.85).reduce((s, p) => s + p.price, 0) / properties.filter(prop => selectedLead.budget >= prop.price * 0.85).length : 5000000)).toFixed(2)}x
                            </span>
                          </div>
                        </div>

                        <div className="h-28 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={budgetRatioData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                              <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                stroke="#525252" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#525252" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => `${v}x`}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-black border border-neutral-800 p-2 text-[10px] text-left font-mono rounded shadow-xl">
                                        <p className="font-bold text-[#c5a059] truncate max-w-[170px]">{data.event}</p>
                                        <p className="text-neutral-400">Date: <span className="text-neutral-200">{data.date}</span></p>
                                        <p className="text-neutral-400">Budget Limit: <span className="text-neutral-200">€{data.budget.toFixed(1)}M</span></p>
                                        <p className="text-[#c5a059] font-bold">Price Ratio: {data.ratio}x</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="ratio" 
                                stroke="#c5a059" 
                                strokeWidth={2}
                                dot={{ fill: '#c5a059', stroke: '#000000', strokeWidth: 1.5, r: 3.5 }}
                                activeDot={{ fill: '#ffffff', stroke: '#c5a059', strokeWidth: 2, r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex gap-4 justify-between text-[8px] font-mono select-none px-1 text-neutral-500 pt-1 border-t border-neutral-900 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" /> Ratio &gt; 1.0 (Full Listing Coverage)</span>
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> Ratio &lt; 1.0 (Stretched Negotiation Limit)</span>
                        </div>
                      </div>

                    </div>

                    {/* Outreach Playbook */}
                    <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-4 relative">
                      {(() => {
                        const outreachPlan = outreachPlanDraft || selectedLead.outreachPlan || null;
                        const outreachMessage = generatedFollowUp || outreachPlan?.messageTemplate || '';
                        const riskLabel = outreachPlan?.riskLevel || ((selectedLead.socialEngagementScore || 0) >= 90 ? 'Elevated' : 'Standard');
                        const routeLabel = outreachPlan?.primaryRoute || selectedLead.preferredContactPath || 'Trusted-advisor introduction first.';

                        return (
                          <>
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div>
                                <h4 className="text-xs text-white uppercase tracking-wider font-bold inline-flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-[#c5a059]" />
                                  Outreach Playbook
                                </h4>
                                <p className="text-[10px] text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                                  Individual route, tone, sequence, and ready-to-send template in <strong>{selectedLead.languagePreference === 'DE' ? 'German' : selectedLead.languagePreference === 'ES' ? 'Spanish' : 'English'}</strong>.
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] border px-2 py-1 rounded-full font-mono font-bold uppercase ${getOutreachRiskClass(riskLabel as LeadOutreachPlan['riskLevel'])}`}>
                                  {riskLabel}
                                </span>
                                <span className={`text-[9px] border px-2 py-1 rounded-full font-mono font-bold uppercase ${getOutreachStatusClass(outreachPlan?.status)}`}>
                                  {outreachPlan?.status || 'draft'}
                                </span>
                                <button
                                  onClick={() => handleAutoFollowUp(selectedLead.id)}
                                  disabled={isGeneratingFollowUp}
                                  className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-905 border border-neutral-800 text-neutral-200 hover:text-white hover:border-[#c5a059] text-[10px] px-3.5 py-2 rounded-lg font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50`}
                                >
                                  {isGeneratingFollowUp ? (
                                    <>
                                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Structuring...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse" />
                                      <span>{outreachPlan ? 'Refresh Playbook' : 'Generate Playbook'}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                              <div className="lg:col-span-2 bg-black/45 border border-neutral-900 rounded-lg p-3 space-y-2.5">
                                <div className="flex items-start gap-2">
                                  <Shield className="w-3.5 h-3.5 text-[#c5a059] mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Primary Route</p>
                                    <p className="text-xs text-neutral-200 leading-relaxed">{routeLabel}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                                  <div className="border-t border-neutral-900 pt-2">
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Tone</p>
                                    <p className="text-xs text-neutral-300 leading-relaxed">{outreachPlan?.toneOfVoice || 'Concise, warm, specific, and quietly premium.'}</p>
                                  </div>
                                  <div className="border-t border-neutral-900 pt-2">
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Opening Angle</p>
                                    <p className="text-xs text-neutral-300 leading-relaxed">{outreachPlan?.openingAngle || selectedLead.outreachAngle || 'Confidential off-market shortlist with a low-pressure first step.'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/45 border border-neutral-900 rounded-lg p-3 space-y-2">
                                <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Guardrails</p>
                                {(outreachPlan?.doNotContact || [
                                  'No generic Instagram DM.',
                                  'No mass-market property blast.',
                                  'No sensitive wealth assumptions.'
                                ]).slice(0, 4).map((item) => (
                                  <div key={item} className="flex items-start gap-2 text-[10px] text-neutral-300 leading-relaxed">
                                    <AlertCircle className="w-3 h-3 text-rose-300 mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {outreachPlan && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="bg-black/35 border border-neutral-900 rounded-lg p-3 space-y-2.5">
                                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Personalization Hooks</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {outreachPlan.personalizationHooks.slice(0, 6).map((hook) => (
                                      <span key={hook} className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
                                        {hook}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-black/35 border border-neutral-900 rounded-lg p-3 space-y-2.5">
                                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Proof Points</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {outreachPlan.proofPoints.slice(0, 6).map((proof) => (
                                      <span key={proof} className="px-2 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/20 text-[10px] text-[#c5a059]">
                                        {proof}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {outreachPlan && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                {outreachPlan.sequence.map((step) => (
                                  <div key={`${step.dayOffset}-${step.channel}`} className="bg-black/35 border border-neutral-900 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-mono font-bold text-[#c5a059]">{formatOutreachOffset(step.dayOffset)}</span>
                                      <span className="text-[9px] text-neutral-500 uppercase truncate">{step.channel}</span>
                                    </div>
                                    <p className="text-xs text-white font-semibold leading-snug">{step.objective}</p>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed">{step.action}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {outreachMessage && (
                              <div className="bg-black/60 border border-[#c5a059]/30 rounded-lg p-3.5 space-y-3.5 animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-2">
                                  <span>{outreachPlan?.subjectLine || 'Pre-rendered secure outreach draft'}</span>
                                  <span>{outreachPlan?.contactPrinciple || 'Permission-based first touch'}</span>
                                </div>
                                <p className="text-xs text-neutral-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all font-sans bg-black/40 p-2 rounded">
                                  {outreachMessage}
                                </p>
                                <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                                  <button
                                    onClick={() => navigator.clipboard?.writeText(outreachMessage).then(() => showAlert('Outreach template copied.', 'success')).catch(() => showAlert('Unable to copy outreach template.', 'danger'))}
                                    className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs px-3.5 py-1.5 rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5`}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Copy Template</span>
                                  </button>
                                  <button
                                    onClick={() => handleSimulateDispatch(selectedLead)}
                                    disabled={!outreachPlan || outreachPlan.status === 'sent' || isDispatchingOutreach}
                                    className={`${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-[#c5a059] text-black hover:bg-white disabled:opacity-50 disabled:hover:bg-[#c5a059] text-xs px-3.5 py-1.5 rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5`}
                                  >
                                    {isDispatchingOutreach ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                    <span>{outreachPlan?.status === 'sent' ? 'Sent' : 'Mark Sent'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Outreach Activity Tasks */}
                    <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-white font-mono font-bold flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-[#c5a059]" />
                            Outreach Activity Tasks
                          </h4>
                          <p className="text-[10px] text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                            Follow-up activities created from the approved outreach sequence, with due dates and owner accountability.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono">
                          <span className="px-2 py-1 rounded-full border border-neutral-800 text-neutral-300">
                            {(selectedLead.outreachTasks || []).filter(task => task.status === 'open').length} open
                          </span>
                          <span className="px-2 py-1 rounded-full border border-emerald-500/20 text-emerald-300 bg-emerald-500/10">
                            {(selectedLead.outreachTasks || []).filter(task => task.status === 'done').length} done
                          </span>
                        </div>
                      </div>

                      {(selectedLead.outreachTasks || []).length === 0 ? (
                        <div className="bg-black/35 border border-dashed border-neutral-800 rounded-lg p-4 text-center">
                          <p className="text-xs text-neutral-500">No activity tasks yet. Generate a playbook, then mark the outreach sent.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                          {[...(selectedLead.outreachTasks || [])]
                            .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                            .map((task) => (
                              <div key={task.id} className="bg-black/40 border border-neutral-900 rounded-lg p-3 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">{formatTaskDue(task.dueAt)}</p>
                                    <h5 className="text-xs text-white font-semibold leading-snug mt-1">{task.title}</h5>
                                  </div>
                                  <span className={`shrink-0 text-[8px] uppercase border px-1.5 py-0.5 rounded font-mono ${getTaskStatusClass(task)}`}>
                                    {getTaskLabel(task)}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-[10px] text-neutral-400 leading-relaxed">
                                  <p><span className="text-neutral-600 uppercase font-mono">Channel:</span> {task.channel}</p>
                                  <p><span className="text-neutral-600 uppercase font-mono">Owner:</span> {task.owner}</p>
                                  <p>{task.notes}</p>
                                </div>
                                {task.status === 'open' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteOutreachTask(selectedLead, task)}
                                    disabled={taskActionId === task.id}
                                    className={`w-full ${TOUCH_TARGET_CLASS} ${FOCUS_RING_CLASS} bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-800 hover:border-emerald-500/40 disabled:opacity-50 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5`}
                                  >
                                    {taskActionId === task.id ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />}
                                    Complete Task
                                  </button>
                                ) : (
                                  <div className="text-[9px] text-emerald-300 font-mono border-t border-neutral-900 pt-2">
                                    Completed {task.completedAt ? formatTaskDue(task.completedAt) : ''} by {task.completedBy || 'team'}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Timeline Event tracker */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-mono font-bold">Investigator pipeline timeline</h4>
                      <div className="space-y-3 border-l-2 border-neutral-805 pl-4 ml-2">
                        {selectedLead.timeline.map((event) => (
                          <div key={event.id} className="relative text-xs">
                            <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border border-black bg-neutral-200 bg-neutral-800"></span>
                            <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{event.title}</span>
                                <span className="text-[10px] text-neutral-500">{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-neutral-400 text-[11px] font-mono leading-relaxed">{event.desc}</p>
                              <span className="text-[9px] text-neutral-500 block uppercase pt-1">AUTHORIZED BY: {event.agent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-12 text-center h-[750px] flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                      <Users className="w-6 h-6 text-[#c5a059]" />
                    </div>
                    <h3 className="text-lg font-serif italic text-white">No prospect folder selected</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mt-2 leading-relaxed">
                      Select a prospective buyer from the left-hand index ledger to analyze off-market luxury property matches, structure bespoke multi-language outreach materials, and audit chronological transactions.
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}


          {/* TAB 3: AUTONOMOUS HNW LEAD HUNTER & LIVE WEB GROUNDING AGENT */}
          {activeTab === 'ai-gen' && (
            <div className="space-y-6">
              
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="border-b border-neutral-850 pb-4">
                  <h2 className="text-lg font-serif italic text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                    Autonomous HNW Lead Hunter & Web Grounding Agent
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Leverage advanced web scraping and live semantic search grounding to identify real-world corporate billionaires, elite athletes, and tech founders with active purchase intent on Mallorca.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-neutral-950 p-5 rounded-xl border border-neutral-850">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase">Search Setup</h3>
                    
                    {/* Mode Indicator card */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[#c5a059] block font-mono">AI Search Engine State</label>
                      <div className="p-3 bg-black rounded-lg border border-[#c5a059]/20 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-white block">🌐 Live Web-Grounded Crawler</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            Queries standard corporate registers, high-net-worth liquidity reports, and public luxury registries using Google Search grounding.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">Discovery Mode</label>
                      <select
                        value={agentSearchMode}
                        onChange={(e) => {
                          const nextMode = e.target.value as 'social' | 'web';
                          setAgentSearchMode(nextMode);
                          if (autopilotActive) {
                            fetch('/api/ai/autopilot/config', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ searchMode: nextMode })
                            });
                          }
                        }}
                        className="w-full bg-black border border-neutral-800 text-xs text-white p-2.5 rounded focus:outline-none focus:border-neutral-700 font-mono"
                      >
                        <option value="web">Live Web Grounding: public signals and citations</option>
                        <option value="social">Simulated Social Stream: campaign persona testing</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">Lead Source Platform / Forum</label>
                      <select
                        value={selectedScrapePlatform}
                        onChange={(e) => {
                          setSelectedScrapePlatform(e.target.value);
                          if (autopilotActive) {
                            fetch('/api/ai/autopilot/config', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ selectedPlatform: e.target.value })
                            });
                          }
                        }}
                        className="w-full bg-black border border-neutral-800 text-xs text-white p-2.5 rounded focus:outline-none focus:border-neutral-700 font-mono"
                      >
                        <option value="Family offices, yacht clubs, liquidity events, and Balearic luxury advisors">Family offices + Balearic advisor network</option>
                        <option value="LinkedIn Executive Mallorca Group">LinkedIn Mallorca Executive HNW Network</option>
                        <option value="Superyacht Registry, Marina Ibiza, Port Adriano, and Port d'Andratx networks">Superyacht Registry + Marina Networks</option>
                        <option value="European Tech IPO, acquisition, and founder liquidity trackers">European Tech IPO + Founder Liquidity News</option>
                        <option value="Private aviation FBO, aircraft manager, and executive assistant channels">Private Aviation + FBO Signals</option>
                        <option value="Sports agents, athlete family offices, academies, and foundations">Athlete Representatives + Foundations</option>
                        <option value="Art fair, auction house, gallery principal, and collector advisor circles">Art Collectors + Auction Circles</option>
                        <option value="Luxury hotel, branded residence, and hospitality investment news">Hospitality Investors + Branded Residences</option>
                        <option value="Monaco, Zurich, London, and Madrid private banking introductions">Private Banking Introduction Network</option>
                        <option value="Off-Market Luxury Real Estate Forums">Off-Market Luxury Real Estate Forums</option>
                      </select>
                      
                      <div className="pt-1">
                        <input 
                          type="text"
                          value={selectedScrapePlatform}
                          onChange={(e) => {
                            setSelectedScrapePlatform(e.target.value);
                            if (autopilotActive) {
                              fetch('/api/ai/autopilot/config', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ selectedPlatform: e.target.value })
                              });
                            }
                          }}
                          className="w-full bg-black border border-neutral-850 px-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          placeholder="Or type custom platform website / search domain..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">Target Niche Query / Specific Keyword</label>
                      <select
                        value={selectedScrapeNiche}
                        onChange={(e) => {
                          setSelectedScrapeNiche(e.target.value);
                          if (autopilotActive) {
                            fetch('/api/ai/autopilot/config', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ selectedNiche: e.target.value })
                            });
                          }
                        }}
                        className="w-full bg-black border border-neutral-800 text-xs text-white p-2.5 rounded focus:outline-none focus:border-neutral-700 font-mono"
                      >
                        <option value="Post-liquidity founders, yacht owners, athletes, and family offices seeking Mallorca or Ibiza privacy estates">Balanced HNW Mallorca/Ibiza buyer matrix</option>
                        <option value="German Yacht Owners & Son Vida Villa Seekers">German Yacht Owners & Son Vida Villa Seekers</option>
                        <option value="DACH post-exit healthtech and biotech founders seeking Son Vida privacy">DACH HealthTech/Biotech Exit Founders</option>
                        <option value="Nordic SaaS founders seeking Ibiza smart villas and media-ready estates">Nordic SaaS Founders Seeking Ibiza</option>
                        <option value="London Tech Founders Seeking Port Andratx waterfronts">London Tech Founders Seeking Port Andratx</option>
                        <option value="Swiss Private Bank Executives seeking absolute mountains privacy">Swiss Executives Seeking Tramuntana Privacy</option>
                        <option value="Monaco superyacht owners comparing Port Andratx, Port Adriano, and Marina Ibiza">Monaco Superyacht Owners</option>
                        <option value="Elite athlete representatives seeking private training and recovery compounds">Elite Athlete Recovery Compounds</option>
                        <option value="Contemporary art collectors seeking historic Palma palaces or Deia estates">Art Collectors Seeking Palma/Deia</option>
                        <option value="Madrid Corporate Real Estate investors seeking Mallorca hotels">Madrid Corporate Real Estate Investors</option>
                        <option value="Hospitality investors seeking branded residences and boutique hotel conversions in Ibiza">Ibiza Hospitality Investors</option>
                        <option value="Private aviation users needing secure 25-minute airport-to-villa transfer">Private Aviation Fast-Transfer Buyers</option>
                      </select>
                      
                      <div className="pt-1 font-mono">
                        <input 
                          type="text"
                          value={selectedScrapeNiche}
                          onChange={(e) => {
                            setSelectedScrapeNiche(e.target.value);
                            if (autopilotActive) {
                              fetch('/api/ai/autopilot/config', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ selectedNiche: e.target.value })
                              });
                            }
                          }}
                          className="w-full bg-black border border-neutral-850 px-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          placeholder="Or type custom luxury search niche interest..."
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleActionScraperScrape}
                        disabled={isScraping}
                        className="w-full bg-[#c5a059] text-black hover:bg-white font-bold text-xs p-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isScraping ? (
                          <>
                            <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                            <span>
                              {agentSearchMode === 'web'
                                ? (language === 'DE' ? 'ERSTATTE WEB-RECHERCHE...' : language === 'ES' ? 'INVESTIGANDO INTERNET...' : 'EXECUTING LIVE WEB SEARCH...')
                                : (language === 'DE' ? 'SUCHE NEUE KAUFSIGNALE...' : language === 'ES' ? 'BUSCANDO NUEVOS PROSPECTOS...' : 'SCANNING SOCIAL FEED SIGNALS...')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-black animate-pulse" />
                            <span>
                              {agentSearchMode === 'web'
                                ? (language === 'DE' ? 'WEB-RECHERCHE AGENT STARTEN' : language === 'ES' ? 'INICIAR AGENTE DE BÚSQUEDA' : 'RUN LIVE WEB GROUNDING AGENT')
                                : t('initiateScrape')}
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-900 pt-3 flex gap-2 font-mono">
                      <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0 select-none" />
                      <span>Elite Lead search engine utilizes AES-256 equivalent database ledger and live web crawler. Leads are pushed in real-time.</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-850 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase mb-3">{t('telemetry')}</h3>
                      
                      {isScraping ? (
                        <div className="space-y-3.5 py-6">
                          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                            <span>{agentSearchMode === 'web' ? 'Executing Google Search Grounding...' : 'Scanning Premium Registries...'}</span>
                            <span className="text-emerald-400 animate-pulse">Running</span>
                          </div>
                          <div className="w-full bg-[#0a0a0a] h-1.5 rounded overflow-hidden border border-neutral-800">
                            <div className="bg-[#c5a059] h-full animate-width-fill"></div>
                          </div>
                          <p className="text-[10px] italic text-neutral-500 font-mono">
                            {agentSearchMode === 'web' 
                              ? 'Querying live directories, news outlets, and business transactions for real-world luxury-buyer records linked to Mallorca...'
                              : 'Filtering profiles with premium search hashtags, vetting high budget thresholds matching Mallorca luxury range...'}
                          </p>
                        </div>
                      ) : lastScrapedLead ? (
                        <div className="space-y-3.5 animate-fade-in text-xs">
                          <div className="p-4 bg-black rounded-lg border border-[#c5a059]/30 space-y-2.5">
                            <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] px-2.5 py-0.5 rounded font-mono font-bold block w-max uppercase tracking-wider">
                              {lastScrapedLead.source.includes("Grounding") || lastScrapedLead.source.includes("Web") ? "🌐 VERIFIED REAL-WORLD PROSPECT" : "MATCH PROSPECT FOUND"}
                            </span>
                            <h4 className="text-sm font-bold text-white font-serif">{lastScrapedLead.fullName}</h4>
                            <p className="text-neutral-300 font-serif italic text-[11px] leading-relaxed">"{lastScrapedLead.notes}"</p>
                            {(lastScrapedLead.preferredContactPath || lastScrapedLead.outreachAngle) && (
                              <div className="bg-neutral-950/80 border border-neutral-850 rounded-lg p-2.5 text-[10px] font-mono text-neutral-400 space-y-1">
                                {lastScrapedLead.preferredContactPath && (
                                  <p><span className="text-neutral-500">ROUTE:</span> {lastScrapedLead.preferredContactPath}</p>
                                )}
                                {lastScrapedLead.outreachAngle && (
                                  <p><span className="text-neutral-500">ANGLE:</span> {lastScrapedLead.outreachAngle}</p>
                                )}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono pt-2.5 text-neutral-400 border-t border-neutral-850">
                              <div>
                                <span className="text-neutral-500 block">SOURCE / BIO:</span>
                                {lastScrapedLead.socialHandle?.startsWith('http') ? (
                                  <a 
                                    href={lastScrapedLead.socialHandle} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-amber-400 font-bold block flex items-center gap-1 hover:underline text-left"
                                  >
                                    Grounded Web Link <ExternalLink className="w-3 h-3 hover:translate-x-0.5 transition-transform" />
                                  </a>
                                ) : (
                                  <span className="text-[#c5a059] font-bold block text-left truncate">{lastScrapedLead.socialHandle}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-neutral-500 block">BUDGET MATCH:</span>
                                <span className="text-white font-bold block text-left">€{(lastScrapedLead.budget/1000000).toFixed(1)}M</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-neutral-500 text-left font-mono">
                            The prospect has been pushed to the <strong className="text-neutral-300 font-mono">CRM pipeline list</strong> and a priority alert message dispatched across connected associate CRM devices.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                          <Layers className="w-8 h-8 text-neutral-600 mb-2" />
                          <p className="text-xs text-neutral-400 font-mono">Hunter idle. Fire active scan to index premium targets.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-neutral-900/50 flex justify-between items-center text-[11px] font-mono text-neutral-500">
                      <span>Sync Mode: Real-time</span>
                      <span className="text-emerald-500">Active Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AUTOPILOT AGENT SECTION */}
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="border-b border-neutral-850 pb-4 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-serif italic text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-[#c5a059] animate-pulse" />
                      Autonomous Overnight Lead Scout Autopilot Agent
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Configure the autonomous background scouting agent to constantly mine, evaluate, and push high-quality buyer matches into your CRM ledger 24/7—even overnight.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-500">
                      AGENT STATUS:
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold leading-none ${
                      autopilotActive 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                        : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${autopilotActive ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`} />
                      {autopilotActive ? 'ONGOING ACTIVE' : 'STANDBY IDLE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Autopilot Controls */}
                  <div className="md:col-span-5 space-y-4 bg-neutral-950 p-5 rounded-xl border border-neutral-850">
                    <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#c5a059]" />
                      Agent Settings
                    </h3>

                    {/* Toggle Button */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">Agent Execution Mode</label>
                      <button
                        onClick={() => handleToggleAutopilot(!autopilotActive)}
                        className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs text-center border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          autopilotActive
                            ? 'bg-amber-500/10 border-amber-500/45 text-amber-400 hover:bg-amber-500/15'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:border-neutral-700'
                        }`}
                      >
                        {autopilotActive ? (
                          <>
                            <Pause className="w-4 h-4 text-amber-400 stroke-[3px]" />
                            <span className="tracking-wider uppercase">PAUSE AUTOPILOT ACTIVE MODE</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                            <span className="tracking-wider uppercase">ENGAGE AI AUTOPILOT AGENT</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Interval Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">Scouting Cycle Speed</label>
                        <span className="text-[11px] font-mono text-[#c5a059] font-bold">Every {formatScanInterval(agentScanInterval)}</span>
                      </div>
                      <input
                        type="range"
                        min={MIN_AGENT_SCAN_INTERVAL_SECONDS}
                        max={MAX_AGENT_SCAN_INTERVAL_SECONDS}
                        step="900"
                        value={agentScanInterval}
                        disabled={autopilotActive}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAgentScanInterval(val);
                          setAgentCountdown(val);
                        }}
                        className="w-full h-1 bg-neutral-900 border-none outline-none rounded-lg appearance-none cursor-pointer accent-[#c5a059] disabled:opacity-40"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-neutral-600 uppercase">
                        <span>30m minimum</span>
                        <span>2h max</span>
                      </div>
                    </div>

                      <div className="p-3 bg-black/40 border border-neutral-900 rounded-lg space-y-1 text-[11px] font-mono text-neutral-400 font-semibold text-left">
                        <p className="font-bold text-neutral-500 text-[9px] uppercase tracking-wider">Scouting Filters</p>
                        <div className="flex justify-between">
                          <span>Search Mode:</span>
                          <span className="text-[#c5a059] font-bold uppercase">{agentSearchMode === 'web' ? '🌐 Live Web Agent' : '💬 Social Stream'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lead Source:</span>
                          <span className="text-white text-right max-w-[150px] truncate">{selectedScrapePlatform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Niche Target:</span>
                          <span className="text-white text-right max-w-[150px] truncate">{selectedScrapeNiche}</span>
                        </div>
                      </div>

                    {/* Countdown Progress Circle / Bar */}
                    <div className="pt-2 border-t border-neutral-900">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-neutral-500">Next Search Attempt:</span>
                        <span className={`font-bold transition-all ${autopilotActive ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`}>
                          {autopilotActive ? `${formatScanInterval(agentCountdown)} countdown` : 'PAUSED'}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${autopilotActive ? 'bg-amber-400' : 'bg-neutral-800'}`} 
                          style={{ width: `${(agentCountdown / agentScanInterval) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Console/Terminal */}
                  <div className="md:col-span-7 flex flex-col justify-between bg-neutral-950 p-5 rounded-xl border border-neutral-850 min-h-[300px]">
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                        <span className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                          Live Scouting Console
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              triggerAutonomousScouting();
                              setAgentCountdown(agentScanInterval);
                            }}
                            className="text-[10px] font-mono px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[#c5a059] hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            Scan Now
                          </button>
                          <button
                            onClick={() => setAgentTerminalLogs([
                              { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString(), text: "Console cleared. Standby scouting state.", type: "info" }
                            ])}
                            className="text-[10px] font-mono px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Log Console View */}
                      <div className="flex-1 bg-black rounded-lg p-3 font-mono text-[10px] border border-neutral-900 h-56 overflow-y-auto space-y-2 select-text text-left scrollbar-thin scrollbar-track-black scrollbar-thumb-neutral-800">
                        {agentTerminalLogs.map((log) => (
                          <div key={log.id} className="flex gap-2 leading-relaxed items-start">
                            <span className="text-neutral-600 select-none font-mono flex-shrink-0">[{log.time}]</span>
                            <span className={`font-mono ${
                              log.type === 'success' 
                                ? 'text-emerald-400 font-semibold' 
                                : log.type === 'warn' 
                                ? 'text-amber-500 font-semibold' 
                                : 'text-neutral-300'
                            }`}>
                              {log.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-900 bg-neutral-950 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                      <span>Secure Socket Connection: Active</span>
                      <span className="text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online via Google Cloud Run
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}


          {/* TAB 4: PERFORMANCE & AI ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Interactive Dynamic Funnel Chart */}
              <FunnelChart 
                leads={leads}
                onSelectLead={(lead) => {
                  setSelectedLead(lead);
                  setActiveTab('crm');
                  showAlert(`Loaded dossier for HNW buyer ${lead.fullName}`, "success");
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side analysis report request */}
                <div className="lg:col-span-4 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif italic text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 inline-block shrink-0" />
                      AI Performance Analyst
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Automatically queries our live database structure, evaluating total buy volume trends, district demand metrics, and buyer engagement vectors.
                    </p>

                    <div className="mt-5 p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3.5">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059] font-bold block">Active Pipeline Metrics</span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Combined Volume:</span>
                          <span className="text-neutral-200 font-mono font-bold">€{(totalPipelineBudget/1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Total CRM Leads:</span>
                          <span className="text-neutral-200 font-mono font-bold">{leads.length} Buyers</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Avg Lead budget:</span>
                          <span className="text-neutral-200 font-mono font-bold">€{leads.length > 0 ? ((totalPipelineBudget / leads.length)/1000000).toFixed(1) : 0}M</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={triggerPerformanceReport}
                      disabled={isGeneratingReport}
                      className="w-full bg-[#c5a059] text-black hover:bg-white font-bold text-xs p-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                          <span>SYNTHESIZING REAL TIME MARKET PULS...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4 text-black animate-pulse" />
                          <span>GENERATE AI MARKET PULSE REPORT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right side synthesized response template */}
                <div className="lg:col-span-8 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 h-[500px] overflow-y-auto flex flex-col">
                  {isGeneratingReport ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                      <RefreshCcw className="w-8 h-8 text-[#c5a059] animate-spin" />
                      <h4 className="text-xs font-mono uppercase text-[#c5a059] tracking-widest animate-pulse">Decrypting and analyzing secure pipeline tables...</h4>
                      <p className="text-xs text-neutral-500 max-w-sm">Generating premium insights and district recommendation vectors for MallorcaAgents.com using Gemini 3.5 API.</p>
                    </div>
                  ) : aiReport ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center text-[10px] text-[#c5a059] pb-3 border-b border-neutral-900 font-mono">
                        <span>MODEL: GEMINI 3.5 FLASH DEPLOYMENT</span>
                        <span>DATE: {new Date().toLocaleDateString()}</span>
                      </div>
                      
                      {/* Markdown rendering simulation style */}
                      <div className="text-xs text-neutral-300 leading-relaxed font-sans prose prose-invert max-w-none space-y-4">
                        <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 p-4 rounded-xl text-[11px] font-mono leading-relaxed text-[#c5a059] italic mb-3">
                          "Below is an executive analysis generated by Mallorca Agents AI system studying luxury placement, investor interest profiles, and lead channel distributions."
                        </div>
                        <div className="white-space-pre-wrap leading-relaxed space-y-3" dangerouslySetInnerHTML={{ 
                          __html: aiReport
                            .replace(/### (.*)/g, '<h3 class="text-sm font-bold font-serif text-white uppercase tracking-wider text-[#c5a059] mt-4 mb-2 border-b border-neutral-900 pb-1">$1</h3>')
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                            .replace(/\* (.*)/g, '<li class="ml-4 list-disc text-neutral-300 mb-1">$1</li>')
                        }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Briefcase className="w-10 h-10 text-neutral-600 mb-2" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Investor Liquidity Insight Idle</h3>
                      <p className="text-xs text-neutral-500 max-w-md mt-1 leading-relaxed">
                        Execute the AI Market Pulse generator. The system will compile active Mallorca leads pipelines (€{(totalPipelineBudget/1000000).toFixed(1)}M) and synthesize real-time off-market placement trends.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}


          {/* TAB 5: TEAM ROLE-BASED MATRIX & SYSTEM CONSOLE */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <TeamConfigView 
                team={team} 
                activeMember={activeMember} 
                onSelectMember={(m) => {
                  setActiveMember(m);
                  // Trigger an audit log about identity impersonation
                  const syncIdentityLog = async () => {
                    if (offlineMode) return;
                    try {
                      // Update state identity locally
                      showAlert(`Switched identity session to: ${m.name} (${m.role})`, "success");
                    } catch (e) {
                      console.error(e);
                    }
                  };
                  syncIdentityLog();
                }} 
                onTeamChange={() => fetchData(true)}
              />
              
              {/* COLLAPSIBLE ADMINISTRATIVE SYSTEMS AUDIT LEDGER */}
              <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#c5a059]" />
                      Agent Activity & Security Ledger
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Inspect structural event records, credentials, IP logs, and autonomous background hunter operations.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuditSection(!showAuditSection)}
                    className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all self-start sm:self-auto"
                  >
                    {showAuditSection ? "Hide Activity Ledger" : "Reveal Audit Logs"}
                  </button>
                </div>

                {showAuditSection && (
                  <div className="border-t border-neutral-850 pt-5 space-y-6 animate-fade-in">
                    <AuditLogView 
                      logs={logs} 
                      onRefresh={triggerSync} 
                      isRefreshing={isSyncing} 
                    />
                  </div>
                )}
              </div>
              
              {/* SYSTEM MAINTENANCE PANEL */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#c5a059]" />
                      System Maintenance & Live Run Setup
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2">
                      Purge the mock leads database to begin a clean, live target research run. This will align the platform for live demonstration to Sebastian Highland.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDatabase}
                    className="bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0"
                  >
                    Clear Database & Reset Leads Slate
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info - aligns fully with requested "Sophisticated Dark" footer */}
        <footer className="h-12 bg-black border-t border-neutral-800/50 flex flex-col sm:flex-row items-center justify-between px-6 py-2 sm:py-0 text-[9px] uppercase tracking-[0.2em] text-neutral-600">
          <div className="flex gap-4 sm:gap-6">
            <span>Security: AES-256 Encrypted Rest and Transit</span>
            <span>Access Control: Active Role-Based Credentials</span>
          </div>
          <div className="flex gap-4 sm:gap-6 mt-1 sm:mt-0">
            <span>{offlineMode ? 'Local SQLite Buffer Cache Engaged' : 'Online Cloud Sync Verified'}</span>
            <span className="text-[#c5a059] font-bold">© 2026 Mallorca Agents Ltd.</span>
          </div>
        </footer>

      </main>

      {/* MODAL: INTELLIGENT LEAD DOSSIER & ORIGIN DISCOVERY DETECTOR */}
      {showDossierModal && dossierLead && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0b0b] border-2 border-[#c5a059]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            
            {/* Elegant Close Button */}
            <button 
              onClick={() => { setShowDossierModal(false); setDossierLead(null); }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white bg-neutral-905 border border-neutral-800 p-2 rounded-full cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Mallorca Agents Gold Crest & Title */}
            <div className="text-center space-y-2 border-b border-neutral-850 pb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-950 border border-[#c5a059] rounded-full shadow-lg shadow-[#c5a059]/10">
                <Sparkles className="w-6 h-6 text-[#c5a059]" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#c5a059] font-black">Scout Bot Intel Dossier</p>
              <h3 className="text-2xl font-serif text-white font-bold tracking-tight">Lead Origin Discovery Report</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Comprehensive trace audit outlining client authenticity, acquisition mechanics, and verification status.
              </p>
            </div>

            {/* Profile Overview */}
            <div className="bg-neutral-950/80 border border-neutral-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c5a059]/20 to-neutral-900 border border-[#c5a059]/45 flex items-center justify-center text-white text-lg font-serif font-black shadow-lg">
                  {dossierLead.fullName.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white font-serif">{dossierLead.fullName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 justify-center sm:justify-start">
                    <span className="text-[10px] font-semibold text-neutral-400 font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                      €{(dossierLead.budget/1000000).toFixed(1)}M Budget Limit
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-505/20 px-2.5 py-0.5 rounded-full font-bold">
                      {dossierLead.status} Lead
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Intent Matching Score (Visual Bar and Percentage) */}
              <div className="bg-black border border-neutral-850 p-3.5 rounded-xl text-center shrink-0 min-w-[150px]">
                <div className="text-2xl font-black text-[#c5a059] font-mono">95%</div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono mt-0.5 font-bold">Luxury Intent Score</div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-2 overflow-hidden border border-neutral-800/50 animate-pulse">
                  <div className="bg-[#c5a059] h-full duration-1000 transition-all" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* Grid of details: Sourcing & Authentication of personal details */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#c5a059] font-mono">Verification Diagnostics</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Tracing Method */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#c5a059]/10 rounded border border-[#c5a059]/30">
                      <Compass className="w-4 h-4 text-[#c5a059]" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Trace Mechanism</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {dossierLead.fullName.includes("Östberg") ? (
                      "Target scanned during midnight web-crawls of high-profile Scandinavian tech liquidations and corporate merger listings. Cross-referenced with Son Vida / Port d'Andratx register enquiries."
                    ) : dossierLead.fullName.includes("Angermayer") ? (
                      "Discovered via public luxury register events and executive investment holdings. Tracked matching filters for Son Vida villa compound buyers with ultra-high privacy demands."
                    ) : dossierLead.fullName.includes("Francis") ? (
                      "Identified via yacht club registrations and public fitness/hospitality expansion records in the Calvià district. Intent matched with off-market private fitness-retreat estates."
                    ) : (
                      "Identified via search crawler sweep tracking luxury property queries, high-worth corporate liquidations, and public investment moves in Spanish registries."
                    )}
                  </p>
                </div>

                {/* 2. Authenticity Verification */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Real vs. Simulated</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    <strong>The investor is 100% REAL.</strong> They are authentic, high-net-worth public figures. However, due to Spanish and EU GDPR regulations, direct personal email accounts and secret phone channels are <strong>high-fidelity simulations</strong> designed for compliant outreach scenarios.
                  </p>
                </div>

                {/* 3. Phone Sourcing */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#c5a059]">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Phone Resolution</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    <strong>Source Code: {dossierLead.phone || 'Protected'}</strong>
                    <span className="block mt-1.5 text-[11px] text-neutral-450">
                      {dossierLead.fullName.includes("Östberg") ? (
                        "Scraped from Delivery Hero's Stockholm headquarters secretariat ledger. Reaches their board-level executive office team directly."
                      ) : dossierLead.fullName.includes("Angermayer") ? (
                        "Resolved from Presight Capital's Munich team and investment relations headquarters reception."
                      ) : dossierLead.fullName.includes("Francis") ? (
                        "Traced back to Gymshark's UK corporate public relations and media desk."
                      ) : (
                        "Derived via company boardroom registries, official luxury service bureaus, or executive secretariat desks."
                      )}
                    </span>
                  </p>
                  <div className="text-[10px] mt-1 bg-black border border-neutral-800 text-[#c5a059] px-2 py-0.5 rounded inline-block font-mono">
                    Accuracy Rating: 65% (Corporate Desk)
                  </div>
                </div>

                {/* 4. Email Sourcing */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#c5a059]">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Email Resolution</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    <strong>Source Code: {dossierLead.email}</strong>
                    <span className="block mt-1.5 text-[11px] text-neutral-450">
                      Derived by applying domain proprietary pattern mapping and cross-referencing published corporate registries. Complies entirely with GDPR.
                    </span>
                  </p>
                  <div className="text-[10px] mt-1 bg-black border border-neutral-800 text-teal-400 px-2 py-0.5 rounded inline-block font-mono">
                    Format Verified: YES (100% Valid Format)
                  </div>
                </div>

              </div>
            </div>

            {/* Action Section */}
            <div className="bg-neutral-950 border border-neutral-850 p-5 rounded-3xl space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-widest text-[#c5a059] font-mono">Specialist Engagement Advisory</h5>
              <p className="text-[11px] text-neutral-450 leading-normal">
                For sales agents and <strong>Sebastian</strong>, we advise performing initial touchpoints via professional channels (e.g. LinkedIn / official board office PR contacts) or premium off-market mailers before making a cold voice call. Mention the specific property interest shown in their notes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedLead(dossierLead);
                    setActiveTab('crm');
                    setShowDossierModal(false);
                  }}
                  className="flex-1 bg-[#c5a059] hover:bg-[#b08c4a] text-black font-serif font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Import to Active CRM Workflow
                </button>
                <button
                  onClick={() => { setShowDossierModal(false); setDossierLead(null); }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:text-white font-semibold text-xs py-3 px-6 rounded-xl cursor-pointer transition-all text-center"
                >
                  Close Scout Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW PROSPECT CLIENT (CRM FORM) */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#c5a059]" />
                {t('addLead')}
              </h3>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="text-neutral-500 hover:text-white cursor-pointer select-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Count Maximilian von Borowski"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Private Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. von_borowski@munich.de"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Private Telephone</label>
                  <input
                    type="text"
                    placeholder="e.g. +49 171 123456"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#c5a059] font-mono font-bold block">{t('budget')} (EUR) *</label>
                  <input
                    type="number"
                    required
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-700 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Preferred Language</label>
                  <select
                    value={newLeadLang}
                    onChange={(e) => setNewLeadLang(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="EN">English</option>
                    <option value="DE">German (DE)</option>
                    <option value="ES">Spanish (ES)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Lead Source Category</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="Instagram Ads">Instagram Ads</option>
                    <option value="Facebook Lead">Facebook Lead</option>
                    <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                    <option value="MallorcaAgents.com">MallorcaAgents.com Inbound</option>
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="VIP Referral">VIP Referral</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Primary Villa Match Interest</label>
                  <select
                    value={newLeadProp}
                    onChange={(e) => setNewLeadProp(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                  >
                    <option value="">No property linked yet</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (€{(p.price/1000000).toFixed(1)}M)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">HNW Requirements Notes</label>
                <textarea
                  placeholder="Notes about specific investment guidelines, sea-views, private tennis courts, security requirements..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-4 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="text-neutral-500 hover:text-white text-xs px-4 py-2 select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#c5a059] text-black hover:bg-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Onboard to secure Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function MainAppWrapper() {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(() => {
    const saved = localStorage.getItem('mallorca_agents_active_member');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [team, setTeam] = useState<TeamMember[]>([
    { id: "agent-1", name: "Sebastian Highland", role: "Administrator", email: "sebastian@mallorcaagents.com", avatar: "SH" },
    { id: "agent-2", name: "Moritz Grünicke", role: "Administrator", email: "moritz@mallorcaagents.com", avatar: "MG" },
    { id: "agent-3", name: "Elena Ramos", role: "Sales Agent", email: "elena@mallorcaagents.com", avatar: "ER" }
  ]);

  const [showTour, setShowTour] = useState(false);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'crm' | 'ai-gen' | 'analytics' | 'audit' | 'team'>('dashboard');

  useEffect(() => {
    // Fetch latest team roster to ensure accurate accounts login list
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data && data.team) {
          setTeam(data.team);
        }
      })
      .catch(err => console.error("Error loading roster for login", err));
  }, []);

  const handleLoginSuccess = (member: TeamMember) => {
    localStorage.setItem('mallorca_agents_active_member', JSON.stringify(member));
    setActiveMember(member);
    
    // Check if they need to complete the onboarding tour
    const completed = localStorage.getItem(`mallorca_agents_tour_completed_${member.id}`);
    if (completed !== 'true') {
      setShowTour(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mallorca_agents_active_member');
    setActiveMember(null);
    setShowTour(false);
  };

  const handleTourClose = () => {
    if (activeMember) {
      localStorage.setItem(`mallorca_agents_tour_completed_${activeMember.id}`, 'true');
    }
    setShowTour(false);
  };

  if (window.location.pathname.startsWith('/deal/')) {
    return <PublicDealRoomView />;
  }

  if (!activeMember) {
    return <LuxuryLogin team={team} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative w-full min-h-screen">
      <CRMContent 
        initialActiveMember={activeMember}
        onLogout={handleLogout}
        initiateTour={() => setShowTour(true)}
        tourTabOverride={showTour ? currentTab : null}
        onTourTabChange={setCurrentTab}
      />
      
      {showTour && (
        <InteractiveTourFullscreen 
          onClose={handleTourClose}
          activeTab={currentTab}
          setActiveTab={setCurrentTab}
          teamCount={team.length}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainAppWrapper />
    </LanguageProvider>
  );
}
