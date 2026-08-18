# 3 to 5-Minute Video Walkthrough Script
## Fullstack Product Engineer Case Study: AI Interview Platform

**Platform:** AI Interview Platform  
**Live Video Walkthrough:** [https://www.awesomescreenshot.com/video/55666106?key=63cd1783c7a06deab95b8e4ba6ab0e96](https://www.awesomescreenshot.com/video/55666106?key=63cd1783c7a06deab95b8e4ba6ab0e96)  
**Pull Request Link:** [https://github.com/rakamindev/ai-interview-platform/pull/46](https://github.com/rakamindev/ai-interview-platform/pull/46)  
**Target Duration:** 3:30 – 4:30 minutes  
**Format:** Screen Recording + Audio Demonstration  

---

### [0:00 – 0:45] Section 1: Introduction & Product Engineer Mindset
* **Visual:** Speaker on camera + Title screen showing `AI Interview Platform: Monozukuri Portfolio & Fit/Gap Engine`.
* **Script:**
  > "Hi everyone, thank you for reviewing my submission for the Fullstack Product Engineer role at Rakamin.
  > 
  > Rather than treating this exercise as a mere coding task, I approached it from first principles as a Product Engineer. In Indonesia, hiring managers face overwhelming applicant volumes, while candidates are vulnerable to opaque algorithmic decisions. 
  > 
  > Under Indonesian Personal Data Protection Law (UU PDP No. 27/2022), evaluations must be transparent, evidence-backed, and subject to human oversight. Today, I'll walk you through how I revamped the core seam of this platform—from structured skill portfolios to calibrated vacancy Fit/Gap matching—with Monozukuri craftsmanship."

---

### [0:45 – 2:00] Section 2: Live Product Walkthrough (Frontend Craftsmanship)
* **Visual:** Screen share of `http://localhost:5173/assessments/1/sessions/1/portfolio`.
* **Script:**
  > "Here is our revamped **Candidate Skill Portfolio screen**. 
  > 
  > Notice the visual hierarchy: each skill card displays the candidate's effective competency level from L1 to L5, accompanied by an AI confidence badge and competency synthesis.
  > 
  > Crucially, every evaluation is anchored in **verbatim interview evidence**. To prevent long candidate quotes from breaking mobile layouts, I engineered expandable quote accordions.
  > 
  > Now, let's look at **human assessor calibration**. If the AI assigned Level 2, but the candidate demonstrated senior architecture knowledge in the transcript, an assessor can click 'Edit Override', select Level 4, and record mandatory notes.
  > 
  > Watch what happens: the UI optimistically updates the badge to display 'AI: L2 → L4', preserving the original AI baseline for audit compliance while immediately reflecting the new score."

---

### [2:00 – 3:15] Section 3: Fit/Gap Analysis & Seamless Event Sync
* **Visual:** Select a vacancy $\rightarrow$ Click 'Run Fit/Gap' $\rightarrow$ Screen share of `http://localhost:5173/assessments/1/sessions/1/fitgap/1`.
* **Script:**
  > "From the portfolio, we run the **Role Fit & Gap Analysis** against open vacancies.
  > 
  > Here is the comparison matrix:
  > - Required levels vs. Candidate levels are clearly aligned.
  > - Overridden skills immediately show an 'Adjusted' tag and recalculate deltas (+1 Exceed, Match, or Gap).
  > - Unassessed skills are defensively handled with a clean '— Not Assessed' status without breaking averages.
  > - Below, Gemini Flash synthesizes two distinct narrative blocks: Culture Alignment and Executive Recommendation.
  > 
  > If the AI provider experiences an outage, our backend has designed failure paths that generate deterministic fallback narratives, ensuring recruiters are never blocked."

---

### [3:15 – 4:00] Section 4: Engineering Rigor, Test Harness & Seeded Fault
* **Visual:** Terminal split screen showing RSpec passing 24/24 and Vitest passing 7/7.
* **Script:**
  > "Moving under the hood to engineering rigor:
  > - When I inherited the codebase, there were zero specs. I established the complete test harness: **24 RSpec tests** covering models, services, and request controllers in Rails, and **7 Vitest component tests** in React.
  > - To prove our tests are real, I performed a **Seeded Fault Test**: on a scratch branch, I inverted the delta calculation in `FitGap::Engine`. The test harness immediately caught the regression with an explicit failure.
  > - I also documented an **AI Verification Moment**: when AI tooling suggested destructively overwriting the AI score column, I intervened and enforced a dedicated `AssessorOverride` model to maintain regulatory compliance."

---

### [4:00 – 4:30] Section 5: Conclusion & Live Defense Readiness
* **Visual:** GitHub Pull Request overview and single PDF report.
* **Script:**
  > "All changes are committed with clean atomic history on a dedicated feature branch with an open Pull Request on GitHub.
  > 
  > The platform is now reliable, resilient, beautifully designed, and legally compliant. I look forward to our live technical defense session to discuss architecture and trade-offs in depth. Thank you!"

---

### Recording Checklist for Candidate:
- [ ] Ensure API (`localhost:3001`) and Web (`localhost:5173`) are running.
- [ ] Open Loom / OBS / Screen Recorder with camera bubble in bottom corner.
- [ ] Follow time stamps to keep total length between 3:30 and 4:30 minutes.
- [ ] Paste final video URL into `assessment/EXECUTION_REPORT.md` before final PDF export.
