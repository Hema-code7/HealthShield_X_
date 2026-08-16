import React from 'react';
import { Cpu, ShieldCheck, ShieldAlert, Wifi, Lock, Server } from 'lucide-react';
import type { MedicalDevice } from '../types';

interface MedicalDeviceSecurityProps {
  devices: MedicalDevice[];
  onToggleIsolateDevice?: (id: string) => void;
}

export const MedicalDeviceSecurity: React.FC<MedicalDeviceSecurityProps> = ({
  devices,
  onToggleIsolateDevice
}) => {
  const secureCount = devices.filter((d) => d.status === 'SECURE').length;
  const isolatedCount = devices.filter((d) => d.status === 'ISOLATED' || d.status === 'CRITICAL').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#111827]/90 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>MEDICAL IoT & HEALTHCARE INFRASTRUCTURE TELEMETRY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            MEDICAL DEVICE SECURITY
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-sans">
            Real-time isolation controls and continuous security monitoring for ICU monitors, ventilators, infusion pumps, lab servers, and clinical workstations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
            SIMULATED DEVICE TELEMETRY ●
          </span>
        </div>
      </div>

      {/* Summary Metrics (3-Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase">MONITORED DEVICES</div>
            <div className="text-2xl font-bold text-white mt-1">{devices.length} UNITS</div>
          </div>
          <Server className="w-8 h-8 text-indigo-400 opacity-80" />
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase">FULLY PROTECTED</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{secureCount} SECURE</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs uppercase">ISOLATED / CONTAINED</div>
            <div className={`text-2xl font-bold mt-1 ${isolatedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {isolatedCount} ISOLATED
            </div>
          </div>
          <ShieldAlert className={`w-8 h-8 opacity-80 ${isolatedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((dev) => {
          const isIsolated = dev.status === 'ISOLATED' || dev.status === 'CRITICAL';
          const isHighRisk = dev.risk_score >= 70;

          return (
            <div
              key={dev.id}
              className={`bg-[#0d1117]/90 border rounded-xl p-4 space-y-3 font-mono shadow-xl relative transition-all duration-300 ${
                isIsolated
                  ? 'border-rose-500/70 bg-rose-950/20 shadow-rose-950/40'
                  : isHighRisk
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-[#1e293b] hover:border-cyan-500/40'
              }`}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/40" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/40" />

              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    isIsolated ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
                  }`} />
                  <span className="text-sm font-bold text-white tracking-wider">{dev.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  isIsolated
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {dev.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-300 font-sans font-semibold text-sm">{dev.name}</div>
                <div className="text-slate-400 text-[11px]">Type: {dev.type}</div>
                <div className="text-slate-400 text-[11px]">VLAN: <span className="text-slate-200">{dev.vlan}</span></div>
                <div className="text-slate-400 text-[11px]">IP: <span className="text-cyan-400 font-bold">{dev.ip}</span></div>
              </div>

              {/* Risk Gauge Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">RISK SCORE:</span>
                  <span className={`font-bold ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {dev.risk_score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isHighRisk ? 'bg-rose-500' : dev.risk_score > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${dev.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Telemetry info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-[#1e293b]">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-cyan-400" /> {dev.last_comm}
                </span>
                <span>{dev.location}</span>
              </div>

              {/* Isolation Control Action */}
              <button
                onClick={() => onToggleIsolateDevice && onToggleIsolateDevice(dev.id)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isIsolated
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isIsolated ? 'RECONNECT DEVICE' : 'ISOLATE DEVICE'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
