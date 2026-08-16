import json
import datetime
from sqlalchemy.orm import Session
from app.db.models import (
    Incident, SecurityEvent, EvidenceRequirement,
    AttackNode, AttackEdge, ControlCatalogItem, AuditLog
)
from app.security_engine.controls_catalog import CONTROLS_CATALOG

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Incident).filter(Incident.id == "INC-0241").first():
        return

    # Seed Control Catalog
    for ctrl in CONTROLS_CATALOG:
        if not db.query(ControlCatalogItem).filter(ControlCatalogItem.id == ctrl["id"]).first():
            db.add(ControlCatalogItem(
                id=ctrl["id"],
                name=ctrl["name"],
                category=ctrl["category"],
                nist_function=ctrl["nist_function"],
                nist_control=ctrl["nist_control"],
                addresses_gap=ctrl["addresses_gap"],
                priority=ctrl["priority"],
                description=ctrl["description"]
            ))

    # Seed Incidents
    inc1 = Incident(
        id="INC-0241",
        title="Suspicious Database Access",
        severity="HIGH",
        status="INVESTIGATING",
        start_time="10:32",
        end_time="10:47",
        fec_score=72.0,
        summary="Anomalous database query targeting sensitive patient records following initial access via Workstation-14 and microservice API traversal."
    )

    inc2 = Incident(
        id="INC-0240",
        title="Unauthorized API Token Refresh",
        severity="MEDIUM",
        status="RESOLVED",
        start_time="09:10",
        end_time="09:25",
        fec_score=91.0,
        summary="Repeated JWT refresh token attempts detected from non-hospital IP range; authenticated session revoked."
    )

    inc3 = Incident(
        id="INC-0239",
        title="Exfiltration Signal on Lab Gateway",
        severity="HIGH",
        status="EVIDENCE_GAP",
        start_time="08:05",
        end_time="08:30",
        fec_score=64.0,
        summary="Large outbound data transfer registered on laboratory network gateway without associated authentication logs."
    )

    db.add_all([inc1, inc2, inc3])
    db.commit()

    # Seed Events for INC-0241
    events = [
        SecurityEvent(
            id="EVT-1821",
            incident_id="INC-0241",
            timestamp="10:32:15",
            source_ip="198.51.100.42",
            destination_ip="10.10.1.10",
            source_port=54210,
            destination_port=443,
            protocol="TCP",
            event_type="failed_login",
            source_entity="EXTERNAL_NET",
            destination_entity="WORKSTATION-14",
            user="dr_smith",
            application="Hospital VPN Gateway",
            attack_stage="Initial Access",
            evidence_domain="Identity",
            evidence_status="Verified",
            confidence=0.98,
            raw_reference="VPN Gateway Auth Failure: User 'dr_smith' invalid credentials from 198.51.100.42"
        ),
        SecurityEvent(
            id="EVT-1824",
            incident_id="INC-0241",
            timestamp="10:35:00",
            source_ip="10.10.1.10",
            destination_ip="10.10.2.14",
            source_port=54214,
            destination_port=3389,
            protocol="RDP",
            event_type="successful_authentication",
            source_entity="VPN_POOL",
            destination_entity="WORKSTATION-14",
            user="dr_smith",
            application="Active Directory",
            attack_stage="Initial Access",
            evidence_domain="Identity",
            evidence_status="Verified",
            confidence=0.95,
            raw_reference="AD Event 4624: Successful logon user 'dr_smith' on WORKSTATION-14"
        ),
        SecurityEvent(
            id="EVT-1827",
            incident_id="INC-0241",
            timestamp="10:38:12",
            source_ip="10.10.2.14",
            destination_ip="10.10.4.5",
            source_port=49152,
            destination_port=8080,
            protocol="HTTP/2",
            event_type="api_access",
            source_entity="WORKSTATION-14",
            destination_entity="HOSPITAL-API",
            user="dr_smith",
            application="EHR Microservice API",
            attack_stage="Lateral Movement",
            evidence_domain="Application",
            evidence_status="Verified",
            confidence=0.92,
            raw_reference="HTTP POST /v2/patient/query bearer token issued to WORKSTATION-14"
        ),
        SecurityEvent(
            id="EVT-1830",
            incident_id="INC-0241",
            timestamp="10:41:22",
            source_ip="10.10.4.5",
            destination_ip="10.10.5.100",
            source_port=41200,
            destination_port=5432,
            protocol="TCP",
            event_type="database_query",
            source_entity="HOSPITAL-API",
            destination_entity="PATIENT-DB",
            user="ehr_service_acct",
            application="PostgreSQL PatientDB",
            attack_stage="Data Access",
            evidence_domain="Database",
            evidence_status="Verified",
            confidence=0.99,
            raw_reference="SELECT * FROM patient_records WHERE region='NE' LIMIT 5000;"
        ),
        SecurityEvent(
            id="EVT-1842",
            incident_id="INC-0241",
            timestamp="10:44:05",
            source_ip="10.10.5.100",
            destination_ip="10.10.6.20",
            source_port=5432,
            destination_port=443,
            protocol="HTTPS",
            event_type="file_export",
            source_entity="PATIENT-DB",
            destination_entity="FILE-STORE",
            user="ehr_service_acct",
            application="Medical File Archive",
            attack_stage="Exfiltration",
            evidence_domain="File",
            evidence_status="Verified",
            confidence=0.91,
            raw_reference="EXPORT FILE patient_records_20260816.csv to FILE-STORE"
        )
    ]
    db.add_all(events)

    # Seed Evidence Requirements for INC-0241
    evidence_reqs = [
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="Identity", attack_stage="Initial Access", weight=0.15, required=True, available=True),
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="Network", attack_stage="Lateral Movement", weight=0.20, required=True, available=True),
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="Endpoint", attack_stage="Execution", weight=0.28, required=True, available=False), # MISSING GAP!
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="Application", attack_stage="Lateral Movement", weight=0.15, required=True, available=True),
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="Database", attack_stage="Data Access", weight=0.15, required=True, available=True),
        EvidenceRequirement(incident_id="INC-0241", evidence_domain="File", attack_stage="Exfiltration", weight=0.07, required=True, available=True),
    ]
    db.add_all(evidence_reqs)

    # Seed Attack Graph Nodes for INC-0241
    nodes = [
        AttackNode(id="ATTACKER", incident_id="INC-0241", label="Attacker (External)", node_type="Attacker", ip="198.51.100.42", risk_state="compromised", evidence_count=2, missing_evidence=""),
        AttackNode(id="WORKSTATION-14", incident_id="INC-0241", label="Workstation-14", node_type="Workstation", ip="10.10.2.14", risk_state="suspicious", evidence_count=3, missing_evidence="Endpoint Telemetry"),
        AttackNode(id="HOSPITAL-API", incident_id="INC-0241", label="Hospital EHR API", node_type="API", ip="10.10.4.5", risk_state="normal", evidence_count=4, missing_evidence=""),
        AttackNode(id="PATIENT-DB", incident_id="INC-0241", label="Patient DB", node_type="Database", ip="10.10.5.100", risk_state="compromised", evidence_count=5, missing_evidence=""),
        AttackNode(id="FILE-STORE", incident_id="INC-0241", label="Medical File Store", node_type="FileStore", ip="10.10.6.20", risk_state="normal", evidence_count=2, missing_evidence=""),
    ]
    db.add_all(nodes)

    # Seed Attack Graph Edges for INC-0241
    edges = [
        AttackEdge(id="EDG-001", incident_id="INC-0241", source="ATTACKER", target="WORKSTATION-14", relationship_label="access", supporting_events=json.dumps(["EVT-1821", "EVT-1824"])),
        AttackEdge(id="EDG-002", incident_id="INC-0241", source="WORKSTATION-14", target="HOSPITAL-API", relationship_label="API request", supporting_events=json.dumps(["EVT-1827"])),
        AttackEdge(id="EDG-003", incident_id="INC-0241", source="HOSPITAL-API", target="PATIENT-DB", relationship_label="SQL query", supporting_events=json.dumps(["EVT-1830"])),
        AttackEdge(id="EDG-004", incident_id="INC-0241", source="PATIENT-DB", target="FILE-STORE", relationship_label="transfer", supporting_events=json.dumps(["EVT-1842"])),
    ]
    db.add_all(edges)

    # Audit log entry
    audit = AuditLog(
        timestamp="09:50:00",
        user="investigator@hospital-demo.org",
        action="INCIDENT_RECONSTRUCTED",
        incident_id="INC-0241",
        details="Incident INC-0241 reconstructed from UNSW-NB15 + Shadow Hospital telemetry dataset."
    )
    db.add(audit)

    db.commit()
