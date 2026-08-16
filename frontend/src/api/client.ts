import type {
  Incident, SecurityEvent, FECResult, AttackGraphData,
  ControlCatalogItem, ReplayRunResult, AIRecommendation, ActivityLog
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API call failed: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getIncidents: (): Promise<Incident[]> => fetchJson<Incident[]>(`${API_BASE}/incidents`),
  getIncident: (id: string): Promise<Incident> => fetchJson<Incident>(`${API_BASE}/incidents/${id}`),
  getTimeline: (id: string): Promise<SecurityEvent[]> => fetchJson<SecurityEvent[]>(`${API_BASE}/incidents/${id}/timeline`),
  getAttackGraph: (id: string): Promise<AttackGraphData> => fetchJson<AttackGraphData>(`${API_BASE}/incidents/${id}/graph`),
  getEvidence: (id: string) => fetchJson<any[]>(`${API_BASE}/incidents/${id}/evidence`),
  getFEC: (id: string): Promise<FECResult> => fetchJson<FECResult>(`${API_BASE}/incidents/${id}/fec`),
  getControls: (): Promise<ControlCatalogItem[]> => fetchJson<ControlCatalogItem[]>(`${API_BASE}/controls`),
  getAIAnalysis: (id: string): Promise<AIRecommendation> => 
    fetchJson<AIRecommendation>(`${API_BASE}/incidents/${id}/ai-analysis`, { method: 'POST' }),
  triggerReplay: (id: string, controlId: string): Promise<ReplayRunResult> => 
    fetchJson<ReplayRunResult>(`${API_BASE}/incidents/${id}/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ control_id: controlId })
    }),
  getActivityLog: (): Promise<ActivityLog[]> => fetchJson<ActivityLog[]>(`${API_BASE}/activity-log`)
};
