import Link from "next/link";

export default function SignInPage() {
  const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const emailAuthEnabled = process.env.EMAIL_AUTH_ENABLED === "true";
  const hasProvider = githubEnabled || googleEnabled || emailAuthEnabled;
  return (
    <main className="container">
      <section className="card">
        <h1>Sign in</h1>
        {hasProvider ? <p>Choose an enabled authentication method to continue your private job search workspace.</p> : <p>Sign-in is disabled for this deployment. Continue with the public job-search experience for now.</p>}
        <div className="landing-actions">
          {githubEnabled ? <Link className="btn" href="/api/auth/signin/github">Continue with GitHub</Link> : null}
          {googleEnabled ? <Link className="btn" href="/api/auth/signin/google">Continue with Google</Link> : null}
          {emailAuthEnabled ? <Link className="btn" href="/api/auth/signin/email">Continue with email</Link> : null}
          {!hasProvider ? <Link className="btn" href="/jobs">Browse jobs</Link> : null}
        </div>
      </section>
    </main>
  );
}
