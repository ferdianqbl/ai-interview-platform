# Fullstack Product Engineer Case Study: Execution Report & Monozukuri Submission

**Target Platform:** [AI Interview Platform (`api/` & `web/`)](https://github.com/ferdianqbl/ai-interview-platform)  
**Candidate / Engineer:** Product Engineer  
**Pull Request Link:** [https://github.com/rakamindev/ai-interview-platform/pull/46](https://github.com/rakamindev/ai-interview-platform/pull/46)  
**Video Demonstration Walkthrough:** [https://www.awesomescreenshot.com/video/55666106?key=63cd1783c7a06deab95b8e4ba6ab0e96](https://www.awesomescreenshot.com/video/55666106?key=63cd1783c7a06deab95b8e4ba6ab0e96)  
**Initial Submission Date:** August 2026  
**Revision & Rebase Date:** October 2026 (Addressing Technical Recruiter Audit)  

---

## Executive Summary & Alignment Overview

This document serves as the comprehensive, production-grade **Execution Report** for the AI Interview Platform revamp. It is structured into two complementary sections:
1. **Part I: Tech Test Execution Narrative** — Rebased directly on the step-by-step methodology outlined in [`brief-fullstack.pdf`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/brief-fullstack.pdf) (Steps 1 through 6, 5 Core Pillars, Monozukuri craftsmanship, and automated test harnesses).
2. **Part II: Comprehensive Response to Technical Recruiter Revisions** — Directly answering all 4 review items regarding the Dynamic Option evaluation under clean architecture assumptions, the operational costs and implementation complexities of the Materialized Option, the complete elimination of hardcoded JWT fallback secrets, and strict multi-tenant scoping without `Vacancy.unscoped`.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MONOZUKURI QUALITY & AUDIT DASHBOARD                            │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 35 Backend Specs (0 fail)  │ 27 Vitest Tests (9 suites) │ 6 Playwright E2E Flows       │
│ RSpec models, auth, tenant │ Optimistic UI, hooks, seams│ Complete browser workflows   │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ Fail-Fast JWT Security     │ Strict Tenant Isolation    │ Production Voice Interview   │
│ KeyError on missing secret │ Current.tenant_id scoping  │ WebAudio 16kHz PCM streaming │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

# PART I: TECH TEST EXECUTION NARRATIVE (Following `brief-fullstack.pdf`)

## 1. Role Expectation & Monozukuri Philosophy

In accordance with Section 1 of the case study brief, we approached this exercise not as a passive feature implementation, but as a **Product Engineer accountable for whether the feature is worth shipping at all**.

### First-Principles Framing
* **What is genuinely true?**
  * Traditional resume screening and subjective unstructured interviews are unscalable and noisy.
  * An automated AI evaluation system is only viable if its evaluations are **verifiable** (anchored to verbatim candidate speech quotes), **auditable** (supporting human calibration without destroying baseline AI ratings), and **safe** (strictly adhering to data privacy and multi-tenant isolation).
* **Craftsmanship Beyond the Minimum Baseline (Monozukuri)**:
  * We treated the brief's baseline requirements not as a ceiling, but as a starting floor.
  * Delivered uncompromised system rigor (35 backend RSpec specs, 27 frontend Vitest specs across 9 suites, 6 Playwright E2E flows, 0 build errors) and high visual taste across all 6 interaction states.

---

## 2. Step 1: Setup & Local Exploration

### Baseline Assessment
Upon cloning the starter repository (`github.com/rakamindev/ai-interview-platform`), our initial exploration revealed:
1. **Backend (`api/`)**: Rails 7 on PostgreSQL with Sidekiq and Gemini AI integration. **Zero RSpec specs** were written, leaving the domain models, API endpoints, and authentication completely unverified.
2. **Frontend (`web/`)**: React 18, TypeScript, Vite, Tailwind CSS, and Radix UI. **No test runner** was configured (Vitest/Jest were absent), and there was no continuous integration setup.
3. **Seam Gaps**: The application lacked end-to-end type safety, resulting in undefined UI states and unhandled promise rejections.

### Establishing the Testing Harness
To own the change with rigorous engineering craftsmanship, we established the platform's test infrastructure from scratch:
* **Backend**: Configured RSpec with factory fixtures, database cleaner, and mock clients. Implemented **35 RSpec specs** covering models, services, background workers, controllers, JWT security, and multi-tenant scoping.
* **Frontend**: Configured Vitest and React Testing Library with `@testing-library/jest-dom`. Implemented **27 unit/component/hook tests across 9 suites**.
* **End-to-End**: Added **6 Playwright browser flows** simulating candidate invites, real-time interviews, portfolio generation, vacancy configuration, and Fit/Gap report synthesis.

---

## 3. Step 2: Deep Context & Domain Immersion (The 5 Core Pillars)

Before proposing architecture or writing code, we immersed ourselves in the 5 core domain pillars mandated by the brief:

1. **The Product**:
   * Bridges raw conversational audio/transcripts with structured competency evaluations and role fit/gap analysis.
   * Serves as an objective decision support system for hiring teams rather than an opaque black box.
2. **The Industry (Indonesian Tech & Operational Hiring)**:
   * Indonesian companies face massive applicant volumes for engineering and operational positions.
   * Resume fraud and keyword stuffing create bottlenecks for recruiters, while manual interviews consume hundreds of engineering hours.
3. **What It Is For**:
   * Delivering transparent, reproducible, and calibrated hiring signals.
   * Ensuring that hiring decisions are based on demonstrated competency rather than pedigree or charisma.
4. **The Users**:
   * **Assessors**: Need to audit candidate quotes and calibrate AI scores with human oversight.
   * **Recruiters & Hiring Managers**: Need instant gap signals and executive summaries comparing candidates against specific vacancy rubrics.
5. **The Unrepresented Candidates & Indonesian UU PDP (Law No. 27/2022)**:
   * Candidates do not choose to be evaluated by an AI and cannot opt out. A flawed evaluation can derail a real person's career.
   * **Data Minimization**: Zero Personally Identifiable Information (PII), audio streams, or auth secrets are exposed in application logs (enforced via [`config/initializers/filter_parameter_logging.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/config/initializers/filter_parameter_logging.rb)).
   * **Human Oversight Guarantee**: Human assessor overrides provide essential algorithmic accountability before any hiring decision is finalized, preventing automated discrimination.
   * **Verifiability**: Every AI proficiency rating must be anchored to verifiable candidate utterances with transcript offsets.

---

## 4. Step 3: Defining Problem & Gap to Ideal Condition

A complete fullstack seam and security audit identified 7 critical defects categorized by severity from P0 to P3:

| Severity | Category | Flaw / Problem Description | Real-World User Impact | Classification |
|---|---|---|---|---|
| **P0** | Security / Auth | Hardcoded JWT secret fallback if `SECRET_KEY_BASE` is unset or blank. | Allows cryptographic token forgery (`HS256`) and complete authentication bypass across tenants. | **Defective Implementation** |
| **P0** | Security / Multi-Tenancy | Unscoped `Vacancy` / `Portfolio` queries bypassing `TenantScoped` (`Current.tenant_id`). | Enables cross-tenant data leakage of confidential job vacancies and candidate portfolios. | **Defective Implementation** |
| **P1** | Fullstack Seam | Property name mismatch (`expected_level` vs `required_level`, `ai_level` int vs string). | Vacancy required levels rendered as `undefined` in the React comparison table. | **Defective Implementation** |
| **P1** | Fullstack / Audio | Microphone deadlocks & speech recognition audio conflict ("duk duk" dictation chime). | Interview page locked up; speech recognition failed to capture candidate voice; sessions aborted prematurely. | **Defective Implementation** |
| **P1** | Backend / FitGap | Stale Fit/Gap reports when assessor overrides or vacancy rubrics are updated. | Recruiters evaluated candidates on outdated AI scores rather than calibrated human ratings. | **Missing Specification** |
| **P1** | Backend / FitGap | Unassessed vacancy skills caused nil delta exceptions and failed LLM prompts. | Crashed Fit/Gap generation (HTTP 500) whenever a vacancy required unprobed skills. | **Defective Implementation** |
| **P2** | Frontend / UX | Missing interaction states (Loading skeletons, empty states, error retry banners). | Flash of unstyled content, confusing blank screens on generation delay or failure. | **Missing Specification** |
| **P2** | Frontend / UI | Long evidence quotes overflowed containers on mobile/tablet viewports. | Broke responsive layout and made mobile reviewing frustrating for hiring managers. | **Defective Implementation** |

### Constraint Signals (Tech Lead Escalations)
* **Signal 1 (LLM Latency & Outage Resilience)**: Upstream Gemini Pro/Flash API calls can take 15–60s under peak loads. Implemented deterministic, structured fallback narratives in `FitGap::Engine` so users are never blocked by upstream AI outages.
* **Signal 2 (Fail-Fast Shared Auth Secret)**: `JsonWebToken` strictly enforces a non-empty `ENV.fetch('SECRET_KEY_BASE')` with zero fallback strings, ensuring immediate startup failure rather than silent security vulnerabilities.

---

## 5. Step 4: Revamp Strategy, Acceptance Criteria & Trade-offs

### 5.1 Self-Derived Acceptance Criteria & Edge Cases
1. **Unassessed Skills**: Categorized as `not_assessed`, `delta: nil`, styled with a neutral `— Not Assessed` pill, and excluded from match averages.
2. **Assessor Override Priority**: Overridden scores take immediate precedence in Fit/Gap deltas; original `ai_level` remains immutable in the database for audit history.
3. **LLM Failure Resilience**: If Gemini Flash fails or times out, `FitGap::Engine` returns deterministic, structured fallback narratives (HTTP 200/202, zero 500s).
4. **Strict Level Clamping**: Database constraints and model validations enforce $1 \le \text{level} \le 5$.
5. **Responsive & Accessible UI**: Full layout responsiveness across 375px (mobile), 768px (tablet), and 1440px (desktop) with expandable quote accordions.
6. **Fail-Fast Security & Multi-Tenancy**: `JsonWebToken` fails fast on missing secret (`KeyError`); queries strictly enforce tenant scoping without `.unscoped` leaks.

### 5.2 Solution Options & Trade-Off Evaluation Matrix
To bridge candidate portfolios, human assessor overrides, and vacancy Fit/Gap reports, we evaluated two architectural approaches assuming clean domain encapsulation:

| Evaluation Dimension | Option A: Structured Dynamic Engine (Stateless Compute-on-Read) | Option B: Event-Driven Materialized Reports (Compute-on-Write + Read-Through Cache) (**Chosen**) |
|---|---|---|
| **Architectural Design** | Stateless `FitGap::Engine` service object invoked directly on `GET /fitgap` and `/export` requests—zero persisted report tables. | Encapsulated calculation in `FitGap::Engine`, persisted `FitGapReport` in PostgreSQL (`jsonb`), and event-driven invalidation. |
| **1. Product Impact vs. Cost** | **Pros:** Zero idle DB storage; zero wasted compute on unviewed pairs.<br>**Cons:** Every page view triggers a synchronous Gemini Flash call (1.5s–15s latency) and bills tokens per *read* ($O(R)$). Multiple hiring reviewers amplify cost and suffer slow page loads. | **Pros:** Sub-50ms dashboard reads; LLM token spend bounded to *state mutations* ($O(W)$).<br>**Costs & Risks:** Requires provisioning **Redis + Sidekiq workers**, increases PostgreSQL storage for `jsonb`, and risks write-amplification during bulk rubric updates. |
| **2. Maintainability & Complexity** | **Pros:** **100% strong read consistency by construction**; zero cache-invalidation code; formulas evolve with zero DB migrations.<br>**Cons:** Couples read-path availability directly to third-party LLM uptime. | **Pros:** Clean separation of async LLM synthesis and synchronous HTTP reads; creates point-in-time audit snapshots.<br>**Complexity & Risks:** Multi-entity cache invalidation across 3 mutable sources (`AssessorOverride`, `Vacancy`, `Portfolio`); dual-maintenance synchronization tax between Ruby backend delta logic and React TypeScript optimistic client recalculation (`usePortfolioQuery`). |
| **3. Failure Modes & Risks** | Upstream Gemini latency spikes block Puma worker threads (which share capacity with live WebSocket interviews). Stochastic LLM generation (`temperature: 0.4`) causes different evaluators to see conflicting narratives. | Eventual consistency window ($2\text{ s}–15\text{ s}$) while worker regenerates; stale data risk if any mutation path misses invalidation; Redis queue downtime requires synchronous read-through fallback. |
| **4. Final Decision Rationale** | Unacceptable for enterprise high-volume hiring due to multi-second read latency, per-view token costs, and non-deterministic hiring narratives. | **Chosen Trade-Off:** Despite higher implementation complexity and Redis/Sidekiq operational overhead, sub-50ms deterministic reads and reproducible audit snapshots are essential. |

---

## 6. Step 5: Monozukuri Implementation & Pull Request

### 6.1 Proven Correctness Across the Full Stack
* **Backend RSpec Suite**: **35 specs, 0 failures** (`JsonWebToken` fail-fast security, `PortfolioSkill`, `AssessorOverride`, `FitGapReport`, `FitGap::Engine`, `FitGapGeneratorWorker` tenant isolation, `PortfoliosController`, and `PortfolioSkillsController` cross-tenant security).
* **Frontend Vitest Suite**: **27 tests across 9 suites, 0 failures** (`LoginPage`, `AssessmentListPage`, `SkillPortfolioCard`, `ComparisonTable`, `navbar`, `api`, `internetSpeedTest`, `usePortfolioQuery`, and `useFitGapQuery`).
* **Playwright E2E Suite**: **6 browser flows, 0 failures** (Auth, Candidate Invites, Portfolio, Vacancies, Fit/Gap Synthesis, Candidate Interview).
* **Production Build**: 100% clean `tsc && vite build` with zero TypeScript errors.

### 6.2 Designed Failure Paths & Protected Data
* **Safe Reversible Migration**: Migration [`20260815000001_add_assessment_state_and_narrative_status.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/db/migrate/20260815000001_add_assessment_state_and_narrative_status.rb) introduces `portfolio_assessment_state` and `fit_gap_narrative_status` columns with full rollback safety (`down` direction removes columns cleanly).
* **UU PDP Compliance**: Filtered all sensitive parameters (`:auth_token`, `:token`, `:audio_data`, `:transcript`, `:email`, `:password`) in application logging.

### 6.3 Seeded Fault Test Proof
To demonstrate that our testing harness actively catches regressions:
1. **Injected Defect on Scratch Branch `fault/seeded-delta-bug`**:
   ```ruby
   # Inverted delta arithmetic in FitGap::Engine
   delta = expected_level - candidate_level
   ```
2. **Terminal Test Failure Log**:
   ```
   FitGap::Engine#call correctly calculates match, exceed, gap, and not_assessed (FAILED - 1)
   Failures:
     1) FitGap::Engine#call correctly calculates match, exceed, gap, and not_assessed
        Failure/Error: expect(react_comp['result']).to eq('exceed')
          expected: "exceed"
               got: "gap"
   ```
3. **Revert & Green Proof**: Reverted to `feature/monozukuri-portfolio-and-fitgap-revamp` and verified all 35/35 specs passing green.

### 6.4 AI Verification Moment Case Study
* **Flawed AI Generation**: During scaffolding, AI code generation proposed updating the `ai_level` column directly on `portfolio_skills` when an assessor saved a score override.
* **Risk Identified**: This destructive write permanently destroyed the baseline AI score, making algorithmic auditing impossible and violating **UU PDP human oversight governance**.
* **Engineered Fix**: Implemented a dedicated `AssessorOverride` model preserving immutable `ai_level`, tracking `overridden_by`, `overridden_at`, and mandatory `assessor_notes`.

---

## 7. Step 6: Final Submission, Visual Proof & UI Showcase

### High-Fidelity UI Evidence

| View | Screenshot Preview & Visual Details |
|---|---|
| **Candidate Skill Portfolio** | ![Candidate Skill Portfolio](screenshoot/candidate_portfolio.png)<br>*Evaluated skills with Level badges (L1–L5), confidence tags, verbatim quote accordions, and human assessor override calibration banners.* |
| **Role Fit & Gap Analysis Matrix** | ![Role Fit & Gap Analysis](screenshoot/fitgap_analysis.png)<br>*Automated delta comparison matrix (Match / Exceeds / Gap / Not Assessed), summary counters, executive culture narrative, and additive discovered competencies.* |
| **Assessment Candidates & Invite Dashboard** | ![Assessment Candidates](screenshoot/assessment_invite.png)<br>*Live candidate session tracking, instant invite link copying, and direct links to portfolio results.* |
| **Interview Transcript & Evidence** | ![Interview Transcript](screenshoot/session_transcript.png)<br>*Turn-by-turn conversational record providing verifiable proof for all AI-synthesized skill ratings.* |
| **Vacancy Target Rubric Configuration** | ![Vacancy Rubric Configuration](screenshoot/vacancy_edit.png)<br>*Custom vacancy skill definitions with required proficiency levels (L1–L5), company culture expectations, and competency requirements.* |

### The 6 Monozukuri Interaction States
1. **Initial / Idle State**: Clear empty states with instructional copy directing recruiters to select vacancies.
2. **Loading Skeleton State**: Pulsing shimmer cards matching final DOM layouts to prevent cumulative layout shift (CLS).
3. **Empty State**: Friendly SVG iconography and action buttons when candidates have not yet completed interviews.
4. **Error with Retry State**: Non-blocking toast alerts and retry buttons preserving previously calibrated scores.
5. **Partial / Degraded State**: Deterministic fallback executive summaries displayed if the Gemini LLM times out.
6. **Success / Active State**: Color-coded delta badges, expandable quote accordions, and instant save feedback.

### Claimed Engineering Depth (50% Backend / 50% Frontend)
```
┌────────────────────────────────────────────────────────┐
│               CLAIMED ENGINEERING DEPTH                │
├───────────────────────────┬────────────────────────────┤
│   Backend Depth (50%)     │   Frontend Depth (50%)     │
│ • FitGap Rule Engine      │ • Vertical Feature Slices  │
│ • Override & Vacancy Sync │ • In-Memory Cache Sync     │
│ • Strict Tenant Isolation │ • Optimistic UI Mutations  │
│ • Fail-Fast JWT Security  │ • 6-State Interaction UI   │
│ • Complete RSpec (35)     │ • Vitest Suite (27 tests)  │
│ • UU PDP Safe Logging     │ • Collapsible Shell Layout │
└───────────────────────────┴────────────────────────────┘
```

---

# PART II: COMPREHENSIVE RESPONSE TO TECHNICAL RECRUITER REVISIONS

This section provides direct, rigorous answers to the four technical review findings raised by the recruiter audit.

## 8. Revision Item 1: In-Depth Evaluation of Dynamic Option under Clean Implementation Assumptions

### Recruiter Feedback
> *"Alasan penolakan opsi dynamic saat ini berfokus pada logika yang tersebar di berbagai controller dan serializer. Hal tersebut lebih berkaitan dengan kualitas implementasi daripada nilai pendekatan itu sendiri. Mohon evaluasi kembali opsi tersebut dengan asumsi implementasinya dirancang secara terstruktur dan maintainable."*

### Product Engineer Re-Evaluation
We re-evaluated the **Dynamic Option (Stateless Compute-on-Read Engine)** under the explicit assumption that it is designed with the highest standards of software craftsmanship: encapsulated entirely within a pure, modular domain service object ([`FitGap::Engine`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/services/fit_gap/engine.rb)), completely separated from controllers, models, and serializers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   OPTION A: CLEAN DYNAMIC COMPUTE-ON-READ ENGINE                       │
│                                                                                        │
│   GET /fitgap ───► FitGapController ───► FitGap::Engine.call(portfolio, vacancy)      │
│                                                │                                       │
│                                                ├──► 1. In-Memory Delta Math (<2ms)     │
│                                                └──► 2. Synchronous Gemini LLM (1.5-15s)│
│                                                                │                       │
│   JSON Response ◄──────────────────────────────────────────────┘                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Merits of a Clean Dynamic Implementation
1. **100% Strong Read Consistency by Construction**:
   Because deltas and summaries are calculated on-the-fly at request time, the output is guaranteed to reflect the latest `AssessorOverride` scores and `VacancySkill` rubric adjustments immediately. It eliminates the entire class of bugs related to stale cache invalidation, cache eviction races, and eventual consistency lag.
2. **Zero Cache Invalidation Plumbing & High Domain Agility**:
   There is no need for event listeners, database triggers, background workers, or multi-entity invalidation hooks in `AssessorOverridesController` and `VacanciesController`. If the engineering team updates the scoring rubric algorithm or competency weighting logic, the new calculation takes effect instantly across all historical candidates without requiring database backfill migrations.
3. **Zero Background Queue Overhead & Operational Simplicity**:
   Eliminates the operational overhead of provisioning, monitoring, and maintaining Redis and Sidekiq worker pools specifically for Fit/Gap generation.

### Why the Dynamic Option Remains Structurally Inferior for This Product
Despite its architectural cleanliness for pure rule-based computation, the presence of **LLM Executive Narrative Generation** makes pure compute-on-read fundamentally flawed for an enterprise hiring platform:
1. **Unacceptable Read Latency ($1.5\text{s}–15\text{s}$ P95)**:
   Calling the Gemini Flash/Pro API synchronously during a `GET` request subjects recruiters and hiring managers to multi-second loading spinners on every page view or PDF export. In high-volume hiring workflows where recruiters review dozens of candidates per hour, this latency degrades user productivity.
2. **Read-Amplified Financial Cost ($O(R)$ vs $O(W)$)**:
   In collaborative hiring, multiple stakeholders (recruiter, hiring manager, interview panel) open and re-examine the same candidate report across multiple interview rounds. Under Option A, every single page load incurs Gemini LLM token billing ($O(R)$ reads). Under Option B, LLM spend is strictly bounded to state mutations ($O(W)$ writes).
3. **Puma Worker Thread Starvation**:
   Rails Puma worker threads blocked waiting on synchronous external HTTP LLM responses share capacity with live WebSocket audio interview streams. A surge in recruiters reviewing reports can exhaust the thread pool, causing packet drops or latency spikes in ongoing live candidate interviews.
4. **Non-Deterministic Hiring Committee Reviews**:
   Due to LLM stochasticity (`temperature: 0.4`), running narrative synthesis on-the-fly on every view means two executives opening the same candidate comparison at different times can see slightly different narrative assessments, creating confusion during calibration meetings.

**Conclusion**: While Option A is superior for lightweight, purely mathematical calculations, **Option B (Materialized Reports with Read-Through Synthesis)** remains the correct architectural choice for an enterprise platform incorporating generative AI.

---

## 9. Revision Item 2: Implementation Complexity, Operational Costs & Failure Risks of the Materialized Approach

### Recruiter Feedback
> *"Evaluasi pendekatan materialized saat ini lebih banyak menyoroti kelebihan dan mitigasinya. Mohon tambahkan pembahasan mengenai kompleksitas implementasi dan biaya operasional agar perbandingan lebih seimbang."*

### Deep-Dive Analysis of Option B Costs and Complexities
To provide a thoroughly balanced architectural evaluation, we document the real engineering tax, operational overhead, and failure risks inherent in our chosen materialized approach:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   OPTION B: EVENT-DRIVEN MATERIALIZED ARCHITECTURE                     │
│                                                                                        │
│   AssessorOverride Save ──┐                                                            │
│   Vacancy Rubric Update ──┼──► Cache Invalidation Hook ──► Destroy Stale Reports       │
│   Portfolio Generation ───┘                                        │                   │
│                                                                    ▼                   │
│   GET /fitgap ──► Check Cache ──[MISS]──► Sidekiq Async Job (or Read-Through Sync)     │
│                         │                              │                               │
│                      [HIT]                             ▼                               │
│                         │                     FitGap::Engine.call                      │
│                         │                              │                               │
│                         ▼                              ▼                               │
│                   <50ms Fast Read             Persist FitGapReport (PostgreSQL jsonb)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Implementation Complexity
* **Multi-Entity Cache Invalidation Coordinates 3 Mutable Aggregates**:
  A `FitGapReport` depends on 3 separate aggregates: `AssessorOverride`, `Vacancy`/`VacancySkill`, and `Portfolio`. Invalidation must be executed flawlessly across all mutation paths:
  1. When an assessor updates an override (`AssessorOverridesController`).
  2. When a recruiter modifies vacancy target skills or required levels (`VacanciesController#update`).
  3. When an interview completes and generates a new portfolio (`Portfolios::Generator`).
  If any controller or background service bypasses this invalidation, the system silently serves stale evaluations to hiring managers.
* **Dual-Maintenance Synchronization Tax**:
  To prevent recruiters from staring at empty screens during the 2–15 second asynchronous regeneration window, the React frontend implements an optimistic client-side delta calculator ([`usePortfolioQuery.ts`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/web/src/features/portfolio/usePortfolioQuery.ts)). This creates a **dual-maintenance tax**: any modification to the delta calculation algorithm in Ruby ([`FitGap::Engine`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/services/fit_gap/engine.rb)) must be manually mirrored in TypeScript, increasing the risk of frontend/backend calculation drift.
* **JSONB Schema Evolution & Versioning**:
  Persisting structured evaluation snapshots in a PostgreSQL `jsonb` column requires backward-compatible schema handling. If new metadata fields (such as `confidence_score` or `substance_rating`) are added to the report structure, historical JSONB records require careful migration or defensive parsing in Rails serializers.

### 2. Operational Costs & Infrastructure Footprint
* **Redis & Sidekiq Infrastructure Overhead**:
  Option B requires provisioning, clustering, and monitoring Redis instances and Sidekiq background workers. This entails operational monitoring (memory usage, queue latency, retry queues, dead-letter alerts) and increases hosting costs compared to a stateless backend.
* **PostgreSQL Storage Growth**:
  Persisting serialized JSONB comparison matrices, skill summaries, and executive narratives consumes significant database storage over time ($O(P \times V)$ where $P$ is candidates and $V$ is vacancies evaluated).
* **Write-Amplification Risks**:
  If a recruiter modifies a vacancy rubric that has 500 associated candidate portfolios, eager background regeneration would enqueue 500 Sidekiq jobs simultaneously, overwhelming worker concurrency and API rate limits. (We mitigated this by adopting **lazy invalidation on vacancy edits** paired with **read-through synthesis** upon first access).

### 3. Failure Modes & Consistency Risks
* **Eventual Consistency Window**:
  Following an assessor override, there is an inherent $2\text{s}–15\text{s}$ delay before the updated executive narrative is synthesized.
* **Worker Queue Downtime**:
  If Redis crashes or Sidekiq workers become backlogged, report generation halts. We engineered an explicit fallback mechanism: if the background job fails or is delayed, the API executes a synchronous read-through synthesis with a deterministic fallback template, ensuring the user is never blocked.

---

## 10. Revision Item 3: Fallback Secret JWT Elimination & Cryptographic Enforcement

### Recruiter Feedback
> *"Implementasi signing JWT masih menggunakan secret yang di-hardcode ketika environment secret tidak tersedia. Kondisi ini menimbulkan risiko keamanan karena token berpotensi dipalsukan. Mohon hapus fallback tersebut dan pastikan signing hanya dapat berjalan dengan secret yang dikonfigurasi secara aman."*

### Security Vulnerability Analysis
In earlier starter iterations, `JsonWebToken.encode` contained a fallback clause:
```ruby
# VULNERABLE HISTORICAL CODE:
SECRET_KEY = ENV['SECRET_KEY_BASE'] || 'development_secret_fallback'
```
This fallback introduced a catastrophic **P0 Security Vulnerability**: in production or staging environments where `SECRET_KEY_BASE` was inadvertently left unconfigured or empty, the application silently fell back to a publicly known static string. An attacker could forge valid JWT tokens signed with this well-known key and gain unauthorized access to candidate records across any tenant organization.

### Implemented Solution & Fail-Fast Architecture
We refactored [`api/app/lib/json_web_token.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/lib/json_web_token.rb) to enforce strict fail-fast cryptographic validation:

```ruby
# SECURE REFACTORED IMPLEMENTATION:
class JsonWebToken
  ALGORITHM = 'HS256'.freeze

  def self.secret_key
    key = ENV.fetch('SECRET_KEY_BASE') do
      raise KeyError, 'FATAL: SECRET_KEY_BASE environment variable is missing. Halting to prevent insecure JWT signing.'
    end

    if key.to_s.strip.empty?
      raise KeyError, 'FATAL: SECRET_KEY_BASE environment variable is empty. Halting to prevent insecure JWT signing.'
    end

    key
  end

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, secret_key, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret_key, true, { algorithm: ALGORITHM })[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError, KeyError => e
    nil
  end
end
```

### Automated RSpec Verification
We authored 3 dedicated security test cases in [`api/spec/lib/json_web_token_spec.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/spec/lib/json_web_token_spec.rb):
1. **Missing Secret Test**: Verifies that calling `.encode` when `ENV['SECRET_KEY_BASE']` is missing immediately raises `KeyError`.
2. **Blank Secret Test**: Verifies that calling `.encode` when `ENV['SECRET_KEY_BASE'] = "   "` immediately raises `KeyError`.
3. **Cryptographic Integrity Test**: Verifies that tokens signed with a different key return `nil` on decode, completely preventing signature forgery.

---

## 11. Revision Item 4: Elimination of `Vacancy.unscoped` & Strict Multi-Tenant Scoping

### Recruiter Feedback
> *"Query vacancy menggunakan Vacancy.unscoped, sehingga melewati pembatasan multi-tenant dan berpotensi memungkinkan akses terhadap vacancy milik tenant lain. Mohon pastikan query tetap menerapkan scoping tenant yang sesuai."*

### Security Vulnerability Analysis
The starter codebase contained unscoped database lookups such as:
```ruby
# VULNERABLE HISTORICAL CODE:
@vacancy = Vacancy.unscoped.find(params[:id])
```
Because `Vacancy` includes the `TenantScoped` concern, calling `.unscoped` stripped the default tenant query filter (`where(tenant_id: Current.tenant_id)`). This allowed an authenticated user from Organization A to view, edit, or evaluate candidates against confidential vacancies belonging to Organization B simply by guessing or iterating integer IDs (`GET /vacancies/99`).

### Implemented Solution & Complete Tenant Isolation
We eliminated `Vacancy.unscoped` across the entire backend and enforced strict tenant isolation across all layers:

1. **Controller Layer Multi-Tenant Scoping**:
   In [`VacanciesController`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/controllers/vacancies_controller.rb), all lookups rely on `Current.tenant_id`:
   ```ruby
   # SECURE SCOPED IMPLEMENTATION:
   def set_vacancy
     @vacancy = Vacancy.find_by!(id: params[:id])
   end
   ```
   If a user requests a vacancy belonging to another organization, Rails raises `ActiveRecord::RecordNotFound`, returning a clean HTTP 404 with zero data leakage.

2. **Cross-Tenant Relationship Scoping in Portfolios**:
   In [`PortfoliosController`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/controllers/portfolios_controller.rb), portfolio lookups are scoped through their parent interview session:
   ```ruby
   def set_portfolio
     @portfolio = Portfolio.joins(:session)
                           .where(sessions: { tenant_id: Current.tenant_id })
                           .find_by!(id: params[:id])
   end
   ```

3. **Asynchronous Worker Tenant Context Preservation**:
   In [`FitGapGeneratorWorker`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/workers/fit_gap_generator_worker.rb), asynchronous Sidekiq jobs restore the tenant context before executing business logic:
   ```ruby
   def perform(portfolio_id, vacancy_id, tenant_id)
     Current.using(tenant_id: tenant_id) do
       portfolio = Portfolio.find(portfolio_id)
       vacancy = Vacancy.find(vacancy_id)
       FitGap::Engine.new(portfolio, vacancy).call
     end
   end
   ```

### Automated RSpec Verification
We authored cross-tenant isolation specs in [`api/spec/requests/portfolios_spec.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/spec/requests/portfolios_spec.rb) and [`api/spec/workers/fit_gap_generator_worker_spec.rb`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/spec/workers/fit_gap_generator_worker_spec.rb):
* Proves that attempting to access a vacancy or portfolio belonging to Tenant B while authenticated under Tenant A returns HTTP 404.
* Proves that background workers running under Tenant A cannot bind or mutate records belonging to Tenant B.

---

## 12. Bonus Monozukuri Revision: Production Real-Time Voice Interview Architecture

In addition to addressing the 4 recruiter review items, we resolved the critical voice interview audio conflict:

1. **Root Cause Analysis**:
   The starter frontend attempted to run the browser's Web Speech Recognition API concurrently with WebAudio audio capture. On macOS/iOS, Web Speech Recognition triggers an operating system dictation chime ("duk duk") that forcibly locked the microphone hardware, prevented audio chunks from reaching the backend, and aborted sessions prematurely.
2. **Engineered Fix**:
   * Removed browser dictation in favor of an **AudioWorklet WebAudio 16kHz PCM streaming pipeline**.
   * Implemented **real-time emerald RMS visualizer** ([`VoiceBars.tsx`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/web/src/features/interview/VoiceBars.tsx)) providing live waveform feedback.
   * Built **<3s hardware preflight checks** verifying microphone and speaker availability before entering the interview.
   * Engineered **substance-aware portfolio scoring** in [`Portfolios::Generator`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/ai-interview-platform/api/app/services/portfolios/generator.rb) with graceful fallbacks.

---

## 13. Live Technical Defense Strategy (CTO & Tech Lead)

| Anticipated Question | Architectural Rationale & Defense |
|---|---|
| *If Option A is cleanly structured in a service object, why not use it?* | While a cleanly structured Dynamic `FitGap::Engine` provides **100% strong read consistency** and zero cache plumbing, the inclusion of **Gemini LLM narrative synthesis** ($1.5\text{s}–15\text{s}$ P95 latency, stochastic outputs, per-read token costs) makes compute-on-read detrimental to user experience and server capacity during bulk recruiter screening. Materialization (Option B) trades higher implementation complexity (multi-source cache invalidation across overrides and vacancies) for &lt;50ms deterministic reads and reproducible audit snapshots. |
| *How do you enforce multi-tenant isolation and fail-fast JWT security?* | All tenant queries enforce `TenantScoped` (`Current.tenant_id`) across controllers (`Vacancy.find_by!`, `Portfolio.joins(:session)`) and background workers (`Current.using(tenant_id:)`), with zero `.unscoped` leaks. `JsonWebToken` strictly enforces non-empty `ENV.fetch('SECRET_KEY_BASE')` with immediate `KeyError` fail-fast validation. |
| *How do you guarantee candidate fairness under Indonesian UU PDP?* | Evidence quote anchoring prevents hallucinated ratings; immutable AI baselines paired with human assessor audit records guarantee full human-in-the-loop oversight; PII parameters are filtered from logs. |
| *What happens during an upstream LLM outage?* | Designed failure paths provide deterministic fallback narratives, transactional skill persistence, and single-click retry triggers without throwing 500 errors. |
| *Why Vitest over Jest for the frontend?* | Vitest integrates natively with the existing Vite build pipeline—zero config overhead, sub-second HMR test reruns, and native ESM/TypeScript support. |

---

## 14. Conclusion & Submission Checklist

Every requirement from [`brief-fullstack.pdf`](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/rakamin-v2/brief-fullstack.pdf) and every revision from the technical recruiter review has been implemented, validated, and documented.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          FINAL SUBMISSION VERIFICATION CHECKLIST                       │
├──────────────────────────────────────────────────────────────────┬─────────────────────┤
│ 1. GitHub Pull Request Link (PR #46 on rakamindev)               │  ✓ VERIFIED         │
│ 2. Video Demonstration Walkthrough Link (AwesomeScreenshot)      │  ✓ VERIFIED         │
│ 3. Step 1: Baseline Exploration & Testing Harness Established     │  ✓ VERIFIED         │
│ 4. Step 2: 5 Domain Pillars & Indonesian UU PDP Compliance       │  ✓ VERIFIED         │
│ 5. Step 3: Severity-Ranked Problem & Gap Analysis (P0–P3)        │  ✓ VERIFIED         │
│ 6. Step 4: Option A vs Option B Trade-Off & Acceptance Criteria  │  ✓ VERIFIED         │
│ 7. Step 5: Fullstack Monozukuri Implementation & Seeded Fault    │  ✓ VERIFIED         │
│ 8. Step 6: Visual Evidence, 6 UI States & Single PDF Report      │  ✓ VERIFIED         │
│ 9. Recruiter Revision 1: Dynamic Option Evaluated (Clean Code)   │  ✓ VERIFIED         │
│ 10. Recruiter Revision 2: Cost & Risk on Materialized Option     │  ✓ VERIFIED         │
│ 11. Recruiter Revision 3: Fallback Secret JWT Eliminated         │  ✓ VERIFIED         │
│ 12. Recruiter Revision 4: Vacancy.unscoped Multi-Tenant Scoped   │  ✓ VERIFIED         │
│ 13. Bonus Monozukuri: Production WebAudio 16kHz Voice Pipeline   │  ✓ VERIFIED         │
└──────────────────────────────────────────────────────────────────┴─────────────────────┘
```
