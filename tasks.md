# CareerAI Job Hunter Journey — UI Implementation Tasks

**Inputs:** `requirements.md`, `design.md`  
**Scope guard:** UI-only. Do not modify backend, database, auth, APIs, or real integrations.

## Task conventions

- `[ ]` Not started.
- `[~]` In progress.
- `[x]` Complete.
- Each task must leave the repository lintable and type-safe.
- Prefer small, reviewable commits grouped by phase.
- Do not delete working legacy UI until its replacement is integrated.

## Phase 0 — Baseline and safeguards

### T-001 — Capture baseline

- [ ] Run `npm install` if dependencies are not installed.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Record any pre-existing failures before changing code.

**Done when:** Baseline results are documented in the implementation summary.

### T-002 — Confirm scope exclusions

- [ ] Verify no task requires changes under `db/**`, `drizzle/**`, `lib/auth/**`, or `app/api/**`.
- [ ] Verify all data interactions can use fixtures and browser-local state.
- [ ] Add a short code comment near the UI store noting that persistence is prototype-only.

**Done when:** The implementation plan contains no backend work.

## Phase 1 — Journey foundation

### T-101 — Add journey presentation types

**Add:** `components/career/journey/types.ts`

- [ ] Define `JourneyStatus`.
- [ ] Define `JourneyRole`.
- [ ] Define requirement coverage types.
- [ ] Define application, artifact, event, interview, profile, evidence, filter, and toast types.
- [ ] Avoid importing server-only modules.

**Acceptance:** `npm run typecheck` passes.

### T-102 — Expand and normalize fixtures

**Add:** `components/career/journey/fixtures.ts`  
**Refactor:** `components/career/data.ts`

- [ ] Convert numeric job IDs to stable string IDs or provide a safe compatibility mapping.
- [ ] Preserve the six existing sample jobs.
- [ ] Add fit reasons, material gaps, requirements, responsibilities, freshness, source, effort, status, notes, and last activity.
- [ ] Add at least three application records covering Applying, Submitted, and Interviewing.
- [ ] Add at least two interview records covering Upcoming and Completed.
- [ ] Move or re-export existing CV and cover letter fixtures.
- [ ] Add profile and evidence-story fixtures based on current Alex Morgan content.

**Acceptance:** Existing pages can still import compatible fixture exports during migration.

### T-103 — Implement pure selectors

**Add:** `components/career/journey/selectors.ts`

- [ ] `getRoleById`.
- [ ] `getApplicationById` and `getApplicationByRoleId`.
- [ ] `getInterviewById` and `getInterviewByRoleId`.
- [ ] `getRolesByStatus`.
- [ ] `getPipelineCounts`.
- [ ] `filterAndSortRoles`.
- [ ] `calculateApplicationProgress`.
- [ ] `calculateInterviewReadiness`.
- [ ] `getNextAction`.
- [ ] `getHighestPriorityAction`.

**Acceptance:** Functions are deterministic and contain no React or browser APIs.

### T-104 — Implement reducer

**Add:** `components/career/journey/journeyReducer.ts`

- [ ] Implement save/unsave.
- [ ] Implement dismiss/restore.
- [ ] Implement start application.
- [ ] Implement artifact updates.
- [ ] Implement pre-flight toggles.
- [ ] Implement mark submitted/undo.
- [ ] Implement interview updates and completion.
- [ ] Implement role notes/profile updates.
- [ ] Implement comparison selection capped at three roles.
- [ ] Implement toast actions.
- [ ] Append local timeline events for meaningful transitions.

**Acceptance:** State updates are immutable and type-safe.

### T-105 — Implement versioned browser storage

**Add:** `components/career/journey/storage.ts`

- [ ] Use `careerai-journey-ui-v2`.
- [ ] Guard `window` access.
- [ ] Validate version and required shapes.
- [ ] Merge persisted mutable values with fresh fixtures.
- [ ] Fall back safely on invalid JSON.
- [ ] Exclude transient toasts and hydration fields.

**Acceptance:** Corrupt storage never crashes rendering.

### T-106 — Implement journey provider

**Add:** `components/career/journey/JourneyProvider.tsx`

- [ ] Create context for state and dispatch.
- [ ] Hydrate after mount.
- [ ] Persist relevant state changes.
- [ ] Expose `useJourney` with a useful missing-provider error.
- [ ] Provide reset-demo-data action.

**Acceptance:** State survives route navigation and browser refresh.

### T-107 — Add selector/reducer/storage tests

**Add:**

- `tests/journey-selectors.test.ts`
- `tests/journey-reducer.test.ts`
- `tests/journey-storage.test.ts`

- [ ] Test next-action mapping.
- [ ] Test pipeline counts.
- [ ] Test filtering and sorting.
- [ ] Test readiness weights.
- [ ] Test application progress.
- [ ] Test save/start/submit/interview transitions.
- [ ] Test invalid storage fallback.

**Acceptance:** `npm test` passes in the existing Node environment.

## Phase 2 — Shell, tokens, and shared UI

### T-201 — Introduce CareerAI design tokens

**Change:** `app/globals.css` or add imported `styles/career-tokens.css`

- [ ] Add semantic surface, text, border, brand, status, focus, spacing, radius, and shadow tokens.
- [ ] Retain current landing-page styling.
- [ ] Add a global visible focus rule using `:focus-visible`.
- [ ] Add reduced-motion handling.
- [ ] Format new CSS for maintainability rather than appending another minified block.

**Acceptance:** Existing landing page remains visually intact.

### T-202 — Build shared UI primitives

**Add under:** `components/career/ui/`

- [ ] `StatusBadge`.
- [ ] `Progress`.
- [ ] `EmptyState`.
- [ ] `Skeleton`.
- [ ] `ConfirmDialog`.
- [ ] `ToastRegion`.
- [ ] Optional `Button`, `Card`, and `PageHeader` only if they reduce duplication.

**Acceptance:** Primitives have semantic markup and visible focus states.

### T-203 — Build responsive journey shell

**Add:** `components/career/shell/CareerShell.tsx`  
**Change:** `components/career/CareerNav.tsx`

- [ ] Rename navigation labels to Home, Discover, Applications, Interviews, Profile.
- [ ] Add `/dashboard` and `/profile`.
- [ ] Remove Saved from primary navigation.
- [ ] Add `aria-current="page"`.
- [ ] Implement responsive mobile behavior.
- [ ] Keep logo rendered with `next/image`.
- [ ] Mount `ToastRegion` once in the shell.

**Acceptance:** No horizontal navigation overflow at 360px.

### T-204 — Wrap dashboard route group

**Change:** `app/(dashboard)/layout.tsx`

- [ ] Wrap children with `JourneyProvider`.
- [ ] Render `CareerShell` around children.
- [ ] Remove repeated `CareerNav` instances from individual page wrappers after migration.
- [ ] Ensure the route group has one `main` landmark per page, not nested `main` elements.

**Acceptance:** All dashboard routes share state and shell.

## Phase 3 — Home and Profile

### T-301 — Build journey dashboard

**Add:** `components/career/dashboard/CareerDashboardPage.tsx`  
**Change:** `app/(dashboard)/dashboard/page.tsx`

- [ ] Render greeting and search summary.
- [ ] Render highest-priority next action.
- [ ] Render pipeline counts and filterable role list.
- [ ] Render upcoming deadlines/interviews.
- [ ] Render shortlist preview.
- [ ] Render recent activity.
- [ ] Add empty state linking to Discover.

**Acceptance:** Every dashboard card links to a valid route.

### T-302 — Build pipeline overview

**Add:** `components/career/dashboard/PipelineOverview.tsx`

- [ ] Use buttons or links with accessible labels.
- [ ] Show labels and counts, not color alone.
- [ ] Support selected stage state.
- [ ] Stack or scroll safely on mobile.

### T-303 — Redesign Profile page

**Add:** `components/career/profile/CareerProfilePage.tsx`  
**Change:** `app/(dashboard)/profile/page.tsx`

- [ ] Add completeness summary.
- [ ] Add one next-useful-field card.
- [ ] Add editable target role/preferences fields.
- [ ] Add skills chips.
- [ ] Add evidence/achievement cards.
- [ ] Add STAR story bank.
- [ ] Add provenance labels.
- [ ] Add Reset demo data control with confirmation.
- [ ] Disclose browser-local persistence.

**Acceptance:** Local edits survive refresh.

## Phase 4 — Discover, role detail, and Shortlist

### T-401 — Replace simplified Jobs page with Discover results

**Change:** `components/career/JobSearchPage.tsx`

- [ ] Keep editable skills and positions.
- [ ] Show role results on initial render.
- [ ] Add local “Generate matches” loading/result update.
- [ ] Add filter and sort controls.
- [ ] Add result count live region.
- [ ] Add active filter chips and Clear all.
- [ ] Add saved-only toggle.

**Acceptance:** Initial page provides value before user input.

### T-402 — Redesign JobCard

**Change:** `components/career/JobCard.tsx`

- [ ] Show match score with confidence text.
- [ ] Show status badge.
- [ ] Show freshness, salary, and work style.
- [ ] Show two fit reasons and one material gap.
- [ ] Change primary CTA to View role.
- [ ] Implement save with `aria-pressed`.
- [ ] Implement dismiss with Undo toast.
- [ ] Remove direct default jump to `/applications`.

**Acceptance:** Card works in Discover, Shortlist, and Dashboard contexts.

### T-403 — Add role detail route

**Add:**

- `app/(dashboard)/jobs/[jobId]/page.tsx`
- `components/career/discover/RoleDetailPage.tsx`
- `components/career/discover/FitBreakdown.tsx`
- `components/career/discover/RequirementCoverage.tsx`

- [ ] Resolve role by route parameter.
- [ ] Add not-found UI for invalid fixture IDs.
- [ ] Render role summary and metadata.
- [ ] Render fit reasons, gaps, blockers, and requirements.
- [ ] Render responsibilities, source, and effort.
- [ ] Render state-aware primary CTA.
- [ ] Add Save/Unsave and Dismiss/Archive.
- [ ] Add local notes field.

**Acceptance:** Start application creates or opens the role’s application record.

### T-404 — Replace separate saved-ID model

**Change or remove:** `components/career/useSavedJobs.ts`

- [ ] Migrate all save behavior to `JourneyRole.status`.
- [ ] Keep a compatibility hook only if it delegates to `useJourney`.
- [ ] Remove duplicate storage keys after migration.

**Acceptance:** Discover and `/saved` always display the same Shortlisted set.

### T-405 — Redesign SavedJobsPage as Shortlist

**Change:** `components/career/SavedJobsPage.tsx`

- [ ] Show shortlist count.
- [ ] Add sort controls.
- [ ] Add priority and note preview.
- [ ] Add compare selection.
- [ ] Add Start application CTA.
- [ ] Add empty state and local-storage disclosure.

### T-406 — Add role comparison

**Add:** `components/career/shortlist/RoleComparison.tsx`

- [ ] Cap selection at three roles.
- [ ] Compare match, gap, salary, work style, freshness, and effort.
- [ ] Implement accessible open/close behavior.
- [ ] Provide mobile card presentation.

## Phase 5 — Applications

### T-501 — Build Applications overview

**Add:** `components/career/applications/ApplicationsPage.tsx`  
**Change:** `app/(dashboard)/applications/page.tsx`

- [ ] Group records by Applying, Submitted, Interviewing, Offer, Closed.
- [ ] Add status filters and search.
- [ ] Show last activity and next action.
- [ ] Add empty state linking to Discover and Shortlist.

**Acceptance:** The page no longer opens directly into a generic draft.

### T-502 — Add application workspace route

**Add:**

- `app/(dashboard)/applications/[applicationId]/page.tsx`
- `components/career/applications/ApplicationWorkspacePage.tsx`

- [ ] Resolve application and linked role.
- [ ] Add role context header.
- [ ] Add progress stepper.
- [ ] Add document/pre-flight panels.
- [ ] Add requirements/evidence side panel.
- [ ] Add activity timeline and notes.
- [ ] Add not-found UI.

### T-503 — Refactor DraftStudio into role-bound component

**Refactor:** `components/career/DraftStudioPage.tsx`  
**Preferred target:** `components/career/applications/DraftStudio.tsx`

- [ ] Accept role, application, document kind, and callbacks as props.
- [ ] Preserve CV and cover letter editing.
- [ ] Preserve quick suggestions.
- [ ] Replace generic template tools with role-requirement actions.
- [ ] Include selected role/company in content and helper text.
- [ ] Show a local-template disclaimer.
- [ ] Add `role="textbox"`, label, multiline semantics, and focus style to the editable document.
- [ ] Show unsupported-claim warning UI for a fixture suggestion.

**Acceptance:** Drafts are never shown without role context.

### T-504 — Build application stepper

**Add:** `components/career/applications/ApplicationStepper.tsx`

- [ ] Review requirements.
- [ ] Tailor CV.
- [ ] Tailor cover letter.
- [ ] Pre-flight.
- [ ] Submitted.
- [ ] Support completed/current/upcoming states with text and icon.

### T-505 — Build pre-flight checklist

**Add:** `components/career/applications/PreflightChecklist.tsx`

- [ ] Render required checks.
- [ ] Derive progress.
- [ ] Keep every item keyboard operable.
- [ ] Show blocking warning when unsupported claim remains unresolved.
- [ ] Provide external application placeholder action.

### T-506 — Implement explicit submission confirmation

- [ ] Add Mark as submitted button.
- [ ] Open confirmation dialog.
- [ ] State that CareerAI does not submit externally.
- [ ] Dispatch mark-submitted action only after confirmation.
- [ ] Show success toast with View tracking action.
- [ ] Provide Undo for the current session.

### T-507 — Build application activity timeline

**Add:** `components/career/applications/ActivityTimeline.tsx`

- [ ] Render chronological events.
- [ ] Use semantic list markup.
- [ ] Include human-readable timestamps/labels.
- [ ] Add events from reducer transitions.

## Phase 6 — Interviews

### T-601 — Build Interviews overview

**Add:** `components/career/interviews/InterviewsPage.tsx`  
**Change:** `app/(dashboard)/interviews/page.tsx`

- [ ] Group records into Upcoming, Needs preparation, and Completed.
- [ ] Show date, stage, role, company, readiness, and next action.
- [ ] Add empty state linking to Submitted applications.

### T-602 — Add interview workspace route

**Add:**

- `app/(dashboard)/interviews/[interviewId]/page.tsx`
- `components/career/interviews/InterviewWorkspacePage.tsx`

- [ ] Resolve interview, role, and application.
- [ ] Add role context and interview summary.
- [ ] Integrate practice, evidence, checklist, notes, and questions.
- [ ] Add not-found UI.

### T-603 — Refactor current InterviewPrepPage

**Refactor:** `components/career/InterviewPrepPage.tsx`

- [ ] Extract reusable Practice panel.
- [ ] Extract Evidence story list.
- [ ] Extract Preparation checklist.
- [ ] Preserve current draft feedback behavior.
- [ ] Persist answers and notes in journey state.
- [ ] Show requirement context for each practice question.

### T-604 — Implement weighted readiness

- [ ] Use selector-based weighted calculation.
- [ ] Expose semantic progress.
- [ ] Show the next missing preparation action.
- [ ] Verify readiness cannot exceed 100.

### T-605 — Add post-interview flow

**Add:** `components/career/interviews/PostInterviewPanel.tsx`

- [ ] Add Mark interview complete confirmation.
- [ ] Capture questions asked.
- [ ] Capture self-assessment.
- [ ] Capture signals/concerns.
- [ ] Generate a local fixture thank-you note draft.
- [ ] Add follow-up date placeholder UI.
- [ ] Clearly state that no email is sent.

## Phase 7 — Shared states and accessibility

### T-701 — Add loading skeletons

- [ ] Dashboard.
- [ ] Discover cards.
- [ ] Applications list/workspace.
- [ ] Interviews list/workspace.
- [ ] Profile.

**Acceptance:** Skeletons do not create large layout shifts.

### T-702 — Add empty and no-results states

- [ ] Dashboard empty.
- [ ] Discover no results.
- [ ] Shortlist empty.
- [ ] Applications empty.
- [ ] Interviews empty.
- [ ] Evidence bank empty.

### T-703 — Add recoverable error states

- [ ] Invalid role/application/interview ID.
- [ ] Storage unavailable.
- [ ] Storage parse failure.
- [ ] Generic component error fallback where practical.

### T-704 — Keyboard and focus audit

- [ ] Navigation.
- [ ] Filters.
- [ ] Save/dismiss/undo.
- [ ] Comparison dialog.
- [ ] Application tabs/buttons.
- [ ] Submission dialog.
- [ ] Interview question navigation.
- [ ] Editable document.
- [ ] Reset demo data dialog.

### T-705 — Semantic audit

- [ ] One `h1` per page.
- [ ] Logical heading hierarchy.
- [ ] One `main` landmark.
- [ ] Correct links versus buttons.
- [ ] Form labels.
- [ ] Live regions.
- [ ] Progress semantics.
- [ ] Status text in addition to color.

### T-706 — Responsive audit

Manually verify at 360, 768, 1024, and 1440 pixels.

- [ ] No horizontal page overflow.
- [ ] Mobile nav usable.
- [ ] Cards stack correctly.
- [ ] Sidebars become sequential content.
- [ ] Sticky panels become static where required.
- [ ] Touch targets are practical.
- [ ] Long company names, salaries, and notes wrap safely.

## Phase 8 — Tests and final verification

### T-801 — Add optional component tests

If adding DOM tests:

- [ ] Add only `jsdom` if missing.
- [ ] Scope UI tests with `// @vitest-environment jsdom`.
- [ ] Test save/unsave.
- [ ] Test submission confirmation.
- [ ] Test readiness changes.
- [ ] Test empty state.

If DOM tests are not added:

- [ ] Expand reducer/selector coverage for equivalent behavior.
- [ ] Document manual test evidence.

### T-802 — Remove dead UI code

- [ ] Remove unused old navigation classes/components.
- [ ] Remove duplicate saved-job storage logic.
- [ ] Remove obsolete direct links to generic drafting.
- [ ] Remove unused fixture fields only after migration.
- [ ] Keep unrelated landing and backend code untouched.

### T-803 — Final quality gates

- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm test`.
- [ ] `npm run build`.
- [ ] Review git diff for accidental backend changes.
- [ ] Verify no secrets or generated files are added.

### T-804 — Final implementation report

Report:

- [ ] Routes changed or added.
- [ ] Components added or refactored.
- [ ] State and storage behavior.
- [ ] Accessibility behavior.
- [ ] Tests added.
- [ ] Commands run and results.
- [ ] Any remaining limitations.

## Recommended commit sequence

1. `feat(ui): add role journey state and selectors`
2. `feat(ui): add responsive career shell and tokens`
3. `feat(ui): redesign dashboard and profile journey views`
4. `feat(ui): add discover results and role detail`
5. `feat(ui): unify shortlist state and comparison`
6. `feat(ui): add application pipeline and role workspace`
7. `feat(ui): add interview overview and workspace`
8. `test(ui): cover journey selectors and transitions`
9. `fix(ui): complete responsive and accessibility pass`

## Final scope checklist

- [ ] UI-only changes.
- [ ] No database changes.
- [ ] No migrations.
- [ ] No API changes.
- [ ] No auth changes.
- [ ] No real AI calls.
- [ ] No email/calendar integrations.
- [ ] No external submission behavior.
- [ ] Browser-local state is clearly disclosed.
