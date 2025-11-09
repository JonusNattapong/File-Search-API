import os
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()


class Settings(BaseModel):
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    upload_dir: str = "uploads"
    allowed_extensions: List[str] = [".pdf", ".txt", ".md"]
    max_wait_time: int = 120  # for file processing if needed


settings = Settings()
