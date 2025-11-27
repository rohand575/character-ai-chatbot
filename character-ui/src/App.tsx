// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { fetchCharacters, sendChat } from "./api";
import type { Character, ChatMessage } from "./types";
import "./App.css";

function createSessionId() {
  // simple unique-ish id for now
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>(createSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);

  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId) || null,
    [characters, selectedCharacterId]
  );

  // Load characters on mount
  useEffect(() => {
    const load = async () => {
      try {
        const chars = await fetchCharacters();
        setCharacters(chars);
        if (chars.length > 0) {
          setSelectedCharacterId(chars[0].id);
        }
        setInitialLoaded(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load characters");
        setInitialLoaded(true);
      }
    };
    load();
  }, []);

  const handleSend = async () => {
    setError(null);
    const trimmed = input.trim();
    if (!trimmed || !selectedCharacterId || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    // optimistic update
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChat({
        character_id: selectedCharacterId,
        session_id: sessionId,
        message: trimmed,
        reset: false, // we handle reset via separate button
      });

      setMessages(response.history);
      setSessionId(response.session_id); // in case backend changes it later
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      // rollback last message? For now, keep it to show what user attempted.
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleNewChat = () => {
    setSessionId(createSessionId());
    setMessages([]);
    setError(null);
  };

  const handleCharacterChange = (id: string) => {
    setSelectedCharacterId(id);
    // optional: reset chat when changing character
    handleNewChat();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Character AI Chat</h1>
          <p className="subtitle">
            Multi-persona chatbot powered by your FastAPI backend + OpenAI.
          </p>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>
          New Chat
        </button>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <h2>Characters</h2>
          {!initialLoaded && <p>Loading characters...</p>}
          {error && (
            <p className="error-text">
              {error}
            </p>
          )}
          <div className="character-list">
            {characters.map((char) => (
              <button
                key={char.id}
                className={`character-card ${
                  char.id === selectedCharacterId ? "active" : ""
                }`}
                onClick={() => handleCharacterChange(char.id)}
              >
                <div className="character-name">{char.name}</div>
                <div className="character-desc">{char.description}</div>
              </button>
            ))}
            {characters.length === 0 && initialLoaded && !error && (
              <p>No characters found. Check your backend /characters configs.</p>
            )}
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <div>
              <h2>{selectedCharacter?.name || "Select a character"}</h2>
              {selectedCharacter && (
                <p className="chat-subtitle">{selectedCharacter.description}</p>
              )}
            </div>
            <div className="session-id">Session: {sessionId}</div>
          </div>

          <div className="chat-window">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>
                  Start the conversation with{" "}
                  <strong>{selectedCharacter?.name || "a character"}</strong>.
                </p>
                <p className="hint">
                  Tip: ask it something like{" "}
                  <code>"Help me design my learning roadmap."</code>
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${
                  msg.role === "user" ? "user" : "assistant"
                }`}
              >
                <div className="chat-bubble">
                  <div className="chat-role">
                    {msg.role === "user"
                      ? "You"
                      : selectedCharacter?.name || "Assistant"}
                  </div>
                  <div className="chat-content">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-bubble typing">
                  <div className="chat-role">
                    {selectedCharacter?.name || "Assistant"}
                  </div>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-panel">
            <textarea
              placeholder={
                selectedCharacter
                  ? `Talk to ${selectedCharacter.name}...`
                  : "Select a character first..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedCharacter || loading}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!selectedCharacter || loading || !input.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
