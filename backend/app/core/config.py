from typing import List, Union
import json

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # PROJECT
    PROJECT_NAME: str = "AgriVision - Smart Agriculture Platform"
    API_V1_STR: str = "/api/v1"

    # SECURITY / JWT
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # DATABASE
    DATABASE_URL: str = "sqlite:///./agrivision.db"

    # AI CONFIGURATION
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # GOOGLE OAUTH
    GOOGLE_CLIENT_ID: str = ""

    # EMAIL / PASSWORD RESET
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@agrivision.com"
    EMAILS_FROM_NAME: str = "AgriVision Support"

    # SMS / OTP
    SMS_PROVIDER: str = "mock"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_RATE_LIMIT_PER_HOUR: int = 5
    OTP_SECRET_KEY: str = Field(min_length=32)
    REQUIRE_PHONE_VERIFICATION: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # UPLOADS
    UPLOAD_DIR: str = "uploads"

    # APPLICATION MODE
    DEMO_MODE: bool = True

    # ENVIRONMENT CONFIGURATION
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # CORS VALIDATOR
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls,
        value: Union[str, List[str]],
    ) -> List[str]:
        if isinstance(value, list):
            return value

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            if value.startswith("["):
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [
                            str(origin).strip()
                            for origin in parsed
                            if str(origin).strip()
                        ]
                except json.JSONDecodeError:
                    pass

            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        return []


settings = Settings()