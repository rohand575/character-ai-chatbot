from typing import Dict, List


# In-memory store: {session_id: [{"role": "...", "content": "..."}]}
_conversations: Dict[str, List[Dict[str, str]]] = {}


def get_history(session_id: str) -> List[Dict[str, str]]:
    return _conversations.get(session_id, [])


def append_message(session_id: str, role: str, content: str) -> None:
    history = _conversations.setdefault(session_id, [])
    history.append({"role": role, "content": content})


def reset_conversation(session_id: str) -> None:
    if session_id in _conversations:
        del _conversations[session_id]
