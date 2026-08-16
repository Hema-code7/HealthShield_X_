from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import Incident, EvidenceRequirement
from app.security_engine.fec_engine import calculate_fec

router = APIRouter()

@router.get("/incidents/{incident_id}/evidence")
def get_incident_evidence(incident_id: str, db: Session = Depends(get_db)):
    reqs = db.query(EvidenceRequirement).filter(EvidenceRequirement.incident_id == incident_id).all()
    if not reqs:
        raise HTTPException(status_code=404, detail="Evidence requirements not found")
    
    return [
        {
            "id": r.id,
            "evidence_domain": r.evidence_domain,
            "attack_stage": r.attack_stage,
            "weight": r.weight,
            "required": r.required,
            "available": r.available,
            "status": "Available" if r.available else "Missing"
        }
        for r in reqs
    ]

@router.get("/incidents/{incident_id}/fec")
def get_incident_fec(incident_id: str, db: Session = Depends(get_db)):
    reqs = db.query(EvidenceRequirement).filter(EvidenceRequirement.incident_id == incident_id).all()
    if not reqs:
        raise HTTPException(status_code=404, detail="Incident evidence data not found")
    
    evidence_list = [
        {
            "evidence_domain": r.evidence_domain,
            "attack_stage": r.attack_stage,
            "weight": r.weight,
            "required": r.required,
            "available": r.available
        }
        for r in reqs
    ]

    return calculate_fec(evidence_list)

@router.get("/incidents/{incident_id}/gaps")
def get_incident_gaps(incident_id: str, db: Session = Depends(get_db)):
    reqs = db.query(EvidenceRequirement).filter(EvidenceRequirement.incident_id == incident_id).all()
    missing = [
        {
            "domain": r.evidence_domain,
            "attack_stage": r.attack_stage,
            "weight": r.weight,
            "impact": f"{r.evidence_domain} telemetry missing during {r.attack_stage} stage."
        }
        for r in reqs if not r.available
    ]
    return missing
