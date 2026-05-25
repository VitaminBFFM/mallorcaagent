export type Role = 'Administrator' | 'Sales Agent' | 'Lead Gen Specialist';

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar: string;
}

export interface MallorcaProperty {
  id: string;
  title: string;
  area: string;
  price: number;
  beds: number;
  baths: number;
  sizeSqM: number;
  image: string;
  highlight: string;
  description: string;
}

export interface DealRoom {
  id: string;
  status: 'draft' | 'active' | 'expired';
  accessToken: string;
  sharePath: string;
  shareUrl?: string;
  ndaRequired: boolean;
  ndaAcceptedAt?: string;
  consentCapturedAt?: string;
  selectedPropertyIds: string[];
  privateNote: string;
  createdAt: string;
  lastSharedAt: string;
  lastViewedAt?: string;
  expiresAt: string;
  viewCount: number;
}

export type PrivacyLevel = 'Standard' | 'High' | 'Ultra';
export type PurchaseTimeframe = 'Immediate' | '3-6 months' | '6-12 months' | 'Exploratory';

export interface LeadSearchProfile {
  targetAreas: string[];
  mustHaves: string[];
  minBudget: number;
  maxBudget: number;
  minBeds: number;
  minBaths: number;
  minSizeSqM: number;
  privacyLevel: PrivacyLevel;
  purchaseTimeframe: PurchaseTimeframe;
  advisorRoute: string;
  profileNotes: string;
  updatedAt?: string;
}

export type OutreachRiskLevel = 'Standard' | 'Elevated' | 'VIP';
export type OutreachPlanStatus = 'draft' | 'reviewed' | 'sent';

export interface OutreachStep {
  dayOffset: number;
  channel: string;
  objective: string;
  action: string;
}

export interface LeadOutreachPlan {
  id: string;
  status: OutreachPlanStatus;
  riskLevel: OutreachRiskLevel;
  primaryRoute: string;
  contactPrinciple: string;
  toneOfVoice: string;
  openingAngle: string;
  subjectLine: string;
  messageTemplate: string;
  personalizationHooks: string[];
  proofPoints: string[];
  doNotContact: string[];
  complianceNotes: string[];
  sequence: OutreachStep[];
  generatedAt: string;
  lastReviewedAt?: string;
  sentAt?: string;
}

export type LeadTaskStatus = 'open' | 'done' | 'blocked';
export type LeadTaskPriority = 'Normal' | 'High' | 'Critical';
export type LeadTaskSource = 'outreach_sequence' | 'manual';

export interface LeadTask {
  id: string;
  playbookId?: string;
  title: string;
  channel: string;
  dueAt: string;
  owner: string;
  status: LeadTaskStatus;
  priority: LeadTaskPriority;
  source: LeadTaskSource;
  dayOffset?: number;
  notes: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Showing Scheduled' | 'Offer Pending' | 'Closed Won' | 'Cold';
export type InterestLevel = 'High' | 'Medium' | 'Low';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'creation' | 'contact' | 'showing' | 'offer' | 'close' | 'ai_generation' | 'sync';
  title: string;
  desc: string;
  agent: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: string; // e.g., 'Instagram Ads', 'Facebook Lead', 'LinkedIn Outreach', 'Manual Entry', 'Direct Inbound'
  status: LeadStatus;
  interestLevel: InterestLevel;
  budget: number; // in EUR
  languagePreference: 'EN' | 'DE' | 'ES';
  notes: string;
  assignedAgent: string; // team member id or name
  lastContactDate: string;
  nextFollowUpDate: string;
  propertyInterestIds: string[];
  socialHandle?: string;
  socialEngagementScore?: number;
  lastActive?: string;
  preferredContactPath?: string;
  outreachAngle?: string;
  buyerSegment?: string;
  identityKey?: string;
  dealRoom?: DealRoom;
  searchProfile?: LeadSearchProfile;
  outreachPlan?: LeadOutreachPlan;
  outreachTasks?: LeadTask[];
  timeline: TimelineEvent[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  role: Role;
  module: 'CRM' | 'LeadGen' | 'AccessControl' | 'Encryption' | 'System';
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'lead' | 'sync' | 'security' | 'intelligence';
  read: boolean;
}

export type Language = 'EN' | 'DE' | 'ES';

export interface Dictionary {
  dashboard: string;
  crmLeadTracker: string;
  aiLeadsFinder: string;
  auditLogs: string;
  teamAccess: string;
  language: string;
  budget: string;
  status: string;
  assignedAgent: string;
  lastContact: string;
  nextFollowUp: string;
  actionLogs: string;
  realtimeSync: string;
  encryptedText: string;
  role: string;
  addLead: string;
  propertyMatching: string;
  performanceAnalytics: string;
  autoPilotFollowUps: string;
}
