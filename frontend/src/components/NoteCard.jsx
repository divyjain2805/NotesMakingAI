import { formatNoteWhen, formatRelativeTime } from "../utils/format";

export default function NoteCard({ note, compact = false }) {
  const when = formatNoteWhen(note);

  return (
    <article
      className={`rounded-xl border border-border bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold leading-snug text-ink">
          {note.title}
        </h3>
        <span className="shrink-0 text-xs text-muted">
          {formatRelativeTime(note.updatedAt || note.createdAt)}
        </span>
      </div>

      {note.content ? (
        <p
          className={`mt-2 text-sm leading-relaxed text-stone-600 ${
            compact ? "line-clamp-3" : "line-clamp-4"
          }`}
        >
          {note.content}
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-stone-400">No content yet</p>
      )}

      {(note.person || when) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {note.person && (
            <span className="rounded-full bg-paper-muted px-2.5 py-1 text-stone-600">
              {note.person}
            </span>
          )}
          {when && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent-dark">
              {when}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
