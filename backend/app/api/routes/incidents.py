from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
import datetime
from app.api.deps import get_db
from app.db.models import Incident, SecurityEvent, AttackNode, AttackEdge, AuditLog
from app.security_engine.attack_graph import build_attack_graph
from app.security_engine.normalizer import normalize_event
from app.security_engine.dna_engine import generate_attack_dna

router = APIRouter()

class LogIngestPayload(BaseModel):
    incident_id: str = "INC-0241"
    source_type: str = "FIREWALL" # FIREWALL, AD, EDR, APP, DATABASE
    raw_logs: List[Dict[str, Any]] = []

@router.get("/incidents")
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    result = []
    for inc in incidents:
        open_gaps = len([e for e in inc.evidence_requirements if not e.available])
        result.append({
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "start_time": inc.start_time,
            "end_time": inc.end_time,
            "fec_score": inc.fec_score,
            "summary": inc.summary,
            "open_gaps_count": open_gaps,
            "created_at": inc.created_at.isoformat() if inc.created_at else None
        })
    return result

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    open_gaps = [
        {"domain": e.evidence_domain, "stage": e.attack_stage, "weight": e.weight}
        for e in inc.evidence_requirements if not e.available
    ]

    return {
        "id": inc.id,
        "title": inc.title,
        "severity": inc.severity,
        "status": inc.status,
        "start_time": inc.start_time,
        "end_time": inc.end_time,
        "fec_score": inc.fec_score,
        "summary": inc.summary,
        "open_gaps": open_gaps
    }

@router.get("/incidents/{incident_id}/timeline")
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    events = db.query(SecurityEvent).filter(SecurityEvent.incident_id == incident_id).all()
    return [
        {
            "id": evt.id,
            "timestamp": evt.timestamp,
            "source_ip": evt.source_ip,
            "destination_ip": evt.destination_ip,
            "source_port": evt.source_port,
            "destination_port": evt.destination_port,
            "protocol": evt.protocol,
            "event_type": evt.event_type,
            "source_entity": evt.source_entity,
            "destination_entity": evt.destination_entity,
            "user": evt.user,
            "application": evt.application,
            "attack_stage": evt.attack_stage,
            "evidence_domain": evt.evidence_domain,
            "evidence_status": evt.evidence_status,
            "confidence": evt.confidence,
            "raw_reference": evt.raw_reference
        }
        for evt in events
    ]

@router.get("/incidents/{incident_id}/graph")
def get_incident_attack_graph(incident_id: str, db: Session = Depends(get_db)):
    nodes = db.query(AttackNode).filter(AttackNode.incident_id == incident_id).all()
    edges = db.query(AttackEdge).filter(AttackEdge.incident_id == incident_id).all()

    nodes_dict = [
        {
            "id": n.id,
            "label": n.label,
            "node_type": n.node_type,
            "ip": n.ip,
            "risk_state": n.risk_state,
            "evidence_count": n.evidence_count,
            "missing_evidence": n.missing_evidence
        }
        for n in nodes
    ]

    edges_dict = [
        {
            "id": e.id,
            "source": e.source,
            "target": e.target,
            "relationship_label": e.relationship_label,
            "supporting_events": e.supporting_events
        }
        for e in edges
    ]

    return build_attack_graph(nodes_dict, edges_dict)

@router.get("/incidents/{incident_id}/dna")
def get_incident_attack_dna(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    events_raw = db.query(SecurityEvent).filter(SecurityEvent.incident_id == incident_id).all()
    events_dict = [{"event_type": e.event_type, "attack_stage": e.attack_stage} for e in events_raw]
    
    missing_gaps = [
        {"domain": e.evidence_domain, "stage": e.attack_stage, "weight": e.weight}
        for e in inc.evidence_requirements if not e.available
    ]

    return generate_attack_dna(incident_id, inc.fec_score, events_dict, missing_gaps)

@router.post("/incidents/ingest")
def ingest_multi_source_logs(payload: LogIngestPayload, db: Session = Depends(get_db)):
    normalized_count = 0
    ingested_events = []

    for raw in payload.raw_logs:
        evt_id = f"EVT-{uuid.uuid4().hex[:4].upper()}"
        norm = normalize_event(raw, payload.incident_id, evt_id)
        
        db_event = SecurityEvent(
            id=norm.id,
            incident_id=norm.incident_id,
            timestamp=norm.timestamp,
            source_ip=norm.source_ip,
            destination_ip=norm.destination_ip,
            source_port=norm.source_port,
            destination_port=norm.destination_port,
            protocol=norm.protocol,
            event_type=norm.event_type,
            source_entity=norm.source_entity,
            destination_entity=norm.destination_entity,
            user=norm.user,
            application=norm.application,
            attack_stage=norm.attack_stage,
            evidence_domain=norm.evidence_domain,
            evidence_status=norm.evidence_status,
            confidence=norm.confidence,
            raw_reference=norm.raw_reference
        )
        db.add(db_event)
        ingested_events.append(norm.id)
        normalized_count += 1

    audit = AuditLog(
        timestamp=datetime.datetime.utcnow().strftime("%H:%M:%S"),
        user="ingestion_pipeline",
        action="LOGS_NORMALIZED",
        incident_id=payload.incident_id,
        details=f"Ingested & normalized {normalized_count} raw logs from source {payload.source_type}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "source_type": payload.source_type,
        "normalized_count": normalized_count,
        "events_created": ingested_events
    }

@router.get("/activity-log")
def get_activity_log(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(10).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp,
            "user": l.user,
            "action": l.action,
            "incident_id": l.incident_id,
            "details": l.details
        }
        for l in logs
    ]
