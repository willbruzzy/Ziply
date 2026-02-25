import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { renderTemplate, listTemplates } from "../services/templateEngine";
import { enhanceContent } from "../services/openai";
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

export default router;
