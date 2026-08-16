import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, AlertTriangle, RefreshCw, Search, Eye, 
  Heart, ShieldCheck, Filter
} from 'lucide-react';
import type { Patient } from '../types';
import { PatientProfileModal } from '../components/PatientProfileModal';
import { auth } from '../lib/auth';

export const PatientDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState({
    total_patients: 10,
    active_admissions: 6,
    critical_patients: 2,
    recently_updated: 4
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = auth.getCurrentUser();
  const currentUserEmail = currentUser?.email || 'doctor_demo';

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch('/api/v1/patients');
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients || []);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      } catch {
        console.warn("Using synthetic patients fallback data");
      }
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ADMITTED' && (p.status.includes('Admitted') || p.status.includes('Recovery'))) ||
      (selectedStatus === 'CRITICAL' && p.status.includes('Critical')) ||
      (selectedStatus === 'DISCHARGED' && p.status.includes('Discharged'));

    return matchesSearch && matchesStatus;
  });

  const handleOpenPatient = (p: Patient) => {
    setSelectedPatient(p);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#111827]/85 backdrop-blur-md border border-[#1e293b] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold">
            <Heart className="w-4 h-4 text-indigo-400" /> HEALTHCARE PORTAL · PATIENT MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 font-sans">PATIENT RECORDS & CLINICAL AUDIT</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans">
            Centralized synthetic EHR database. Every record access generates a cryptographic audit trace in the HealthShield-X security event pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>RECORD ACCESS MONITORING ACTIVE</span>
        </div>
      </div>

      {/* Overview Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>TOTAL PATIENTS</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {summary.total_patients}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Synthetic EHR Database</p>
        </div>

        {/* Card 2: Active Admissions */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>ACTIVE ADMISSIONS</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {summary.active_admissions}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">In-patient wards & ICUs</p>
        </div>

        {/* Card 3: Critical Patients */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>CRITICAL PATIENTS</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">
            {summary.critical_patients}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Medical & Neuro ICU</p>
        </div>

        {/* Card 4: Recently Updated */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>RECENTLY UPDATED</span>
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-sky-400">
            {summary.recently_updated}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Labs & ECG completed</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, ID, diagnosis, dept..."
            className="w-full bg-[#161b22] border border-[#1e293b] text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto font-mono text-xs">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          {['ALL', 'ADMITTED', 'CRITICAL', 'DISCHARGED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-[#161b22] text-slate-400 border-[#1e293b] hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Synthetic Patients Table / List */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#161b22] text-slate-400 text-[11px] border-b border-[#1e293b]">
              <tr>
                <th className="p-3">Patient ID & Name</th>
                <th className="p-3">Demographics</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3">Department & Physician</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-[#161b22]/70 transition-colors">
                  <td className="p-3 font-semibold">
                    <div className="text-slate-100 font-sans text-sm">{p.name}</div>
                    <div className="text-indigo-400 text-[11px]">{p.id}</div>
                  </td>

                  <td className="p-3 text-slate-300">
                    <div>{p.age} Yrs · {p.gender}</div>
                    <div className="text-rose-400 font-bold text-[10px]">Blood: {p.blood_group}</div>
                  </td>

                  <td className="p-3 text-slate-300 max-w-xs truncate">
                    <div className="font-sans text-xs">{p.diagnosis}</div>
                    <div className="text-slate-400 text-[10px]">{p.room}</div>
                  </td>

                  <td className="p-3 text-slate-300">
                    <div>{p.doctor}</div>
                    <div className="text-slate-400 text-[10px]">{p.department}</div>
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      p.status.includes('Critical')
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : p.status.includes('Admitted') || p.status.includes('Recovery')
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      ● {p.status}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenPatient(p)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 ml-auto cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW PROFILE</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isModalOpen}
        patient={selectedPatient}
        onClose={() => setIsModalOpen(false)}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
};
