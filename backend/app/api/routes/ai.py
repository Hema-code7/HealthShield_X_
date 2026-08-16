from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import Incident, EvidenceRequirement
from app.security_engine.fec_engine import calculate_fec
from app.security_engine.controls_catalog import match_controls_for_gaps
from app.ai.recommendation_service import generate_ai_recommendation

router = APIRouter()

@router.post("/incidents/{incident_id}/ai-analysis")
def get_ai_analysis(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    reqs = db.query(EvidenceRequirement).filter(EvidenceRequirement.incident_id == incident_id).all()
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

    fec_result = calculate_fec(evidence_list)
    missing_gaps = fec_result["missing_gaps"]
    
    # Identify weak attack stages (< 70% confidence)
    weak_stages = [stage for stage, score in fec_result["stages"].items() if score < 70.0]

    matched_controls = match_controls_for_gaps(missing_gaps)

    return generate_ai_recommendation(
        incident_id=incident_id,
        fec_score=fec_result["overall_fec"],
        missing_gaps=missing_gaps,
        weak_stages=weak_stages,
        available_controls=matched_controls
    )
