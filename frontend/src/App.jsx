import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearAuthToken,
  fetchCurrentUser,
  fetchNotes,
  getAuthToken,
  sendAssistantQuery
} from "./api/client";
import AuthPanel from "./components/AuthPanel";
import ChatPanel from "./components/ChatPanel";
import NotesSidebar from "./components/NotesSidebar";

function createId() {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(getAuthToken()));
  const [authNotice, setAuthNotice] = useState("");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError("");
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      setNotesError(
        error.message ||
          "Could not reach the server. Start the backend (npm run dev in /backend)."
      );
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    if (!token) return undefined;

    fetchCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          void loadNotes();
        }
      })
      .catch(() => {
        if (active) {
          setAuthNotice(
            "Could not verify your saved session. Please sign in again when the server is available."
          );
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadNotes]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setNotes([]);
      setMessages([]);
      setSelectedNoteId(null);
    };
    window.addEventListener("notesmakingai:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("notesmakingai:unauthorized", handleUnauthorized);
  }, []);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  const handleSend = async (query) => {
    setChatError("");
    setSending(true);

    const userMessage = {
      id: createId(),
      role: "user",
      content: query
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendAssistantQuery(query);

      const assistantMessage = {
        id: createId(),
        role: "assistant",
        content: response.message || "(No response)",
        toolResults: response.results ?? []
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await loadNotes();
    } catch (error) {
      setChatError(
        error.message ||
          "Assistant request failed. Check your Groq API key and backend logs."
      );
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Checking your account…
      </main>
    );
  }

  if (!user) {
    return (
      <AuthPanel
        notice={authNotice}
        onAuthenticated={(authenticatedUser) => {
          setAuthNotice("");
          setMessages([]);
          setSelectedNoteId(null);
          setUser(authenticatedUser);
          void loadNotes();
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white shadow-sm">
            N
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
              NotesMaking AI
            </h1>
            <p className="text-xs text-muted">Natural language notes, powered by Groq</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">{user.email}</span>
          <span
            className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline ${
              notesError
                ? "bg-red-100 text-red-700"
                : "bg-accent-soft text-accent-dark"
            }`}
          >
            {notesError ? "Offline" : "Connected"}
          </span>
          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              setUser(null);
              setNotes([]);
              setMessages([]);
              setSelectedNoteId(null);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-accent hover:text-accent-dark"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <NotesSidebar
          notes={notes}
          loading={notesLoading}
          error={notesError}
          onRefresh={loadNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />
        <ChatPanel
          messages={messages}
          onSend={handleSend}
          sending={sending}
          error={chatError}
          selectedNote={selectedNote}
        />
      </main>
    </div>
  );
}
