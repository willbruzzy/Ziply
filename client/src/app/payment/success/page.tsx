"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FlowNav from "@/components/FlowNav";
import Spinner from "@/components/Spinner";
import { AUTH_TOKEN_KEY, GENERATION_ID_KEY } from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "confirmed" | "pending" | "error">("loading");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setError("Missing session information");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/stripe/session-status/${encodeURIComponent(sessionId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to verify payment");
        }

        const data = (await res.json()) as {
          status: string;
          generationId?: string;
        };

        if (data.generationId) {
          setGenerationId(data.generationId);
        }

        if (data.status === "paid") {
          setStatus("confirmed");
        } else {
          setStatus("pending");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to verify payment");
        setStatus("error");
      }
    };

    void checkStatus();
  }, [router, searchParams]);

  const handleDownload = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const gid = generationId || localStorage.getItem(GENERATION_ID_KEY);
    if (!token || !gid) return;

    setDownloading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/generate/download/${encodeURIComponent(gid)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Download failed");
      }

      // Stream file as download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ziply-website.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        {status === "loading" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="flex justify-center mb-4"><Spinner /></div>
            <p className="text-sm text-gray-500">Verifying your payment&hellip;</p>
          </div>
        )}

        {status === "confirmed" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Payment Confirmed
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your website is ready to download.
            </p>
            {error && (
              <p className="text-xs text-red-600 mb-4">{error}</p>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? "Downloading\u2026" : "Download ZIP"}
            </button>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Payment Processing
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your payment is being processed. Please check back shortly.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Refresh status
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <p className="text-sm font-medium text-red-600 mb-2">
              Verification failed
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {error ?? "An unexpected error occurred"}
            </p>
            <Link
              href="/preview"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              &larr; Back to preview
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
