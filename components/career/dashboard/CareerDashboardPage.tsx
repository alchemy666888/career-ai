"use client";

import Link from "next/link";
import { useState } from "react";
import { useJourney } from "../journey/JourneyProvider";
import {
  getHighestPriorityAction,
  getPipelineCounts,
  statusLabels,
} from "../journey/selectors";
import type { JourneyStatus } from "../journey/types";
import { StatusBadge } from "../ui/Primitives";

const statuses: JourneyStatus[] = [
  "discovered",
  "shortlisted",
  "applying",
  "submitted",
  "interviewing",
  "offer",
  "accepted",
  "closed",
];

export function CareerDashboardPage() {
  const { state } = useJourney();
  const [stage, setStage] = useState<JourneyStatus | "all">("all");
  const next = getHighestPriorityAction(state);
  const counts = getPipelineCounts(state);
  const roles = state.roles.filter((role) => stage === "all" || role.status === stage);
  const shortlistedRoles = state.roles.filter((role) => role.status === "shortlisted");
  const recentRoles = state.roles
    .slice()
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    .slice(0, 5);

  return (
    <>
      <section className="cj-page-head career-container dashboard-head">
        <p className="dashboard-eyebrow">Career command center</p>
        <h1>Home</h1>
        <p>
          Alex is tracking {state.roles.length} fixture roles with one shared browser-local journey
          state.
        </p>
        {next && (
          <article className="cj-hero-card dashboard-next-action">
            <div>
              <p className="dashboard-next-action-kicker">Next best action</p>
              <h2>{next.label}</h2>
              <p className="dashboard-next-action-meta">
                {next.role?.title} · {next.role?.company}
              </p>
            </div>
            <Link className="career-btn" href={next.href}>
              {next.label}
            </Link>
          </article>
        )}
      </section>

      <section className="career-container cj-grid dashboard-grid">
        <article className="cj-card cj-span dashboard-card dashboard-pipeline-card">
          <div className="dashboard-card-header">
            <div>
              <p className="dashboard-section-label">Overview</p>
              <h2>Pipeline</h2>
            </div>
            <span className="dashboard-count-pill">{roles.length} shown</span>
          </div>
          <div className="cj-pipeline dashboard-pipeline" aria-label="Filter pipeline by stage">
            <button aria-pressed={stage === "all"} onClick={() => setStage("all")} type="button">
              All <strong>{state.roles.length}</strong>
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                aria-pressed={stage === status}
                onClick={() => setStage(status)}
                type="button"
              >
                {statusLabels[status]} <strong>{counts[status] ?? 0}</strong>
              </button>
            ))}
          </div>
          <div className="cj-list dashboard-role-list">
            {roles.map((role) => (
              <Link key={role.id} href={`/jobs/${role.id}`}>
                <StatusBadge status={role.status} />
                <span>{role.title}</span>
                <strong>{role.company}</strong>
              </Link>
            ))}
          </div>
        </article>

        <article className="cj-card dashboard-card dashboard-stack-card">
          <div className="dashboard-card-header">
            <div>
              <p className="dashboard-section-label">Calendar</p>
              <h2>Upcoming</h2>
            </div>
          </div>
          <div className="dashboard-item-stack">
            {state.interviews.map((interview) => {
              const role = state.roles.find((candidate) => candidate.id === interview.roleId);
              return (
                <Link className="dashboard-mini-item" href={`/interviews/${interview.id}`} key={interview.id}>
                  <span>{new Date(interview.when).toLocaleDateString()}</span>
                  <strong>
                    {role?.company} {interview.stage}
                  </strong>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="cj-card dashboard-card dashboard-stack-card">
          <div className="dashboard-card-header">
            <div>
              <p className="dashboard-section-label">Saved focus</p>
              <h2>Shortlisted roles</h2>
            </div>
          </div>
          <div className="dashboard-item-stack">
            {shortlistedRoles.map((role) => (
              <Link className="dashboard-mini-item" href={`/jobs/${role.id}`} key={role.id}>
                <span>Closes {role.closingDate}</span>
                <strong>{role.title}</strong>
              </Link>
            ))}
          </div>
          <Link className="dashboard-text-link" href="/saved">
            Compare shortlist
          </Link>
        </article>

        <article className="cj-card cj-span dashboard-card dashboard-activity-card">
          <div className="dashboard-card-header">
            <div>
              <p className="dashboard-section-label">Momentum</p>
              <h2>Recent activity</h2>
            </div>
          </div>
          <ul className="dashboard-activity-list">
            {recentRoles.map((role) => (
              <li key={role.id}>
                <time>{role.lastActivity}</time>
                <span>{role.title}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
