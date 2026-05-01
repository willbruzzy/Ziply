"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowNav from "@/components/FlowNav";
import Spinner from "@/components/Spinner";
import {
  type TemplateInputData,
  type WizardPayload,
  AUTH_TOKEN_KEY,
  WIZARD_STORAGE_KEY,
} from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FieldState {
  key: string;
  label: string;
  original: string;
  current: string;
  multiline: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildFieldStates(
  original: TemplateInputData,
  enhanced: TemplateInputData
): FieldState[] {
  const fields: FieldState[] = [
    {
      key: "tagline",
      label: "Tagline",
      original: original.tagline,
      current: enhanced.tagline,
      multiline: false,
    },
    {
      key: "missionStatement",
      label: "Mission Statement",
      original: original.missionStatement,
      current: enhanced.missionStatement,
      multiline: true,
    },
    {
      key: "aboutText",
      label: "About Us",
      original: original.aboutText,
      current: enhanced.aboutText,
      multiline: true,
    },
    ...original.programs.map((p, i) => ({
      key: `program_${i}_description`,
      label: `Program ${i + 1} — ${p.name}`,
      original: p.description,
      current: enhanced.programs[i]?.description ?? p.description,
      multiline: true,
    })),
  ];

  if (original.volunteerText) {
    fields.push({
      key: "volunteerText",
      label: "Volunteer Section",
      original: original.volunteerText,
      current: enhanced.volunteerText ?? original.volunteerText,
      multiline: true,
    });
  }

  return fields;
}

function applyFieldStates(
  base: TemplateInputData,
  fields: FieldState[]
): TemplateInputData {
  const get = (key: string) => fields.find((f) => f.key === key)?.current ?? "";

  return {
    ...base,
    tagline: get("tagline") || base.tagline,
    missionStatement: get("missionStatement") || base.missionStatement,
    aboutText: get("aboutText") || base.aboutText,
    programs: base.programs.map((p, i) => ({
      ...p,
      description: get(`program_${i}_description`) || p.description,
    })),
    volunteerText: base.volunteerText
      ? get("volunteerText") || base.volunteerText
      : undefined,
  };
}

// ── Components ─────────────────────────────────────────────────────────────────

function FieldCard({
  field,
  onUpdate,
  onRevert,
}: {
  field: FieldState;
  onUpdate: (key: string, value: string) => void;
  onRevert: (key: string) => void;
}) {
  const isChanged = field.current !== field.original;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{field.label}</h3>
        {isChanged && (
          <button
            type="button"
            onClick={() => onRevert(field.key)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↩ Revert to original
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Original */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Your original
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-600 min-h-[80px] whitespace-pre-wrap">
            {field.original}
          </div>
        </div>

        {/* AI Enhanced */}
        <div>
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide mb-2">
            AI enhanced
          </p>
          {field.multiline ? (
            <textarea
              value={field.current}
              onChange={(e) => onUpdate(field.key, e.target.value)}
              rows={Math.max(3, Math.ceil(field.current.length / 60))}
              className="w-full border border-indigo-200 rounded-md p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          ) : (
            <input
              type="text"
              value={field.current}
              onChange={(e) => onUpdate(field.key, e.target.value)}
              className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function EnhancePage() {
  const router = useRouter();
  const [wizardPayload, setWizardPayload] = useState<WizardPayload | null>(
    null
  );
  const [fields, setFields] = useState<FieldState[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);

  const callEnhance = useCallback(
    async (payload: WizardPayload, token: string) => {
      try {
        const res = await fetch(`${API_URL}/api/generate/enhance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Enhance request failed");

        const data = (await res.json()) as {
          enhancedInputData: TemplateInputData;
          fallback: boolean;
        };

        setFallback(data.fallback);
        setFields(buildFieldStates(payload.inputData, data.enhancedInputData));
      } catch {
        setFallback(true);
        setFields(buildFieldStates(payload.inputData, payload.inputData));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) {
      router.push("/wizard");
      return;
    }

    try {
      const payload = JSON.parse(raw) as WizardPayload;
      setWizardPayload(payload);
      void callEnhance(payload, token);
    } catch {
      router.push("/wizard");
    }
  }, [router, callEnhance]);

  const updateField = (key: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, current: value } : f))
    );
  };

  const revertField = (key: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, current: f.original } : f))
    );
  };

  const revertAll = () => {
    setFields((prev) => prev.map((f) => ({ ...f, current: f.original })));
  };

  const handleSaveAndContinue = () => {
    if (!wizardPayload) return;
    const finalInputData = applyFieldStates(wizardPayload.inputData, fields);
    const finalPayload: WizardPayload = { ...wizardPayload, inputData: finalInputData };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(finalPayload));
    router.push("/preview");
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <FlowNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-gray-500">
            AI is polishing your content&hellip;
          </p>
        </div>
      </div>
    );
  }

  const hasAnyChange = fields.some((f) => f.current !== f.original);

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Content Enhancement
            </h1>
            <p className="text-sm text-gray-500">
              Review the AI-polished version of your content. Edit any field
              directly or revert to your original.
            </p>
          </div>

          {/* Fallback banner */}
          {fallback && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
              AI enhancement is temporarily unavailable. Your original content
              is shown below — you can still edit it before continuing.
            </div>
          )}

          {/* Revert all */}
          {!fallback && hasAnyChange && (
            <div className="mb-6">
              <button
                type="button"
                onClick={revertAll}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ↩ Revert all to original
              </button>
            </div>
          )}

          {/* Field cards */}
          <div className="space-y-4 mb-8">
            {fields.map((field) => (
              <FieldCard
                key={field.key}
                field={field}
                onUpdate={updateField}
                onRevert={revertField}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/wizard"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to wizard
            </Link>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Save & Preview →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
