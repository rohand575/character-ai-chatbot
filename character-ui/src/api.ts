// src/api.ts
import type { Character, ChatResponse } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch(`${API_BASE_URL}/characters`);
  if (!res.ok) {
    throw new Error(`Failed to load characters: ${res.status}`);
  }
  const data = await res.json();
  return data.characters as Character[];
}

export async function sendChat(options: {
  character_id: string;
  session_id: string;
  message: string;
  reset?: boolean;
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail =
      (errorData && (errorData as any).detail) || `HTTP ${res.status.toString()}`;
    throw new Error(`Chat failed: ${detail}`);
  }

  const data = (await res.json()) as ChatResponse;
  return data;
}
