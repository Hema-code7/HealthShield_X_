from typing import Dict, Any, List

CONTROLS_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "CTRL-001",
        "name": "Endpoint Monitoring",
        "category": "Continuous Monitoring",
        "nist_function": "DETECT",
        "nist_control": "DE.CM-01 (Host-Based Telemetry & Process Tracking)",
        "addresses_gap": "endpoint_telemetry",
        "priority": "HIGH",
        "description": "Deploys agent-based process execution logging and command-line audit telemetry on workstations and endpoints within the Shadow Hospital environment.",
        "expected_benefit": "Restores full visibility into local workstation execution and lateral movement stages, increasing FEC by +24 percentage points."
    },
    {
        "id": "CTRL-002",
        "name": "Enhanced Identity Authentication Logging",
        "category": "Identity Management",
        "nist_function": "PROTECT",
        "nist_control": "PR.AA-01 (Identity & Access Verification)",
        "addresses_gap": "identity_visibility",
        "priority": "MEDIUM",
        "description": "Enforces detailed MFA challenge logging, kerberos ticket issuance tracing, and session token audits.",
        "expected_benefit": "Improves forensic certainty during initial access and credential abuse investigations."
    },
    {
        "id": "CTRL-003",
        "name": "Full-Packet Network Flow Telemetry",
        "category": "Network Monitoring",
        "nist_function": "DETECT",
        "nist_control": "DE.CM-07 (Network Security Monitoring)",
        "addresses_gap": "network_visibility",
        "priority": "MEDIUM",
        "description": "Captures netflow metadata, packet headers, and internal VLAN traffic across hospital subnet boundaries.",
        "expected_benefit": "Closes internal network traversal gaps between workstations and backend hospital microservices."
    },
    {
        "id": "CTRL-004",
        "name": "Database Audit Logging",
        "category": "Data Security",
        "nist_function": "PROTECT",
        "nist_control": "PR.DS-02 (Data-at-Rest & In-Transit Auditing)",
        "addresses_gap": "database_visibility",
        "priority": "HIGH",
        "description": "Logs all SQL query statements, affected rows, schema mutations, and database user sessions for Patient DB.",
        "expected_benefit": "Ensures complete accountability for PHI (Protected Health Information) data queries."
    },
    {
        "id": "CTRL-005",
        "name": "File Access Integrity Monitoring (FIM)",
        "category": "Data Security",
        "nist_function": "PROTECT",
        "nist_control": "PR.DS-06 (Integrity & Exfiltration Detection)",
        "addresses_gap": "file_visibility",
        "priority": "LOW",
        "description": "Monitors file creation, export, encryption, and deletion events on sensitive medical file stores.",
        "expected_benefit": "Provides conclusive proof during ransomware or exfiltration attempts."
    }
]

def get_control_by_id(control_id: str) -> Dict[str, Any] | None:
    for ctrl in CONTROLS_CATALOG:
        if ctrl["id"] == control_id:
            return ctrl
    return None

def match_controls_for_gaps(missing_gaps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    matched = []
    gap_domains = [g.get("domain", "").lower() for g in missing_gaps]
    
    for ctrl in CONTROLS_CATALOG:
        gap_target = ctrl["addresses_gap"].lower()
        if any(d in gap_target for d in gap_domains) or ("endpoint" in gap_domains and "endpoint" in gap_target):
            matched.append(ctrl)
            
    if not matched:
        # Default fallback to Endpoint Monitoring if endpoint evidence is missing
        matched.append(CONTROLS_CATALOG[0])
        
    return matched
