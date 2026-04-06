import { Router, Response } from "express";
import { randomUUID } from "crypto";
import archiver from "archiver";
import { authenticate, AuthRequest } from "../middleware/auth";
import { renderTemplate, listTemplates } from "../services/templateEngine";
import { enhanceContent } from "../services/openai";
import { uploadZip, streamZip } from "../services/storage";
import { createGenerationRecord, getGenerationRecord } from "../services/cosmos";
import { TemplateInputData, TEMPLATES } from "../types/template";

const router = Router();

/**
 * GET /api/templates
 * Returns the list of available templates (id, name, description, version).
 */
router.get("/templates", (_req, res: Response) => {
  res.json({ templates: listTemplates() });
});

/**
 * GET /api/templates/:id
 * Returns metadata for a single template.
 */
router.get("/templates/:id", (req, res: Response) => {
  const template = TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  res.json({ template });
});

/** Hardcoded demo data used to render template previews before the wizard is filled out. */
const DEMO_DATA: TemplateInputData = {
  orgName: "Hope in Action",
  tagline: "Building a stronger community, one step at a time.",
  missionStatement:
    "Our mission is to empower underserved communities through education, resources, and compassionate support. Together, we believe lasting change is possible.",
  aboutText:
    "Founded in 2012, Hope in Action has served thousands of families across the region. We are driven by the belief that every person deserves dignity, opportunity, and community.",
  primaryColor: "#4f46e5",
  secondaryColor: "#1e40af",
  email: "info@hopeinaction.org",
  phone: "(555) 123-4567",
  address: "200 Community Ave, Springfield, IL",
  programs: [
    {
      name: "Youth Mentorship",
      description:
        "Pairing at-risk youth with caring adult mentors to build confidence and life skills.",
    },
    {
      name: "Food Assistance",
      description:
        "Monthly food distributions serving over 500 families in need across our region.",
    },
    {
      name: "Skills Training",
      description:
        "Free workshops on job readiness, financial literacy, and digital skills for adults.",
    },
  ],
  impactStats: [
    { number: "12,000+", label: "lives impacted" },
    { number: "500+", label: "volunteers" },
    { number: "10 yrs", label: "of service" },
  ],
  donationUrl: "https://donate.example.org",
  donationCta: "Donate Today",
  volunteerText:
    "Join our growing community of volunteers and make a real difference in someone's life. We welcome all backgrounds and skill levels.",
};

/**
 * GET /api/generate/demo/:templateId
 * Renders a template with hardcoded demo data for preview purposes.
 * Requires authentication.
 *
 * Response:
 *   { html: string }
 */
router.get(
  "/generate/demo/:templateId",
  authenticate,
  (req: AuthRequest, res: Response) => {
    const templateId = req.params.templateId as string;
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    try {
      const { html } = renderTemplate(templateId, DEMO_DATA);
      res.json({ html });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      res.status(422).json({ error: message });
    }
  }
);

/**
 * POST /api/generate/preview
 * Renders a template with the provided inputData and returns the HTML.
 * Requires authentication.
 *
 * Body:
 *   { templateId: string, inputData: TemplateInputData }
 *
 * Response:
 *   { html: string }
 */
router.post(
  "/generate/preview",
  authenticate,
  (req: AuthRequest, res: Response) => {
    const { templateId, inputData } = req.body as {
      templateId?: string;
      inputData?: TemplateInputData;
    };

    if (!templateId || typeof templateId !== "string") {
      res.status(400).json({ error: "templateId is required" });
      return;
    }

    if (!inputData || typeof inputData !== "object") {
      res.status(400).json({ error: "inputData is required" });
      return;
    }

    // Validate required fields
    const required: (keyof TemplateInputData)[] = [
      "orgName",
      "tagline",
      "missionStatement",
      "aboutText",
      "primaryColor",
      "secondaryColor",
      "email",
    ];

    const missing = required.filter((field) => !inputData[field]);
    if (missing.length > 0) {
      res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    if (!Array.isArray(inputData.programs) || inputData.programs.length === 0) {
      res
        .status(400)
        .json({ error: "At least one program is required" });
      return;
    }

    try {
      const { html } = renderTemplate(templateId, inputData);
      res.json({ html });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Generation failed";
      res.status(422).json({ error: message });
    }
  }
);

/**
 * POST /api/generate/enhance
 * Enhances the text fields of inputData using OpenAI GPT.
 * Falls back to the original inputData if the AI call fails or times out.
 * Requires authentication.
 *
 * Body:
 *   { templateId: string, inputData: TemplateInputData }
 *
 * Response:
 *   { enhancedInputData: TemplateInputData, fallback: boolean }
 */
router.post(
  "/generate/enhance",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const { templateId, inputData } = req.body as {
      templateId?: string;
      inputData?: TemplateInputData;
    };

    if (!templateId || typeof templateId !== "string") {
      res.status(400).json({ error: "templateId is required" });
      return;
    }

    if (!inputData || typeof inputData !== "object") {
      res.status(400).json({ error: "inputData is required" });
      return;
    }

    try {
      const enhancedInputData = await enhanceContent(inputData);
      res.json({ enhancedInputData, fallback: false });
    } catch (err) {
      // Graceful fallback: return original data if OpenAI is unavailable
      // eslint-disable-next-line no-console
      console.error("OpenAI enhance failed, using fallback:", err);
      res.json({ enhancedInputData: inputData, fallback: true });
    }
  }
);

/**
 * POST /api/generate/zip
 * Renders the template, packages it into a ZIP, uploads to Azure Blob Storage,
 * and creates a GenerationRecord in Cosmos DB.
 * Requires authentication.
 *
 * Body:
 *   { templateId: string, inputData: TemplateInputData }
 *
 * Response:
 *   { generationId: string }
 */
router.post(
  "/generate/zip",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const { templateId, inputData } = req.body as {
      templateId?: string;
      inputData?: TemplateInputData;
    };

    if (!templateId || typeof templateId !== "string") {
      res.status(400).json({ error: "templateId is required" });
      return;
    }

    if (!inputData || typeof inputData !== "object") {
      res.status(400).json({ error: "inputData is required" });
      return;
    }

    const userId = req.user!.userId;
    const generationId = randomUUID();
    const blobName = `${userId}/${generationId}.zip`;

    try {
      // Render template
      const { html, css } = renderTemplate(templateId, inputData);

      // Build ZIP in memory
      const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on("data", (chunk: Buffer) => chunks.push(chunk));
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", reject);

        archive.append(html, { name: "index.html" });
        archive.append(css, { name: "styles.css" });
        archive.finalize();
      });

      // Upload to Azure Blob Storage
      await uploadZip(blobName, zipBuffer);

      // Create Cosmos DB record
      await createGenerationRecord({
        id: generationId,
        userId,
        templateId,
        blobName,
        paid: false,
        createdAt: new Date().toISOString(),
      });

      res.json({ generationId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "ZIP generation failed";
      res.status(500).json({ error: message });
    }
  }
);

/**
 * GET /api/generate/download/:generationId
 * Streams the ZIP file for a confirmed generation to the client.
 * Requires authentication and confirmed payment.
 *
 * Response:
 *   ZIP file stream with Content-Disposition: attachment
 */
router.get(
  "/generate/download/:generationId",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const generationId = req.params.generationId as string;
    const userId = req.user!.userId;

    try {
      const record = await getGenerationRecord(generationId, userId);

      if (!record) {
        res.status(404).json({ error: "Generation not found" });
        return;
      }

      if (!record.paid) {
        res.status(402).json({ error: "Payment required to download" });
        return;
      }

      const fileName = `ziply-${record.templateId}-${generationId.slice(0, 8)}.zip`;
      await streamZip(record.blobName, fileName, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
