from typing import List, Union
import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # =========================================================
    # PROJECT
    # =========================================================

    PROJECT_NAME: str = "AgriVision - Smart Agriculture Platform"
    API_V1_STR: str = "/api/v1"

    # =========================================================
    # SECURITY / JWT
    # =========================================================

    SECRET_KEY: str = (
        "agrivision_diploma_super_secure_jwt_secret_key_2026_modern_agritech"
    )

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # =========================================================
    # DATABASE
    # =========================================================

    # Local development uses SQLite.
    # Vercel/Render DATABASE_URL environment variable
    # automatically overrides this value.
    DATABASE_URL: str = "sqlite:///./agrivision.db"

    # =========================================================
    # AI API KEYS
    # =========================================================

    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # =========================================================
    # CORS
    # =========================================================

    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # =========================================================
    # UPLOADS
    # =========================================================

    # Used for local development.
    # Vercel production uses Blob storage.
    UPLOAD_DIR: str = "uploads"

    # =========================================================
    # APPLICATION MODE
    # =========================================================

    DEMO_MODE: bool = True

    # =========================================================
    # ENVIRONMENT CONFIGURATION
    # =========================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # =========================================================
    # CORS VALIDATOR
    # =========================================================

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls,
        value: Union[str, List[str]],
    ) -> List[str]:

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            # JSON list:
            # ["https://site1.com", "https://site2.com"]
            if value.startswith("["):
                return json.loads(value)

            # Comma separated:
            # https://site1.com,https://site2.com
            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        if isinstance(value, list):
            return value

        return []


settings = Settings()