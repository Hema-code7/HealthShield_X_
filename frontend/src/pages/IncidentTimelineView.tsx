import React from 'react';
import { 
  ShieldAlert, CheckCircle2, Lock, FileCheck, Zap, 
  Activity, AlertTriangle 
} from 'lucide-react';

interface IncidentTimelineViewProps {
  isSimulatedAttackActive?: boolean;
}

export const IncidentTimelineView: React.FC<IncidentTimelineViewProps> = () => {
  const timelineSteps = [
    {
      time: '10:42:31',
      title: 'THREAT DETECTED',
      subtitle: 'Anomalous Lateral Movement initiated from ADMIN-PC-07 targeting EHR-SERVER-01',
      status: 'CRITICAL',
      icon: ShieldAlert,
      color: 'text-rose-400 border-rose-500/50 bg-rose-950/20'
    },
    {
      time: '10:42:35',
      title: 'AI ANALYSIS COMPLETE',
      subtitle: 'HealthShield AI engine analyzed behavioral deviation across identity, network & database vectors',
      status: 'VERIFIED',
      icon: Zap,
      color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/20'
    },
    {
      time: '10:42:37',
      title: 'RISK CLASSIFIED: CRITICAL (94%)',
      subtitle: 'Severity rating elevated to HIGH/CRITICAL due to active EHR patient record traversal',
      status: 'HIGH RISK',
      icon: AlertTriangle,
      color: 'text-amber-400 border-amber-500/50 bg-amber-950/20'
    },
    {
      time: '10:42:40',
      title: 'DEVICE ISOLATED',
      subtitle: 'Automated network quarantine command dispatched: ADMIN-PC-07 port blocked',
      status: 'ACTION TAKEN',
      icon: Lock,
      color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20'
    },
    {
      time: '10:42:42',
      title: 'CONNECTION BLOCKED',
      subtitle: 'Restricted EHR-SERVER-01 microservice session terminated by automated gateway rule',
      status: 'BLOCKED',
      icon: Activity,
      color: 'text-indigo-400 border-indigo-500/50 bg-indigo-950/20'
    },
    {
      time: '10:42:45',
      title: 'EVIDENCE PRESERVED',
      subtitle: '5 forensic audit artifacts hashed and immutably stored in cryptographic evidence ledger',
      status: 'COMPLETE',
      icon: FileCheck,
      color: 'text-sky-400 border-sky-500/50 bg-sky-950/20'
    },
    {
      time: '10:42:47',
      title: 'INCIDENT CONTAINED',
      subtitle: 'HealthShield-X automated containment verified zero patient data loss or breach',
      status: 'CONTAINED',
      icon: CheckCircle2,
      color: 'text-emerald-400 border-emerald-500/60 bg-emerald-900/30'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#111827]/90 border border-[#1e293b] rounded-xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AUTOMATED INCIDENT RESPONSE PIPELINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AUTOMATED RESPONSE TIMELINE</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time automated containment ledger detailing threat identification, AI risk scoring, network quarantine, and forensic preservation.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>AUTOMATED MITIGATION ACTIVE</span>
        </div>
      </div>

      {/* Vertical SOC Timeline */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 sm:p-8 shadow-2xl font-mono relative">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-[#1e293b]">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div key={idx} className="relative flex items-start gap-6 group">
                {/* Timeline node icon */}
                <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Event Card Content */}
                <div className="flex-1 bg-[#161b22] border border-[#1e293b] rounded-xl p-4 space-y-1 shadow-md hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 tracking-wider">{step.time}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 bg-slate-900 text-slate-300 uppercase">
                      {step.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white font-sans">{step.title}</div>
                  <p className="text-xs text-slate-400 font-sans">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
