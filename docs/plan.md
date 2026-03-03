# Ziply — Implementation Plan (plan.md)

This document translates `spec.md` into phased, executable tasks designed for AI-assisted development (Claude Code).  
Work proceeds strictly in order: MVP → Polish → Extras.  
No phase may begin until all “Definition of Done” criteria for the previous phase are met.

**Current status (March 2026):** Phase 0 and Phase 1 (MVP) are implemented; work is moving into Phase 2.

---

## Phase 0 — Project Setup & Guardrails (Pre-MVP)

### Goals
Establish a stable foundation and prevent architectural drift during AI-assisted development.

### Tasks
1. Initialize GitHub repository and branching strategy.
2. Create base project structure (frontend, backend, shared utilities).
3. Set up environment variable management and secrets handling.
4. Configure CI/CD pipeline using GitHub Actions.
5. Add project documentation skeleton (README, spec.md, plan.md).

### Definition of Done
- Repository builds successfully on a clean machine.
- CI pipeline runs lint/build checks on every push.
- No hardcoded secrets exist in the codebase.
- README explains how to run the project locally.
- Claude Code instructions are added (agent rules).

---

## Phase 1 — MVP: End-to-End Happy Path (Core Value)

**This phase proves Ziply works end-to-end for one template.**

### Goals
A user can generate, pay for, and download a website ZIP using a single template.

---

### 1.1 Authentication & Accounts (Minimal)
**Tasks**
- Implement user registration and login.
- Implement secure session handling (JWT or framework-equivalent).
- Protect authenticated routes.

**Definition of Done**
- Users can register, log in, log out.
- Passwords are hashed.
- Unauthorized users cannot access protected endpoints.
 - MVP stores users in-memory; persisting accounts to Cosmos DB can be a follow-up task.

---

### 1.2 Template Engine v1 (Single Template)
**Tasks**
- Use Handlebars as the templating library.
- Create one nonprofit template with placeholders.
- Implement variable injection from structured input data.
- Generate static HTML/CSS output locally.

**Definition of Done**
- Given input JSON, the engine produces a valid static website.
- Output renders correctly in a browser.
- Template variables are clearly documented.

---

### 1.3 Guided Wizard (Core Inputs Only)
**Tasks**
- Build multi-step form for required nonprofit data.
- Validate required fields.
- Save submission payload for generation.

**Definition of Done**
- User can complete wizard without errors.
- Submitted data matches template requirements exactly.
- Invalid input produces clear feedback.

---

### 1.4 AI Content Enhancement (OpenAI GPT)
**Tasks**
- Integrate OpenAI GPT API (server-side only, key stored as environment variable).
- Build a structured prompt that sends the user's raw wizard input and selected template context to GPT for content polishing (grammar, tone, clarity, professionalism).
- Create `POST /api/generate/enhance` endpoint that accepts `templateId` + `inputData` and returns `enhancedInputData`.
- Build UI step after wizard completion that displays AI-enhanced text alongside the original, allowing the user to accept, edit, or revert each field.
- Implement graceful fallback: if the OpenAI API is unavailable or times out, proceed with the user's original input and show a notification.

**Definition of Done**
- AI-enhanced text is noticeably improved in tone and clarity over typical raw input.
- User can compare original vs. enhanced text and choose per field.
- System works end-to-end even when OpenAI API is unreachable (fallback to raw input).
- No OpenAI credentials are exposed to the client.

---

### 1.5 Preview Generation
**Tasks**
- Generate preview output using template engine.
- Display preview to user prior to payment.

**Definition of Done**
- Preview reflects user input accurately.
- Preview is viewable without payment.
- Preview does not expose downloadable ZIP.

---

### 1.6 ZIP Generation & Storage
**Tasks**
- Implement ZIP packaging using Archiver.
- Store ZIP artifact securely (Azure Blob Storage or equivalent).
- Associate ZIP with generation request.
 - Expose `POST /api/generate/zip` to render the template, build the ZIP, upload to storage, and create the generation record before checkout.

**Definition of Done**
- ZIP contains full static site structure.
- ZIP can be unzipped and deployed manually.
- ZIP is not publicly accessible without authorization.

---

### 1.7 Stripe Payment Integration
**Tasks**
- Implement Stripe Checkout for $29 one-time payment.
- Handle success and cancel redirects.
- Implement webhook endpoint with signature verification.
- Gate ZIP download on confirmed payment.
 - Expose `POST /api/stripe/create-session` and `GET /api/stripe/session-status/:sessionId` endpoints used by the frontend payment flow.

**Definition of Done**
- Payment must be confirmed via webhook, not redirect.
- Failed or canceled payments do not unlock downloads.
- Paid users can download ZIP exactly once (or clearly documented policy).

---

### 1.8 MVP Deployment
**Tasks**
- Deploy frontend and backend to Azure.
- Configure environment variables in Azure.
- Verify production build.

**Definition of Done**
- App is publicly accessible.
- Full happy path works in production:
  signup → wizard → AI enhance → preview → payment → ZIP download.

---

## Phase 2 — Sprint 3: Polish & Expansion (Deliverable Phase 1)

### Goals
Improve reliability, usability, and completeness for evaluation.

---

### 2.1 Multiple Templates
**Tasks**
- Add 3–5 additional nonprofit templates.
- Standardize template input schema.
- Add template previews.

**Definition of Done**
- User can choose between 4–6 templates.
- All templates support the same input schema.
- Templates are visually distinct and nonprofit-focused.

---

### 2.2 UI/UX Improvements
**Tasks**
- Improve wizard flow and layout.
- Add progress indicators.
- Improve error and loading states.

**Definition of Done**
- Wizard is usable without explanation.
- Errors are actionable and clear.
- No broken navigation paths.

---

### 2.3 Reliability & Error Handling
**Tasks**
- Add error handling around generation and ZIP creation.
- Handle Stripe edge cases.
- Add basic logging.

**Definition of Done**
- Failures do not crash the app.
- Users receive clear failure messages.
- Logs allow tracing generation/payment issues.

---

### 2.4 Documentation (Sprint 3 Level)
**Tasks**
- Write hosting guides for non-technical users.
- Create API documentation (OpenAPI/Swagger).
- Create architecture and data flow diagrams.

**Definition of Done**
- A non-technical user can deploy a ZIP using the docs.
- API surface is documented.
- Architecture diagram matches implementation.

---

### Sprint 3 Definition of Done
- Application is stable, demo-ready, and publicly accessible.
- Supports multiple templates.
- Documentation exists for users and developers.
- Matches Sprint 3 deadline requirements.

---

## Phase 3 — Sprint 4: Refinement & Optional Features (Deliverable Phase 2)

### Goals
Demonstrate depth, learning, and polish without expanding core scope.

---

### 3.1 Optional Feature Expansion
**Possible Tasks**
- Template customization options.
- Improved onboarding or example content.
- Better preview fidelity.

**Definition of Done**
- Features do not break MVP flow.
- Features are clearly documented as enhancements.

---

### 3.2 Performance & Cleanup
**Tasks**
- Optimize generation speed.
- Remove unused code.
- Improve folder structure.

**Definition of Done**
- Generation time is reasonable.
- Codebase is clean and readable.
- No unused endpoints or dead code.

---

### 3.3 Final Documentation & Learning Artifacts
**Tasks**
- Write technical blog post on template engine.
- Finalize README and setup instructions.
- Prepare individual learning reflections.

**Definition of Done**
- Blog post explains design decisions.
- README allows local setup without assistance.
- Learning reflections are complete.

---

## Phase 4 — Wrap-Up & Demonstration

### Tasks
- Prepare live demo flow.
- Record 5–7 minute demo video.
- Prepare final presentation slides.

### Definition of Done
- Live demo can be run without failure.
- Video demonstrates full user journey.
- Deliverables align with Sprint 4 submission criteria.