# Ziply — Product & Technical Specification (spec.md)

## 1. Summary
Ziply is a SaaS web application that enables nonprofit organizations to generate professional websites without coding experience. Users select a nonprofit-focused template, enter organization details (name, mission, colors, programs, images, etc.), preview the site, pay a one-time fee of $29 via Stripe, and download a ready-to-deploy website as a ZIP file.

## 2. Goals
- Provide nonprofits an affordable, credible website generator with clear ownership of exported assets.
- Deliver a smooth guided wizard for inputting content and branding.
- Generate a complete static website bundle (HTML/CSS/assets) from templates.
- Support one-time payments and secure access to paid downloads.
- Deploy the production app to Microsoft Azure and make it publicly accessible for evaluation.
- Produce documentation for both technical setup and non-technical hosting/deployment of the exported ZIP.

## 3. Non-Goals (Explicitly Out of Scope for MVP)
- Ongoing subscriptions, recurring billing, or multi-seat organization management.
- A full CMS editor with rich drag-and-drop page building.
- Custom domain purchase/management built into Ziply.
- Fully automated one-click deployment of the generated site to a hosting provider (may be future work; docs only for capstone).
- Admin dashboard with analytics beyond basic operational needs.

## 4. Target Users & Use Cases
### Primary users
- Nonprofit staff or volunteers with limited technical background.

### Primary use cases
1. Create an account and sign in.
2. Choose a nonprofit template.
3. Complete a multi-step wizard to enter organization content and branding.
4. Preview the generated site.
5. Pay $29 via Stripe Checkout.
6. Download generated ZIP (post-payment).
7. Follow hosting guide to deploy the ZIP to a static hosting provider.

## 5. Social Impact Requirement
Ziply reduces cost and complexity barriers for nonprofits needing a professional web presence. A one-time low fee and downloadable ZIP delivery provides nonprofits ownership and flexibility to host cheaply or for free (e.g., Netlify, Cloudflare Pages, GitHub Pages), supported by clear non-technical documentation.

## 6. Functional Requirements
### 6.1 Authentication & Accounts
- Users can register, log in, and log out.
- Sessions must be secure (JWT-based authentication with secure session handling as applicable to chosen architecture).
- Passwords must be hashed and never stored in plaintext.
- Basic account page: view past purchases or generated downloads (MVP can be minimal).

### 6.2 Template Selection
- User can browse and select from 4–6 nonprofit-focused templates.
- Each template includes predefined pages/sections appropriate for nonprofits (donations CTA, volunteer signup prompt, programs/services, impact metrics, events).

### 6.3 Guided Wizard (Multi-step Form)
- Multi-step wizard collects:
  - Organization name
  - Mission / about text
  - Branding: colors, logo (optional), images
  - Programs/services descriptions
  - Contact info (email/phone/address)
  - Donation link or CTA (may be a URL or a placeholder CTA)
  - Optional: volunteer info / signup link
  - Optional: events list or simple event section content
- Wizard validates required fields and provides helpful error messages.

### 6.3.1 AI Content Enhancement (OpenAI GPT)
- After the user completes all required wizard fields, the collected input data and the selected template identifier are sent to the OpenAI GPT API for content polishing.
- The AI pass improves grammar, tone, clarity, and professionalism of user-provided text (mission statement, program descriptions, about text, etc.) while preserving the original meaning and facts.
- The system sends a structured prompt that includes the user's raw input and context about the chosen template so the LLM can tailor language to a nonprofit audience.
- The user is shown the AI-enhanced version alongside their original input and can accept, edit, or revert each field before proceeding to preview.
- The enhancement step must not block generation if the OpenAI API is unavailable — the system should fall back gracefully to the user's original input with a notification.
- API keys are stored server-side only; no OpenAI credentials are exposed to the client.

### 6.4 Preview
- User can preview the generated site before purchase.
- Preview should reflect the chosen template and injected content.
- Preview does not provide direct ZIP download before payment.

### 6.5 Payment (Stripe)
- Stripe Checkout for one-time payment ($29).
- Payment success redirects back to the app with confirmation.
- Payment cancel redirects back with a recoverable state.
- Stripe webhooks are used to securely confirm payment completion (signature verification required).
- System handles incomplete/failed payments gracefully (no download granted).

### 6.6 Website Generation (Template Engine)
- A Node.js-based generation engine produces a complete static website output:
  - HTML files (or equivalent static output)
  - CSS (template-provided)
  - Assets directory containing uploaded images/logos
- Template variables are injected into HTML using Handlebars (also used to inject brand colors into CSS).
- Generation must be deterministic and reproducible given the same inputs.

### 6.7 ZIP Packaging & Delivery
- Generated site is packaged into a ZIP file using a reliable method (e.g., Archiver npm package).
- After confirmed payment, user can download the ZIP.
- ZIP download should be protected (signed URL, token-gated endpoint, or authenticated download linked to purchase).

### 6.8 Documentation
- End-user docs: “How to deploy your ZIP” (Netlify / Cloudflare Pages / GitHub Pages).
- Technical docs:
  - README with setup instructions
  - API documentation (OpenAPI/Swagger)
  - Architecture diagram(s) and data flow description

## 7. Non-Functional Requirements
- Security: protect secrets; Stripe webhook signature verification; no public access to paid ZIPs without authorization.
- Reliability: generation and ZIP creation should handle common errors and provide user-friendly messaging.
- Accessibility: templates and UI should aim for WCAG-aligned accessibility practices (semantic HTML, contrast, alt text guidance).
- Performance: generation should complete within a reasonable time for typical nonprofit-sized input; avoid blocking UI without feedback.

## 8. Tech Stack & Deployment
### Frontend
- React + Next.js (App Router as applicable).

### Backend
- Node.js + Express (separate backend in `server/`, with the Next.js app in `client/`).
- REST API endpoints for wizard submission, preview, payment status, and download access.

### Azure
- Deployment target includes Microsoft Azure services such as:
  - App Service and/or Static Web Apps
  - Functions (if used)
  - Blob Storage for file handling (uploads and/or ZIP storage)
  - Cosmos DB for NoSQL storage (user data, template metadata, purchase records)
- CI/CD with GitHub Actions.

### OpenAI
- GPT API (e.g., gpt-4o-mini or gpt-4o) for AI content enhancement of user wizard inputs.
- Called server-side only; API key stored as an environment variable, never exposed to the client.

### Stripe
- Stripe Checkout + Webhooks.

## 9. Data Model (Initial)
(Exact schema can evolve, but must be explicit.)
- User  
  - id  
  - email  
  - passwordHash  
  - createdAt  
  - (MVP stores users in-memory; persisting to Cosmos DB is a future enhancement.)
- Template  
  - id  
  - name  
  - description  
  - previewAssets / thumbnail  
  - version
- GenerationRecord  
  - id (generation id, also Cosmos document id)  
  - userId (Cosmos partition key)  
  - templateId  
  - blobName (e.g. `{userId}/{id}.zip` in Azure Blob Storage)  
  - paid (boolean)  
  - createdAt  
  - paidAt (optional)  
  - stripeSessionId (optional)  
  - (This single record plays the role of “generation request”, “purchase status”, and “artifact location” for MVP.)

## 10. API Surface (Draft)
(If you use Next.js API routes, map these accordingly.)

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

- GET  /api/templates
- GET  /api/templates/:id

- POST /api/generate/enhance
  - input: templateId, inputData (raw user input)
  - output: enhancedInputData (AI-polished version of each text field)
  - falls back to original inputData if OpenAI API is unavailable

- POST /api/generate/preview
  - input: templateId, inputData (original or AI-enhanced)
  - output: html (server-rendered HTML string used by the preview page)

- POST /api/generate/zip
  - input: templateId, inputData
  - output: generationId
  - side effects: renders template, builds ZIP, uploads to Azure Blob Storage, and creates a GenerationRecord

- POST /api/stripe/create-session
  - input: generationId
  - output: sessionUrl (Stripe Checkout session)

- POST /api/stripe/webhook
  - Stripe webhook endpoint with signature verification

- GET /api/stripe/session-status/:sessionId
  - requires authentication
  - returns payment status and associated generationId

- GET /api/generate/download/:generationId
  - requires confirmed payment
  - returns ZIP (or a signed URL)

## 11. Acceptance Criteria (Definition of Done)
- A user can create an account, select a template, complete the wizard, preview output, pay via Stripe, and download a ZIP.
- Payment gating is enforced using webhook-confirmed status (not just client redirect).
- Generated ZIP contains a valid static site that can be deployed via documented steps.
- App is deployed on Azure and is publicly accessible.
- Deliverables include:
  - 4–6 templates
  - Node.js generation engine
  - OpenAPI/Swagger API documentation
  - Architecture diagrams
  - Hosting guides for non-technical users
  - README/setup docs
  - Technical blog post on the template engine
  - Individual learning reflections
  - Live demo and a 5–7 minute recorded demo video showing full user journey

## 12. Risks & Mitigations
- Stripe/webhook complexity: prototype early; use official docs; validate signature verification.
- Template engine drift: start with 1 template end-to-end, then scale to 4–6.
- File handling & storage: prefer Blob Storage for artifacts; minimize sensitive data in stored payloads.
- OpenAI API dependency: implement graceful fallback to raw user input if the API is slow or unavailable; set reasonable timeouts.
- Scope creep: enforce non-goals; phase extras after end-to-end MVP works.

## 13. Open Questions (To Resolve Early)
- Backend shape: use an Express server in `server/` with a separate Next.js app in `client/`.
- Preview strategy: server-rendered HTML preview; `POST /api/generate/preview` returns `{ html }` used by the preview page.
- Artifact storage: ZIP is generated by `POST /api/generate/zip`, uploaded to Azure Blob Storage, and referenced from the GenerationRecord.
- Access control approach: authenticated download endpoint that checks the associated GenerationRecord is marked `paid`; no signed URLs in the MVP.
- Template library choice: Handlebars for both HTML templates and CSS color theming.
