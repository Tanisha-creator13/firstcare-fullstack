from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    database_url: str
    jwt_secret: str
    jwt_expire_hours: int = 24
    frontend_origin: str = "http://localhost:5173"
    environment: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
