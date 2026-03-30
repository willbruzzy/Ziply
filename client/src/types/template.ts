/**
 * Structured input data for generating a nonprofit website.
 * Mirrors server/src/types/template.ts — keep in sync.
 */

export interface Program {
  name: string;
  description: string;
  icon?: string;
}

export interface ImpactStat {
  number: string;
  label: string;
}

export interface TemplateInputData {
  // Required
  orgName: string;
  tagline: string;
  missionStatement: string;
  aboutText: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  programs: Program[];

  // Optional
  logoUrl?: string;
  logoAlt?: string;
  images?: { about?: string; [key: string]: string | undefined };
  impactStats?: ImpactStat[];
  donationUrl?: string;
  donationCta?: string;
  phone?: string;
  address?: string;
  volunteerText?: string;
  volunteerUrl?: string;
}

export interface WizardPayload {
  templateId: string;
  inputData: TemplateInputData;
}

export const WIZARD_STORAGE_KEY = 'ziply_wizard_data';
export const AUTH_TOKEN_KEY = 'ziply_token';
export const AUTH_USER_KEY = 'ziply_user';
export const GENERATION_ID_KEY = 'ziply_generation_id';
