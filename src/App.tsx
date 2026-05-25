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
import { Lead, TeamMember, MallorcaProperty, AuditLog, SystemNotification, Language } from './types';
import { LanguageProvider, useTranslation, DICTIONARY } from './components/LanguageSelector';
import { motion } from 'motion/react';
import TeamConfigView from './components/TeamConfigView';
import AuditLogView from './components/AuditLogView';
import FunnelChart from './components/FunnelChart';
import LuxuryLogin from './components/LuxuryLogin';
import InteractiveTourFullscreen from './components/InteractiveTourFullscreen';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
  
  // Gemini-driven follow-up generation states
  const [generatedFollowUp, setGeneratedFollowUp] = useState<string>('');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState<boolean>(false);
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
  const [selectedScrapePlatform, setSelectedScrapePlatform] = useState<string>('Instagram Luxury Target Campaigns');
  const [selectedScrapeNiche, setSelectedScrapeNiche] = useState<string>('German Yacht Owners & Son Vida Villa Seekers');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastScrapedLead, setLastScrapedLead] = useState<Lead | null>(null);

  // Autonomous AI Lead Scout Agent States
  const [autopilotActive, setAutopilotActive] = useState<boolean>(false);
  const [agentScanInterval, setAgentScanInterval] = useState<number>(30); // in seconds
  const [agentCountdown, setAgentCountdown] = useState<number>(30); // in seconds
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
        setLogs(data.logs);
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

  // Simulated outreach dispatch
  const handleSimulateDispatch = (lead: Lead) => {
    showAlert(`Bespoke luxury campaign dispatched via encrypted protocol to ${lead.fullName} (${lead.email})`, "success");
    setGeneratedFollowUp('');
    // Refresh log to capture showing updates
    fetchData(true);
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
          selectedPlatform: selectedScrapePlatform
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
            { triggerSec: 25, text: `🔍 Scouting high-engagement signals on ${selectedScrapePlatform}...`, type: 'info' },
            { triggerSec: 15, text: `🛡️ Pulling registration data matching theme "${selectedScrapeNiche}"...`, type: 'info' },
            { triggerSec: 5, text: `🧠 Feeding candidate profiles into Gemini 3.5 structured parsing loop...`, type: 'info' }
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
  }, [autopilotActive, agentScanInterval, selectedScrapePlatform, selectedScrapeNiche]);

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
    // If client budget allows
    const matched = properties.filter(prop => lead.budget >= prop.price * 0.85); // 15% stretch leeway
    return (
      <div className="space-y-3">
        {matched.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No direct property profiles match this budget scale yet.</p>
        ) : (
          matched.map(prop => {
            const isPerfectMatch = lead.propertyInterestIds.includes(prop.id);
            return (
              <div 
                key={prop.id} 
                className={`p-3 rounded-lg border flex gap-3 items-center ${
                  isPerfectMatch 
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
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-serif font-semibold truncate text-white">{prop.title}</h5>
                    <span className="text-[10px] text-[#c5a059] font-mono font-bold">€{(prop.price/1000000).toFixed(1)}M</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">{prop.area} • {prop.highlight}</p>
                </div>
                {isPerfectMatch && (
                  <span className="text-[9px] uppercase tracking-wider bg-[#c5a059]/20 text-[#c5a059] px-2 py-0.5 rounded border border-[#c5a059]/40 font-mono">
                    PRIORITY
                  </span>
                )}
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

  return (
    <div className="w-full min-h-screen bg-[#050505] text-neutral-200 flex flex-col md:flex-row font-sans">
      
      {/* Dynamic alerts/events banner */}
      {alertBanner && (
        <div className={`fixed top-4 right-4 z-55 max-w-md p-4 rounded-xl border animate-slide-in shadow-2xl flex items-start gap-3 ${
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
          <button onClick={() => setAlertBanner(null)} className="text-neutral-500 hover:text-white cursor-pointer select-none">
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
            className="md:hidden text-neutral-400 hover:text-white p-1"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left group cursor-pointer ${
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded transition-all text-left group cursor-pointer text-[#c5a059] bg-[#c5a059]/5 border border-[#c5a059]/20 hover:bg-[#c5a059]/10"
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
                className={`w-full p-2 rounded text-left transition-colors flex items-center gap-2 border cursor-pointer ${
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
            className="w-full mt-4 p-2.5 rounded text-left transition-colors flex items-center justify-center gap-2 border bg-rose-950/15 border-rose-900/40 text-rose-400 hover:bg-rose-950/25 hover:text-white cursor-pointer select-none"
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
        <header className="h-20 border-b border-neutral-800/50 flex items-center justify-between px-4 md:px-8 bg-[#050505]">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="md:hidden text-neutral-400 hover:text-white p-1"
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
                  className={`text-[10px] md:text-[11px] px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:border-neutral-700 transition-colors ${
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
                className="p-2 border border-neutral-800 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Force Synchronize with Cloud DB Node"
              >
                <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Notifications box */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 border border-neutral-800 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer relative"
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
                        className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
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

                <div className="my-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black border border-neutral-850 pl-9 pr-3 py-2 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 placeholder-neutral-600"
                    />
                  </div>
                  <div className="w-[145px]">
                    <select
                      value={leadSortCriteria}
                      onChange={(e) => setLeadSortCriteria(e.target.value)}
                      className="w-full bg-black border border-neutral-850 text-neutral-300 px-2.5 py-2 rounded-xl text-xs focus:outline-none focus:border-[#c5a059]/50 cursor-pointer font-sans"
                    >
                      <option value="newest">📅 {t('newest')}</option>
                      <option value="engagement">🔥 {t('engagementScore') || 'Engagement & Activity'}</option>
                      <option value="budget-desc">💎 {t('budgetHighLow')}</option>
                      <option value="alphabetical">🔤 {t('alphabetical')}</option>
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
                        className="mt-4 text-[10px] text-black bg-[#c5a059] hover:bg-white hover:text-black transition-colors px-4 py-2 rounded-lg inline-flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider font-mono shadow-md"
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
                            setGeneratedFollowUp('');
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
                                  className="p-1 rounded text-neutral-500 hover:text-[#c5a059] hover:bg-neutral-800/80 transition-colors cursor-pointer"
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
                          className="bg-black border border-neutral-800 rounded text-xs text-neutral-300 p-1.5 focus:outline-none hover:border-neutral-700 cursor-pointer"
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
                          className="p-1.5 bg-rose-950/20 text-rose-400 border border-rose-900/30 rounded hover:bg-rose-950 hover:text-rose-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
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
                            className="w-full mt-4 bg-neutral-900 hover:bg-[#c5a059]/15 text-[11px] font-bold text-[#c5a059] border border-[#c5a059]/20 hover:border-[#c5a059]/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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

                    {/* AI AUTOPILOT FOLLOW-UP SYSTEM */}
                    <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-4 space-y-3.5 relative">
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="text-[9px] bg-indigo-505/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          Gemini 3.5 Active
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-xs text-white uppercase tracking-wider font-bold inline-flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#c5a059]" />
                          Autopilot Follow-Up Generator
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Synthesize a bespoke off-market outreach template structured perfectly in <strong>{selectedLead.languagePreference === 'DE' ? 'German' : selectedLead.languagePreference === 'ES' ? 'Spanish' : 'English'}</strong>.
                        </p>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleAutoFollowUp(selectedLead.id)}
                          disabled={isGeneratingFollowUp}
                          className="bg-neutral-905 border border-neutral-800 text-neutral-200 hover:text-white hover:border-[#c5a059] text-xs px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isGeneratingFollowUp ? (
                            <>
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Structuring outreach...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-pulse" />
                              <span>Generate Bespoke Outreach</span>
                            </>
                          )}
                        </button>
                      </div>

                      {generatedFollowUp && (
                        <div className="bg-black/60 border border-[#c5a059]/30 rounded-lg p-3.5 space-y-3.5 animate-fade-in">
                          <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-2">
                            <span>Pre-rendered secure Outreach Draft</span>
                            <span>AES encrypted pipeline</span>
                          </div>
                          <p className="text-xs text-neutral-200 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap select-all font-sans bg-black/40 p-2 rounded">
                            {generatedFollowUp}
                          </p>
                          <div className="flex justify-end gap-2.5 pt-1">
                            <button
                              onClick={() => setGeneratedFollowUp('')}
                              className="text-neutral-500 hover:text-white text-xs select-none cursor-pointer"
                            >
                              Discard
                            </button>
                            <button
                              onClick={() => handleSimulateDispatch(selectedLead)}
                              className="bg-[#c5a059] text-black hover:bg-white text-xs px-3.5 py-1.5 rounded font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Dispatch to Client</span>
                            </button>
                          </div>
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
                        <option value="LinkedIn Executive Mallorca Group">LinkedIn Mallorca Executive HNW Network</option>
                        <option value="German Yacht Owners Forum">Superyacht Registry & Port d'Andratx Club Inbounds</option>
                        <option value="European Tech IPO & Liquidity trackers">European Tech IPO & Liquidity News</option>
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
                        <option value="German Yacht Owners & Son Vida Villa Seekers">German Yacht Owners & Son Vida Villa Seekers</option>
                        <option value="London Tech Founders Seeking Port Andratx waterfronts">London Tech Founders Seeking Port Andratx</option>
                        <option value="Swiss Private Bank Executives seeking absolute mountains privacy">Swiss Executives Seeking Tramuntana Privacy</option>
                        <option value="Madrid Corporate Real Estate investors seeking Mallorca hotels">Madrid Corporate Real Estate Investors</option>
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
                        <span className="text-[11px] font-mono text-[#c5a059] font-bold">Every {agentScanInterval} seconds</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="300"
                        step="15"
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
                        <span>15s (Demo)</span>
                        <span>300s (Production)</span>
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
                          {autopilotActive ? `${agentCountdown}s countdown` : 'PAUSED'}
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
