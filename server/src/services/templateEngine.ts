import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { TemplateInputData, TEMPLATES } from "../types/template";

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

/**
 * Compiles a template with the given input data and returns the rendered HTML string.
 *
 * The CSS file for the template is inlined into the returned HTML by embedding
 * it inside a <style> tag — this produces a single self-contained HTML file that
 * renders correctly when opened directly in a browser.
 *
 * @param templateId  Must match one of the ids in the TEMPLATES registry.
 * @param inputData   Structured data conforming to TemplateInputData.
 * @returns           An object containing the rendered `html` string and the raw `css` string.
 */
export function renderTemplate(
  templateId: string,
  inputData: TemplateInputData
): { html: string; css: string } {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  const templateDir = path.join(TEMPLATES_DIR, template.dirName);

  // Load Handlebars source
  const hbsPath = path.join(templateDir, "index.hbs");
  if (!fs.existsSync(hbsPath)) {
    throw new Error(`Template file not found: ${hbsPath}`);
  }
  const hbsSource = fs.readFileSync(hbsPath, "utf-8");

  // Load CSS source
  const cssPath = path.join(templateDir, "styles.css");
  if (!fs.existsSync(cssPath)) {
    throw new Error(`Stylesheet not found: ${cssPath}`);
  }
  const cssRaw = fs.readFileSync(cssPath, "utf-8");

  // Compile CSS — it also uses Handlebars to inject color variables
  const cssTemplate = Handlebars.compile(cssRaw);
  const css = cssTemplate({
    primaryColor: inputData.primaryColor,
    secondaryColor: inputData.secondaryColor,
  });

  // Build the template context
  const context: Record<string, unknown> = {
    ...inputData,
    // Provide sensible defaults for optional fields
    logoAlt: inputData.logoAlt ?? inputData.orgName,
    donationCta: inputData.donationCta ?? "Donate Now",
    year: new Date().getFullYear(),
    // Flatten image slots so templates can use simple {{#if aboutImageUrl}} checks
    aboutImageUrl: inputData.images?.about ?? "",
    heroImageUrl: inputData.images?.hero ?? "",
    programsImageUrl: inputData.images?.programs ?? "",
  };

  // Compile the HTML template and inject the resolved CSS inline
  const htmlTemplate = Handlebars.compile(hbsSource);
  let html = htmlTemplate(context);

  // Replace the external stylesheet link with an inline <style> block so
  // the output is a fully self-contained HTML file (no file-system dependency
  // on styles.css when the HTML is opened standalone).
  html = html.replace(
    /<link rel="stylesheet" href="styles\.css" \/>/,
    `<style>\n${css}\n</style>`
  );

  return { html, css };
}

/**
 * Returns the list of available templates (id, name, description).
 */
export function listTemplates(): typeof TEMPLATES {
  return TEMPLATES;
}
