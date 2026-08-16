from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import EvidenceRequirement, ReplayRun, AuditLog
from app.security_engine.replay_engine import run_controlled_replay

router = APIRouter()

class ReplayRequest(BaseModel):
    control_id: str = "CTRL-001"

@router.post("/incidents/{incident_id}/replay")
def trigger_replay(incident_id: str, payload: ReplayRequest, db: Session = Depends(get_db)):
    reqs = db.query(EvidenceRequirement).filter(EvidenceRequirement.incident_id == incident_id).all()
    if not reqs:
        raise HTTPException(status_code=404, detail="Incident not found")

    baseline_evidence = [
        {
            "evidence_domain": r.evidence_domain,
            "attack_stage": r.attack_stage,
            "weight": r.weight,
            "required": r.required,
            "available": r.available
        }
        for r in reqs
    ]

    result = run_controlled_replay(incident_id, payload.control_id, baseline_evidence)

    # Persist ReplayRun into database
    replay_record = ReplayRun(
        id=result["replay_id"],
        incident_id=incident_id,
        scenario_name=f"Controlled Retest ({incident_id})",
        control_id=payload.control_id,
        control_name=result["control_name"],
        before_fec=result["before_fec"],
        after_fec=result["after_fec"],
        improvement=result["improvement"],
        status="COMPLETED"
    )
    db.add(replay_record)

    # Audit log entry
    audit = AuditLog(
        timestamp=result["timestamp"][11:19],
        user="investigator@hospital-demo.org",
        action="CONTROL_REPLAY_EXECUTED",
        incident_id=incident_id,
        details=f"Replay {result['replay_id']} executed with control {payload.control_id} ({result['control_name']}). FEC: {result['before_fec']}% → {result['after_fec']}% (+{result['improvement']} pts)."
    )
    db.add(audit)

    db.commit()
    return result

@router.get("/replays/{replay_id}")
def get_replay_run(replay_id: str, db: Session = Depends(get_db)):
    run = db.query(ReplayRun).filter(ReplayRun.id == replay_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Replay run not found")
    return {
        "id": run.id,
        "incident_id": run.incident_id,
        "scenario_name": run.scenario_name,
        "control_id": run.control_id,
        "control_name": run.control_name,
        "before_fec": run.before_fec,
        "after_fec": run.after_fec,
        "improvement": run.improvement,
        "status": run.status,
        "created_at": run.created_at.isoformat() if run.created_at else None
    }
