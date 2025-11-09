from typing import List

from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    store_id: str
    model: str = "openai/gpt-oss-20b:free"  # Default model


class UploadResponse(BaseModel):
    success: bool
    store_id: str
    filename: str
    message: str


class ChatResponse(BaseModel):
    success: bool
    answer: str
    filename: str


class StoreInfo(BaseModel):
    store_id: str
    filename: str


class StoresResponse(BaseModel):
    stores: List[StoreInfo]


class DeleteResponse(BaseModel):
    success: bool
    message: str
