import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Dictionary } from '../types';

export const DICTIONARY: Record<Language, Dictionary> = {
  EN: {
    dashboard: "Analytics Suite",
    crmLeadTracker: "Luxury CRM Suite",
    aiLeadsFinder: "Social Lead Hunter",
    auditLogs: "Secure Audit Ledger",
    teamAccess: "Team Role-Based Matrix",
    language: "Language Selection",
    budget: "Investment Budget",
    status: "Pipeline Status",
    assignedAgent: "Assigned Executive",
    lastContact: "Last Interaction",
    nextFollowUp: "Autopilot Action Slate",
    actionLogs: "Access Logs",
    realtimeSync: "Cloud Sync Enabled",
    encryptedText: "End-to-End Encrypted",
    role: "Operational Role",
    addLead: "Onboard New Prospect",
    propertyMatching: "Luxury Portfolio Matcher",
    performanceAnalytics: "AI Intelligence Suite",
    autoPilotFollowUps: "Autopilot Follow-Up Writer"
  },
  DE: {
    dashboard: "Analyse-Suite",
    crmLeadTracker: "Luxus-CRM-Verwaltung",
    aiLeadsFinder: "Käufer-Auffinder",
    auditLogs: "Sicherheits-Audit-Log",
    teamAccess: "Rollenbasierte Matrix",
    language: "Sprachauswahl",
    budget: "Investitionsbudget",
    status: "Pipeline-Status",
    assignedAgent: "Zuständiger Berater",
    lastContact: "Letzter Kontakt",
    nextFollowUp: "Autopilot Wiedervorlage",
    actionLogs: "Zugriffsprotokolle",
    realtimeSync: "Cloud-Synchronisation Aktiv",
    encryptedText: "Ende-zu-Ende verschlüsselt",
    role: "Betriebliche Rolle",
    addLead: "Neuen Kunden anlegen",
    propertyMatching: "Immobilien-Matching",
    performanceAnalytics: "KI-Analyseberichte",
    autoPilotFollowUps: "Autopilot-Nachfassbriefe"
  },
  ES: {
    dashboard: "Panel de Inteligencia",
    crmLeadTracker: "Gestión de CRM Premium",
    aiLeadsFinder: "Captación de Leads",
    auditLogs: "Historial de Auditoría",
    teamAccess: "Matriz de Roles de Equipo",
    language: "Selección de Idioma",
    budget: "Presupuesto Inversión",
    status: "Fase de Negocio",
    assignedAgent: "Asesor Asignado",
    lastContact: "Último Contacto",
    nextFollowUp: "Plazos Autopilot",
    actionLogs: "Registros del Sistema",
    realtimeSync: "Sincronización en la Nube",
    encryptedText: "Cifrado de Extremo a Extremo",
    role: "Rol Operativo",
    addLead: "Registrar Nuevo Cliente",
    propertyMatching: "Casación de Villas",
    performanceAnalytics: "Informes Analíticos de IA",
    autoPilotFollowUps: "Generador de Seguimientos IA"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Dictionary) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: keyof Dictionary): string => {
    return DICTIONARY[language][key] || DICTIONARY['EN'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
