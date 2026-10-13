export default function MessageBubble({ role, content, toolResults }) {
  const isUser = role === "user";

  return (
    <div
      className={`animate-fade-up flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-accent text-white rounded-br-md"
            : "border border-border bg-white text-stone-800 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {!isUser && toolResults?.length > 0 && (
          <details className="mt-3 rounded-lg bg-paper-muted/80 px-3 py-2 text-xs text-stone-600">
            <summary className="cursor-pointer font-medium text-stone-700">
              Actions taken ({toolResults.length})
            </summary>
            <ul className="mt-2 space-y-1.5">
              {toolResults.map((entry, index) => (
                <li key={`${entry.tool}-${index}`} className="font-mono text-[11px]">
                  <span className="text-accent-dark">{entry.tool}</span>
                  {" — "}
                  {entry.result?.message ||
                    entry.result?.error ||
                    (entry.result?.success ? "OK" : "Failed")}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
