import Link from "next/link";

export default function SignUpPage() {
  const hasProvider = Boolean(
    (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) ||
    (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ||
    process.env.EMAIL_AUTH_ENABLED === "true"
  );
  return (
    <main className="container">
      <section className="card">
        <h1>Sign up</h1>
        {hasProvider ? <p>Account registration uses the same Auth.js provider flow as sign-in.</p> : <p>Account registration is disabled for this deployment. Use the public job-search experience while sign-in remains off.</p>}
        <div className="landing-actions">
          {hasProvider ? <Link className="btn" href="/api/auth/signin">Continue with provider</Link> : <Link className="btn" href="/jobs">Browse jobs</Link>}
          <Link className="btn" href="/signin">Sign-in status</Link>
        </div>
      </section>
    </main>
  );
}
