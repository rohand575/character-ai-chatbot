# backend/app/character_loader.py
import json
from pathlib import Path
from typing import Dict, Any


CHARACTERS_DIR = Path(__file__).resolve().parent.parent / "characters"


class CharacterNotFound(Exception):
    pass


def load_character(character_id: str) -> Dict[str, Any]:
    """
    Load a character config by ID from the characters/ directory.
    """
    path = CHARACTERS_DIR / f"{character_id}.json"
    if not path.exists():
        raise CharacterNotFound(f"Character '{character_id}' not found") 
    # NOTE: utf-8-sig handles BOM nicely
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def list_characters() -> Dict[str, Dict[str, str]]:
    """
    Return a lightweight list of available characters:
    {id: {name, description}}
    """
    chars = {}
    for file in CHARACTERS_DIR.glob("*.json"):
        with file.open("r", encoding="utf-8-sig") as f:
            data = json.load(f)
        chars[data["id"]] = {
            "name": data.get("name", data["id"]),
            "description": data.get("description", "")
        }
    return chars
