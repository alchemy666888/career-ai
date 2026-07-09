# Requirements: AI Job Search Spec-Driven Development

## 1. Product vision

AI Job Search is a local-first, agent-driven job application framework that turns an AI coding CLI into a structured career assistant. The system helps a job seeker build a verified career profile, discover relevant roles, evaluate fit, tailor CVs and cover letters, prepare for interviews, record outcomes, and learn from the job-market feedback loop.

The product must preserve the user's agency: the AI recommends, drafts, critiques, and verifies, while the user decides where to apply and reviews every submitted artifact.

## 2. Primary users

- **Job seeker:** Configures the profile, searches jobs, selects opportunities, reviews generated materials, tracks outcomes, and calibrates the workflow.
- **AI coding agent:** Executes slash-command workflows, reads local profile and source documents, calls portal tools, drafts artifacts, verifies claims, and updates local records.
- **Reviewer agent:** Independently critiques application drafts from a recruiter/company perspective before final revision.
- **Maintainer/adaptor:** Extends the framework to new job portals, templates, languages, or markets.

## 3. Operating principles

1. **Local-first privacy:** Personal profile data, source documents, generated applications, and tracker state remain in the user's repository/workspace unless the user explicitly shares them.
2. **Evidence-grounded claims:** Generated CVs, cover letters, interview answers, and profile expansions must not invent skills, achievements, employers, credentials, or motivations.
3. **Human-in-the-loop submission:** The system must never submit applications automatically; it produces reviewed outputs for the user to inspect and submit.
4. **Spec-driven extensibility:** Commands, skills, templates, and portal integrations must follow documented contracts so Codex or another AI coding CLI can safely extend them.
5. **Market portability:** The core workflow must be language- and country-agnostic; portal integrations can be market-specific and replaceable.
6. **Verifiable artifacts:** Generated PDFs must be compiled and inspected for layout and ATS-readable text before being presented as final.

## 4. Functional requirements

### FR-1: Profile setup and calibration

- The system must support profile creation from a documents folder, a pasted CV, or an interview-style onboarding flow.
- The setup flow must populate structured candidate-profile, behavioral-profile, writing-style, evaluation, CV-template, cover-letter-template, and interview-prep files.
- Re-running setup against the documents folder must be idempotent and safe as new source material is added.
- The system must support recalibrating search configuration independently via a search-section setup flow.
- The profile must track evidence sources for claims wherever possible.

### FR-2: Job discovery

- The system must provide a `/scrape` workflow that queries configured job portals, deduplicates postings, and presents matches sorted by relevance or fit.
- Portal tools must expose a consistent CLI contract: query parameters in, normalized job records out.
- The initial portal set must include Danish job boards and a country-agnostic LinkedIn public-listing integration.
- Portal integrations must clearly document access limitations, terms-of-service considerations, and personal-use expectations.
- The system must persist scraper state such as seen jobs and result files to avoid noisy duplicate results.

### FR-3: Job fit ranking

- The system must provide a `/rank` workflow that batch-scores scraped postings against the candidate profile.
- Fit scoring must evaluate skills, experience, culture, location/work model, compensation/seniority where available, and career alignment.
- Deal-breakers must be able to veto otherwise high-scoring jobs.
- Expired or unreachable postings must be marked rather than silently ignored.
- Output must include strengths, gaps, risks, recommendation, and urgency/deadline notes.

### FR-4: Application generation

- The system must provide an `/apply <url-or-text>` workflow for a single job posting.
- The workflow must parse the posting from a URL or pasted description.
- The workflow must evaluate fit before drafting and should advise against applying when the role violates hard constraints.
- The workflow must generate a tailored LaTeX CV and cover letter based only on supported profile evidence.
- The workflow must use a drafter-reviewer pattern: first draft, independent reviewer critique, then revised final output.
- The final CV must target an exact page limit defined by the active template, with the default CV constrained to two pages.
- The final cover letter must target an exact page limit defined by the active template, with the default cover letter constrained to one page.
- Keyword optimization must be honest: supported keywords may be added; unsupported keywords must remain visible as gaps.

### FR-5: PDF and ATS verification

- The system must compile generated LaTeX artifacts with the correct engine for each active template.
- The system must visually inspect generated PDFs and iterate until layout problems are resolved.
- The system must verify text extraction for ATS parseability when `pdftotext` is available.
- The system must confirm that contact information, reading order, and supported target keywords survive PDF extraction.
- If optional ATS tooling is unavailable, the system must degrade gracefully and report the limitation.

### FR-6: Interview preparation

- The system must provide an `/interview` workflow for tracked applications.
- Interview prep must use the archived posting, submitted CV, submitted cover letter, previous-stage notes, and verified company/interviewer research.
- The workflow must map likely questions to real STAR examples.
- Gaps must be handled with honest bridge answers rather than fabricated experience.
- Mock interview behavior must follow the configured roleplay protocol.

### FR-7: Outcome tracking and learning loop

- The system must provide an `/outcome` workflow to record application results, interview stages, offers, rejections, silence, and feedback.
- Outcomes must archive submitted materials and posting text under a stable application folder.
- Outcomes must update the application tracker in a machine-readable format.
- Once enough outcomes exist, the system must prompt the user to recalibrate the fit framework from observed results.

### FR-8: Profile expansion

- The system must provide an `/expand` workflow that enriches the profile from public sources already linked in the user's profile and from named courses/certifications.
- Newly discovered competencies must include source tags.
- The workflow must not infer unsupported seniority or claim professional use from casual exposure.

### FR-9: Upskilling analysis

- The system must provide an `/upskill` workflow that compares the profile with tracked postings or a provided posting.
- Output must include a prioritized skill-gap heatmap, learning recommendations, resource links, and estimated effort.
- Recommendations must separate application-critical gaps from long-term career-development gaps.

### FR-10: Template customization

- The system must provide an `/add-template` workflow to register user-provided CV and cover-letter LaTeX templates.
- Template registration must capture compile engine, fonts, style rules, placeholder strategy, and page limits.
- Registration must run a mandatory test compile before activation.
- Users must be able to list templates, switch active templates, and revert to defaults.

### FR-11: Portal customization

- The system must provide an `/add-portal` workflow that scaffolds a new job-portal search skill.
- Portal generation must investigate search URL patterns, result structure, access rules, robots.txt, authentication requirements, and terms-of-service constraints.
- Auth-walled or restrictive portals must be declined or prominently marked with personal-use warnings.
- Generated portals must conform to the same output contract as existing portal tools.

### FR-12: Reset and data safety

- The system must provide `/reset profile`, `/reset documents`, and `/reset all` modes.
- Reset must preview exactly what will be deleted.
- Reset must require an explicit confirmation token before deleting anything.
- Reset must preserve framework rules unless the user explicitly requests a full wipe.

## 5. Non-functional requirements

- **Privacy:** No telemetry, hidden cloud persistence, or automatic upload of personal career data.
- **Portability:** Core workflows must run on common developer machines with Python, Bun for portal CLIs, and a LaTeX distribution.
- **Resilience:** Commands must degrade gracefully when optional tools, portal access, or web pages fail.
- **Auditability:** Generated artifacts must be traceable to profile evidence and archived inputs.
- **Maintainability:** Skills, commands, portal CLIs, tests, and documentation must use predictable structure and naming.
- **Accessibility:** Text outputs and generated PDFs should maintain readable structure and ATS-friendly text extraction.
- **Ethics:** The system must support thoughtful job search assistance, not deceptive auto-application or credential inflation.

## 6. Acceptance criteria

- A new user can fork the repository, install required tools, run setup, search jobs, rank results, apply to one posting, and inspect final PDFs using documented commands.
- A generated application contains no unsupported claims when checked against the profile files.
- A generated CV and cover letter compile with the configured engines and satisfy template page limits.
- A ranked shortlist explains why each job is recommended, risky, vetoed, or expired.
- Outcomes are archived in a structure that future setup/calibration can parse.
- A new portal or template can be added by following the command workflow without hand-editing core workflow files.
