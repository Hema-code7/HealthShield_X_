import React, { useState } from 'react';
import { 
  FileText, ArrowRight, Layers, Terminal
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { GradientBlinds } from '../components/GradientBlinds';
import { AttackDNABadge } from '../components/AttackDNABadge';
import type { Incident, SecurityEvent } from '../types';

interface IncidentInvestigationProps {
  incident: Incident | null;
  events: SecurityEvent[];
  onNavigateTab: (tab: string) => void;
}

export const IncidentInvestigation: React.FC<IncidentInvestigationProps> = ({
  incident,
  events,
  onNavigateTab
}) => {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  if (!incident) return <div className="p-6 text-slate-400">Select an incident to view investigation details.</div>;

  return (
    <div className="relative min-h-full w-full p-6 space-y-6 max-w-7xl mx-auto overflow-hidden font-sans">
      {/* Full-Page React Bits GradientBlinds WebGL Background for Dashboard 02 */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <GradientBlinds
          gradientColors={['#6366F1', '#38BDF8', '#0F172A']}
          angle={0}
          noise={0.25}
          blindCount={14}
          blindMinWidth={55}
          spotlightRadius={0.6}
          spotlightSoftness={1}
          spotlightOpacity={0.9}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Dark Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-[#0b0f19]/75 backdrop-blur-[1px] pointer-events-none z-1" />

      {/* Main Page Content Layered Above GradientBlinds */}
      <div className="relative z-10 space-y-6">
        {/* Incident Header Card */}
        <div className="bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-slate-100">{incident.id}</span>
              <Badge text={incident.severity} variant={incident.severity.toLowerCase() as any} />
              <Badge text={incident.status} variant={incident.status.toLowerCase() as any} />
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1 font-sans">{incident.title}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">{incident.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('evidence')}
              className="px-3 py-2 rounded-lg bg-[#161b22]/90 border border-[#1e293b] text-slate-200 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <FileText className="w-4 h-4 text-indigo-400" /> EVIDENCE AUDIT
            </button>
            <button
              onClick={() => onNavigateTab('graph')}
              className="px-3 py-2 rounded-lg bg-[#161b22]/90 border border-[#1e293b] text-slate-200 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Layers className="w-4 h-4 text-indigo-400" /> ATTACK GRAPH
            </button>
            <button
              onClick={() => onNavigateTab('replay')}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
            >
              CONTROLLED REPLAY <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline (2 Columns) */}
          <div className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div>
                <h2 className="font-bold text-slate-100 text-sm tracking-wide font-sans">CHRONOLOGICAL ATTACK TIMELINE</h2>
                <p className="text-xs text-slate-400 font-sans">Reconstructed telemetry event flow across attack stages.</p>
              </div>
              <span className="font-mono text-xs text-slate-400 bg-[#161b22]/90 px-3 py-1 rounded border border-[#1e293b]">
                TIME WINDOW: {incident.start_time} - {incident.end_time}
              </span>
            </div>

            {/* Timeline Events List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e293b]">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="relative bg-[#161b22]/90 border border-[#1e293b] hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-[#1a2332]"
                >
                  {/* Node indicator */}
                  <div className="absolute -left-8 top-4 w-4 h-4 rounded-full bg-[#111827] border-2 border-indigo-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b]/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{evt.timestamp}</span>
                      <span className="font-mono text-xs font-semibold text-slate-200 uppercase">{evt.attack_stage}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {evt.event_type}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Source</span>
                      <span className="text-slate-200">{evt.source_entity} ({evt.source_ip})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Destination</span>
                      <span className="text-slate-200">{evt.destination_entity} ({evt.destination_ip})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Domain</span>
                      <span className="text-slate-300">{evt.evidence_domain}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                      <span className="text-emerald-400 font-bold">{(evt.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Metadata & Attack DNA Sidebar (1 Column) */}
          <div className="space-y-6">
            {/* Attack DNA Badge */}
            <AttackDNABadge incidentId={incident.id} />

            <div className="bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 space-y-4 font-mono text-xs shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm tracking-wide font-sans">INCIDENT SUMMARY</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Attack Origin</span>
                  <span className="text-rose-400 font-bold text-sm">198.51.100.42 (EXTERNAL_NET)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Primary Target</span>
                  <span className="text-slate-200 font-bold">Patient DB (10.10.5.100)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Intermediate Hop</span>
                  <span className="text-amber-400 font-bold">WORKSTATION-14 (10.10.2.14)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                  <span className="text-slate-300">15 Minutes</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111827]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 space-y-3 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm tracking-wide font-sans">EVIDENCE COVERAGE</h3>
              <div className="text-3xl font-bold font-mono text-amber-400">72%</div>
              <p className="text-xs text-slate-400 font-sans">
                Endpoint telemetry is unavailable for Workstation-14. Process creation & execution trace cannot be confirmed.
              </p>
              <button
                onClick={() => onNavigateTab('defense')}
                className="w-full mt-2 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-semibold hover:bg-indigo-600/30 transition-colors cursor-pointer uppercase"
              >
                Recommend Security Control
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal Inspector */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-sm font-mono">EVENT #{selectedEvent.id}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Timestamp</span>
                  <span className="text-indigo-400 font-bold">{selectedEvent.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Protocol</span>
                  <span className="text-slate-200">{selectedEvent.protocol}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Source IP</span>
                  <span className="text-slate-200">{selectedEvent.source_ip}:{selectedEvent.source_port}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Destination IP</span>
                  <span className="text-slate-200">{selectedEvent.destination_ip}:{selectedEvent.destination_port}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Raw Reference Log</span>
                <div className="p-3 rounded bg-[#0b0f19] border border-[#1e293b] text-slate-300 font-mono text-[11px] break-all">
                  {selectedEvent.raw_reference}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer font-mono"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
