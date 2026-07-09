# Tasks: Spec-Driven Development Plan

## Phase 0: Repository understanding and guardrails

- [ ] Inventory the repository structure and map each command, skill, tool, template, and state directory to the architecture in `design.md`.
- [ ] Identify files that contain personal user data versus reusable framework assets.
- [ ] Confirm `.gitignore` excludes generated PDFs, private documents, local tool caches, and sensitive application outputs where appropriate.
- [ ] Run existing lint and test commands to establish a baseline.
- [ ] Document any environment-only failures separately from product failures.

## Phase 1: Documentation alignment

- [x] Add `requirements.md` describing product goals, users, operating principles, functional requirements, non-functional requirements, and acceptance criteria.
- [x] Add `design.md` describing architecture, workflows, data contracts, privacy, and extensibility.
- [x] Add `tasks.md` describing implementation phases and task breakdown.
- [x] Add `codex-prompt.md` describing how Codex should execute future development from the spec.
- [ ] Cross-link the spec documents from `README.md` or `CONTRIBUTING.md` if maintainers want spec-driven development to be first-class.

## Phase 2: Command contract hardening

- [ ] Review every `.claude/commands/*.md` file for explicit inputs, outputs, side effects, validation, and failure modes.
- [ ] Add missing command preconditions and postconditions.
- [ ] Ensure `/setup` documents all three onboarding paths and idempotency expectations.
- [ ] Ensure `/scrape` defines portal selection, deduplication, result persistence, and handoff to `/rank` or `/apply`.
- [ ] Ensure `/rank` defines scoring dimensions, deal-breakers, expired-posting handling, and output schema.
- [ ] Ensure `/apply` defines fit evaluation, drafting, independent review, revision, PDF compile, ATS extraction, archiving, and final checklist.
- [ ] Ensure `/outcome` defines tracker updates and application archive schema.
- [ ] Ensure `/reset` requires preview and explicit confirmation.

## Phase 3: Data contracts and validation

- [ ] Create or update a documented normalized job-record schema for portal CLIs.
- [ ] Add validation tests for required job-record fields.
- [ ] Create or update a fit-evaluation output schema.
- [ ] Add fixture postings that cover good fit, weak fit, deal-breaker, expired posting, and unreachable posting cases.
- [ ] Add tests for application archive folder naming and required files.
- [ ] Add tests that prevent unsupported profile claims from appearing in generated examples.

## Phase 4: Portal integration quality

- [ ] Review each `.agents/skills/*-search` skill for consistent `SKILL.md` usage instructions.
- [ ] Confirm each portal CLI supports predictable query flags and normalized output.
- [ ] Add or update type checks for each Bun/TypeScript portal CLI.
- [ ] Add parser fixtures for representative portal result pages or API responses when allowed.
- [ ] Ensure each portal documents robots.txt/access rules, terms-of-service caveats, and personal-use limits.
- [ ] Verify LinkedIn integration is clearly marked as public-listing and personal-use only.

## Phase 5: Application artifact generation

- [ ] Confirm active CV and cover-letter template metadata includes compile engine, page limit, required fonts/assets, and placeholder strategy.
- [ ] Add smoke tests for default CV compilation with `lualatex`.
- [ ] Add smoke tests for default cover-letter compilation with `xelatex`.
- [ ] Add checks for generated PDFs exceeding page limits.
- [ ] Add optional ATS text-extraction checks using `pdftotext` when installed.
- [ ] Document graceful fallback behavior when LaTeX or `pdftotext` is missing.

## Phase 6: Privacy and safety

- [ ] Audit tracked files for private candidate information and replace with placeholders where needed.
- [ ] Add documentation warning users not to commit private documents or real applications to public forks.
- [ ] Ensure generated application archives are ignored or clearly documented as private by default.
- [ ] Add a no-auto-submit policy to relevant command docs.
- [ ] Ensure profile expansion requires linked/authorized public sources and source tags.
- [ ] Ensure salary benchmarking uses user-provided data and handles missing salary data gracefully.

## Phase 7: User experience polish

- [ ] Add a first-run checklist for prerequisites: AI coding CLI, Python, Bun, LaTeX, optional poppler.
- [ ] Add troubleshooting guidance for common LaTeX compilation failures.
- [ ] Add examples of good profile evidence versus unsupported claims.
- [ ] Add examples of ranked shortlist output.
- [ ] Add examples of reviewer critique and resolution notes.
- [ ] Add examples of outcome records that improve future calibration.

## Phase 8: Continuous integration

- [ ] Ensure CI runs skill linting.
- [ ] Ensure CI runs portal CLI type checks.
- [ ] Ensure CI runs LaTeX smoke compiles or skips with a clear environment message.
- [ ] Ensure CI runs Python tests for support tooling.
- [ ] Add CI checks for spec-document links if spec docs become required.
- [ ] Keep CI fast enough for fork contributors.

## Definition of done for future changes

A future change is complete when:

- [ ] It traces to a requirement in `requirements.md` or updates the requirement explicitly.
- [ ] It preserves or updates the architecture in `design.md`.
- [ ] It completes or adds relevant tasks in `tasks.md`.
- [ ] It includes tests or a documented reason tests are not applicable.
- [ ] It does not commit private user data.
- [ ] It keeps generated claims evidence-grounded.
- [ ] It documents any new command, skill, portal, template, or data contract.
