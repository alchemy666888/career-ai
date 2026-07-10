# CareerAI Job Hunter Journey — UI Enhancement Requirements

**Document status:** Implementation-ready  
**Scope:** UI-only enhancement  
**Target repository:** `alchemy666888/career-ai`  
**Baseline date:** 10 July 2026

## 1. Purpose

This specification defines a role-centric UI enhancement for CareerAI. The current product presents Search, AI Drafts, Interview Prep, and Saved as separate tools. The enhanced experience must present them as views of one continuous job-hunting journey:

> One role, one workspace, one current state, and one next best action.

The implementation must improve information architecture, continuity, clarity, responsiveness, accessibility, and perceived completeness without introducing backend behavior.

## 2. Source baseline

The requirements are based on:

- Live routes:
  - `https://career-pick.vercel.app/jobs`
  - `https://career-pick.vercel.app/applications`
  - `https://career-pick.vercel.app/interviews`
  - `https://career-pick.vercel.app/saved`
- Repository: `https://github.com/alchemy666888/career-ai`
- Uploaded journey review: *CareerAI Job Hunter Journey — Product Analysis and Target-State Design*

### 2.1 Current implementation constraints

The current UI is primarily implemented through:

- Next.js App Router route wrappers under `app/(dashboard)`.
- Client components under `components/career`.
- Hard-coded fixtures in `components/career/data.ts`.
- Component-local React state.
- Browser `localStorage` for saved job IDs.
- A shared `CareerNav` component.
- A large shared stylesheet in `app/globals.css`.

The enhanced UI must work within this architecture unless a small front-end refactor materially improves maintainability.

## 3. Goals

### G-01 — Journey continuity

Make every surface visibly part of the same role lifecycle, from discovery through outcome.

### G-02 — Clear next action

Every role-oriented screen must show one visually dominant next best action appropriate to the role’s current state.

### G-03 — Faster value

The Discover experience must show credible sample results immediately. Users must not be forced to complete profile-like setup before seeing value.

### G-04 — Reduced navigation ambiguity

Navigation labels must describe user goals rather than isolated AI tools.

### G-05 — Trustworthy UI behavior

The interface must never imply that an application was submitted, a message was sent, or an interview was scheduled unless the user explicitly confirms the simulated UI action.

### G-06 — Responsive, accessible completion

The core journey must be usable with keyboard-only input, screen readers, touch, and viewports from 360px upward.

## 4. Non-goals

The following are explicitly out of scope:

- Database, Drizzle schema, or migration changes.
- New API routes, server actions, or persistence services.
- Authentication or authorization changes.
- Real job search integrations or scraping.
- Real AI generation or provider calls.
- Email, calendar, ATS, CRM, or notification integrations.
- Autonomous application submission.
- Production analytics infrastructure.
- Changes to existing security, environment-variable, or deployment behavior.

Mock interactions may visually represent these future capabilities, but must be labeled and implemented as UI state only.

## 5. Primary user and job to be done

### Primary user

An active job seeker managing multiple roles across discovery, application, and interview stages.

### Core job to be done

> When I find a promising role, help me understand fit, decide whether it is worth pursuing, prepare a truthful application, track progress, and prepare for interviews without losing context or wondering what to do next.

## 6. Experience principles

1. **Role before tool:** Present the role and its state before exposing drafting or preparation tools.
2. **One dominant action:** Each view has one primary CTA and no more than two secondary actions above the fold.
3. **Progressive disclosure:** Show the information needed for the current decision; reveal detail on demand.
4. **Evidence over generic AI:** Suggested actions and content must visibly connect to known skills, achievements, or role requirements.
5. **Explicit transitions:** Status changes require deliberate user actions and visible confirmation.
6. **Reversible decisions:** Save, dismiss, archive, and status changes must be undoable during the current session.
7. **Honest prototype behavior:** Local mock state must be described as such where persistence expectations matter.

## 7. Canonical UI journey

The UI must represent the following lifecycle:

1. **Discover** — role found or matched.
2. **Decide** — fit, gaps, requirements, freshness, and effort reviewed.
3. **Shortlist** — role saved for later comparison.
4. **Applying** — role workspace opened and materials being tailored.
5. **Submitted** — user confirms external submission.
6. **Interviewing** — interview preparation is active.
7. **Offer** — offer review or decision UI is available.
8. **Closed** — rejected, withdrawn, declined, accepted, or archived.

### 7.1 UI status mapping

The presentation layer should use user-facing labels while remaining compatible with existing repository statuses.

| UI status | Existing status compatibility |
|---|---|
| Discovered | `discovered`, `evaluating` |
| Shortlisted | `saved` |
| Applying | `applying` |
| Submitted | `applied` |
| Interviewing | `interviewing` |
| Offer | `offered` |
| Accepted | `accepted` |
| Closed | `rejected`, `declined`, `archived` |

## 8. Functional requirements

## 8.1 Global shell and navigation

### NAV-01 — Goal-oriented primary navigation

The primary navigation must contain:

- Home
- Discover
- Applications
- Interviews
- Profile

**Acceptance criteria**

- “AI Drafts” is renamed to “Applications.”
- “Search” is renamed to “Discover.”
- “Saved” is removed from primary navigation and exposed as a Discover filter and Home shortcut.
- The existing `/saved` route remains valid as a compatibility Shortlist view.
- Active navigation uses `aria-current="page"`.

### NAV-02 — Persistent shell

All dashboard routes must share one responsive shell.

**Acceptance criteria**

- Desktop shows the CareerAI brand, primary navigation, and a compact user/profile affordance.
- Tablet may collapse labels while retaining accessible names.
- Mobile uses a compact menu or bottom navigation without horizontal overflow.
- Page content begins below or beside the shell without being obscured by sticky elements.

### NAV-03 — Contextual role header

Role-specific views must show a compact context header containing:

- Role title.
- Company.
- Current status.
- Match score when relevant.
- Primary next action.

## 8.2 Home dashboard

### HOME-01 — Default journey home

`/dashboard` must become the default journey overview rather than a generic analytics card page.

**Required UI regions**

- Greeting and concise search-state summary.
- “Next best action” hero card.
- Pipeline overview grouped by status.
- Upcoming deadlines and interviews.
- Shortlisted roles requiring review.
- Recently active roles.

**Acceptance criteria**

- The highest-priority incomplete role action is visually dominant.
- Empty dashboard state routes the user to Discover.
- All cards link to the relevant role or workspace.

### HOME-02 — Pipeline visualization

The dashboard must provide a scannable role pipeline.

**Acceptance criteria**

- Stages are labeled in plain language.
- Counts derive from UI fixtures/state selectors.
- Stage controls are keyboard accessible.
- Selecting a stage filters the role list without a full reload.

## 8.3 Discover and role decision

### DISC-01 — Immediate sample value

`/jobs` must render sample role matches on initial load.

**Acceptance criteria**

- Role cards are visible before the user changes skills or target positions.
- Existing skills and positions chips remain editable.
- “Generate AI Matches” updates a visible matching state and result summary using local UI behavior.
- Loading feedback is visible for at least one render cycle but must not block keyboard interaction unnecessarily.

### DISC-02 — Discover controls

The Discover page must include:

- Search or role query.
- Work-style filter.
- Experience-level filter.
- Match-strength filter.
- Saved-only toggle.
- Sort control.

**Acceptance criteria**

- Filters have programmatic labels.
- Active filters are visible and individually removable.
- “Clear all” is available when filters are active.
- Filter state may be local and need not modify the URL.

### DISC-03 — Role card information hierarchy

Every role card must show:

- Role title and company.
- Location/work style.
- Salary when available.
- Posted freshness.
- Match score and confidence label.
- Two top fit reasons.
- At most one material gap.
- Status badge.

**Card actions**

- Primary: View role.
- Secondary: Save/Unsave.
- Tertiary menu: Dismiss or Archive.

**Acceptance criteria**

- The card does not use “Tailor application” as the first action before role inspection.
- Save control has an accessible pressed state.
- Dismiss presents an undo toast.

### DISC-04 — Role detail route

Add a UI-only role detail view at `/jobs/[jobId]`.

**Required sections**

- Role overview.
- Why this matches.
- Requirement coverage.
- Gaps and blockers.
- Role responsibilities.
- Company/source/freshness information.
- Estimated application effort.
- Notes placeholder.

**Primary actions by state**

- Discovered: Start application.
- Shortlisted: Start application.
- Applying: Continue application.
- Submitted: View tracking.
- Interviewing: Prepare for interview.

**Secondary actions**

- Save/Unsave.
- Dismiss/Archive.
- Back to results.

### DISC-05 — Fit explanation

The fit explanation must separate:

- Strong evidence.
- Partial evidence.
- Missing evidence.
- Hard requirement blockers.

**Acceptance criteria**

- Match score is not displayed without an explanatory breakdown.
- Gaps use neutral, actionable language.
- Color is never the only indicator.

## 8.4 Shortlist compatibility view

### SAVE-01 — Saved as a role state

Saving a role must change its canonical UI status to Shortlisted rather than copying it into a separate data structure.

### SAVE-02 — `/saved` compatibility view

The existing `/saved` route must render the same Shortlisted roles available from the Discover saved-only filter.

**Required UI**

- Shortlist count.
- Sort by match, deadline, or recency.
- Compare selection for up to three roles.
- Notes and priority affordance.
- Start application CTA.

**Acceptance criteria**

- Empty state explains how to save a role and links to Discover.
- Browser-local behavior is disclosed unobtrusively.
- Removing a role from Shortlist is reversible during the session.

### SAVE-03 — Role comparison

Users may select two or three Shortlisted roles for a comparison panel.

**Comparison dimensions**

- Match score.
- Material gap.
- Salary.
- Work style.
- Freshness/deadline.
- Estimated application effort.

## 8.5 Applications pipeline and workspace

### APP-01 — Applications overview

`/applications` must first present an application pipeline/list, not a context-free document editor.

**Required groups**

- Applying.
- Submitted.
- Interviewing.
- Offer.
- Closed.

**Acceptance criteria**

- Each application row/card shows role, company, status, last activity, and next action.
- A status filter and text search are available.
- Empty state links to Discover and Shortlist.

### APP-02 — Role application workspace

Add a UI-only application workspace at `/applications/[applicationId]` or an equivalent selected-workspace layout.

**Required layout**

- Role context header.
- Progress stepper.
- Requirements/evidence panel.
- CV tab.
- Cover letter tab.
- Submission checklist tab or panel.
- Activity timeline.
- Notes.

### APP-03 — Integrate existing draft studio

The existing editable CV, cover letter, quick edits, and AI editor must be retained inside the selected role workspace.

**Acceptance criteria**

- Draft content visibly names the selected role/company where relevant.
- The UI shows which requirements a suggested edit addresses.
- Unsupported-claim warning UI is present for simulated suggestions that exceed fixture evidence.
- Generic AI chat is secondary to contextual action chips.

### APP-04 — Application progress

The workspace must show the following UI steps:

1. Review requirements.
2. Tailor CV.
3. Tailor cover letter.
4. Complete pre-flight.
5. Confirm submitted.

**Acceptance criteria**

- Completion state derives from local UI state.
- Users can revisit earlier steps.
- Progress does not imply external submission.

### APP-05 — Pre-flight checklist

Pre-flight must check or visually represent:

- Correct role and company names.
- Required documents present.
- Contact details present.
- Portfolio/link review.
- Requirement coverage.
- Unsupported-claim warning.
- External application link readiness.

### APP-06 — Explicit submission confirmation

The UI may change a role to Submitted only after the user selects “Mark as submitted” and confirms in a dialog.

**Acceptance criteria**

- Confirmation states that CareerAI did not submit externally.
- The user may cancel.
- A success toast links to tracking.
- The transition can be undone during the current session.

### APP-07 — Activity timeline

Application workspaces must include a chronological UI timeline containing simulated events such as:

- Role saved.
- Application started.
- CV edited.
- Cover letter edited.
- Marked submitted.
- Interview scheduled.

## 8.6 Interviews

### INT-01 — Interview overview

`/interviews` must support multiple interview records grouped into:

- Upcoming.
- Needs preparation.
- Completed.

**Acceptance criteria**

- The current single interview fixture remains represented.
- Each card shows role, company, date/time, interview stage, readiness, and next action.
- Empty state links to Submitted applications.

### INT-02 — Role-specific interview workspace

The interview workspace must retain and enhance:

- Practice questions.
- Draft answer.
- Feedback UI.
- Evidence stories.
- Preparation checklist.
- Private notes.

It must add:

- Role requirement context.
- Interview format and participant summary.
- Questions-to-ask area.
- Post-interview notes state.
- Follow-up action.

### INT-03 — Readiness model

Readiness must derive from meaningful preparation tasks, not raw checkbox count alone.

**UI-weighted readiness inputs**

- Role requirements reviewed.
- Two evidence stories selected.
- At least one answer drafted.
- Company research marked complete.
- Questions to ask added.

The calculation may remain local and deterministic.

### INT-04 — Post-interview state

After “Mark interview complete,” the UI must reveal:

- What was asked.
- Self-assessment.
- Signals/concerns.
- Thank-you note draft.
- Follow-up date placeholder.

No email is actually sent.

## 8.7 Profile and evidence UI

### PROF-01 — Profile page redesign

`/profile` must become a usable front-end profile and evidence overview.

**Required sections**

- Profile completeness.
- Target roles and preferences.
- Skills.
- Work history summary.
- Achievement/evidence cards.
- STAR story bank.
- Resume source status.

### PROF-02 — Progressive completion

The page must highlight one “next useful field” rather than presenting all missing fields as errors.

### PROF-03 — Editable mock fields

Profile fields may be edited in local component state.

**Acceptance criteria**

- Save actions show local success feedback.
- The UI does not claim server persistence.
- Derived fields have an “AI suggested” or “From resume” provenance label when appropriate.

## 8.8 Shared interaction requirements

### SHARED-01 — Canonical next-action selector

A shared front-end selector must map role state to the next best action.

| Status | Next best action |
|---|---|
| Discovered | View role |
| Shortlisted | Start application |
| Applying | Continue application |
| Submitted | Add update / Prepare follow-up |
| Interviewing | Continue preparation |
| Offer | Review offer |
| Closed | Review learning / Archive |

### SHARED-02 — Toast feedback

Save, dismiss, archive, status change, local save, and checklist completion actions must provide concise feedback.

**Acceptance criteria**

- Toasts use `role="status"` or an appropriate live region.
- Reversible actions include Undo.
- Toasts do not trap focus.

### SHARED-03 — Dialog behavior

Confirmation and comparison dialogs must:

- Move focus into the dialog.
- Trap focus while open.
- Close with Escape.
- Return focus to the invoking control.
- Have a programmatic title and description.

### SHARED-04 — Empty, loading, and error states

Every primary page must define:

- Initial loading/skeleton state.
- Empty state.
- No-filter-results state.
- Recoverable error presentation.

### SHARED-05 — Browser-local persistence

A single UI state store may persist role statuses, notes, checklist progress, and saved state in browser storage.

**Acceptance criteria**

- Storage access is guarded for server rendering.
- Corrupt storage falls back safely to fixtures.
- A versioned key is used, for example `careerai-journey-ui-v2`.
- A reset-demo-data action is available from Profile or Settings UI.

## 9. Visual and content requirements

### VIS-01 — Visual hierarchy

- Primary CTAs use the existing green brand direction.
- Status badges use distinct labels and icons in addition to color.
- Dense cards must use clear spacing, headings, and separators.
- Match score visualization must remain readable without conic-gradient support.

### VIS-02 — Design token cleanup

The enhanced UI must introduce reusable tokens for:

- Surface colors.
- Text colors.
- Brand colors.
- Status colors.
- Spacing.
- Radius.
- Shadow.
- Focus ring.
- Content widths.

### VIS-03 — Copy style

Copy must be:

- Direct and task-oriented.
- Honest about simulated/local behavior.
- Free of claims that AI completed an external action.
- Consistent in capitalization and terminology.

## 10. Responsive requirements

### RESP-01 — Supported viewport behavior

The UI must be designed and manually checked at:

- 360px.
- 768px.
- 1024px.
- 1440px.

### RESP-02 — Mobile priority

On mobile:

- Primary action remains visible without requiring horizontal scrolling.
- Multi-column workspaces become a single logical reading order.
- Comparison tables become cards or horizontally scroll with clear affordance.
- Sticky desktop sidebars become static.
- Touch targets are at least 44×44 CSS pixels where practical.

## 11. Accessibility requirements

### A11Y-01 — Keyboard operation

All interactive behavior must be operable with keyboard alone.

### A11Y-02 — Focus visibility

All links, buttons, form controls, tabs, dialogs, and cards with interactive behavior must have a visible focus indicator with at least 3:1 contrast against adjacent colors.

### A11Y-03 — Semantics

- Use one `h1` per page.
- Preserve logical heading order.
- Use landmarks: `header`, `nav`, `main`, `aside`, and `footer` where appropriate.
- Use actual buttons for actions and links for navigation.
- Tabs must implement tab semantics or use simpler buttons if full tab behavior is not provided.

### A11Y-04 — Status and progress

- Progress must expose text equivalents.
- Match score, readiness, and pipeline counts must not rely on color alone.
- Dynamic updates use polite live regions unless urgent.

### A11Y-05 — Reduced motion

Animations and transitions must respect `prefers-reduced-motion`.

## 12. Performance requirements

### PERF-01 — No heavy UI dependency

Do not add a charting, state-management, icon, or component-library dependency solely for this enhancement.

### PERF-02 — Client boundary discipline

Only components requiring interaction or browser storage should use `"use client"`.

### PERF-03 — Asset and rendering discipline

- Continue using `next/image` for the CareerAI logo.
- Avoid unnecessary layout shifts.
- Use CSS for simple charts, progress, and status visualization.

## 13. Testing and quality requirements

### TEST-01 — Front-end state tests

Add unit tests for:

- Status-to-next-action mapping.
- Pipeline grouping.
- Discover filtering and sorting.
- Readiness calculation.
- Storage parsing and version fallback.

### TEST-02 — Component behavior tests

Where the repository test setup permits, test:

- Save/Unsave.
- Start application.
- Mark submitted confirmation.
- Interview checklist/readiness.
- Empty states.

If DOM testing requires a dev dependency, add only the minimum required dependency and document it.

### TEST-03 — Required checks

The completed implementation must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 14. Definition of done

The UI enhancement is complete when:

1. The five-item goal-oriented navigation is present and responsive.
2. `/dashboard` presents a journey dashboard with a dominant next best action.
3. `/jobs` displays immediate role results, filters, improved cards, and role detail navigation.
4. `/saved` works as a Shortlist compatibility view using the same role state.
5. `/applications` presents a pipeline and role-bound drafting workspace.
6. `/interviews` presents multiple interview states and a role-specific workspace.
7. `/profile` presents progressive profile and evidence UI.
8. All state transitions are local, explicit, reversible where specified, and honest about persistence.
9. Empty, loading, error, keyboard, focus, responsive, and reduced-motion requirements are satisfied.
10. No backend, schema, API, auth, or real integration code is changed.
11. Lint, typecheck, tests, and production build pass.
