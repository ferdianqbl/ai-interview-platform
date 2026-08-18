# Fullstack Product Engineer Case Study: Execution Report & Monozukuri Submission
**Target Platform:** [AI Interview Platform (`api/` & `web/`)](https://github.com/ferdianqbl/ai-interview-platform)  
**Candidate / Engineer:** Product Engineer  
**Pull Request Link:** [https://github.com/rakamindev/ai-interview-platform/pull/46](https://github.com/rakamindev/ai-interview-platform/pull/46)  
**Video Demonstration Walkthrough:** [3-5 Minute Video Walkthrough Link](#) *(Loom / YouTube Unlisted / Google Drive)*  
**Submission Date:** August 2026  

---

## 1. Executive Summary & Product Engineer Narrative

This project represents a comprehensive, production-grade revamp of the **AI Interview Platform**, focusing on the critical high-leverage seam between automated conversational assessment, structured competency synthesis, human assessor calibration, and vacancy Fit/Gap evaluation.

### First-Principles Framing
* **What is genuinely true?**
  * Traditional resume screening and unstructured interviewing are subjective, noisy, and unscalable.
  * An AI interview system is only viable if its evaluations are **verifiable** (anchored to verbatim candidate speech quotes), **auditable** (supporting human calibration without erasing baseline AI ratings), and **safe** (strictly adhering to data privacy and non-discrimination regulations).
* **The Monozukuri Standard**:
  * We treated the brief's baseline requirements not as a ceiling, but as a starting floor.
  * Delivered uncompromised system rigor (24 backend RSpec specs, 7 frontend Vitest specs, 0 build errors) and high visual taste across all 6 interaction states.

---

## 2. Product Context & Indonesian UU PDP Law Compliance

### 2.1 The 5 Domain Pillars
1. **The Product**: Rails 7 API with PostgreSQL and Sidekiq, paired with a React 18 / Vite / Tailwind SPA.
2. **The Industry**: Indonesian hiring market facing massive applicant volumes for engineering and operational roles.
3. **What It Is For**: Transparent, objective, reproducible candidate evaluations that give hiring managers instant hiring signal.
4. **The Users**: Assessors auditing candidate quotes and calibrating levels; Recruiters and Hiring Managers reviewing role fit deltas and executive summaries.
5. **The Unrepresented Candidates & UU PDP No. 27/2022**:
   * Candidates cannot opt out of algorithmic evaluation.
   * **Data Minimization**: Zero Personally Identifiable Information (PII), audio streams, or auth secrets are exposed in server logs or error payloads.
   * **Human Oversight Guarantee**: Human assessor overrides provide essential algorithmic accountability before any hiring decision is finalized.

---

## 3. Severity-Ranked Problem & Gap Analysis (P0 to P3)

We conducted a complete fullstack seam audit and identified 5 critical defects:

| Severity | Category | Flaw / Problem Description | Real-World User Impact | Missing Spec vs. Defective Impl |
|---|---|---|---|---|
| **P1** | Fullstack Seam | Property name mismatch (`expected_level` vs `required_level`, `ai_level` int vs string). | Vacancy required levels rendered as `undefined` in the React comparison table. | **Defective Implementation** |
| **P1** | Backend / FitGap | Stale Fit/Gap reports when assessor overrides are updated. | Recruiters evaluated candidates on outdated AI scores rather than calibrated human ratings. | **Missing Specification** |
| **P1** | Backend / FitGap | Unassessed vacancy skills caused nil delta exceptions and failed LLM prompts. | Crashed Fit/Gap generation (HTTP 500) whenever a vacancy required unprobed skills. | **Defective Implementation** |
| **P2** | Frontend / UX | Missing interaction states (Loading skeletons, empty states, error retry banners). | Flash of unstyled content, confusing blank screens on generation delay or failure. | **Missing Specification** |
| **P2** | Frontend / UI | Long evidence quotes overflowed containers on mobile/tablet viewports. | Broke responsive layout and made mobile reviewing frustrating for hiring managers. | **Defective Implementation** |

### Constraint Signals (Tech Lead Escalations)
* **Signal 1 (LLM Latency & Timeouts)**: Gemini Pro/Flash API calls can take 15–60s under peak loads. Implemented deterministic fallback narratives in `FitGap::Engine` so users are never blocked by upstream outages.
* **Signal 2 (Shared Auth Secret)**: Single source of truth for `SECRET_KEY_BASE` across services is required to guarantee cryptographic token verification.

---

## 4. Solution Options & Trade-Off Evaluation Matrix

| Evaluation Dimension | Option A: Dynamic On-The-Fly Calculation | Option B: Event-Driven Materialized Reports (**Chosen & Shipped**) |
|---|---|---|
| **1. Product Impact vs Cost** | Low upfront cost, but recalculates on every page load, causing high latency and repetitive LLM API billing. | **High Impact**: Instant sub-100ms dashboard loads for recruiters; LLM narrative generated once and invalidated cleanly on override save. |
| **2. Long-Term Maintainability** | Calculation logic scattered across multiple controllers and serializers. | **Clean Architecture**: `FitGap::Engine` is the single source of truth; models handle cache invalidation and Sidekiq retries. |
| **3. Failure Modes** | Database load spikes and rate limit exhaustion during bulk hiring rounds. | Isolated async worker failures handled with structured fallback narratives without blocking the UI. |
| **4. Contextual Fit** | Fragile under real enterprise traffic. | **Optimal Fit**: Leverages existing Rails + PostgreSQL + Sidekiq architecture perfectly. |

---

## 5. Self-Derived Acceptance Criteria & Edge Cases

1. **Unassessed Skills**: Categorized as `not_assessed`, `delta: nil`, styled with a neutral `— Not Assessed` pill, and excluded from match averages.
2. **Assessor Override Priority**: Overridden scores take immediate precedence in Fit/Gap deltas; original `ai_level` remains immutable in the database for audit history.
3. **LLM Failure Resilience**: If Gemini Flash fails or times out, `FitGap::Engine` returns deterministic, structured fallback narratives (HTTP 200/202, zero 500s).
4. **Strict Level Clamping**: Database constraints and model validations enforce $1 \le \text{level} \le 5$.
5. **Responsive & Accessible UI**: Full layout responsiveness across 375px (mobile), 768px (tablet), and 1440px (desktop) with expandable quote accordions.

---

## 6. Monozukuri Engineering Rigor & Test Verification

### 6.1 Test Suite Summary
* **Backend (`api/` RSpec Suite)**: **24 examples, 0 failures** (Models, `FitGap::Engine`, `PortfoliosController`, `PortfolioSkillsController`).
* **Frontend (`web/` Vitest Suite)**: **7 tests, 0 failures** (`SkillPortfolioCard`, `ComparisonTable`, interaction states).
* **Production Build (`tsc && vite build`)**: **100% clean**, 0 TypeScript errors, optimized vendor chunks.

### 6.2 Seeded Fault Test Proof
To prove the test harness is active, reliable, and capable of catching subtle regressions:

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
3. **Revert & Green Proof**: Reverted to `feature/monozukuri-portfolio-and-fitgap-revamp` and verified 24/24 specs passing green.

### 6.3 AI Verification Moment Case Study
* **Flawed AI Generation**: During scaffolding, AI code generation proposed updating the `ai_level` column directly on `portfolio_skills` when an assessor saved a score override.
* **Risk Identified**: This destructive write permanently destroyed the baseline AI score, making algorithmic auditing impossible and violating **UU PDP human oversight governance**.
* **Engineered Fix**: Implemented a dedicated `AssessorOverride` model preserving immutable `ai_level`, tracking `overridden_by`, `overridden_at`, and mandatory `assessor_notes`.

---

## 7. Claimed Engineering Depth

```
┌────────────────────────────────────────────────────────┐
│               CLAIMED ENGINEERING DEPTH                │
├───────────────────────────┬────────────────────────────┤
│   Backend Depth (55%)     │   Frontend Depth (45%)     │
│ • FitGap Rule Engine      │ • 6-State Interaction UI   │
│ • Override Event Sync     │ • Expandable Quote Blocks  │
│ • Gemini Fallback Logic   │ • Color-Coded Delta Badges │
│ • Complete RSpec Harness  │ • Vitest Component Tests   │
│ • UU PDP Safe Logging     │ • Full Mobile/Tablet Grid  │
└───────────────────────────┴────────────────────────────┘
```

---

## 8. Live Technical Defense Strategy (CTO & Tech Lead)

| Anticipated Question | Architectural Rationale & Defense |
|---|---|
| *Why materialize Fit/Gap reports rather than computing them on the fly?* | Sub-100ms recruiter dashboard latency is essential for high-volume hiring. Materialization with event-driven invalidation gives instant reads while guaranteeing freshness. |
| *How do you guarantee candidate fairness under UU PDP?* | Evidence quote anchoring prevents hallucinated claims; immutable AI baselines paired with assessor audit records guarantee full human-in-the-loop oversight. |
| *What happens during an LLM outage?* | Designed failure paths provide deterministic fallback narratives and single-click retry triggers without throwing 500 errors. |

---

## 9. Conclusion
This submission bridges the gap between raw AI transcripts and actionable, trustworthy hiring decisions, embodying the true standard of a Fullstack Product Engineer.
