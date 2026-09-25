"""
Central configuration for UNZA Compass backend.
Loads all settings from environment variables (.env file).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # AI Provider (Google Gemini — https://aistudio.google.com/apikey)
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.5-flash"

    # Database
    DATABASE_URL: str = "sqlite:///./unza_compass.db"

    # Admin account (used only by seed.py to create/update the admin user)
    ADMIN_EMAIL: str = "admin@unzacompass.example"
    ADMIN_PASSWORD: str = "ChangeThisPassword123!"

    # Auth
    JWT_SECRET: str = "insecure-dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
