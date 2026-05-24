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
