import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Job Search | Evidence-backed career workspace",
  description:
    "A focused AI career workspace for tracking opportunities, proving fit, drafting from approved evidence, and improving every job search outcome."
};

const proofPoints = [
  "Approved evidence library",
  "Fit scoring and gap notes",
  "No automatic external submissions"
];

const workflowCards = [
  {
    title: "Find better-fit roles",
    description:
      "Capture promising opportunities, compare them against your constraints, and keep the search grounded in roles worth pursuing."
  },
  {
    title: "Draft from real proof",
    description:
      "Turn verified achievements, preferences, and writing style into tailored resumes, cover letters, and outreach drafts."
  },
  {
    title: "Learn from outcomes",
    description:
      "Review stage conversion, feedback, follow-ups, and compensation notes so every application improves the next one."
  }
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-header" aria-label="Primary navigation">
        <Link className="landing-brand" href="/">
          <Image className="landing-brand-logo" src="/careerai-logo.svg" alt="CareerAI" width={190} height={50} priority />
        </Link>
        <nav className="landing-auth-nav" aria-label="Primary app links">
          <Link className="career-btn secondary" href="/jobs">
            Explore jobs
          </Link>
          <Link className="career-btn" href="/dashboard">
            Open dashboard
          </Link>
        </nav>
      </header>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">AI Job Search</span>
          <h1>Run an honest, evidence-backed AI job search.</h1>
          <p>
            Track opportunities, evaluate fit, draft application material from approved evidence,
            prepare for interviews, and learn from outcomes—without automatic external submissions.
          </p>
          <div className="landing-actions">
            <Link className="career-btn secondary" href="/jobs">
              Explore jobs
            </Link>
          </div>
          <ul className="landing-proof" aria-label="Product highlights">
            {proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="landing-preview" aria-label="Workspace preview">
          <div className="landing-preview-header">
            <span>Search health</span>
            <strong>82%</strong>
          </div>
          <div className="landing-preview-card featured">
            <span>Next best action</span>
            <h2>Tailor application for Product Operations Lead</h2>
            <p>4 approved evidence points ready · 2 gaps to address honestly</p>
          </div>
          <div className="landing-preview-grid">
            <div>
              <strong>18</strong>
              <span>Active roles</span>
            </div>
            <div>
              <strong>7</strong>
              <span>Drafts ready</span>
            </div>
          </div>
          <div className="landing-preview-card">
            <span>Interview prep</span>
            <p>Practice STAR stories tied to the job description and your verified experience.</p>
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="workflow-heading">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">Built for deliberate search</span>
          <h2 id="workflow-heading">A calmer way to manage every application.</h2>
        </div>
        <div className="landing-card-grid">
          {workflowCards.map((card) => (
            <article className="landing-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
