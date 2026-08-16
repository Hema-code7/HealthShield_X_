export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'INVESTIGATING' | 'RESOLVED' | 'EVIDENCE_GAP';

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  start_time: string;
  end_time: string;
  fec_score: number;
  summary: string;
  open_gaps_count?: number;
  created_at?: string;
  open_gaps?: Array<{ domain: string; stage: string; weight: number }>;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: string;
  event_type: string;
  source_entity: string;
  destination_entity: string;
  user: string;
  application: string;
  attack_stage: string;
  evidence_domain: string;
  evidence_status: string;
  confidence: number;
  raw_reference: string;
}

export interface EvidenceRequirement {
  id: number;
  evidence_domain: string;
  attack_stage: string;
  weight: number;
  required: boolean;
  available: boolean;
  status: string;
}

export interface FECResult {
  overall_fec: number;
  stages: Record<string, number>;
  domain_status: Record<string, { required: boolean; available: boolean; weight: number; status: string }>;
  missing_gaps: Array<{ domain: string; impact: string; weight: number }>;
  formula: string;
  provenance_trace: Array<{ conclusion: string; supported_by: string[]; strength: string }>;
}

export interface AttackNodeData {
  id: string;
  label: string;
  node_type: string;
  ip: string;
  risk_state: 'normal' | 'suspicious' | 'compromised' | 'verified';
  evidence_count: number;
  missing_evidence: string;
}

export interface ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: AttackNodeData;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: { relationship_label: string; supporting_events: string[] };
}

export interface AttackGraphData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  summary: {
    total_nodes: number;
    total_edges: number;
    compromised_nodes: string[];
    suspicious_nodes: string[];
  };
}

export interface ControlCatalogItem {
  id: string;
  name: string;
  category: string;
  nist_function: string;
  nist_control: string;
  addresses_gap: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  expected_benefit?: string;
}

export interface ReplayRunResult {
  replay_id: string;
  incident_id: string;
  control_id: string;
  control_name: string;
  before_fec: number;
  after_fec: number;
  improvement: number;
  status: string;
  timestamp: string;
  simulation_steps: Array<{ step: number; status: string; message: string }>;
  stage_comparison: Array<{ stage: string; before_score: number; after_score: number; diff: number }>;
  evidence_before: Record<string, any>;
  evidence_after: Record<string, any>;
}

export interface AIRecommendation {
  incident_id: string;
  fec_score: number;
  recommended_control: ControlCatalogItem;
  priority: string;
  reason: string;
  addresses_gap: string;
  expected_visibility_gains: string[];
  nist_mapping: {
    framework: string;
    function: string;
    category: string;
    control: string;
  };
  why_this_recommendation: string;
}

export interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  incident_id: string;
  details: string;
}

export interface ClinicalActivity {
  timestamp: string;
  activity: string;
  clinician: string;
  status: string;
}

export interface RecordAccessLog {
  timestamp: string;
  user: string;
  action: string;
  status: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  dob: string;
  diagnosis: string;
  allergies: string[];
  medications: string[];
  doctor: string;
  department: string;
  admission_date: string;
  discharge_date?: string | null;
  status: string;
  room: string;
  recent_clinical_activity: ClinicalActivity[];
  access_history: RecordAccessLog[];
}

export interface MedicalDevice {
  id: string;
  name: string;
  type: string;
  status: 'SECURE' | 'WARNING' | 'HIGH_RISK' | 'ISOLATED' | 'CRITICAL';
  risk_score: number;
  last_comm: string;
  vlan: string;
  location: string;
  ip: string;
}

export interface SOCNotification {
  id: string;
  type: 'CRITICAL' | 'AUTOMATED_RESPONSE' | 'FORENSIC_EVENT' | 'INFO';
  timestamp: string;
  title: string;
  description: string;
  read?: boolean;
}

export interface AttackSimulationStep {
  phase: number;
  title: string;
  status: string;
  timestamp: string;
  details: string;
}
