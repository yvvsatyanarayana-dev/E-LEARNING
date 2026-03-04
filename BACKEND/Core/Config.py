from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME : str
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool
    ALGORITHM : str
    ACCESS_TOKEN_EXPIRE_MINUTES : int
    EMAIL_HOST : str
    EMAIL_PORT : int
    EMAIL_USER : str
    EMAIL_PASSWORD : str
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()