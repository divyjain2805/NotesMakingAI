import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

const SUGGESTIONS = [
  "Create a note: buy groceries — milk, eggs, bread",
  "List all my notes",
  "Find notes about meetings",
  "Update my most recent note with a reminder for Friday"
];

export default function ChatPanel({
  messages,
  onSend,
  sending,
  error,
  selectedNote
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setInput("");
  };

  const applySuggestion = (text) => {
    if (sending) return;
    onSend(text);
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-paper">
      <header className="border-b border-border px-5 py-4">
        <h2 className="font-display text-xl font-semibold text-ink">AI assistant</h2>
        <p className="mt-1 text-sm text-muted">
          Create, search, update, and delete notes in natural language.
        </p>
        {selectedNote && (
          <p className="mt-2 rounded-lg bg-accent-soft/60 px-3 py-2 text-xs text-accent-dark">
            Selected: <strong>{selectedNote.title}</strong> — try &quot;Show me
            this note&quot; or &quot;Delete the note titled …&quot;
          </p>
        )}
      </header>

      <div className="chat-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <p className="font-display text-lg font-medium text-stone-800">
              What would you like to remember?
            </p>
            <p className="mt-2 text-sm text-muted">
              The assistant uses your saved notes as context and runs tools to
              change them when you ask.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  disabled={sending}
                  onClick={() => applySuggestion(text)}
                  className="rounded-full border border-border bg-paper-muted px-3 py-1.5 text-left text-xs text-stone-700 transition hover:border-accent hover:bg-white disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            toolResults={message.toolResults}
          />
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 text-sm text-muted shadow-sm">
              Thinking…
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-white/80 p-4 backdrop-blur-sm"
      >
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Ask anything about your notes…"
            disabled={sending}
            className="min-h-[3rem] flex-1 resize-none rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink outline-none ring-accent/30 placeholder:text-stone-400 focus:ring-2 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="self-end rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">
          Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </section>
  );
}
