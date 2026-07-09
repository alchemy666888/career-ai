# Design: AI Job Search Architecture

## 1. System overview

AI Job Search is a repository-native workflow system for an AI coding CLI. It is organized around slash-command specifications, reusable skills, local source documents, LaTeX templates, portal CLI tools, and generated application state.

The system does not behave like a hosted SaaS product. Instead, the repository is the application runtime, database, prompt library, document store, and audit trail. The AI agent reads and edits local files while command markdown files define the process boundaries.

## 2. Major subsystems

### 2.1 Agent command layer

The `.claude/commands/` directory defines the user-facing workflows:

- `setup.md`: creates or refreshes the profile.
- `scrape.md`: discovers jobs through portal skills.
- `rank.md`: batch-scores scraped jobs.
- `apply.md`: evaluates one posting and generates application materials.
- `interview.md`: prepares for interviews from archived application context.
- `outcome.md`: records results and feedback.
- `expand.md`: enriches profile evidence.
- `upskill.md`: analyzes skill gaps and learning paths.
- `add-template.md`: registers LaTeX templates.
- `add-portal.md`: scaffolds new portal integrations.
- `reset.md`: safely removes user data.

Each command should be written as an executable specification: inputs, required files, workflow steps, validation checks, side effects, and final user-facing output.

### 2.2 Core career skill

The `.claude/skills/job-application-assistant/` skill stores profile and generation rules:

- `SKILL.md`: skill entry point and usage contract.
- `01-candidate-profile.md`: education, roles, projects, tools, credentials, achievements, languages, and constraints.
- `02-behavioral-profile.md`: working style, communication preferences, values, and behavioral signals.
- `03-writing-style.md`: tone, vocabulary, structure, and do/don't rules.
- `04-job-evaluation.md`: fit rubric, scoring dimensions, vetoes, goals, and preferences.
- `05-cv-templates.md`: CV section strategy, tailoring rules, and active template guidance.
- `06-cover-letter-templates.md`: cover-letter structure and personalization rules.
- `07-interview-prep.md`: STAR examples, interview themes, and mock interview protocol.

This skill is the canonical source for what the system may claim about the user.

### 2.3 Job search skill layer

The `.agents/skills/` directory contains market-specific portal integrations. Existing examples include Danish portals and LinkedIn public job listings. Each portal skill should contain:

- A `SKILL.md` describing the portal, access rules, usage, and expected output.
- A `cli/` package or script that performs the actual search.
- A normalized output schema so `/scrape` and `/rank` can consume results consistently.
- Tests or type checks appropriate for the implementation language.

Portal skills are replaceable adapters. Core workflows must not hard-code assumptions about a specific country or portal.

### 2.4 Document and state layer

The repository stores user inputs and generated state in predictable locations:

- `documents/`: source materials for setup and expansion.
- `documents/cv/`: master CV inputs.
- `documents/linkedin/`: LinkedIn exports.
- `documents/diplomas/`: education evidence.
- `documents/references/`: recommendations and references.
- `documents/applications/<company>_<role>/`: archived postings, submitted materials, outcomes, and interview notes.
- `job_scraper/`: scraper state, seen jobs, and result files.
- `upskill/`: generated upskilling reports.
- `job_search_tracker.csv`: application pipeline spreadsheet.

This layout supports repeatable command execution and later calibration.

### 2.5 Document generation layer

The default generation layer uses LaTeX:

- `cv/main_example.tex`: default moderncv-based CV template.
- `cover_letters/cover.cls`: custom cover-letter class.
- `cover_letters/cover_example.tex`: example cover letter and smoke-test fixture.
- `cover_letters/OpenFonts/`: bundled fonts.
- `templates/`: user-registered templates from `/add-template`.

The active template configuration must declare compile engine, page limits, required fonts/assets, placeholder strategy, and style constraints.

### 2.6 Tooling and quality layer

Supporting tooling includes:

- `salary_lookup.py`: optional salary benchmarking against user-provided salary data.
- `tools/convert_salary_excel.py`: salary data conversion.
- `tools/lint_skills.py`: command, skill, and settings linting.
- `.github/workflows/ci.yml`: LaTeX smoke compiles, skill lint, and portal CLI checks.
- `tests/`: automated checks for scripts, skills, and command contracts.

## 3. Core workflows

### 3.1 Setup workflow

1. Detect available onboarding path: documents folder, pasted CV, or interview.
2. Extract evidence-backed profile facts.
3. Populate structured profile files.
4. Configure search targets, locations, role families, and deal-breakers.
5. Validate that key sections are not empty.
6. Report missing evidence and recommended next steps.

### 3.2 Scrape workflow

1. Read search configuration from profile/evaluation files.
2. Invoke enabled portal skills with normalized query parameters.
3. Normalize results to a common job record.
4. Deduplicate by URL, company, title, and location heuristics.
5. Persist results and seen-job state.
6. Present a shortlist with enough context for the user to choose next actions.

### 3.3 Rank workflow

1. Load newly scraped or selected postings.
2. Fetch full posting text when available.
3. Score each posting against the fit rubric.
4. Apply deal-breakers and expiry checks.
5. Return ranked recommendations with evidence-backed strengths and gaps.
6. Hand off a selected posting to `/apply`.

### 3.4 Apply workflow

1. Parse the job posting from URL or pasted text.
2. Evaluate fit and recommend apply/skip/consider.
3. Draft a tailored CV and cover letter using only supported profile evidence.
4. Spawn or invoke an independent reviewer perspective for critique.
5. Revise drafts based on reviewer findings.
6. Compile PDFs with template-specific engines.
7. Inspect PDFs for page limits, orphaned headings, visible signature, font consistency, and layout errors.
8. Extract PDF text when possible and verify ATS readability.
9. Archive materials and present final output with a verification checklist.

### 3.5 Outcome workflow

1. Identify the tracked application.
2. Record status, stage, dates, notes, compensation signals, and feedback.
3. Archive final submitted artifacts and posting text.
4. Update `job_search_tracker.csv`.
5. Recommend recalibration when patterns emerge.

## 4. Data contracts

### 4.1 Normalized job record

A portal integration should emit records with these fields when available:

```json
{
  "id": "portal-specific-id-or-hash",
  "portal": "jobindex|jobnet|jobbank|jobdanmark|linkedin|custom",
  "title": "Role title",
  "company": "Employer",
  "location": "City/region/remote",
  "url": "Canonical posting URL",
  "date_posted": "ISO-8601 date or null",
  "deadline": "ISO-8601 date or null",
  "employment_type": "full-time|part-time|contract|internship|null",
  "seniority": "entry|mid|senior|lead|null",
  "summary": "Short snippet",
  "raw": "Portal-specific raw data or reference"
}
```

### 4.2 Fit evaluation output

Each scored job should include:

- Overall score and recommendation.
- Dimension scores for skill match, experience match, motivation/culture, logistics, career direction, and compensation/seniority if available.
- Evidence from the posting.
- Evidence from the candidate profile.
- Gaps and unsupported keywords.
- Deal-breaker status.
- Next action.

### 4.3 Application archive folder

Each application archive should contain, when available:

- `posting.md`: full posting text and source URL.
- `fit_evaluation.md`: scoring and apply/skip rationale.
- `cv.tex` and compiled CV PDF.
- `cover_letter.tex` and compiled cover-letter PDF.
- `review.md`: reviewer critique and resolved changes.
- `outcome.md`: status history and feedback.
- `interview_prep.md`: interview preparation notes.

## 5. Error handling and graceful degradation

- If a posting URL cannot be fetched, prompt for pasted posting text.
- If a portal blocks automated access, mark the portal result as unavailable and continue with other portals.
- If LaTeX compilation fails, inspect logs, fix template/content issues, and retry within a bounded loop.
- If `pdftotext` is unavailable, run visual/keyword review and clearly disclose the missing ATS extraction check.
- If evidence is insufficient for a requested claim, state the gap and omit or reframe the claim.
- If reset is requested, require preview and explicit confirmation before deletion.

## 6. Security and privacy design

- Treat all profile and document files as sensitive personal data.
- Avoid adding real personal documents or generated private applications to public commits.
- Do not store secrets in command files, skills, tracker CSV, or portal configs.
- Portal integrations must avoid credential scraping and must document access limitations.
- External research used by reviewer/interview workflows must be verified before being used in final claims.

## 7. Extensibility guidelines for Codex

- Prefer adding a new skill/adapter over modifying core workflows for market-specific behavior.
- Preserve command contracts and file locations unless a migration note is added.
- Add tests for any parser, normalizer, CLI contract, or lint rule changed.
- Keep generated user data out of commits; commit framework docs, templates, examples, tests, and placeholders only.
- Update requirements, design, and tasks together when changing scope.
