import { useState } from 'react';
import { AuditLog } from '../types';
import { useTranslation } from './LanguageSelector';
import { ShieldCheck, Search, Filter, HardDrive, RefreshCcw, Lock } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function AuditLogView({ logs, onRefresh, isRefreshing }: AuditLogViewProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getModuleBadge = (mod: string) => {
    const styles: Record<string, string> = {
      CRM: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      LeadGen: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      AccessControl: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      Encryption: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      System: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-mono border ${styles[mod] || styles.System}`}>
        {mod}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">ENCRYPTION PROTOCOL</span>
            <h4 className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
              <Lock className="w-4 h-4" />
              AES-256-GCM
            </h4>
          </div>
          <span className="text-2xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono">
            SECURE REST
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">TRANSIT CHANNEL</span>
            <h4 className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" />
              TLS 1.3 / SSL
            </h4>
          </div>
          <span className="text-2xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono">
            CYPHER TUNNEL
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between font-mono">
          <div>
            <span className="text-xs text-slate-400">DEVICE SNAPSHOTTING</span>
            <h4 className="text-lg font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" />
              SYNC SYNCED
            </h4>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Audit Transaction Log
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guaranteed tamper-proof ledger tracking device synchronizations, credential grants, and decryption histories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 w-60 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Logs</option>
                <option value="CRM">CRM</option>
                <option value="LeadGen">LeadGen</option>
                <option value="AccessControl">AccessControl</option>
                <option value="Encryption">Encryption</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-xs">
                <th className="py-3 font-mono">TIMESTAMP</th>
                <th className="py-3 font-mono">MODULE</th>
                <th className="py-3 font-mono">SECURE TRANSACTION</th>
                <th className="py-3 font-mono">OPERATING AGENT</th>
                <th className="py-3 font-mono text-right">NODE IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-4 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}{' '}
                      <span className="text-[10px] block opacity-55">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4">{getModuleBadge(log.module)}</td>
                    <td className="py-4 max-w-sm">
                      <span className="font-semibold text-white block">{log.action}</span>
                      <span className="text-slate-400 text-xs block mt-1">{log.details}</span>
                    </td>
                    <td className="py-4 font-mono">
                      <span className="text-slate-200 block">{log.user}</span>
                      <span className="text-2xs text-slate-500 block">{log.role}</span>
                    </td>
                    <td className="py-4 font-mono text-right text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    ledger query returned empty set.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
