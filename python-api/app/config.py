from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    python_internal_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
