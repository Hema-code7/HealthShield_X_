import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import AuditLog

router = APIRouter()

class ClinicalActivity(BaseModel):
    timestamp: str
    activity: str
    clinician: str
    status: str

class RecordAccessLog(BaseModel):
    timestamp: str
    user: str
    action: str
    status: str

class Patient(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    blood_group: str
    dob: str
    diagnosis: str
    allergies: List[str]
    medications: List[str]
    doctor: str
    department: str
    admission_date: str
    discharge_date: Optional[str] = None
    status: str
    room: str
    recent_clinical_activity: List[ClinicalActivity]
    access_history: List[RecordAccessLog]

SYNTHETIC_PATIENTS: List[Patient] = [
    Patient(
        id="PT-1001",
        name="Eleanor Vance",
        age=54,
        gender="Female",
        blood_group="A+",
        dob="1972-04-12",
        diagnosis="Acute Coronary Syndrome & Hypertensive Heart Disease",
        allergies=["Penicillin", "NSAIDs"],
        medications=["Lisinopril 10mg QD", "Atorvastatin 40mg QD", "Aspirin 81mg QD"],
        doctor="Dr. Sarah Lin, MD",
        department="Cardiology",
        admission_date="2026-08-10",
        discharge_date=None,
        status="Admitted (Active)",
        room="Ward 4B - Bed 12",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="10:15:00", activity="12-Lead ECG recorded - Normal sinus rhythm", clinician="Nurse M. Davis, RN", status="Completed"),
            ClinicalActivity(timestamp="08:30:00", activity="Troponin I lab panel drawn", clinician="Lab Tech R. Patel", status="Normal (0.01 ng/mL)"),
            ClinicalActivity(timestamp="07:00:00", activity="Morning cardiac medication administered", clinician="Nurse M. Davis, RN", status="Verified")
        ],
        access_history=[
            RecordAccessLog(timestamp="10:32:15", user="doctor_demo", action="VIEW_PATIENT_RECORD", status="Authorized"),
            RecordAccessLog(timestamp="08:29:40", user="investigator@gmail.com", action="VIEW_PATIENT_RECORD", status="Authorized")
        ]
    ),
    Patient(
        id="PT-1002",
        name="Marcus Thorne",
        age=68,
        gender="Male",
        blood_group="O+",
        dob="1958-09-24",
        diagnosis="Type 2 Diabetes Mellitus with Diabetic Nephropathy",
        allergies=["Sulfa drugs"],
        medications=["Metformin 1000mg BID", "Insulin Glargine 20u QHS", "Empagliflozin 10mg QD"],
        doctor="Dr. Robert Chen, MD",
        department="Endocrinology",
        admission_date="2026-08-12",
        discharge_date=None,
        status="Admitted (Active)",
        room="Ward 2A - Bed 04",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="09:45:00", activity="Fasting blood glucose 132 mg/dL", clinician="Nurse J. Miller, RN", status="Recorded"),
            ClinicalActivity(timestamp="07:15:00", activity="Hemoglobin A1c result: 7.8%", clinician="Central Lab", status="Updated")
        ],
        access_history=[
            RecordAccessLog(timestamp="09:46:12", user="doctor_demo", action="VIEW_PATIENT_RECORD", status="Authorized")
        ]
    ),
    Patient(
        id="PT-1003",
        name="Sophia Rodriguez",
        age=32,
        gender="Female",
        blood_group="B-",
        dob="1994-11-03",
        diagnosis="Acute Appendicitis - Post-Laparoscopic Appendectomy",
        allergies=["Latex"],
        medications=["Cefazolin 1g IV Q8H", "Acetaminophen 1000mg IV PRN", "Normal Saline 100ml/hr"],
        doctor="Dr. James Aris, MD",
        department="General Surgery",
        admission_date="2026-08-14",
        discharge_date=None,
        status="Post-Operative Recovery",
        room="Surgical ICU - Bed 02",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="10:00:00", activity="Vitals checked: BP 118/74, HR 72, Temp 98.6F", clinician="Nurse K. Adams, RN", status="Stable"),
            ClinicalActivity(timestamp="06:30:00", activity="Post-op surgical wound inspection", clinician="Dr. James Aris, MD", status="Clean / Healing")
        ],
        access_history=[
            RecordAccessLog(timestamp="10:01:10", user="doctor_demo", action="VIEW_PATIENT_RECORD", status="Authorized")
        ]
    ),
    Patient(
        id="PT-1004",
        name="Arthur Pendelton",
        age=79,
        gender="Male",
        blood_group="AB+",
        dob="1947-01-30",
        diagnosis="Severe Acute Exacerbation of COPD & Pneumonia",
        allergies=["Codeine", "Erythromycin"],
        medications=["Azithromycin 500mg IV", "Prednisone 40mg PO", "Albuterol/Ipratropium Nebulizer Q4H"],
        doctor="Dr. Elena Rostova, MD",
        department="Pulmonology",
        admission_date="2026-08-08",
        discharge_date=None,
        status="Critical Care",
        room="Medical ICU - Bed 06",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="10:20:00", activity="Arterial Blood Gas (ABG) drawn", clinician="Resp Tech B. Hayes", status="PaO2 88, PaCO2 42"),
            ClinicalActivity(timestamp="08:00:00", activity="Supplemental Oxygen adjusted to 3L nasal cannula", clinician="Nurse D. Walsh, RN", status="Active")
        ],
        access_history=[
            RecordAccessLog(timestamp="08:05:22", user="investigator@gmail.com", action="VIEW_PATIENT_RECORD", status="Authorized")
        ]
    ),
    Patient(
        id="PT-1005",
        name="Clara Oswald",
        age=29,
        gender="Female",
        blood_group="O-",
        dob="1997-06-18",
        diagnosis="Complicated Pyelonephritis & Mild Sepsis",
        allergies=["Ciprofloxacin"],
        medications=["Ceftriaxone 2g IV QD", "IV Fluids 0.9% NaCl 125ml/hr", "Ondansetron 4mg IV PRN"],
        doctor="Dr. Michael Chang, MD",
        department="Internal Medicine",
        admission_date="2026-08-13",
        discharge_date=None,
        status="Admitted (Active)",
        room="Ward 3C - Bed 19",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="09:10:00", activity="Blood culture result: Escherichia coli (Pan-sensitive)", clinician="Microbiology Lab", status="Finalized"),
            ClinicalActivity(timestamp="07:30:00", activity="Afebrile status confirmed - Temp 98.4F", clinician="Nurse C. White, RN", status="Stable")
        ],
        access_history=[
            RecordAccessLog(timestamp="09:12:05", user="doctor_demo", action="VIEW_PATIENT_RECORD", status="Authorized")
        ]
    ),
    Patient(
        id="PT-1006",
        name="David Harrison",
        age=45,
        gender="Male",
        blood_group="A-",
        dob="1981-08-05",
        diagnosis="Lumbar Disc Herniation L4-L5 with Radiculopathy",
        allergies=["None Known"],
        medications=["Gabapentin 300mg TID", "Naproxen 500mg BID", "Cyclobenzaprine 10mg PRN"],
        doctor="Dr. Rachel Kim, MD",
        department="Orthopedics",
        admission_date="2026-08-01",
        discharge_date="2026-08-05",
        status="Discharged",
        room="Outpatient Follow-up",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="08:00:00", activity="Physical therapy home care plan transmitted", clinician="PT T. Brooks", status="Completed")
        ],
        access_history=[]
    ),
    Patient(
        id="PT-1007",
        name="Nora Sterling",
        age=62,
        gender="Female",
        blood_group="B+",
        dob="1964-03-21",
        diagnosis="Invasive Ductal Carcinoma - Post-Chemotherapy Cycle 3",
        allergies=["Taxol (Mild Rash)"],
        medications=["Filgrastim 300mcg SQ", "Prochlorperazine 10mg PO PRN", "Dexamethasone 4mg PO"],
        doctor="Dr. Alexander Vance, MD",
        department="Oncology",
        admission_date="2026-08-15",
        discharge_date=None,
        status="Day Oncology Unit",
        room="Infusion Suite 08",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="10:30:00", activity="CBC with differential: ANC 2.4 x10^3/uL", clinician="Hematology Lab", status="Normal Range")
        ],
        access_history=[]
    ),
    Patient(
        id="PT-1008",
        name="Benjamin Hayes",
        age=41,
        gender="Male",
        blood_group="O+",
        dob="1985-12-14",
        diagnosis="Traumatic Right Femur Fracture - Post Orif Surgery",
        allergies=["Morphine (Nausea)"],
        medications=["Hydromorphone 1mg IV PRN", "Enoxaparin 40mg SQ QD", "Cefazolin 1g IV"],
        doctor="Dr. Rachel Kim, MD",
        department="Orthopedics",
        admission_date="2026-08-11",
        discharge_date=None,
        status="Admitted (Active)",
        room="Ward 5A - Bed 01",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="09:00:00", activity="Post-op X-ray right femur: Hardware alignment excellent", clinician="Radiology", status="Verified")
        ],
        access_history=[]
    ),
    Patient(
        id="PT-1009",
        name="Hannah Abbott",
        age=23,
        gender="Female",
        blood_group="A+",
        dob="2003-09-09",
        diagnosis="Moderate Persistent Asthma Exacerbation",
        allergies=["Dust Mites", "Peanuts"],
        medications=["Budesonide/Formoterol 160/4.5 Turbuhaler", "Prednisolone 30mg PO"],
        doctor="Dr. Elena Rostova, MD",
        department="Pulmonology",
        admission_date="2026-08-14",
        discharge_date="2026-08-15",
        status="Discharged",
        room="Outpatient Clinic",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="08:30:00", activity="Peak Expiratory Flow Rate: 420 L/min (92% predicted)", clinician="Resp Tech B. Hayes", status="Normal")
        ],
        access_history=[]
    ),
    Patient(
        id="PT-1010",
        name="Vikram Patel",
        age=71,
        gender="Male",
        blood_group="AB-",
        dob="1955-05-17",
        diagnosis="Ischemic Stroke - Left Middle Cerebral Artery Territory",
        allergies=["Aspirin (GI Bleed)"],
        medications=["Clopidogrel 75mg QD", "Atorvastatin 80mg QD", "Amlodipine 5mg QD"],
        doctor="Dr. Leonard McCoy, MD",
        department="Neurology",
        admission_date="2026-08-09",
        discharge_date=None,
        status="Critical Care",
        room="Neuro ICU - Bed 03",
        recent_clinical_activity=[
            ClinicalActivity(timestamp="10:10:00", activity="NIH Stroke Scale assessment: Score 4 (Mild)", clinician="Dr. Leonard McCoy, MD", status="Improving"),
            ClinicalActivity(timestamp="07:45:00", activity="Brain MRI T2/FLAIR diffusion scan completed", clinician="Neuroradiology", status="Stabilized")
        ],
        access_history=[]
    )
]

@router.get("/patients")
def get_all_patients():
    total_patients = len(SYNTHETIC_PATIENTS)
    active_admissions = len([p for p in SYNTHETIC_PATIENTS if "Admitted" in p.status or "Care" in p.status or "Recovery" in p.status])
    critical_patients = len([p for p in SYNTHETIC_PATIENTS if "Critical" in p.status])
    recently_updated = len([p for p in SYNTHETIC_PATIENTS if len(p.recent_clinical_activity) > 0])

    return {
        "summary": {
            "total_patients": total_patients,
            "active_admissions": active_admissions,
            "critical_patients": critical_patients,
            "recently_updated": recently_updated
        },
        "patients": [p.dict() for p in SYNTHETIC_PATIENTS]
    }

@router.get("/patients/{patient_id}")
def get_patient_by_id(patient_id: str):
    patient = next((p for p in SYNTHETIC_PATIENTS if p.id.upper() == patient_id.upper()), None)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient record {patient_id} not found.")
    return patient.dict()

class PatientAuditPayload(BaseModel):
    user: str = "doctor_demo"
    action: str = "VIEW_PATIENT_RECORD"
    status: str = "Authorized"

@router.post("/patients/{patient_id}/access-audit")
def audit_patient_record_access(patient_id: str, payload: PatientAuditPayload, db: Session = Depends(get_db)):
    patient = next((p for p in SYNTHETIC_PATIENTS if p.id.upper() == patient_id.upper()), None)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient record {patient_id} not found.")

    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    # Append access log to synthetic patient access history
    patient.access_history.insert(0, RecordAccessLog(
        timestamp=timestamp,
        user=payload.user,
        action=payload.action,
        status=payload.status
    ))

    # Also log to main security AuditLog database table
    audit = AuditLog(
        timestamp=timestamp,
        user=payload.user,
        action=f"PATIENT_RECORD_ACCESSED: {patient_id}",
        incident_id="",
        details=f"Authorized record access for patient {patient.name} ({patient_id}). Status: {payload.status}"
    )
    db.add(audit)
    db.commit()

    return {
        "recorded": True,
        "patient_id": patient_id,
        "timestamp": timestamp,
        "status": payload.status
    }
