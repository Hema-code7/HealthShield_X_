import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SecureGateway } from './pages/SecureGateway';
import { LogoutDashboard } from './pages/LogoutDashboard';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardAccordionBar } from './components/DashboardAccordionBar';
import { SectionTransition } from './components/layout/SectionTransition';

import { CommandCenter } from './pages/CommandCenter';
import { IncidentInvestigation } from './pages/IncidentInvestigation';
import { AttackGraphView } from './pages/AttackGraphView';
import { MedicalDeviceSecurity } from './pages/MedicalDeviceSecurity';
import { IncidentTimelineView } from './pages/IncidentTimelineView';
import { EvidenceForensics } from './pages/EvidenceForensics';
import { HealthShieldAIAssistant } from './pages/HealthShieldAIAssistant';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { SettingsView } from './pages/SettingsView';
import { PatientDashboard } from './pages/PatientDashboard';
import { DefenseArchitect } from './pages/DefenseArchitect';
import { ReplayValidation } from './pages/ReplayValidation';

import GridDistortion from './components/GridDistortion';
import { AttackSimulationModal } from './components/AttackSimulationModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';

import { api } from './api/client';
import { auth, type UnauthorizedErrorPayload } from './lib/auth';
import type { 
  Incident, SecurityEvent, FECResult, AttackGraphData, 
  ControlCatalogItem, AIRecommendation, ActivityLog, 
  MedicalDevice, SOCNotification 
} from './types';

const TAB_ORDER = [
  'command', 'investigation', 'graph', 'devices', 'incidents', 
  'evidence', 'ai-assistant', 'analytics', 'settings', 
  'patient_portal', 'defense', 'replay'
];

export function App() {
  const [viewState, setViewState] = useState<'GATEWAY' | 'CONSOLE' | 'LOGOUT'>('GATEWAY');
  const [activeTab, setActiveTabState] = useState<string>('command');
  const [prevTab, setPrevTab] = useState<string>('command');
  const [isConsoleEntering, setIsConsoleEntering] = useState(false);
  const [isConsoleExiting, setIsConsoleExiting] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-0241');

  // Simulation & Notification Modal state
  const [isAttackSimulationOpen, setIsAttackSimulationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAttackSimulatedActive, setIsAttackSimulatedActive] = useState(true);

  // Global State Synchronization
  const [devices, setDevices] = useState<MedicalDevice[]>([
    { id: 'ICU-MON-01', name: 'ICU Monitor 01', type: 'Patient Monitor', status: 'SECURE', risk_score: 8, last_comm: '12 sec ago', vlan: 'ICU VLAN', location: 'ICU Ward 4A', ip: '10.10.3.11' },
    { id: 'ICU-MON-02', name: 'ICU Monitor 02', type: 'Patient Monitor', status: 'SECURE', risk_score: 5, last_comm: '5 sec ago', vlan: 'ICU VLAN', location: 'ICU Ward 4A', ip: '10.10.3.12' },
    { id: 'VENT-04', name: 'Ventilator Unit 04', type: 'Critical Ventilation', status: 'SECURE', risk_score: 4, last_comm: '8 sec ago', vlan: 'ICU VLAN', location: 'ICU Ward 4B', ip: '10.10.3.40' },
    { id: 'INFUSION-08', name: 'Infusion Pump 08', type: 'Drug Infusion', status: 'SECURE', risk_score: 11, last_comm: '15 sec ago', vlan: 'MedIoT VLAN', location: 'Ward 2C', ip: '10.10.3.88' },
    { id: 'LAB-03', name: 'Lab Analyzer 03', type: 'Blood Chemistry', status: 'SECURE', risk_score: 7, last_comm: '2 sec ago', vlan: 'Lab VLAN', location: 'Central Lab', ip: '10.10.4.30' },
    { id: 'ER-MON-05', name: 'ER Telemetry 05', type: 'Emergency Monitor', status: 'SECURE', risk_score: 6, last_comm: '10 sec ago', vlan: 'ER VLAN', location: 'ER Trauma 01', ip: '10.10.2.55' },
    { id: 'PHARMACY-SRV-02', name: 'Pharmacy Dispenser 02', type: 'Medication Storage', status: 'SECURE', risk_score: 14, last_comm: '4 sec ago', vlan: 'Pharm VLAN', location: 'Pharmacy Main', ip: '10.10.5.22' },
    { id: 'ADMIN-PC-07', name: 'Workstation ADMIN-PC-07', type: 'Admin Workstation', status: 'ISOLATED', risk_score: 94, last_comm: '1 sec ago', vlan: 'Admin VLAN', location: 'Admin Suite 03', ip: '10.10.2.14' }
  ]);

  const [notifications, setNotifications] = useState<SOCNotification[]>([
    { id: 'n1', type: 'CRITICAL', timestamp: '10:42:31', title: 'CRITICAL THREAT DETECTED', description: 'ADMIN-PC-07 generated a high-risk behavioral anomaly (94% Risk Score).' },
    { id: 'n2', type: 'AUTOMATED_RESPONSE', timestamp: '10:42:40', title: 'AUTOMATED RESPONSE EXECUTED', description: 'Device isolation completed for ADMIN-PC-07. Network port quarantined.' },
    { id: 'n3', type: 'FORENSIC_EVENT', timestamp: '10:42:45', title: 'FORENSIC EVIDENCE PRESERVED', description: '5 new evidence artifacts immutably hashed and preserved.' }
  ]);

  // Clean dashboard-to-dashboard tab switching
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setPrevTab(activeTab);
    setActiveTabState(newTab);
  };

  const handleAccessGranted = (targetTab?: string) => {
    if (targetTab) setActiveTabState(targetTab);
    setIsConsoleEntering(true);
    setViewState('CONSOLE');
    setTimeout(() => {
      setIsConsoleEntering(false);
    }, 700);
  };

  const handleLogout = () => {
    setIsConsoleExiting(true);
    setTimeout(() => {
      setIsConsoleExiting(false);
      setViewState('LOGOUT');
    }, 600);
  };

  const handleToggleIsolateDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const newStatus = d.status === 'ISOLATED' || d.status === 'CRITICAL' ? 'SECURE' : 'ISOLATED';
          const newRisk = newStatus === 'ISOLATED' ? 94 : 8;
          return { ...d, status: newStatus, risk_score: newRisk };
        }
        return d;
      })
    );
  };

  const handleSimulationComplete = () => {
    setIsAttackSimulatedActive(true);
    // Update ADMIN-PC-07 to ISOLATED in devices state
    setDevices((prev) =>
      prev.map((d) => (d.id === 'ADMIN-PC-07' ? { ...d, status: 'ISOLATED', risk_score: 94 } : d))
    );

    // Prepend live alert to notifications drawer
    const newNotif: SOCNotification = {
      id: Date.now().toString(),
      type: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      title: 'SIMULATED ATTACK CONTAINED',
      description: 'ADMIN-PC-07 successfully isolated. 94% threat score mitigated automatically.'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleResetDemo = () => {
    setIsAttackSimulatedActive(false);
    setDevices((prev) =>
      prev.map((d) => ({ ...d, status: 'SECURE', risk_score: Math.min(d.risk_score, 14) }))
    );
    setNotifications([]);
  };

  const prevIndex = TAB_ORDER.indexOf(prevTab);
  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const direction = currentIndex >= prevIndex ? 1 : -1;

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-0241',
      title: 'Suspicious Database Access',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      start_time: '10:32',
      end_time: '10:47',
      fec_score: 72.0,
      summary: 'Anomalous database query targeting sensitive patient records following initial access via Workstation-14 and microservice API traversal.'
    },
    {
      id: 'INC-0240',
      title: 'Unauthorized API Token Refresh',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      start_time: '09:10',
      end_time: '09:25',
      fec_score: 91.0,
      summary: 'Repeated JWT refresh token attempts detected from non-hospital IP range.'
    },
    {
      id: 'INC-0239',
      title: 'Exfiltration Signal on Lab Gateway',
      severity: 'HIGH',
      status: 'EVIDENCE_GAP',
      start_time: '08:05',
      end_time: '08:30',
      fec_score: 64.0,
      summary: 'Large outbound data transfer registered on laboratory network gateway.'
    }
  ]);

  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<SecurityEvent[]>([]);
  const [graphData, setGraphData] = useState<AttackGraphData | null>(null);
  const [fecData, setFecData] = useState<FECResult | null>(null);
  const [controls, setControls] = useState<ControlCatalogItem[]>([]);
  const [aiData, setAiData] = useState<AIRecommendation | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // When an unauthorized login attempt occurs, inject structured event into timeline & audit log
  const handleUnauthorizedDetected = (payload: UnauthorizedErrorPayload) => {
    const newEvt: SecurityEvent = {
      id: `EVT-UNAUTH-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: payload.timestamp,
      source_ip: payload.source,
      destination_ip: '10.10.1.1 (Gateway)',
      source_port: 443,
      destination_port: 8443,
      protocol: 'HTTPS/TLS',
      event_type: 'unauthorized_login_attempt',
      source_entity: 'EXTERNAL_PUBLIC_NET',
      destination_entity: 'HEALTHCARE_PORTAL',
      user: payload.account,
      application: 'HealthShield Gateway Auth',
      attack_stage: 'Initial Access (Blocked)',
      evidence_domain: 'Identity',
      evidence_status: 'Verified',
      confidence: 1.0,
      raw_reference: `UNAUTHORIZED_ACCESS_ATTEMPT: Account ${payload.account} Status BLOCKED from ${payload.source}`
    };

    setTimelineEvents((prev) => [newEvt, ...prev]);

    setActivityLogs((prev) => [
      {
        id: Date.now(),
        timestamp: payload.timestamp,
        user: payload.account,
        action: 'UNAUTHORIZED_LOGIN_ATTEMPT',
        incident_id: selectedIncidentId,
        details: `Unauthorized access attempt blocked from ${payload.source}. Audit reference generated.`
      },
      ...prev
    ]);
  };

  useEffect(() => {
    if (auth.isAuthenticated()) {
      setViewState('CONSOLE');
    }
  }, []);

  // Load data from backend API on mount & on incident change
  useEffect(() => {
    async function loadBackendData() {
      try {
        const incList = await api.getIncidents();
        setIncidents(incList);
      } catch {
        console.warn("Using baseline seed state for incidents list");
      }

      try {
        const ctrlList = await api.getControls();
        setControls(ctrlList);
      } catch {
        console.warn("Using baseline seed controls");
      }

      try {
        const logs = await api.getActivityLog();
        setActivityLogs(logs);
      } catch {
        setActivityLogs([
          { id: 1, timestamp: '09:50:00', user: 'investigator@hospital-demo.org', action: 'INCIDENT_RECONSTRUCTED', incident_id: 'INC-0241', details: 'Incident INC-0241 reconstructed' },
          { id: 2, timestamp: '09:46:12', user: 'system', action: 'GAP_IDENTIFIED', incident_id: 'INC-0241', details: 'Endpoint evidence gap identified' }
        ]);
      }
    }
    loadBackendData();
  }, []);

  useEffect(() => {
    async function loadIncidentDetails() {
      try {
        const inc = await api.getIncident(selectedIncidentId);
        setCurrentIncident(inc);
      } catch {
        const fallbackInc = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
        setCurrentIncident(fallbackInc);
      }

      try {
        const events = await api.getTimeline(selectedIncidentId);
        setTimelineEvents(events);
      } catch {
        setTimelineEvents([
          {
            id: 'EVT-1821', timestamp: '10:32:15', source_ip: '198.51.100.42', destination_ip: '10.10.1.10', source_port: 54210, destination_port: 443, protocol: 'TCP',
            event_type: 'failed_login', source_entity: 'EXTERNAL_NET', destination_entity: 'WORKSTATION-14', user: 'dr_smith', application: 'Hospital VPN Gateway',
            attack_stage: 'Initial Access', evidence_domain: 'Identity', evidence_status: 'Verified', confidence: 0.98, raw_reference: 'VPN Auth Failure: User dr_smith'
          },
          {
            id: 'EVT-1824', timestamp: '10:35:00', source_ip: '10.10.1.10', destination_ip: '10.10.2.14', source_port: 54214, destination_port: 3389, protocol: 'RDP',
            event_type: 'successful_authentication', source_entity: 'VPN_POOL', destination_entity: 'WORKSTATION-14', user: 'dr_smith', application: 'Active Directory',
            attack_stage: 'Initial Access', evidence_domain: 'Identity', evidence_status: 'Verified', confidence: 0.95, raw_reference: 'AD Event 4624'
          },
          {
            id: 'EVT-1827', timestamp: '10:38:12', source_ip: '10.10.2.14', destination_ip: '10.10.4.5', source_port: 49152, destination_port: 8080, protocol: 'HTTP/2',
            event_type: 'api_access', source_entity: 'WORKSTATION-14', destination_entity: 'HOSPITAL-API', user: 'dr_smith', application: 'EHR Microservice API',
            attack_stage: 'Lateral Movement', evidence_domain: 'Application', evidence_status: 'Verified', confidence: 0.92, raw_reference: 'HTTP POST /v2/patient/query'
          },
          {
            id: 'EVT-1830', timestamp: '10:41:22', source_ip: '10.10.4.5', destination_ip: '10.10.5.100', source_port: 41200, destination_port: 5432, protocol: 'TCP',
            event_type: 'database_query', source_entity: 'HOSPITAL-API', destination_entity: 'PATIENT-DB', user: 'ehr_service_acct', application: 'PostgreSQL PatientDB',
            attack_stage: 'Data Access', evidence_domain: 'Database', evidence_status: 'Verified', confidence: 0.99, raw_reference: 'SELECT * FROM patient_records'
          },
          {
            id: 'EVT-1842', timestamp: '10:44:05', source_ip: '10.10.5.100', destination_ip: '10.10.6.20', source_port: 5432, destination_port: 443, protocol: 'HTTPS',
            event_type: 'file_export', source_entity: 'PATIENT-DB', destination_entity: 'FILE-STORE', user: 'ehr_service_acct', application: 'Medical File Archive',
            attack_stage: 'Exfiltration', evidence_domain: 'File', evidence_status: 'Verified', confidence: 0.91, raw_reference: 'EXPORT FILE patient_records.csv'
          }
        ]);
      }

      try {
        const graph = await api.getAttackGraph(selectedIncidentId);
        setGraphData(graph);
      } catch {
        setGraphData({
          nodes: [
            { id: 'ATTACKER', type: 'cyberNode', position: { x: 50, y: 150 }, data: { id: 'ATTACKER', label: 'Attacker (External)', node_type: 'Attacker', ip: '198.51.100.42', risk_state: 'compromised', evidence_count: 2, missing_evidence: '' } },
            { id: 'WORKSTATION-14', type: 'cyberNode', position: { x: 280, y: 150 }, data: { id: 'WORKSTATION-14', label: 'Workstation-14', node_type: 'Workstation', ip: '10.10.2.14', risk_state: 'suspicious', evidence_count: 3, missing_evidence: 'Endpoint Telemetry' } },
            { id: 'HOSPITAL-API', type: 'cyberNode', position: { x: 510, y: 150 }, data: { id: 'HOSPITAL-API', label: 'Hospital EHR API', node_type: 'API', ip: '10.10.4.5', risk_state: 'normal', evidence_count: 4, missing_evidence: '' } },
            { id: 'PATIENT-DB', type: 'cyberNode', position: { x: 740, y: 150 }, data: { id: 'PATIENT-DB', label: 'Patient DB', node_type: 'Database', ip: '10.10.5.100', risk_state: 'compromised', evidence_count: 5, missing_evidence: '' } },
            { id: 'FILE-STORE', type: 'cyberNode', position: { x: 970, y: 150 }, data: { id: 'FILE-STORE', label: 'Medical File Store', node_type: 'FileStore', ip: '10.10.6.20', risk_state: 'normal', evidence_count: 2, missing_evidence: '' } },
          ],
          edges: [
            { id: 'EDG-001', source: 'ATTACKER', target: 'WORKSTATION-14', label: 'access', animated: true, style: { stroke: '#ef4444' } },
            { id: 'EDG-002', source: 'WORKSTATION-14', target: 'HOSPITAL-API', label: 'API request', animated: true, style: { stroke: '#6366f1' } },
            { id: 'EDG-003', source: 'HOSPITAL-API', target: 'PATIENT-DB', label: 'SQL query', animated: true, style: { stroke: '#ef4444' } },
            { id: 'EDG-004', source: 'PATIENT-DB', target: 'FILE-STORE', label: 'transfer', animated: true, style: { stroke: '#6366f1' } },
          ],
          summary: { total_nodes: 5, total_edges: 4, compromised_nodes: ['ATTACKER', 'PATIENT-DB'], suspicious_nodes: ['WORKSTATION-14'] }
        });
      }

      try {
        const fec = await api.getFEC(selectedIncidentId);
        setFecData(fec);
      } catch {
        setFecData({
          overall_fec: 72.0,
          stages: { "Initial Access": 92.0, "Execution": 61.0, "Lateral Movement": 48.0, "Data Access": 95.0, "Exfiltration": 76.0 },
          domain_status: {
            "Identity": { required: true, available: true, weight: 0.15, status: "Available" },
            "Network": { required: true, available: true, weight: 0.20, status: "Available" },
            "Endpoint": { required: true, available: false, weight: 0.28, status: "Missing" },
            "Application": { required: true, available: true, weight: 0.15, status: "Available" },
            "Database": { required: true, available: true, weight: 0.15, status: "Available" },
            "File": { required: true, available: true, weight: 0.07, status: "Available" }
          },
          missing_gaps: [{ domain: "Endpoint", impact: "Host process execution logs unavailable", weight: 0.28 }],
          formula: "FEC = sum(weight * availability) / sum(required_weights) * 100",
          provenance_trace: [
            { conclusion: "Initial Access verified", supported_by: ["EVT-1821", "EVT-1824"], strength: "HIGH" },
            { conclusion: "Workstation API Activity verified", supported_by: ["EVT-1827"], strength: "HIGH" },
            { conclusion: "Endpoint process creation unverified", supported_by: [], strength: "MISSING (Endpoint Gap)" },
            { conclusion: "Patient Database query verified", supported_by: ["EVT-1830"], strength: "HIGH" },
            { conclusion: "File export transfer verified", supported_by: ["EVT-1842"], strength: "MEDIUM" }
          ]
        });
      }

      try {
        const ai = await api.getAIAnalysis(selectedIncidentId);
        setAiData(ai);
      } catch {
        setAiData({
          incident_id: selectedIncidentId,
          fec_score: 72.0,
          recommended_control: {
            id: 'CTRL-001',
            name: 'Endpoint Monitoring',
            category: 'Continuous Monitoring',
            nist_function: 'DETECT',
            nist_control: 'DE.CM-01 (Host-Based Telemetry)',
            addresses_gap: 'endpoint_telemetry',
            priority: 'HIGH',
            description: 'Deploys agent-based process execution logging and command-line audit telemetry on workstations and endpoints.'
          },
          priority: 'HIGH',
          reason: 'Endpoint telemetry is absent for affected Workstation-14 during INC-0241.',
          addresses_gap: 'endpoint_telemetry',
          expected_visibility_gains: [
            'Process creation and parent-child execution tracking on Workstation-14',
            'Command-line invocation and powershell script audit logs',
            'Elevation into Execution stage confidence from 61.0% to 94.0%',
            'Elevation into Lateral Movement stage confidence from 48.0% to 91.0%'
          ],
          nist_mapping: { framework: 'NIST CSF 2.0', function: 'DETECT', category: 'Continuous Monitoring', control: 'DE.CM-01' },
          why_this_recommendation: 'Endpoint Monitoring specifically fills the missing endpoint telemetry gap identified by the deterministic FEC engine.'
        });
      }
    }

    loadIncidentDetails();
  }, [selectedIncidentId, incidents]);

  if (viewState === 'GATEWAY') {
    return (
      <SecureGateway
        onAccessGranted={handleAccessGranted}
        onUnauthorizedDetected={handleUnauthorizedDetected}
      />
    );
  }

  if (viewState === 'LOGOUT') {
    return <LogoutDashboard onReEnterGateway={() => setViewState('GATEWAY')} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-slate-100 font-sans overflow-hidden relative">
      {/* ENTER CONSOLE TRANSITION: React Bits GridDistortion WebGL Three.js Shader Overlay */}
      <AnimatePresence>
        {isConsoleEntering && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <GridDistortion
              grid={16}
              mouse={0.25}
              strength={0.3}
              relaxation={0.9}
              imageSrc="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXIT CONSOLE TRANSITION: React Bits GridDistortion WebGL Three.js Shader Overlay */}
      <AnimatePresence>
        {isConsoleExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <GridDistortion
              grid={18}
              mouse={0.3}
              strength={0.35}
              relaxation={0.88}
              imageSrc="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Sidebar (Stable & Fixed) */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar (Stable & Fixed) */}
        <Header
          selectedIncidentId={selectedIncidentId}
          setSelectedIncidentId={setSelectedIncidentId}
          incidents={incidents}
          onLogout={handleLogout}
          onSimulateAttack={() => setIsAttackSimulationOpen(true)}
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          unreadCount={notifications.length}
        />

        {/* Accordion Gallery Dashboard Navigator (Stable & Fixed) */}
        <DashboardAccordionBar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
        />

        {/* Animated Main Dashboard Viewport Container */}
        <main className="flex-1 overflow-y-auto pb-12 relative w-full overflow-x-hidden">
          <SectionTransition animationKey={activeTab} direction={direction}>
              {activeTab === 'command' && (
                <CommandCenter
                  incidents={incidents}
                  onSelectIncident={(id) => {
                    setSelectedIncidentId(id);
                    handleTabChange('investigation');
                  }}
                  activityLogs={activityLogs}
                />
              )}

              {activeTab === 'investigation' && (
                <IncidentInvestigation
                  incident={currentIncident}
                  events={timelineEvents}
                  onNavigateTab={(tab) => handleTabChange(tab)}
                />
              )}

              {activeTab === 'graph' && (
                <AttackGraphView graphData={graphData} />
              )}

              {activeTab === 'devices' && (
                <MedicalDeviceSecurity
                  devices={devices}
                  onToggleIsolateDevice={handleToggleIsolateDevice}
                />
              )}

              {activeTab === 'incidents' && (
                <IncidentTimelineView isSimulatedAttackActive={isAttackSimulatedActive} />
              )}

              {activeTab === 'evidence' && (
                <EvidenceForensics fecData={fecData} />
              )}

              {activeTab === 'ai-assistant' && (
                <HealthShieldAIAssistant
                  devices={devices}
                  isAttackActive={isAttackSimulatedActive}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  onSimulateAttack={() => setIsAttackSimulationOpen(true)}
                  onResetDemo={handleResetDemo}
                />
              )}

              {activeTab === 'patient_portal' && (
                <PatientDashboard />
              )}

              {activeTab === 'defense' && (
                <DefenseArchitect
                  aiData={aiData}
                  onRunReplayNav={() => handleTabChange('replay')}
                />
              )}

              {activeTab === 'replay' && (
                <ReplayValidation
                  selectedIncidentId={selectedIncidentId}
                  controls={controls.length > 0 ? controls : [
                    {
                      id: 'CTRL-001',
                      name: 'Endpoint Monitoring',
                      category: 'Continuous Monitoring',
                      nist_function: 'DETECT',
                      nist_control: 'DE.CM-01',
                      addresses_gap: 'endpoint_telemetry',
                      priority: 'HIGH',
                      description: 'Agent-based process execution logging'
                    }
                  ]}
                />
              )}
          </SectionTransition>
        </main>
      </div>

      {/* 9-Phase Cinematic Cyber Attack Simulation Modal */}
      <AttackSimulationModal
        isOpen={isAttackSimulationOpen}
        onClose={() => setIsAttackSimulationOpen(false)}
        onSimulationComplete={handleSimulationComplete}
      />

      {/* SOC Live Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
      />
    </div>
  );
}
