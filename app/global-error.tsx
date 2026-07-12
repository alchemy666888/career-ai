"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main className="container">
          <section className="card" role="alert">
            <h1>Something went wrong</h1>
            <p>Please retry. If the problem continues, include the error reference shown in the server logs.</p>
          </section>
        </main>
      </body>
    </html>
  );
}
