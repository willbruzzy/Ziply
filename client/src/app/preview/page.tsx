"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type WizardPayload,
  AUTH_TOKEN_KEY,
  WIZARD_STORAGE_KEY,
} from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Components ─────────────────────────────────────────────────────────────────

function PreviewNav() {
  return (
    <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        Ziply
      </Link>
      <span className="text-sm text-gray-500">Site Preview</span>
    </nav>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");

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

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PreviewNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Generating your preview&hellip;</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PreviewNav />
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
      <PreviewNav />

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
            <Link
              href="/payment"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Continue to Payment →
            </Link>
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
            <Link
              href="/payment"
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Continue to Payment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
