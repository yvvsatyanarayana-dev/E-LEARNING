from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME : str
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool
    ALGORITHM : str
    ACCESS_TOKEN_EXPIRE_MINUTES : int
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()