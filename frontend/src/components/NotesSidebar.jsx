import NoteCard from "./NoteCard";

export default function NotesSidebar({
  notes,
  loading,
  error,
  onRefresh,
  selectedNoteId,
  onSelectNote
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-paper-muted/50">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Your notes</h2>
          <p className="text-xs text-muted">
            {loading ? "Refreshing…" : `${notes.length} saved`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-accent hover:text-accent-dark disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && notes.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-border bg-white/60 p-6 text-center">
            <p className="font-display text-base font-medium text-stone-700">
              No notes yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Ask the assistant to create one — for example, &quot;Create a note
              about tomorrow&apos;s team standup.&quot;
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left ${
                  selectedNoteId === note.id ? "ring-2 ring-accent/50 rounded-xl" : ""
                }`}
              >
                <NoteCard note={note} compact />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
