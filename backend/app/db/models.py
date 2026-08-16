import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True) # e.g. INC-0241
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False) # HIGH, MEDIUM, LOW
    status = Column(String, nullable=False) # INVESTIGATING, RESOLVED, EVIDENCE_GAP
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    fec_score = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    events = relationship("SecurityEvent", back_populates="incident", cascade="all, delete-orphan")
    evidence_requirements = relationship("EvidenceRequirement", back_populates="incident", cascade="all, delete-orphan")
    nodes = relationship("AttackNode", back_populates="incident", cascade="all, delete-orphan")
    edges = relationship("AttackEdge", back_populates="incident", cascade="all, delete-orphan")
    replay_runs = relationship("ReplayRun", back_populates="incident", cascade="all, delete-orphan")

class SecurityEvent(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True) # e.g. EVT-1821
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    timestamp = Column(String, nullable=False)
    source_ip = Column(String, nullable=False)
    destination_ip = Column(String, nullable=False)
    source_port = Column(Integer, default=0)
    destination_port = Column(Integer, default=0)
    protocol = Column(String, default="TCP")
    event_type = Column(String, nullable=False)
    source_entity = Column(String, nullable=False)
    destination_entity = Column(String, nullable=False)
    user = Column(String, default="system")
    application = Column(String, default="Healthcare App")
    attack_stage = Column(String, nullable=False) # Initial Access, Execution, Lateral Movement, Data Access, Exfiltration
    evidence_domain = Column(String, nullable=False) # Identity, Network, Endpoint, Application, Database, File
    evidence_status = Column(String, default="Verified") # Verified, Missing, Suspicious
    confidence = Column(Float, default=0.95)
    raw_reference = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="events")

class EvidenceRequirement(Base):
    __tablename__ = "evidence_requirements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    evidence_domain = Column(String, nullable=False) # Identity, Network, Endpoint, Application, Database, File
    attack_stage = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    required = Column(Boolean, default=True)
    available = Column(Boolean, default=True)

    incident = relationship("Incident", back_populates="evidence_requirements")

class AttackNode(Base):
    __tablename__ = "attack_nodes"

    id = Column(String, primary_key=True, index=True) # e.g. WORKSTATION-14
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    label = Column(String, nullable=False)
    node_type = Column(String, nullable=False) # Attacker, Workstation, API, Database, FileStore
    ip = Column(String, default="")
    risk_state = Column(String, default="normal") # normal, suspicious, compromised, verified
    evidence_count = Column(Integer, default=0)
    missing_evidence = Column(String, default="")

    incident = relationship("Incident", back_populates="nodes")

class AttackEdge(Base):
    __tablename__ = "attack_edges"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    source = Column(String, nullable=False)
    target = Column(String, nullable=False)
    relationship_label = Column(String, nullable=False) # access, API request, SQL query, transfer
    supporting_events = Column(Text, default="[]") # JSON list of event IDs

    incident = relationship("Incident", back_populates="edges")

class ControlCatalogItem(Base):
    __tablename__ = "controls"

    id = Column(String, primary_key=True, index=True) # CTRL-001
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    nist_function = Column(String, nullable=False)
    nist_control = Column(String, nullable=False)
    addresses_gap = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    description = Column(Text, nullable=False)

class ReplayRun(Base):
    __tablename__ = "replay_runs"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    scenario_name = Column(String, nullable=False)
    control_id = Column(String, nullable=False)
    control_name = Column(String, nullable=False)
    before_fec = Column(Float, nullable=False)
    after_fec = Column(Float, nullable=False)
    improvement = Column(Float, nullable=False)
    status = Column(String, default="COMPLETED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="replay_runs")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String, nullable=False)
    user = Column(String, default="investigator@hospital-demo.org")
    action = Column(String, nullable=False)
    incident_id = Column(String, default="")
    details = Column(Text, default="")
