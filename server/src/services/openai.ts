import OpenAI from "openai";
import { TemplateInputData } from "../types/template";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/** Text fields sent to GPT — everything else is passed through unchanged. */
interface EnhanceableFields {
  tagline: string;
  missionStatement: string;
  aboutText: string;
  programs: Array<{ name: string; description: string }>;
  volunteerText?: string;
}

function buildPrompt(orgName: string, fields: EnhanceableFields): string {
  return [
    `You are a professional nonprofit communications writer.`,
    `Polish the following website content for "${orgName}" by improving grammar, clarity, tone, and professionalism.`,
    `Preserve the original meaning, facts, and voice. Do not add invented details.`,
    `Return a JSON object with exactly the same keys as the input. Return only valid JSON, no explanation.`,
    ``,
    `Input:`,
    JSON.stringify(fields, null, 2),
  ].join("\n");
}

/**
 * Calls OpenAI to enhance the text fields of the given TemplateInputData.
 * Non-text fields (colors, URLs, email, phone, address) are passed through unchanged.
 * Throws on API error — callers should implement fallback logic.
 */
export async function enhanceContent(
  inputData: TemplateInputData,
  timeoutMs = 25_000
): Promise<TemplateInputData> {
  const openai = getClient();

  const toEnhance: EnhanceableFields = {
    tagline: inputData.tagline,
    missionStatement: inputData.missionStatement,
    aboutText: inputData.aboutText,
    programs: inputData.programs.map((p) => ({
      name: p.name,
      description: p.description,
    })),
    ...(inputData.volunteerText
      ? { volunteerText: inputData.volunteerText }
      : {}),
  };

  const response = await openai.chat.completions.create(
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: buildPrompt(inputData.orgName, toEnhance) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2048,
    },
    { timeout: timeoutMs }
  );

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");

  const enhanced = JSON.parse(raw) as Partial<EnhanceableFields>;

  return {
    ...inputData,
    tagline: enhanced.tagline ?? inputData.tagline,
    missionStatement: enhanced.missionStatement ?? inputData.missionStatement,
    aboutText: enhanced.aboutText ?? inputData.aboutText,
    programs: inputData.programs.map((p, i) => ({
      ...p,
      name: enhanced.programs?.[i]?.name ?? p.name,
      description: enhanced.programs?.[i]?.description ?? p.description,
    })),
    volunteerText: enhanced.volunteerText ?? inputData.volunteerText,
  };
}
