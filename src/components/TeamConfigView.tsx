import { Role, TeamMember } from '../types';
import { useTranslation } from './LanguageSelector';
import { Shield, Key, Eye, Trash2, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TeamConfigViewProps {
  team: TeamMember[];
  activeMember: TeamMember;
  onSelectMember: (member: TeamMember) => void;
}

export default function TeamConfigView({ team, activeMember, onSelectMember }: TeamConfigViewProps) {
  const { t } = useTranslation();

  const getPermissionBadge = (allowedRoles: Role[], currentRole: Role) => {
    const isAllowed = allowedRoles.includes(currentRole);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isAllowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
      }`}>
        {isAllowed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
        {isAllowed ? 'Allowed' : 'Restricted'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-medium text-white flex items-center gap-2">
              <Shield className="w-5  h-5 text-indigo-400" />
              {t('teamAccess')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Simulate and test the secure role-based access controls designed for mallorcaagents.com.
            </p>
          </div>
          <div className="bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Active Session Encrypted: <strong>{activeMember.name} ({activeMember.role})</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {team.map((member) => {
            const isActive = member.id === activeMember.id;
            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`text-left p-5 rounded-xl border transition-all relative overflow-hidden group hover:scale-[1.01] cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 border-indigo-500 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/25 to-transparent pointer-events-none rounded-bl-full flex items-start justify-end p-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                )}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {member.name}
                    </h4>
                    <span className={`text-xs block mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-slate-500 group-hover:text-slate-400 transition-colors text-xs">
                  <span>{member.email}</span>
                  <span className="underline group-hover:text-indigo-400 font-medium">Impersonate →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Rules Matrix details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
          SECURE OPERATIONS PERMISSIONS MATRIX
        </h3>
        <div className="mt-4 divide-y divide-slate-850">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">View Mallorca Luxury Leads</p>
                <p className="text-xs text-slate-400">Read prospective client files & matching portfolios</p>
              </div>
            </div>
            {getPermissionBadge(['Administrator', 'Sales Agent', 'Lead Gen Specialist'], activeMember.role)}
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Lead Hunting & Scraper Simulation</p>
                <p className="text-xs text-slate-400">Execute automated Instagram/Facebook targeting triggers</p>
              </div>
            </div>
            {getPermissionBadge(['Administrator', 'Lead Gen Specialist'], activeMember.role)}
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Lead Record Purging & Hard Removal</p>
                <p className="text-xs text-slate-400">Strictly delete prospect history and associated data vaults</p>
              </div>
            </div>
            {getPermissionBadge(['Administrator'], activeMember.role)}
          </div>
        </div>

        <div className="mt-5 p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex gap-3 text-xs text-slate-400">
          <span className="text-indigo-400 font-bold scale-110">💡 DEMO HIGHLIGHT:</span>
          <p>
            Impersonate <strong>Elena Ramos (Sales Agent)</strong> then attempt to delete a lead inside the CRM view.
            You'll observe that access is denied, prompting real-time visual alerts, and the unauthorized trigger event is registered in the <strong>Audit Ledger</strong> with full user signatures!
          </p>
        </div>
      </div>
    </div>
  );
}
