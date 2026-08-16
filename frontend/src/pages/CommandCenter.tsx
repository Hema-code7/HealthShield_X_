import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, FileSearch, AlertTriangle, ArrowRight, Clock, ShieldCheck, Cpu, Database
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { PlasmaWave } from '../components/PlasmaWave';
import { AttackDNABadge } from '../components/AttackDNABadge';
import { LogIngestModal } from '../components/LogIngestModal';
import type { Incident, ActivityLog } from '../types';

interface CommandCenterProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  activityLogs: ActivityLog[];
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incidents,
  onSelectIncident,
  activityLogs
}) => {
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  return (
    <div className="relative min-h-full w-full p-6 space-y-6 max-w-7xl mx-auto overflow-hidden font-sans">
      {/* Full Page React Bits PlasmaWave WebGL Background for Dashboard 01 */}
      <div className="fixed inset-0 pointer-events-none opacity-45 z-0">
        <PlasmaWave
          colors={["#6366F1", "#06B6D4"]}
          speed1={0.06}
          speed2={0.06}
          focalLength={0.85}
          bend1={1.2}
          bend2={0.6}
          dir2={1.0}
          rotationDeg={0}
        />
      </div>

      {/* Full Page Dark Vignette & Blur Overlay for Readability */}
      <div className="fixed inset-0 bg-[#0b0f19]/70 backdrop-blur-[1px] pointer-events-none z-1" />

      {/* Main Page Content Layered Above PlasmaWave */}
      <div className="relative z-10 space-y-6">
        {/* Dashboard 01 Executive Header */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0f172a]/70 backdrop-blur-md shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-300 uppercase">
                DETERMINISTIC INVESTIGATION ENGINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
              Healthcare Cybersecurity Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              Multi-source log ingestion (Firewall, AD, EDR, App, DB), attack reconstruction, deterministic FEC scoring, and controlled attack replay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={() => setIsIngestOpen(true)}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xl border border-indigo-400/40"
            >
              <Database className="w-4 h-4 text-indigo-200" />
              <span>INGEST LOGS</span>
            </button>

            <div className="bg-[#161b22]/80 border border-white/15 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
              <div className="p-2.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SYSTEM STATUS</div>
                <div className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  INVESTIGATION ACTIVE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Executive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Incidents"
            value="03"
            subtext="2 High Severity · 1 Medium"
            icon={ShieldAlert}
            variant="danger"
          />
          <StatCard
            label="High Severity"
            value="02"
            subtext="Requires Investigator Action"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatCard
            label="Avg Evidence Coverage"
            value="78%"
            subtext="Deterministic Forensic Score"
            icon={FileSearch}
            variant="default"
          />
          <StatCard
            label="Open Evidence Gaps"
            value="07"
            subtext="Across Shadow Hospital"
            icon={Activity}
            variant="default"
          />
        </div>

        {/* Main Grid: Incident Table & Evidence Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Table (2 Columns) */}
          <div className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-100 text-sm tracking-wide font-sans">ACTIVE SECURITY INCIDENTS</h2>
                <p className="text-xs text-slate-400 font-sans">Real-time incident pipeline reconstructed from security telemetry.</p>
              </div>
              <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded">
                3 INCIDENTS
              </span>
            </div>

            <div className="border border-[#1e293b] rounded-lg overflow-hidden font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#161b22]/90 text-slate-400 text-[11px] border-b border-[#1e293b]">
                  <tr>
                    <th className="p-3">Incident</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">FEC</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc.id)}
                      className="hover:bg-[#1f293d]/60 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-semibold text-slate-200">
                        <div className="font-bold">{inc.id}</div>
                        <div className="text-[11px] text-slate-400 font-sans font-normal truncate max-w-[200px]">{inc.title}</div>
                      </td>
                      <td className="p-3">
                        <Badge text={inc.severity} variant={inc.severity.toLowerCase() as any} />
                      </td>
                      <td className="p-3 font-bold">
                        <span className={inc.fec_score >= 90 ? 'text-emerald-400' : inc.fec_score >= 70 ? 'text-amber-400' : 'text-rose-400'}>
                          {inc.fec_score}%
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge text={inc.status} variant={inc.status.toLowerCase() as any} />
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-indigo-400 hover:text-indigo-300 flex items-center justify-end gap-1 text-[11px] font-sans font-semibold cursor-pointer">
                          Investigate <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evidence Health & Attack DNA Sidebar (1 Column) */}
          <div className="space-y-6">
            {/* Attack DNA Badge */}
            <AttackDNABadge incidentId="INC-0241" />

            {/* System Activity Log Stream */}
            <div className="bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm tracking-wide flex items-center gap-2 font-sans">
                  <Clock className="w-4 h-4 text-indigo-400" /> SYSTEM AUDIT STREAM
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-[#161b22]/90 border border-[#1e293b]/60 flex items-start gap-2">
                    <span className="text-indigo-400 shrink-0 font-bold">{log.timestamp}</span>
                    <div>
                      <span className="text-slate-200 block font-semibold">{log.action}</span>
                      <span className="text-slate-400 text-[10px] block">{log.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Source Log Ingestion Modal */}
      <LogIngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        incidentId="INC-0241"
        onIngestSuccess={() => setIsIngestOpen(false)}
      />
    </div>
  );
};
