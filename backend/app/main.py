from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.seeds import seed_database
from app.api.routes import incidents, evidence, controls, replay, ai, datasets, auth_routes, patients

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed database on startup
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Deterministic Healthcare Cybersecurity Investigation & Defense Validation Platform API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes under API_V1_STR (/api/v1) and root /api
app.include_router(incidents.router, prefix=settings.API_V1_STR, tags=["incidents"])
app.include_router(evidence.router, prefix=settings.API_V1_STR, tags=["evidence"])
app.include_router(controls.router, prefix=settings.API_V1_STR, tags=["controls"])
app.include_router(replay.router, prefix=settings.API_V1_STR, tags=["replay"])
app.include_router(ai.router, prefix=settings.API_V1_STR, tags=["ai"])
app.include_router(datasets.router, prefix=settings.API_V1_STR, tags=["datasets"])
app.include_router(auth_routes.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(patients.router, prefix=settings.API_V1_STR, tags=["patients"])

# Direct legacy / fallback aliases for root endpoints
app.include_router(incidents.router, prefix="/api", tags=["incidents-legacy"])
app.include_router(evidence.router, prefix="/api", tags=["evidence-legacy"])
app.include_router(controls.router, prefix="/api", tags=["controls-legacy"])
app.include_router(replay.router, prefix="/api", tags=["replay-legacy"])
app.include_router(ai.router, prefix="/api", tags=["ai-legacy"])
app.include_router(datasets.router, prefix="/api", tags=["datasets-legacy"])
app.include_router(auth_routes.router, prefix="/api", tags=["auth-legacy"])
app.include_router(patients.router, prefix="/api", tags=["patients-legacy"])

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "version": "2.0.0",
        "docs": "/docs",
        "architecture": "Deterministic-First Security Engine + Isolated AI Defense Recommendation Service"
    }
