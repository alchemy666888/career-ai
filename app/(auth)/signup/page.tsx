import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="container">
      <section className="card">
        <h1>Sign up</h1>
        <p>
          Account registration uses the same Auth.js provider flow as sign-in. Configure an
          Auth.js provider in Vercel Cloud, then continue to create or access your account.
        </p>
        <div className="landing-actions">
          <Link className="btn" href="/api/auth/signin">
            Continue with provider
          </Link>
          <Link className="btn" href="/signin">
            Already have an account? Login
          </Link>
        </div>
      </section>
    </main>
  );
}
