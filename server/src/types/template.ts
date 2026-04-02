/**
 * Structured input data for generating a nonprofit website.
 * All text fields are used as-is or AI-enhanced before injection into the template.
 *
 * Required fields must be present for generation to succeed.
 * Optional fields gracefully degrade (sections are hidden when omitted).
 */
export interface TemplateInputData {
  // --- Organization identity ---
  /** Display name of the nonprofit. Required. */
  orgName: string;
  /** Short tagline displayed in the hero section. Required. */
  tagline: string;
  /** Full mission statement paragraph. Required. */
  missionStatement: string;
  /** "About us" body text. Required. */
  aboutText: string;

  // --- Branding ---
  /** CSS hex/hsl/rgb value for the primary brand color (buttons, accents). Required. */
  primaryColor: string;
  /** CSS hex/hsl/rgb value for the secondary brand color (backgrounds, hover). Required. */
  secondaryColor: string;
  /** Publicly-accessible URL for the organization logo image. Optional. */
  logoUrl?: string;
  /** Alt text for the logo image. Defaults to orgName. Optional. */
  logoAlt?: string;

  // --- Images ---
  /**
   * Map of uploaded image URLs keyed by slot name.
   * Slots are template-defined (e.g. "about" for the about-section image).
   * Values are public Azure Blob Storage URLs returned by POST /api/upload/image.
   */
  images?: { about?: string; hero?: string; programs?: string; [key: string]: string | undefined };

  // --- Programs / Services ---
  /**
   * List of programs or services offered by the nonprofit.
   * At least one program is required.
   */
  programs: Array<{
    name: string;
    description: string;
    /** Optional icon name (used as aria-label; decorative only in v1 template). */
    icon?: string;
  }>;

  // --- Impact metrics ---
  /**
   * Key statistics to display in the impact section. Optional.
   * Example: [{ number: "5,000+", label: "meals served monthly" }]
   */
  impactStats?: Array<{
    number: string;
    label: string;
  }>;

  // --- Donation / CTA ---
  /** URL for the external donation platform (e.g. GoFundMe, PayPal). Optional. */
  donationUrl?: string;
  /** Call-to-action button text for donations. Defaults to "Donate Now". Optional. */
  donationCta?: string;

  // --- Contact ---
  /** Public contact email address. Required. */
  email: string;
  /** Public phone number (formatted string). Optional. */
  phone?: string;
  /** Physical or mailing address. Optional. */
  address?: string;

  // --- Volunteer ---
  /** Short blurb inviting volunteers. Optional. */
  volunteerText?: string;
  /** URL for volunteer sign-up form or page. Optional. */
  volunteerUrl?: string;
}

/** Metadata record describing a registered template. */
export interface Template {
  id: string;
  name: string;
  description: string;
  /** Path (relative to server/src/templates/) to the template directory. */
  dirName: string;
  version: string;
}

/** Registry of all available templates. */
export const TEMPLATES: Template[] = [
  {
    id: "nonprofit-basic",
    name: "Nonprofit Basic",
    description:
      "A clean, professional landing page for nonprofits. Includes hero, about, programs, impact, donation CTA, volunteer section, and contact.",
    dirName: "nonprofit-basic",
    version: "1.0.0",
  },
  {
    id: "nonprofit-modern",
    name: "Nonprofit Modern",
    description:
      "A bold, editorial landing page with large typography, strong color blocks, and an asymmetric layout. Ideal for nonprofits seeking a striking online presence.",
    dirName: "nonprofit-modern",
    version: "1.0.0",
  },
  {
    id: "nonprofit-warm",
    name: "Nonprofit Warm",
    description:
      "A soft, community-focused landing page with rounded elements, gentle gradients, and an inviting aesthetic. Perfect for nonprofits that want to feel approachable.",
    dirName: "nonprofit-warm",
    version: "1.0.0",
  },
];
