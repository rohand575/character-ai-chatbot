from fastapi import APIRouter, HTTPException, Depends
from typing import List

from .models import ChatRequest, ChatResponse, ChatMessage, CharactersListResponse, CharacterSummary
from .config import get_settings
from .character_loader import load_character, list_characters, CharacterNotFound
from .conversation_manager import get_history, append_message, reset_conversation

from openai import OpenAI

router = APIRouter()
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


@router.get("/characters", response_model=CharactersListResponse)
def get_characters() -> CharactersListResponse:
    try:
        chars = list_characters()
    except Exception as e:
        # This will turn the vague 500 into a readable error
        raise HTTPException(status_code=500, detail=f"Failed to load characters: {e}")

    summaries: List[CharacterSummary] = []
    for cid, data in chars.items():
        summaries.append(
            CharacterSummary(
                id=cid,
                name=data.get("name", cid),
                description=data.get("description", "")
            )
        )
    return CharactersListResponse(characters=summaries)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    # Reset if asked
    if request.reset:
        reset_conversation(request.session_id)

    # Load character config
    try:
        character = load_character(request.character_id)
    except CharacterNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

    system_prompt = character["system_prompt"]

    # Build messages
    history = get_history(request.session_id)
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": request.message})

    # Call OpenAI
    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.7,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model error: {e}")

    reply = completion.choices[0].message.content  # type: ignore

    # Store new messages in history
    append_message(request.session_id, "user", request.message)
    append_message(request.session_id, "assistant", reply)

    updated_history = get_history(request.session_id)
    history_models = [ChatMessage(**m) for m in updated_history]

    return ChatResponse(
        reply=reply,
        character_id=request.character_id,
        session_id=request.session_id,
        history=history_models,
    )
