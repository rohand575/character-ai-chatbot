from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ChatRequest(BaseModel):
    character_id: str = Field(..., description="ID of the character to talk to")
    session_id: str = Field(..., description="Client-generated session id for conversation")
    message: str = Field(..., description="User's message")
    reset: bool = Field(False, description="If true, reset conversation first")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatResponse(BaseModel):
    reply: str
    character_id: str
    session_id: str
    history: List[ChatMessage]


class CharacterSummary(BaseModel):
    id: str
    name: str
    description: str


class CharactersListResponse(BaseModel):
    characters: List[CharacterSummary]
