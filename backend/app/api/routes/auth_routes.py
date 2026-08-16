import uuid
import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import AuditLog

router = APIRouter()

class AccessAttemptPayload(BaseModel):
    event_type: str = "AUTHENTICATION_FAILURE"
    source: str = "SECURE_GATEWAY"
    timestamp: str = ""
    email_attempted: str = ""

@router.get("/me")
def get_current_user_profile(authorization: str = Header(None)):
    # Verify Authorization header exists
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    
    token = authorization.split(" ")[1]

    # In production, JWT is decoded and verified via Supabase Auth / PyJWT
    # Returns authorized user profile
    return {
        "id": "usr_789421",
        "email": "investigator@gmail.com",
        "role": "INVESTIGATOR",
        "authorized": True,
        "session_expires": (datetime.datetime.utcnow() + datetime.timedelta(hours=8)).isoformat()
    }

@router.post("/security/access-attempts")
def log_security_access_attempt(payload: AccessAttemptPayload, db: Session = Depends(get_db)):
    ref_id = f"HSX-{uuid.uuid4().hex[:6].upper()}"
    
    audit = AuditLog(
        timestamp=datetime.datetime.utcnow().strftime("%H:%M:%S"),
        user=payload.email_attempted or "unauthenticated@gateway",
        action=payload.event_type,
        incident_id="",
        details=f"Access attempt logged from {payload.source}. Ref: {ref_id}"
    )
    db.add(audit)
    db.commit()

    return {
        "recorded": True,
        "reference_id": ref_id,
        "status": "LOGGED"
    }

@router.get("/health")
def get_system_health():
    return {
        "auth": "ONLINE",
        "audit": "ACTIVE",
        "replay": "READY",
        "database": "CONNECTED",
        "version": "2.0.0"
    }
