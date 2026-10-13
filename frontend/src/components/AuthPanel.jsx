import { useState } from "react";
import { registerAccount, signIn } from "../api/client";

export default function AuthPanel({ notice, onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = isRegistering
        ? await registerAccount(email, password)
        : await signIn(email, password);
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message || "Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
            N
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              NotesMaking AI
            </h1>
            <p className="text-sm text-muted">Your notes, private to you</p>
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold text-ink">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isRegistering
            ? "Sign up to start keeping your notes private."
            : "Sign in to access your personal notes."}
        </p>

        {notice && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {notice}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-stone-700">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
              minLength={isRegistering ? 8 : undefined}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/30"
            />
            {isRegistering && (
              <span className="mt-1 block text-xs font-normal text-muted">
                Use at least 8 characters.
              </span>
            )}
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Please wait…"
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {isRegistering ? "Already have an account?" : "New to NotesMaking AI?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="font-semibold text-accent-dark hover:underline"
          >
            {isRegistering ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
