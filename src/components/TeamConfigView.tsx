import React, { useState } from 'react';
import { Role, TeamMember } from '../types';
import { useTranslation } from './LanguageSelector';
import { Shield, Key, Eye, Trash2, Zap, CheckCircle2, AlertTriangle, UserPlus, Edit3, X, Save, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamConfigViewProps {
  team: TeamMember[];
  activeMember: TeamMember;
  onSelectMember: (member: TeamMember) => void;
  onTeamChange: () => void;
}

export default function TeamConfigView({ team, activeMember, onSelectMember, onTeamChange }: TeamConfigViewProps) {
  const { t } = useTranslation();
  
  // Administrator Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<Role>('Sales Agent');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('');

  const isAdmin = activeMember.role === 'Administrator';

  const resetForm = () => {
    setMemberId(null);
    setMemberName('');
    setMemberRole('Sales Agent');
    setMemberEmail('');
    setMemberAvatar('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEditClick = (member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent impersonating triggering first
    if (!isAdmin) return;
    setMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberEmail(member.email);
    setMemberAvatar(member.avatar);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent impersonating
    if (!isAdmin) return;
    
    if (member.id === activeMember.id) {
      alert("Self-Decommission Blocked: You cannot revoke/delete your own active session credentials.");
      return;
    }
    
    if (!window.confirm(`Are you absolutely sure you want to completely revoke credentials and delete agent folder for ${member.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeMember.role,
          'x-user-name': activeMember.name
        }
      });

      if (res.ok) {
        onTeamChange();
        setFormSuccess(`Revoked keys for ${member.name} successfully.`);
        setTimeout(() => setFormSuccess(null), 4000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove team member");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting CRM security cluster");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!memberName || !memberEmail) {
      setFormError("Name and Email are strictly mandatory fields");
      return;
    }

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeMember.role,
          'x-user-name': activeMember.name
        },
        body: JSON.stringify({
          id: memberId,
          name: memberName,
          role: memberRole,
          email: memberEmail,
          avatar: memberAvatar
        })
      });

      if (res.ok) {
        onTeamChange();
        setFormSuccess(memberId ? "Team member profile updated successfully" : "New Sales Agent registered & synchronized across workspace nodes");
        setIsFormOpen(false);
        resetForm();
        setTimeout(() => setFormSuccess(null), 4000);
      } else {
        const err = await res.json();
        setFormError(err.error || "Unauthorized or invalid payload");
      }
    } catch (err) {
      console.error(err);
      setFormError("Unable to communicate with the security server node");
    }
  };

  const getPermissionBadge = (allowedRoles: Role[], currentRole: Role) => {
    const isAllowed = allowedRoles.includes(currentRole);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isAllowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
      }`}>
        {isAllowed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
        {isAllowed ? t('allowed') : t('restricted')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Alerts inside the Admin panel */}
      {formSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-medium text-white flex items-center gap-2">
              <Shield className="w-5  h-5 text-indigo-400" />
              {t('teamAccess')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure agency partners, administrative credentials, and operational roles for mallorcaagents.com.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>{t('encryptedText')}: <strong>{activeMember.name} ({activeMember.role === 'Administrator' ? t('roleAdmin') : activeMember.role === 'Sales Agent' ? t('roleSales') : t('roleSpecialist')})</strong></span>
            </div>
            {isAdmin && (
              <button
                onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
                className="bg-[#c5a059] hover:bg-[#b08d4b] text-black font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Onboard Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* Create/Edit Agent Form Overlay / Accordion */}
        {isFormOpen && isAdmin && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-6 bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c5a059]" />
                {memberId ? "Refine Executive Identity" : "Onboard New Luxury Executive"}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsFormOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/40 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Full Professional Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Moritz Grünicke"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Official Agency Email *</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. moritz@mallorcaagents.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Operational Access Role *</label>
                <select 
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as Role)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Administrator">Administrator (Sebastian & Moritz)</option>
                  <option value="Sales Agent">Sales Agent (Standard Client View)</option>
                  <option value="Lead Gen Specialist">Lead Gen Specialist (Scrapers & AI Autopilot)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Initials/Avatar Stamp (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. MG (Will auto-generate from name if blank)"
                  value={memberAvatar}
                  onChange={(e) => setMemberAvatar(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-850 flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => { setIsFormOpen(false); resetForm(); }}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs px-4 py-2 rounded-xl text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-[#c5a059] font-semibold text-xs text-black px-4 py-2 rounded-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{memberId ? "Commit Profile Update" : "Register Credentials"}</span>
              </button>
            </div>
          </motion.form>
        )}

        {/* Roster profiles view */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {team.map((member) => {
            const isActive = member.id === activeMember.id;
            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`text-left p-5 rounded-xl border transition-all relative overflow-hidden group hover:scale-[1.01] cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 border-indigo-500 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-705'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/25 to-transparent pointer-events-none rounded-bl-full flex items-start justify-end p-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                )}
                
                {/* Admin controls inside the card */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => handleEditClick(member, e)}
                      title="Refine Agent profile"
                      className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 text-slate-400 rounded-md text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                    {member.id !== activeMember.id && (
                      <button 
                        onClick={(e) => handleDeleteClick(member, e)}
                        title="Decommission credentials"
                        className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500 hover:text-rose-400 text-slate-400 rounded-md text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Revoke</span>
                      </button>
                    )}
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
                      {member.role === 'Administrator' ? t('roleAdmin') : member.role === 'Sales Agent' ? t('roleSales') : t('roleSpecialist')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-slate-500 group-hover:text-slate-400 transition-colors text-xs">
                  <span className="truncate max-w-[140px]">{member.email}</span>
                  <span className="underline group-hover:text-indigo-400 font-medium whitespace-nowrap">{t('impersonate')} →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Rules Matrix details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
          {t('permissionsMatrix')}
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
          <span className="text-[#c5a059] font-bold scale-110">💡 {t('demoHighlight')}:</span>
          <p>
            Impersonate <strong>Elena Ramos (Sales Agent)</strong> then attempt to delete a lead inside the CRM view.
            You'll observe that access is denied, prompting real-time visual alerts, and the unauthorized trigger event is registered in the <strong>Audit Ledger</strong> with full user signatures!
          </p>
        </div>
      </div>
    </div>
  );
}

