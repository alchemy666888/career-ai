import Link from "next/link";

export default function HomePage() {
  return <main className="container hero">
    <span className="badge">Vercel-ready • Next.js • PostgreSQL</span>
    <h1>Run an honest, evidence-backed AI job search.</h1>
    <p className="muted">Track opportunities, evaluate fit, draft application material from approved evidence, prepare for interviews, and learn from outcomes—without automatic external submissions.</p>
    <Link className="btn" href="/dashboard">Open workspace</Link>
  </main>;
}
