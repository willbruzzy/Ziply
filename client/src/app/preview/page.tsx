"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowNav from "@/components/FlowNav";
import Spinner from "@/components/Spinner";
import {
  type WizardPayload,
  AUTH_TOKEN_KEY,
  WIZARD_STORAGE_KEY,
  GENERATION_ID_KEY,
} from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Components ─────────────────────────────────────────────────────────────────

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [generatingZip, setGeneratingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const fetchPreview = useCallback(
    async (payload: WizardPayload, token: string) => {
      try {
        const res = await fetch(`${API_URL}/api/generate/preview`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Preview generation failed");
        }

        const data = (await res.json()) as { html: string };
        setHtml(data.html);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Preview generation failed");
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
      setOrgName(payload.inputData.orgName);
      void fetchPreview(payload, token);
    } catch {
      router.push("/wizard");
    }
  }, [router, fetchPreview]);

  const handleContinueToPayment = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!token || !raw) return;

    setGeneratingZip(true);
    setZipError(null);

    try {
      const payload = JSON.parse(raw) as WizardPayload;
      const res = await fetch(`${API_URL}/api/generate/zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "ZIP generation failed");
      }

      const data = (await res.json()) as { generationId: string };
      localStorage.setItem(GENERATION_ID_KEY, data.generationId);
      router.push("/payment");
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "ZIP generation failed");
      setGeneratingZip(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <FlowNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-gray-500">Generating your preview&hellip;</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <FlowNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <p className="text-sm font-medium text-red-600 mb-2">
              Preview failed
            </p>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link
              href="/enhance"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ← Back to enhancement
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-6xl">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Preview — {orgName}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                This is a read-only preview. Your ZIP download is available
                after payment.
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinueToPayment}
              disabled={generatingZip}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generatingZip ? "Preparing…" : "Continue to Payment →"}
            </button>
          </div>

          {/* Preview banner */}
          <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2.5 text-xs text-indigo-600 flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview only — links and buttons are disabled
          </div>

          {/* iframe */}
          <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              srcDoc={html ?? ""}
              sandbox=""
              className="w-full"
              style={{ height: "80vh" }}
              title={`Preview of ${orgName}`}
            />
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-between mt-6">
            <Link
              href="/enhance"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to enhancement
            </Link>
            <div className="flex flex-col items-end gap-2">
              {zipError && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-red-600">{zipError}</p>
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={generatingZip}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generatingZip ? "Preparing…" : "Continue to Payment →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
