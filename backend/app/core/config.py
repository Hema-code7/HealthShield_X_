import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "HealthShield-X 2.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./healthshield.db")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

settings = Settings()
