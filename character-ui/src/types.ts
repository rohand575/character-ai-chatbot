// src/types.ts

export interface Character {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  character_id: string;
  session_id: string;
  history: ChatMessage[];
}
