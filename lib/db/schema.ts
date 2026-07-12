import { relations, sql } from "drizzle-orm";
import { boolean, check, date, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const accountStatus = pgEnum("account_status", ["active", "disabled", "deleted"]);
export const applicationStatus = pgEnum("application_status", ["wishlist", "saved", "applying", "applied", "interviewing", "offer", "rejected", "withdrawn", "accepted", "archived"]);
export const artifactState = pgEnum("artifact_state", ["draft", "approved", "archived"]);
export const artifactType = pgEnum("artifact_type", ["resume", "cover_letter", "interview", "thank_you", "export"]);
export const claimState = pgEnum("claim_state", ["imported", "user_approved", "ai_suggested", "unsupported", "archived"]);
export const ingestionStatus = pgEnum("ingestion_status", ["queued", "running", "succeeded", "failed", "partial"]);
export const jobSource = pgEnum("job_source", ["manual", "mock", "jobspy"]);
export const jobState = pgEnum("job_state", ["available", "expired", "deactivated", "archived"]);
export const workStyle = pgEnum("work_style", ["remote", "hybrid", "onsite", "unknown"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  role: text("role").default("user").notNull(),
  status: accountStatus("status").default("active").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state")
}, (table) => ({ pk: primaryKey({ columns: [table.provider, table.providerAccountId] }), userIdx: index("accounts_user_idx").on(table.userId) }));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
}, (table) => ({ userIdx: index("sessions_user_idx").on(table.userId) }));

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull()
}, (table) => ({ pk: primaryKey({ columns: [table.identifier, table.token] }) }));

export const authenticators = pgTable("authenticators", {
  credentialID: text("credential_id").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("provider_account_id").notNull(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports")
}, (table) => ({ pk: primaryKey({ columns: [table.userId, table.credentialID] }) }));

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  headline: text("headline"),
  summary: text("summary").default("").notNull(),
  location: text("location"),
  targetRoles: jsonb("target_roles").notNull().default(sql`'[]'::jsonb`),
  preferredLocations: jsonb("preferred_locations").notNull().default(sql`'[]'::jsonb`),
  workStyle: workStyle("work_style").default("unknown").notNull(),
  salaryPreference: jsonb("salary_preference").notNull().default(sql`'{}'::jsonb`),
  completenessScore: integer("completeness_score").default(0).notNull(),
  ...timestamps
}, (table) => ({ userIdx: index("profiles_user_idx").on(table.userId), completenessCheck: check("profiles_completeness_check", sql`${table.completenessScore} between 0 and 100`) }));

export const profileSections = pgTable("profile_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  title: text("title"),
  content: jsonb("content").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  ...timestamps
}, (table) => ({ ownerIdx: index("profile_sections_owner_idx").on(table.userId, table.profileId) }));

export const resumeSources = pgTable("resume_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  extractedText: text("extracted_text").notNull(),
  sourceHash: text("source_hash").notNull(),
  parserVersion: text("parser_version").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps
}, (table) => ({ ownerIdx: index("resume_sources_owner_idx").on(table.userId, table.profileId), sizeCheck: check("resume_sources_size_check", sql`${table.sizeBytes} between 1 and 10485760`) }));

export const evidenceItems = pgTable("evidence_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  resumeSourceId: uuid("resume_source_id").references(() => resumeSources.id, { onDelete: "set null" }),
  sourceType: text("source_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  provenance: jsonb("provenance").notNull().default(sql`'{}'::jsonb`),
  claimState: claimState("claim_state").default("user_approved").notNull(),
  ...timestamps
}, (table) => ({ ownerIdx: index("evidence_items_owner_idx").on(table.userId, table.profileId), resumeIdx: index("evidence_items_resume_idx").on(table.resumeSourceId) }));

export const jobPostings = pgTable("job_postings", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: jobSource("source").notNull(),
  provider: text("provider").notNull(),
  externalId: text("external_id"),
  canonicalUrl: text("canonical_url"),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  workStyle: workStyle("work_style").default("unknown").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency"),
  description: text("description").notNull(),
  contentHash: text("content_hash").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  closingDate: date("closing_date"),
  state: jobState("state").default("available").notNull(),
  searchVector: text("search_vector").generatedAlwaysAs(sql`to_tsvector('english', coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(description,''))`),
  ...timestamps
}, (table) => ({
  providerUnique: uniqueIndex("job_postings_provider_unique").on(table.provider, table.externalId),
  urlIdx: index("job_postings_url_idx").on(table.canonicalUrl),
  contentHashIdx: index("job_postings_content_hash_idx").on(table.contentHash),
  searchIdx: index("job_postings_search_idx").using("gin", sql`${table.searchVector}`)
}));

export const userJobStates = pgTable("user_job_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  status: applicationStatus("status").default("saved").notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  notes: text("notes"),
  ...timestamps
}, (table) => ({ ownerUnique: uniqueIndex("user_job_states_owner_unique").on(table.userId, table.jobId), ownerIdx: index("user_job_states_owner_idx").on(table.userId, table.status) }));

export const jobSearches = pgTable("job_searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  filters: jsonb("filters").notNull().default(sql`'{}'::jsonb`),
  resultCount: integer("result_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ ownerIdx: index("job_searches_owner_idx").on(table.userId, table.createdAt) }));

export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(),
  status: ingestionStatus("status").default("queued").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id, { onDelete: "set null" }),
  foundCount: integer("found_count").default(0).notNull(),
  insertedCount: integer("inserted_count").default(0).notNull(),
  updatedCount: integer("updated_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`)
});

export const ingestionErrors = pgTable("ingestion_errors", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id").notNull().references(() => ingestionRuns.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  message: text("message").notNull(),
  sourceRef: text("source_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ runIdx: index("ingestion_errors_run_idx").on(table.runId) }));

export const fitEvaluations = pgTable("fit_evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  confidence: text("confidence").notNull(),
  dealBreaker: boolean("deal_breaker").default(false).notNull(),
  strengths: jsonb("strengths").notNull().default(sql`'[]'::jsonb`),
  gaps: jsonb("gaps").notNull().default(sql`'[]'::jsonb`),
  coverage: jsonb("coverage").notNull().default(sql`'[]'::jsonb`),
  recommendations: jsonb("recommendations").notNull().default(sql`'[]'::jsonb`),
  narrative: text("narrative").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ ownerIdx: index("fit_evaluations_owner_idx").on(table.userId, table.jobId), scoreCheck: check("fit_evaluations_score_check", sql`${table.score} between 0 and 100`) }));

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  status: applicationStatus("status").default("applying").notNull(),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  ...timestamps
}, (table) => ({ ownerIdx: index("applications_owner_idx").on(table.userId, table.status), uniqueJob: uniqueIndex("applications_user_job_unique").on(table.userId, table.jobId) }));

export const applicationStatusEvents = pgTable("application_status_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  fromStatus: applicationStatus("from_status"),
  toStatus: applicationStatus("to_status").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ ownerIdx: index("application_status_events_owner_idx").on(table.userId, table.applicationId) }));

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  completed: boolean("completed").default(false).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  ...timestamps
});

export const applicationArtifacts = pgTable("application_artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  type: artifactType("type").notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  sourceRefs: jsonb("source_refs").notNull().default(sql`'[]'::jsonb`),
  state: artifactState("state").default("draft").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ versionUnique: uniqueIndex("application_artifacts_version_unique").on(table.applicationId, table.type, table.version), ownerIdx: index("application_artifacts_owner_idx").on(table.userId, table.applicationId) }));

export const artifactChanges = pgTable("artifact_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  artifactId: uuid("artifact_id").notNull().references(() => applicationArtifacts.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  originalText: text("original_text"),
  suggestedText: text("suggested_text").notNull(),
  reason: text("reason").notNull(),
  evidenceRefs: jsonb("evidence_refs").notNull().default(sql`'[]'::jsonb`),
  supportStatus: claimState("support_status").default("ai_suggested").notNull(),
  decision: text("decision").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ ownerIdx: index("artifact_changes_owner_idx").on(table.userId, table.artifactId) }));

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").default("draft").notNull(),
  ...timestamps
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  rationale: text("rationale"),
  evidenceRefs: jsonb("evidence_refs").notNull().default(sql`'[]'::jsonb`),
  displayOrder: integer("display_order").default(0).notNull()
});

export const interviewAnswers = pgTable("interview_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => interviewQuestions.id, { onDelete: "cascade" }),
  answerText: text("answer_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const interviewReviews = pgTable("interview_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  answerId: uuid("answer_id").notNull().references(() => interviewAnswers.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  starAnalysis: jsonb("star_analysis").notNull().default(sql`'{}'::jsonb`),
  guidance: text("guidance").notNull(),
  evidenceRefs: jsonb("evidence_refs").notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ scoreCheck: check("interview_reviews_score_check", sql`${table.score} between 0 and 100`) }));

export const outcomes = pgTable("outcomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  result: text("result").notNull(),
  feedback: text("feedback"),
  compensationNotes: text("compensation_notes"),
  followUpAt: timestamp("follow_up_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  operation: text("operation").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").default(0).notNull(),
  outputTokens: integer("output_tokens").default(0).notNull(),
  costMicros: integer("cost_micros").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const quotaBuckets = pgTable("quota_buckets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  used: integer("used").default(0).notNull(),
  limit: integer("limit").notNull()
}, (table) => ({ bucketUnique: uniqueIndex("quota_buckets_unique").on(table.userId, table.key, table.windowStart) }));

export const backgroundJobs = pgTable("background_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  status: text("status").default("queued").notNull(),
  runAfter: timestamp("run_after", { withTimezone: true }).defaultNow().notNull(),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`),
  dedupeKey: text("dedupe_key"),
  lockedBy: text("locked_by"),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  lastErrorCode: text("last_error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ dedupeUnique: uniqueIndex("background_jobs_dedupe_unique").on(table.dedupeKey), claimIdx: index("background_jobs_claim_idx").on(table.status, table.runAfter) }));

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  correlationId: text("correlation_id"),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => ({ userIdx: index("audit_events_user_idx").on(table.userId, table.createdAt), entityIdx: index("audit_events_entity_idx").on(table.entityType, table.entityId) }));

export const userRelations = relations(users, ({ many }) => ({ profiles: many(profiles), accounts: many(accounts), sessions: many(sessions), applications: many(applications), jobStates: many(userJobStates) }));
export const profileRelations = relations(profiles, ({ one, many }) => ({ user: one(users, { fields: [profiles.userId], references: [users.id] }), sections: many(profileSections), evidence: many(evidenceItems), resumeSources: many(resumeSources) }));
export const applicationRelations = relations(applications, ({ one, many }) => ({ user: one(users, { fields: [applications.userId], references: [users.id] }), profile: one(profiles, { fields: [applications.profileId], references: [profiles.id] }), job: one(jobPostings, { fields: [applications.jobId], references: [jobPostings.id] }), artifacts: many(applicationArtifacts), statusEvents: many(applicationStatusEvents), checklistItems: many(checklistItems) }));
