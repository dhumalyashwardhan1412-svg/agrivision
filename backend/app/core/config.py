from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriVision - Smart Agriculture Platform"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = (
        "agrivision_diploma_super_secure_jwt_secret_key_2026_modern_agritech"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    DATABASE_URL: str = "sqlite:///./agrivision.db"

    # AI API Keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ]

    UPLOAD_DIR: str = "uploads"
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls,
        v: Union[str, List[str]]
    ) -> List[str]:

        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]

        if isinstance(v, str) and v.startswith("["):
            return json.loads(v)

        if isinstance(v, list):
            return v

        return ["*"]


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)