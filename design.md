# CareerAI Job Hunter Journey — UI Design and Technical Design

**Related document:** `requirements.md`  
**Scope:** Front-end presentation, interaction, and browser-local demo state only

## 1. Design summary

The enhanced CareerAI UI will replace four disconnected tool experiences with a role-centric journey shell. A shared front-end state model will let Discover, Shortlist, Applications, Interviews, Home, and Profile render consistent views of the same fixture roles.

The design deliberately avoids backend changes. It simulates realistic lifecycle transitions through a versioned browser-local store and deterministic selectors.

## 2. Current-state architecture

The repository currently uses:

- Next.js App Router.
- Route wrappers in `app/(dashboard)`.
- Shared components in `components/career`.
- `CareerNav` for the workspace header.
- `JobSearchPage`, `SavedJobsPage`, `DraftStudioPage`, and `InterviewPrepPage` as client components.
- `careerJobs` and `drafts` fixtures in `components/career/data.ts`.
- `useSavedJobs` for browser-local saved IDs.
- Global classes in `app/globals.css`.

### Current continuity gaps

- `JobCard` links directly to `/applications` rather than a role-detail decision step.
- Drafting content is not bound to a selected role record.
- The interview workspace is a single hard-coded example.
- Saved jobs use a separate ID set rather than a canonical role status.
- Dashboard and Profile routes exist but do not use the CareerAI journey shell.
- Navigation labels reflect product modules instead of user goals.

## 3. Target architecture

## 3.1 Architectural decision

Introduce a small UI journey layer consisting of:

1. Typed fixtures.
2. A reducer-backed React context in the dashboard layout.
3. Pure selectors for pipeline, next action, filtering, and readiness.
4. Shared role/status components.
5. Page compositions for each journey surface.
6. Versioned `localStorage` persistence.

This provides cross-route continuity without touching backend code.

## 3.2 Proposed directory structure

```text
app/
  (dashboard)/
    layout.tsx
    dashboard/page.tsx
    jobs/page.tsx
    jobs/[jobId]/page.tsx
    saved/page.tsx
    applications/page.tsx
    applications/[applicationId]/page.tsx
    interviews/page.tsx
    interviews/[interviewId]/page.tsx
    profile/page.tsx

components/
  career/
    shell/
      CareerShell.tsx
      CareerNav.tsx
      MobileNav.tsx
      PageHeader.tsx
    journey/
      JourneyProvider.tsx
      journeyReducer.ts
      selectors.ts
      storage.ts
      types.ts
      fixtures.ts
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
      EmptyState.tsx
      FilterBar.tsx
      Progress.tsx
      Skeleton.tsx
      StatusBadge.tsx
      ToastRegion.tsx
      ConfirmDialog.tsx
    dashboard/
      CareerDashboardPage.tsx
      NextActionCard.tsx
      PipelineOverview.tsx
      DeadlineList.tsx
      RecentRoles.tsx
    discover/
      JobSearchPage.tsx
      JobCard.tsx
      JobFilters.tsx
      RoleDetailPage.tsx
      FitBreakdown.tsx
      RequirementCoverage.tsx
    shortlist/
      SavedJobsPage.tsx
      RoleComparison.tsx
    applications/
      ApplicationsPage.tsx
      ApplicationWorkspacePage.tsx
      ApplicationStepper.tsx
      DraftStudio.tsx
      PreflightChecklist.tsx
      ActivityTimeline.tsx
    interviews/
      InterviewsPage.tsx
      InterviewWorkspacePage.tsx
      ReadinessSummary.tsx
      PracticePanel.tsx
      EvidenceStoryList.tsx
      PostInterviewPanel.tsx
    profile/
      CareerProfilePage.tsx
      ProfileCompleteness.tsx
      EvidenceBank.tsx
      PreferenceEditor.tsx

styles/
  career-tokens.css
  career-shell.css
  career-components.css
  career-pages.css
```

### Minimal-change alternative

If the implementation should avoid a larger directory migration, keep existing component paths and add the journey layer under `components/career/journey`. The key requirement is separation of state/selectors from page markup, not exact folder naming.

## 4. Data design

## 4.1 Presentation types

```ts
export type JourneyStatus =
  | "discovered"
  | "shortlisted"
  | "applying"
  | "submitted"
  | "interviewing"
  | "offer"
  | "accepted"
  | "closed";

export type MatchConfidence = "high" | "medium" | "low";
export type EvidenceCoverage = "strong" | "partial" | "missing" | "blocker";

export type RoleRequirement = {
  id: string;
  label: string;
  coverage: EvidenceCoverage;
  evidenceIds: string[];
  note?: string;
};

export type JourneyRole = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  workStyle: "Remote" | "Hybrid" | "On-site";
  level: string;
  salary?: string;
  postedLabel: string;
  closingLabel?: string;
  sourceLabel: string;
  sourceUrl?: string;
  matchScore: number;
  confidence: MatchConfidence;
  fitReasons: string[];
  materialGap?: string;
  requirements: RoleRequirement[];
  responsibilities: string[];
  estimatedEffort: "Low" | "Medium" | "High";
  status: JourneyStatus;
  priority?: "high" | "medium" | "low";
  notes: string;
  dismissed?: boolean;
  lastActivityAt: string;
};

export type ApplicationArtifact = {
  id: string;
  roleId: string;
  kind: "cv" | "cover-letter";
  title: string;
  html: string;
  completed: boolean;
  updatedLabel: string;
};

export type ApplicationRecord = {
  id: string;
  roleId: string;
  started: boolean;
  submitted: boolean;
  preflight: Record<string, boolean>;
  artifacts: ApplicationArtifact[];
  timeline: JourneyEvent[];
};

export type InterviewRecord = {
  id: string;
  roleId: string;
  stage: string;
  scheduledLabel: string;
  durationLabel: string;
  participants: string[];
  questionIndex: number;
  answers: Record<string, string>;
  selectedEvidenceIds: string[];
  checklist: Record<string, boolean>;
  questionsToAsk: string;
  privateNotes: string;
  completed: boolean;
  postInterviewNotes?: string;
};

export type EvidenceStory = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  metric?: string;
  provenance: "resume" | "user" | "ai-suggested";
};
```

## 4.2 UI store

```ts
export type JourneyState = {
  version: 2;
  roles: JourneyRole[];
  applications: ApplicationRecord[];
  interviews: InterviewRecord[];
  evidence: EvidenceStory[];
  profile: CareerProfile;
  dismissedRoleIds: string[];
  selectedComparisonRoleIds: string[];
  toasts: ToastMessage[];
  hydrated: boolean;
};
```

## 4.3 Reducer actions

```ts
export type JourneyAction =
  | { type: "HYDRATE"; payload: JourneyState }
  | { type: "RESET_DEMO_DATA" }
  | { type: "SAVE_ROLE"; roleId: string }
  | { type: "UNSAVE_ROLE"; roleId: string }
  | { type: "DISMISS_ROLE"; roleId: string }
  | { type: "RESTORE_ROLE"; roleId: string }
  | { type: "START_APPLICATION"; roleId: string }
  | { type: "UPDATE_ARTIFACT"; roleId: string; kind: "cv" | "cover-letter"; html: string }
  | { type: "TOGGLE_PREFLIGHT"; applicationId: string; itemId: string }
  | { type: "MARK_SUBMITTED"; applicationId: string }
  | { type: "UNDO_SUBMITTED"; applicationId: string }
  | { type: "SCHEDULE_INTERVIEW"; roleId: string }
  | { type: "UPDATE_INTERVIEW"; interviewId: string; patch: Partial<InterviewRecord> }
  | { type: "MARK_INTERVIEW_COMPLETE"; interviewId: string }
  | { type: "UPDATE_ROLE_NOTES"; roleId: string; notes: string }
  | { type: "UPDATE_PROFILE"; patch: Partial<CareerProfile> }
  | { type: "ADD_TOAST"; toast: ToastMessage }
  | { type: "DISMISS_TOAST"; toastId: string };
```

## 4.4 Selectors

Selectors must remain pure and independently testable.

```ts
getVisibleRoles(state)
getShortlistedRoles(state)
getRolesByStatus(state)
getRoleById(state, roleId)
getApplicationByRoleId(state, roleId)
getInterviewByRoleId(state, roleId)
getNextAction(role, application?, interview?)
getPipelineCounts(state)
filterAndSortRoles(roles, filters)
calculateApplicationProgress(application)
calculateInterviewReadiness(interview)
getHighestPriorityAction(state)
```

## 5. State persistence design

## 5.1 Storage contract

Use one versioned key:

```ts
const STORAGE_KEY = "careerai-journey-ui-v2";
```

### Rules

- Read storage only in a client effect or lazy initializer guarded by `typeof window`.
- Validate the parsed object structurally before use.
- Merge persisted mutable fields with current fixtures so fixture additions are not lost.
- Fall back to fresh fixtures on parse/version errors.
- Persist only UI demo state, not transient toasts or hydration flags.
- Include “Reset demo data” in Profile.

## 5.2 Hydration behavior

To avoid hydration mismatch:

1. Render fixture defaults on the server.
2. Set `hydrated: false` initially.
3. Read storage after mount.
4. Dispatch `HYDRATE`.
5. Show non-blocking skeletons only for data that would visibly jump.

## 6. Information architecture

## 6.1 Primary navigation

| Label | Route | Purpose |
|---|---|---|
| Home | `/dashboard` | Pipeline, deadlines, next action |
| Discover | `/jobs` | Matches, filters, role inspection |
| Applications | `/applications` | Application pipeline and workspaces |
| Interviews | `/interviews` | Upcoming and completed interview prep |
| Profile | `/profile` | Preferences, evidence, reusable career data |

### Compatibility route

`/saved` remains available but is not a first-class primary navigation destination. It renders the Shortlisted filter view and may be linked from Home or Discover.

## 6.2 Route behavior

### `/dashboard`

Journey overview and next-action prioritization.

### `/jobs`

Discover results with filters and immediate sample matches.

### `/jobs/[jobId]`

Decision view: fit, requirements, gaps, role value, and state-aware action.

### `/saved`

Shortlist compatibility view and role comparison.

### `/applications`

Grouped pipeline of active and closed application records.

### `/applications/[applicationId]`

Role-bound document workspace, progress, pre-flight, timeline, and submission confirmation.

### `/interviews`

Upcoming, preparation-needed, and completed interview list.

### `/interviews/[interviewId]`

Role-specific interview preparation and post-interview capture.

### `/profile`

Progressive profile, preferences, and evidence bank.

## 7. Page design

## 7.1 Global shell

### Desktop wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ CareerAI      Home Discover Applications Interviews Profile   User │
├─────────────────────────────────────────────────────────────────────┤
│ Page title / role context                              Primary CTA  │
│ Supporting summary / status / metadata                              │
├─────────────────────────────────────────────────────────────────────┤
│ Main page content                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile wireframe

```text
┌──────────────────────────────┐
│ CareerAI              Menu   │
├──────────────────────────────┤
│ Page title                   │
│ Context + primary CTA        │
│ Main content                 │
├──────────────────────────────┤
│ Home Discover Apps Int. Me   │
└──────────────────────────────┘
```

Use either a menu or bottom navigation. Do not display both simultaneously.

## 7.2 Home dashboard

```text
┌─────────────────────────────────────────────────────────────────┐
│ Good morning. Keep your search moving.                           │
├─────────────────────────────────────────────────────────────────┤
│ NEXT BEST ACTION                                                 │
│ Continue Senior Product Designer application        [Continue]  │
│ CV ready • Cover letter needs review • 2 days active             │
├──────────────────────────────────┬──────────────────────────────┤
│ Pipeline                         │ Upcoming                     │
│ 6 Discover • 2 Applying • ...    │ Jul 16 interview            │
├──────────────────────────────────┼──────────────────────────────┤
│ Roles needing attention          │ Shortlist                    │
└──────────────────────────────────┴──────────────────────────────┘
```

### Priority algorithm

`getHighestPriorityAction` should rank fixture actions in this order:

1. Interview within seven days with readiness below 80%.
2. Application in progress with incomplete pre-flight.
3. Submitted role needing follow-up.
4. Shortlisted role with a closing date.
5. Highest-match discovered role.

## 7.3 Discover

### Page structure

1. Intro and query controls.
2. Compact profile chips.
3. Filter/sort bar.
4. Result summary.
5. Responsive role card grid/list.

### Role card layout

```text
┌──────────────────────────────────────────────┐
│ Senior Product Designer      94% High match │
│ Northstar AI • Remote • $145–175k           │
│ Posted 2d ago                               │
│                                              │
│ ✓ Product discovery                         │
│ ✓ Design systems                            │
│ △ Enterprise AI domain                      │
│                                              │
│ [View role]                   [Save] [•••]   │
└──────────────────────────────────────────────┘
```

### Role detail layout

Desktop uses a two-column decision layout:

```text
┌──────────────────────────────────┬─────────────────────────────┐
│ Role summary                     │ Decision card               │
│ Responsibilities                 │ 94% High match              │
│ Requirements                     │ 2 strong reasons            │
│ Company/source                   │ 1 gap                       │
│                                  │ Effort: Medium              │
│                                  │ [Start application]         │
│                                  │ [Save] [Dismiss]            │
└──────────────────────────────────┴─────────────────────────────┘
```

Mobile moves the decision card before long job-description content.

## 7.4 Shortlist and comparison

Shortlist uses the same role card component with shortlist-specific metadata:

- Priority.
- Closing date.
- User note preview.
- Compare checkbox.
- Start application CTA.

Comparison opens a dialog or inline panel. Use native table semantics on desktop; transform each role into a labeled card on narrow screens.

## 7.5 Applications overview

```text
┌─────────────────────────────────────────────────────────────────┐
│ Applications                                      [Discover jobs]│
│ [All] [Applying] [Submitted] [Interviewing] [Closed]             │
├─────────────────────────────────────────────────────────────────┤
│ Senior Product Designer • Northstar AI                          │
│ Applying • CV complete • Cover letter incomplete                │
│ Last activity today                              [Continue]      │
├─────────────────────────────────────────────────────────────────┤
│ Frontend Engineer • Orbit Commerce                              │
│ Submitted • Follow-up available in 3 days          [View]       │
└─────────────────────────────────────────────────────────────────┘
```

## 7.6 Application workspace

### Desktop composition

```text
┌─────────────────────────────────────────────────────────────────┐
│ Senior Product Designer • Northstar AI • Applying   [Continue]  │
│ Review → CV → Cover letter → Pre-flight → Submitted              │
├──────────────────────────────────────┬──────────────────────────┤
│ [CV] [Cover letter] [Pre-flight]     │ Role requirements        │
│ Editable document                    │ Evidence coverage        │
│ Contextual suggestions               │ Activity timeline        │
│                                      │ Notes                    │
├──────────────────────────────────────┴──────────────────────────┤
│ AI assistance / contextual actions                              │
└─────────────────────────────────────────────────────────────────┘
```

### Drafting design decisions

- Keep `contentEditable` for parity with the current prototype.
- Move document-type switching into the workspace tabs.
- Replace role-template buttons such as “Product / Engineering / Data” with requirement-grounded actions.
- Retain free-form editing as a secondary panel.
- Show local-template disclaimer in a subtle helper text.
- Do not render untrusted external HTML; all HTML remains trusted fixture-generated content.

### Pre-flight confirmation

A confirmation dialog must say:

> Mark this application as submitted only after completing the application on the employer’s site. CareerAI will update your tracker; it will not submit anything for you.

## 7.7 Interviews overview and workspace

### Overview

Use cards grouped by urgency. Each includes:

- Date/time.
- Stage.
- Role and company.
- Readiness percentage and label.
- Missing preparation task.
- Continue preparation CTA.

### Workspace

Keep the current practice/evidence/checklist concept, but introduce role context and a clear sequence:

1. Understand the interview.
2. Review requirements.
3. Select evidence.
4. Practice answers.
5. Prepare questions.
6. Capture post-interview notes.

### Readiness calculation

```ts
const weights = {
  requirementsReviewed: 20,
  twoStoriesSelected: 25,
  answerDrafted: 25,
  companyResearchComplete: 15,
  questionsAdded: 15,
};
```

Readiness is the sum of completed weighted conditions, capped at 100.

## 7.8 Profile

Profile uses cards with one expanded “next useful field” panel.

```text
┌─────────────────────────────────────────────────────────────────┐
│ Profile                                              72% complete│
│ Next useful field: Add a target salary range          [Add]      │
├──────────────────┬──────────────────┬───────────────────────────┤
│ Preferences      │ Skills           │ Resume source             │
├──────────────────┴──────────────────┴───────────────────────────┤
│ Evidence bank: achievement and STAR story cards                 │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Shared component design

## 8.1 `StatusBadge`

Props:

```ts
type StatusBadgeProps = {
  status: JourneyStatus;
  compact?: boolean;
};
```

Behavior:

- Text + optional icon.
- No inline styles.
- Central map for label and class.

## 8.2 `NextActionButton`

Props:

```ts
type NextActionButtonProps = {
  role: JourneyRole;
  application?: ApplicationRecord;
  interview?: InterviewRecord;
  size?: "default" | "compact";
};
```

Behavior:

- Uses `getNextAction`.
- Renders a link when the action navigates.
- Renders a button when the action mutates local state.

## 8.3 `Progress`

Use a semantic label and visual bar.

```tsx
<div
  className={styles.progress}
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={value}
  aria-label={label}
>
  <span style={{ inlineSize: `${value}%` }} />
</div>
```

## 8.4 `ConfirmDialog`

Prefer the native `<dialog>` element if browser and test behavior remain reliable. Otherwise implement an accessible controlled modal without adding a UI library.

Required behavior:

- Initial focus on the safe action.
- Escape closes.
- Backdrop click may close only for non-destructive dialogs.
- Destructive action is visually distinct but not color-only.

## 8.5 Toast region

Place one region near the end of `CareerShell`:

```tsx
<div aria-live="polite" aria-atomic="false" className={styles.toastRegion} />
```

Each toast may contain a message and Undo button.

## 9. Styling design

## 9.1 Token layer

Add tokens to `:root` or `styles/career-tokens.css`.

```css
:root {
  --career-bg: #f7faf8;
  --career-surface: #ffffff;
  --career-surface-subtle: #f2f8f4;
  --career-text: #102019;
  --career-text-muted: #607069;
  --career-border: #dce8df;
  --career-brand: #159447;
  --career-brand-strong: #0f7738;
  --career-focus: #0b6fd3;
  --career-danger: #b42318;
  --career-warning: #9a6700;
  --career-radius-sm: 8px;
  --career-radius-md: 14px;
  --career-radius-lg: 22px;
  --career-shadow-sm: 0 4px 14px rgb(15 23 42 / 0.06);
  --career-shadow-md: 0 16px 38px rgb(15 23 42 / 0.10);
  --career-content: 1180px;
}
```

Do not copy these values blindly if contrast testing requires adjustment.

## 9.2 CSS organization

The current `globals.css` is dense and largely minified. The preferred refactor is:

- Keep resets and global tokens in `app/globals.css`.
- Move CareerAI shell and component styles into imported, formatted CSS files or CSS modules.
- Preserve existing landing-page classes to avoid unrelated marketing-page regressions.
- Remove old CareerAI classes only after all references are migrated.

## 9.3 Breakpoints

```css
@media (max-width: 1100px) { /* reduce side panels */ }
@media (max-width: 900px)  { /* stack workspaces */ }
@media (max-width: 720px)  { /* mobile navigation and cards */ }
@media (max-width: 420px)  { /* compact spacing and typography */ }
```

Use content-driven layout rather than exact device assumptions.

## 9.4 Motion

Use subtle transitions for hover, selection, and toast entry. Disable transform and nonessential animation under:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## 10. Accessibility design

### Navigation

- `aria-label="Career workspace"`.
- `aria-current="page"` on active link.
- Mobile menu control exposes `aria-expanded` and `aria-controls`.

### Cards

- Do not make the entire card a nested interactive control.
- Use a heading with a linked title or explicit View role link.
- Save is a button with `aria-pressed`.

### Filters

- Use fieldsets and legends for grouped controls where appropriate.
- Announce the result count after filter changes through a polite live region.

### Tabs

Use true tab semantics only if arrow-key management is implemented. Otherwise use a button group that changes panels and clearly exposes the selected state with `aria-pressed`.

### Dialogs

Implement focus management and return focus.

### Editable documents

`contentEditable` regions must have:

- `role="textbox"`.
- `aria-multiline="true"`.
- An explicit label via `aria-labelledby`.
- Visible focus styling.

## 11. Error, empty, and loading design

## 11.1 Loading

Use skeleton shapes matching final content. Avoid full-screen spinners.

## 11.2 Empty state pattern

Each empty state includes:

1. Clear heading.
2. Brief explanation.
3. One primary action.
4. Optional secondary recovery action.

## 11.3 No-results pattern

For filters yielding zero roles:

- State that no roles match current filters.
- Offer Clear filters.
- Keep query inputs intact.

## 11.4 Storage failure

If browser storage fails:

- Keep the UI usable in memory.
- Show a non-blocking message: “Changes will last for this session only.”
- Do not surface raw exceptions.

## 12. Testing design

## 12.1 Pure unit tests

Add tests under `tests/**/*.test.ts` for:

- `getNextAction`.
- `getPipelineCounts`.
- `filterAndSortRoles`.
- `calculateApplicationProgress`.
- `calculateInterviewReadiness`.
- Storage version/fallback behavior.

These tests can run in the current Node test environment.

## 12.2 DOM tests

The repository already includes `@testing-library/react`, but Vitest currently uses a Node environment. Two acceptable options:

### Option A — Minimal DOM setup

- Add `jsdom` as a dev dependency.
- Set relevant UI tests to `// @vitest-environment jsdom`.
- Add a small setup file for DOM matchers only if needed.

### Option B — No new dependency

- Keep tests focused on pure selectors and reducer transitions.
- Rely on lint, typecheck, build, and a documented manual accessibility checklist.

Option A is preferred if dependency installation is reliable.

## 12.3 Manual QA matrix

Check all primary routes at 360, 768, 1024, and 1440 widths.

For each route verify:

- Keyboard tab order.
- Visible focus.
- No horizontal overflow.
- Heading structure.
- Empty state.
- Long text wrapping.
- Reduced motion.
- Browser refresh persistence.

## 13. Migration plan

### Phase 1 — Foundation

- Add journey types, fixtures, reducer, selectors, storage, and provider.
- Wrap `app/(dashboard)/layout.tsx` with the provider and shell.
- Keep old pages rendering during the transition.

### Phase 2 — Navigation and Home

- Replace current header with goal-oriented navigation.
- Redesign Dashboard and Profile inside the same shell.

### Phase 3 — Discover and Shortlist

- Expand fixtures.
- Restore role cards on `/jobs`.
- Add role details.
- Replace separate saved-ID storage with role status.

### Phase 4 — Applications

- Add overview and role workspace.
- Embed/refactor current Draft Studio.
- Add pre-flight, timeline, and submission confirmation.

### Phase 5 — Interviews

- Add interview list and role-bound workspace.
- Add weighted readiness and post-interview state.

### Phase 6 — Quality pass

- Accessibility.
- Responsive behavior.
- Loading/empty/error states.
- Tests and checks.
- Remove unused legacy classes/components.

## 14. File impact map

### Files expected to change

- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/jobs/page.tsx`
- `app/(dashboard)/saved/page.tsx`
- `app/(dashboard)/applications/page.tsx`
- `app/(dashboard)/interviews/page.tsx`
- `app/(dashboard)/profile/page.tsx`
- `components/career/CareerNav.tsx`
- `components/career/JobSearchPage.tsx`
- `components/career/JobCard.tsx`
- `components/career/SavedJobsPage.tsx`
- `components/career/DraftStudioPage.tsx`
- `components/career/InterviewPrepPage.tsx`
- `components/career/data.ts`
- `app/globals.css`
- `vitest.config.ts` only if DOM tests are added
- `package.json` only if a minimal UI-test dependency is added

### Files expected to be added

- Dynamic route pages for role/application/interview details.
- Journey state, types, selectors, storage, and provider modules.
- Shared UI primitives.
- Dashboard, application overview, interview overview, and profile components.
- Unit tests.

### Files that must not change for this initiative

- `db/**`
- `drizzle/**`
- `lib/auth/**`
- API routes under `app/api/**`
- Environment validation/configuration.
- AI provider or server prompt code.
- Database schemas or migrations.

## 15. Key design decisions

1. **Browser-local state is intentional for this scope.** It demonstrates continuity without backend work.
2. **Saved is a status, not a separate source of truth.** `/saved` remains as a filtered compatibility view.
3. **Drafting is embedded in an application workspace.** The current editor is preserved but receives role context.
4. **Role detail is a required decision step.** Discover cards no longer jump directly to drafting.
5. **Dashboard becomes the return point.** It prioritizes action rather than reporting generic statistics.
6. **No new UI framework.** Existing React, Next.js, and CSS are sufficient.
7. **Selectors drive behavior.** Page markup does not duplicate lifecycle logic.
