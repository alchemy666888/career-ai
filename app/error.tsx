"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container">
      <section className="card" role="alert">
        <h1>Something went wrong</h1>
        <p>We could not complete that action. Retry, or contact support with the safe error reference from server logs.</p>
        <button className="btn" type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
