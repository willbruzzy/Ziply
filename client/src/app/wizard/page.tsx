"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowNav from "@/components/FlowNav";
import Spinner from "@/components/Spinner";
import {
  type TemplateInputData,
  type ImpactStat,
  type Program,
  AUTH_TOKEN_KEY,
  WIZARD_STORAGE_KEY,
} from "@/types/template";

interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  version: string;
}

const TOTAL_STEPS = 7;

const STEP_LABELS = [
  "Template",
  "Organization",
  "Branding",
  "Media",
  "Programs",
  "Impact & Donations",
  "Contact",
];

const INITIAL_DATA: TemplateInputData = {
  orgName: "",
  tagline: "",
  missionStatement: "",
  aboutText: "",
  primaryColor: "#4f46e5",
  secondaryColor: "#1e40af",
  email: "",
  programs: [{ name: "", description: "" }],
  impactStats: [],
  donationUrl: "",
  donationCta: "",
  phone: "",
  address: "",
  volunteerText: "",
  volunteerUrl: "",
  images: {},
};

type Errors = Record<string, string>;

// ── Helper components ──────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {children}
      {optional && (
        <span className="ml-1 text-gray-400 font-normal text-xs">
          (optional)
        </span>
      )}
    </label>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const textareaClass = `${inputClass} resize-none`;

// ── Step components ────────────────────────────────────────────────────────────

function Step1({
  data,
  errors,
  onChange,
}: {
  data: TemplateInputData;
  errors: Errors;
  onChange: (field: keyof TemplateInputData, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="orgName">Organization name</Label>
        <input
          id="orgName"
          type="text"
          value={data.orgName}
          onChange={(e) => onChange("orgName", e.target.value)}
          className={inputClass}
          placeholder="Green Future Foundation"
        />
        <FieldError msg={errors.orgName} />
      </div>

      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <input
          id="tagline"
          type="text"
          value={data.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          className={inputClass}
          placeholder="Building a sustainable tomorrow, together."
        />
        <p className="mt-1 text-xs text-gray-400">
          A short phrase that appears in the hero section.
        </p>
        <FieldError msg={errors.tagline} />
      </div>

      <div>
        <Label htmlFor="missionStatement">Mission statement</Label>
        <textarea
          id="missionStatement"
          rows={3}
          value={data.missionStatement}
          onChange={(e) => onChange("missionStatement", e.target.value)}
          className={textareaClass}
          placeholder="Our mission is to empower communities through sustainable practices and education…"
        />
        <FieldError msg={errors.missionStatement} />
      </div>

      <div>
        <Label htmlFor="aboutText">About us</Label>
        <textarea
          id="aboutText"
          rows={4}
          value={data.aboutText}
          onChange={(e) => onChange("aboutText", e.target.value)}
          className={textareaClass}
          placeholder="Founded in 2010, we have worked with over 200 communities across the region…"
        />
        <FieldError msg={errors.aboutText} />
      </div>
    </div>
  );
}

function Step2({
  data,
  errors,
  onChange,
}: {
  data: TemplateInputData;
  errors: Errors;
  onChange: (field: keyof TemplateInputData, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="primaryColor">Primary color</Label>
          <div className="flex items-center gap-3 mt-1">
            <input
              id="primaryColor"
              type="color"
              value={data.primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="h-10 w-16 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="#4f46e5"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Used for buttons, links, and accents.
          </p>
          <FieldError msg={errors.primaryColor} />
        </div>

        <div>
          <Label htmlFor="secondaryColor">Secondary color</Label>
          <div className="flex items-center gap-3 mt-1">
            <input
              id="secondaryColor"
              type="color"
              value={data.secondaryColor}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              className="h-10 w-16 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={data.secondaryColor}
              onChange={(e) => onChange("secondaryColor", e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="#1e40af"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Used for backgrounds and hover states.
          </p>
          <FieldError msg={errors.secondaryColor} />
        </div>
      </div>

    </div>
  );
}

function StepMedia({
  slotId,
  slotLabel,
  slotDescription,
  imageUrl,
  onImageUrl,
  onStatusChange,
}: {
  slotId: string;
  slotLabel: string;
  slotDescription: string;
  imageUrl?: string;
  onImageUrl: (url: string) => void;
  onStatusChange: (uploading: boolean) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(imageUrl ?? "");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");
    onStatusChange(true);

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("ziply_token");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const { url } = await res.json();
      setPreview(url);
      onImageUrl(url);
      setStatus("done");
      onStatusChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setStatus("error");
      onStatusChange(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={slotId} optional>
          {slotLabel}
        </Label>
        <p className="text-xs text-gray-500 mb-2">{slotDescription}</p>
        <input
          id={slotId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          disabled={status === "uploading"}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {status === "uploading" && (
        <p className="text-sm text-indigo-600">Uploading…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {preview && status !== "error" && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={slotLabel}
            className="rounded-lg object-cover w-full max-h-48"
          />
        </div>
      )}
    </div>
  );
}

function Step3({
  programs,
  errors,
  onUpdate,
  onAdd,
  onRemove,
}: {
  programs: Program[];
  errors: Errors;
  onUpdate: (index: number, field: keyof Program, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Add the programs or services your nonprofit offers. At least one is
        required.
      </p>

      {errors.programs && (
        <p className="text-xs text-red-600">{errors.programs}</p>
      )}

      {programs.map((prog, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Program {i + 1}
            </span>
            {programs.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <Label htmlFor={`prog-${i}-name`}>Program name</Label>
            <input
              id={`prog-${i}-name`}
              type="text"
              value={prog.name}
              onChange={(e) => onUpdate(i, "name", e.target.value)}
              className={inputClass}
              placeholder="Environmental Education"
            />
            <FieldError msg={errors[`program_${i}_name`]} />
          </div>

          <div>
            <Label htmlFor={`prog-${i}-desc`}>Description</Label>
            <textarea
              id={`prog-${i}-desc`}
              rows={2}
              value={prog.description}
              onChange={(e) => onUpdate(i, "description", e.target.value)}
              className={textareaClass}
              placeholder="We run workshops in local schools teaching students about sustainability…"
            />
            <FieldError msg={errors[`program_${i}_desc`]} />
          </div>
        </div>
      ))}

      {programs.length < 6 && (
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          + Add another program
        </button>
      )}
    </div>
  );
}

function Step4({
  data,
  impactStats,
  errors,
  onChange,
  onStatUpdate,
  onStatAdd,
  onStatRemove,
}: {
  data: TemplateInputData;
  impactStats: ImpactStat[];
  errors: Errors;
  onChange: (field: keyof TemplateInputData, value: string) => void;
  onStatUpdate: (index: number, field: keyof ImpactStat, value: string) => void;
  onStatAdd: () => void;
  onStatRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        All fields on this step are optional — skip anything that doesn&apos;t
        apply.
      </p>

      {/* Impact stats */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Impact statistics
          <span className="ml-1 text-gray-400 font-normal text-xs">
            (optional)
          </span>
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Numbers displayed in the impact section, e.g. &ldquo;5,000+ meals
          served&rdquo;.
        </p>

        {impactStats.map((stat, i) => (
          <div
            key={i}
            className="flex items-start gap-3 mb-3 border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`stat-${i}-number`}>Number</Label>
                <input
                  id={`stat-${i}-number`}
                  type="text"
                  value={stat.number}
                  onChange={(e) => onStatUpdate(i, "number", e.target.value)}
                  className={inputClass}
                  placeholder="5,000+"
                />
                <FieldError msg={errors[`stat_${i}_number`]} />
              </div>
              <div>
                <Label htmlFor={`stat-${i}-label`}>Label</Label>
                <input
                  id={`stat-${i}-label`}
                  type="text"
                  value={stat.label}
                  onChange={(e) => onStatUpdate(i, "label", e.target.value)}
                  className={inputClass}
                  placeholder="meals served monthly"
                />
                <FieldError msg={errors[`stat_${i}_label`]} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStatRemove(i)}
              className="mt-6 text-xs text-red-500 hover:text-red-700 transition-colors shrink-0"
            >
              Remove
            </button>
          </div>
        ))}

        {impactStats.length < 4 && (
          <button
            type="button"
            onClick={onStatAdd}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            + Add impact stat
          </button>
        )}
      </div>

      {/* Donation */}
      <div>
        <Label htmlFor="donationUrl" optional>
          Donation URL
        </Label>
        <input
          id="donationUrl"
          type="url"
          value={data.donationUrl ?? ""}
          onChange={(e) => onChange("donationUrl", e.target.value)}
          className={inputClass}
          placeholder="https://gofundme.com/your-campaign"
        />
        <FieldError msg={errors.donationUrl} />
      </div>

      <div>
        <Label htmlFor="donationCta" optional>
          Donation button text
        </Label>
        <input
          id="donationCta"
          type="text"
          value={data.donationCta ?? ""}
          onChange={(e) => onChange("donationCta", e.target.value)}
          className={inputClass}
          placeholder="Donate Now"
        />
        <p className="mt-1 text-xs text-gray-400">
          Defaults to &ldquo;Donate Now&rdquo; if left blank.
        </p>
      </div>
    </div>
  );
}

function Step5({
  data,
  errors,
  onChange,
}: {
  data: TemplateInputData;
  errors: Errors;
  onChange: (field: keyof TemplateInputData, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="email">Contact email</Label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={inputClass}
          placeholder="info@greenfuture.org"
        />
        <FieldError msg={errors.email} />
      </div>

      <div>
        <Label htmlFor="phone" optional>
          Phone number
        </Label>
        <input
          id="phone"
          type="tel"
          value={data.phone ?? ""}
          onChange={(e) => onChange("phone", e.target.value)}
          className={inputClass}
          placeholder="(555) 867-5309"
        />
      </div>

      <div>
        <Label htmlFor="address" optional>
          Address
        </Label>
        <input
          id="address"
          type="text"
          value={data.address ?? ""}
          onChange={(e) => onChange("address", e.target.value)}
          className={inputClass}
          placeholder="123 Main St, Springfield, IL 62701"
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <p className="text-sm font-medium text-gray-700 mb-4">
          Volunteer section
          <span className="ml-1 text-gray-400 font-normal text-xs">
            (optional)
          </span>
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="volunteerText" optional>
              Volunteer invitation text
            </Label>
            <textarea
              id="volunteerText"
              rows={2}
              value={data.volunteerText ?? ""}
              onChange={(e) => onChange("volunteerText", e.target.value)}
              className={textareaClass}
              placeholder="Join our team of dedicated volunteers making a difference every day…"
            />
          </div>

          <div>
            <Label htmlFor="volunteerUrl" optional>
              Volunteer sign-up URL
            </Label>
            <input
              id="volunteerUrl"
              type="url"
              value={data.volunteerUrl ?? ""}
              onChange={(e) => onChange("volunteerUrl", e.target.value)}
              className={inputClass}
              placeholder="https://forms.gle/your-form"
            />
            <FieldError msg={errors.volunteerUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewModal({
  templateId,
  templateName,
  onClose,
}: {
  templateId: string | null;
  templateName: string;
  onClose: () => void;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    setHtml(null);
    setError(null);
    setLoading(true);
    const token = localStorage.getItem("ziply_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(`${apiUrl}/api/generate/demo/${templateId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Preview failed");
        return res.json() as Promise<{ html: string }>;
      })
      .then((data) => setHtml(data.html))
      .catch((err) => setError(err instanceof Error ? err.message : "Preview failed"))
      .finally(() => setLoading(false));
  }, [templateId]);

  if (!templateId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex flex-col flex-1 mx-auto my-6 w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
          <span className="text-sm font-semibold text-gray-800">
            Preview — {templateName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Spinner />
              <p className="text-sm text-gray-500">Loading preview…</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {html && (
            <iframe
              srcDoc={html}
              sandbox=""
              className="w-full h-full"
              title={`Preview of ${templateName}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateSelect({
  templates,
  selectedId,
  onSelect,
  onPreview,
  loading,
}: {
  templates: TemplateMeta[];
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview: (id: string, name: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Spinner />
        <p className="text-sm text-gray-500">Loading templates…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Choose a design for your nonprofit website. All templates support the
        same content — pick the style that best fits your organization.
      </p>
      <div className="grid gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className={`border-2 rounded-lg transition-all ${
              selectedId === t.id
                ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              className="w-full text-left p-5"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                {selectedId === t.id && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.description}
              </p>
            </button>
            <div className="px-5 pb-3 -mt-1">
              <button
                type="button"
                onClick={() => onPreview(t.id, t.name)}
                className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Preview template →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────────

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TemplateInputData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [templateId, setTemplateId] = useState("nonprofit-basic");
  const [previewTemplate, setPreviewTemplate] = useState<{ id: string; name: string } | null>(null);
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    fetch(`${apiBase}/api/templates`)
      .then((res) => res.json())
      .then((json) => setTemplates(json.templates ?? []))
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
  }, [router]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setField = (field: keyof TemplateInputData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setSimpleField = (field: keyof TemplateInputData, value: string) => {
    setField(field, value);
  };

  // Programs
  const updateProgram = (
    index: number,
    field: keyof Program,
    value: string
  ) => {
    const updated = data.programs.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setField("programs", updated);
    setErrors((prev) => ({ ...prev, [`program_${index}_${field === "name" ? "name" : "desc"}`]: "" }));
  };

  const addProgram = () => {
    setField("programs", [...data.programs, { name: "", description: "" }]);
  };

  const removeProgram = (index: number) => {
    setField(
      "programs",
      data.programs.filter((_, i) => i !== index)
    );
  };

  // Impact stats
  const updateStat = (
    index: number,
    field: keyof ImpactStat,
    value: string
  ) => {
    const updated = (data.impactStats ?? []).map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    setField("impactStats", updated);
    setErrors((prev) => ({ ...prev, [`stat_${index}_${field}`]: "" }));
  };

  const addStat = () => {
    setField("impactStats", [...(data.impactStats ?? []), { number: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    setField(
      "impactStats",
      (data.impactStats ?? []).filter((_, i) => i !== index)
    );
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (): boolean => {
    const errs: Errors = {};

    if (step === 1) {
      if (!templateId) errs.templateId = "Please select a template.";
    }

    if (step === 2) {
      if (!data.orgName.trim()) errs.orgName = "Organization name is required.";
      if (!data.tagline.trim()) errs.tagline = "Tagline is required.";
      if (!data.missionStatement.trim())
        errs.missionStatement = "Mission statement is required.";
      if (!data.aboutText.trim()) errs.aboutText = "About text is required.";
    }

    if (step === 3) {
      if (!data.primaryColor)
        errs.primaryColor = "Primary color is required.";
      if (!data.secondaryColor)
        errs.secondaryColor = "Secondary color is required.";
    }

    if (step === 5) {
      if (data.programs.length === 0) {
        errs.programs = "At least one program is required.";
      }
      data.programs.forEach((p, i) => {
        if (!p.name.trim())
          errs[`program_${i}_name`] = "Program name is required.";
        if (!p.description.trim())
          errs[`program_${i}_desc`] = "Description is required.";
      });
    }

    if (step === 6) {
      if (
        data.donationUrl &&
        !/^https?:\/\/.+/.test(data.donationUrl)
      ) {
        errs.donationUrl = "Donation URL must start with http:// or https://";
      }
      (data.impactStats ?? []).forEach((s, i) => {
        if (!s.number.trim())
          errs[`stat_${i}_number`] = "Number is required.";
        if (!s.label.trim()) errs[`stat_${i}_label`] = "Label is required.";
      });
    }

    if (step === 7) {
      if (!data.email.trim()) {
        errs.email = "Contact email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errs.email = "Please enter a valid email address.";
      }
      if (
        data.volunteerUrl &&
        !/^https?:\/\/.+/.test(data.volunteerUrl)
      ) {
        errs.volunteerUrl =
          "Volunteer URL must start with http:// or https://";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Strip empty optional arrays / strings before saving
      const cleaned: TemplateInputData = {
        ...data,
        programs: data.programs,
        impactStats:
          (data.impactStats ?? []).length > 0 ? data.impactStats : undefined,
        donationUrl: data.donationUrl || undefined,
        donationCta: data.donationCta || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        volunteerText: data.volunteerText || undefined,
        volunteerUrl: data.volunteerUrl || undefined,
        logoUrl: data.logoUrl || undefined,
        logoAlt: data.logoAlt || undefined,
        images: data.images && Object.values(data.images).some(Boolean) ? data.images : undefined,
      };

      localStorage.setItem(
        WIZARD_STORAGE_KEY,
        JSON.stringify({ templateId, inputData: cleaned })
      );

      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Completion screen ──────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <FlowNav />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg text-center bg-white rounded-xl shadow-sm border border-gray-100 p-10">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Wizard complete!
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Your information has been saved for{" "}
              <strong className="text-gray-700">{data.orgName}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              The next step is AI content enhancement, followed by a live
              preview of your generated site.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/enhance"
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors text-center"
              >
                Continue to AI Enhancement →
              </Link>
              <button
                onClick={() => {
                  setDone(false);
                  setStep(1);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Edit my answers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard shell ───────────────────────────────────────────────────────────

  const progressPct = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        {/* Progress */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${
                  i + 1 === step
                    ? "text-indigo-600"
                    : i + 1 < step
                    ? "text-gray-500"
                    : "text-gray-300"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {STEP_LABELS[step - 1]}
          </h2>

          {step === 1 && (
            <TemplateSelect
              templates={templates}
              selectedId={templateId}
              onSelect={setTemplateId}
              onPreview={(id, name) => setPreviewTemplate({ id, name })}
              loading={templatesLoading}
            />
          )}
          {step === 2 && (
            <Step1 data={data} errors={errors} onChange={setSimpleField} />
          )}
          {step === 3 && (
            <div className="space-y-8">
              <Step2 data={data} errors={errors} onChange={setSimpleField} />
              <div className="space-y-4">
                <StepMedia
                  slotId="logoImage"
                  slotLabel="Logo"
                  slotDescription="Your organization's logo. Displayed in the navigation bar and used as the browser tab icon."
                  imageUrl={data.logoUrl}
                  onImageUrl={(url) => setSimpleField("logoUrl", url)}
                  onStatusChange={(uploading) => setUploadingCount((c) => uploading ? c + 1 : Math.max(0, c - 1))}
                />
                {data.logoUrl && (
                  <div>
                    <Label htmlFor="logoAlt" optional>
                      Logo alt text
                    </Label>
                    <input
                      id="logoAlt"
                      type="text"
                      value={data.logoAlt ?? ""}
                      onChange={(e) => setSimpleField("logoAlt", e.target.value)}
                      className={inputClass}
                      placeholder="Green Future Foundation logo"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-8">
              <p className="text-sm text-gray-500">
                Upload images for your website. Accepted formats: JPEG, PNG, WebP (max 5 MB). All fields are optional.
              </p>
              <StepMedia
                slotId="heroImage"
                slotLabel="Hero section image"
                slotDescription="Background photo displayed in the banner at the top of your page."
                imageUrl={data.images?.hero}
                onImageUrl={(url) => setField("images", { ...data.images, hero: url })}
                onStatusChange={(uploading) => setUploadingCount((c) => uploading ? c + 1 : Math.max(0, c - 1))}
              />
              <StepMedia
                slotId="aboutImage"
                slotLabel="About section image"
                slotDescription="Photo displayed in the &ldquo;Who We Are&rdquo; section."
                imageUrl={data.images?.about}
                onImageUrl={(url) => setField("images", { ...data.images, about: url })}
                onStatusChange={(uploading) => setUploadingCount((c) => uploading ? c + 1 : Math.max(0, c - 1))}
              />
              <StepMedia
                slotId="programsImage"
                slotLabel="Programs section image"
                slotDescription="Banner photo displayed above your programs and services."
                imageUrl={data.images?.programs}
                onImageUrl={(url) => setField("images", { ...data.images, programs: url })}
                onStatusChange={(uploading) => setUploadingCount((c) => uploading ? c + 1 : Math.max(0, c - 1))}
              />
            </div>
          )}
          {step === 5 && (
            <Step3
              programs={data.programs}
              errors={errors}
              onUpdate={updateProgram}
              onAdd={addProgram}
              onRemove={removeProgram}
            />
          )}
          {step === 6 && (
            <Step4
              data={data}
              impactStats={data.impactStats ?? []}
              errors={errors}
              onChange={setSimpleField}
              onStatUpdate={updateStat}
              onStatAdd={addStat}
              onStatRemove={removeStat}
            />
          )}
          {step === 7 && (
            <Step5 data={data} errors={errors} onChange={setSimpleField} />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={uploadingCount > 0}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingCount > 0 ? "Uploading…" : step === TOTAL_STEPS ? "Complete wizard →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>

    <TemplatePreviewModal
      templateId={previewTemplate?.id ?? null}
      templateName={previewTemplate?.name ?? ""}
      onClose={() => setPreviewTemplate(null)}
    />
    </>
  );
}

