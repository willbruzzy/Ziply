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

function DeploymentGuide() {
  const [showGitHub, setShowGitHub] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-1">How to Deploy Your Site</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your ZIP contains two files: <code className="bg-gray-100 px-1 rounded">index.html</code> and{" "}
        <code className="bg-gray-100 px-1 rounded">styles.css</code>. Images are already embedded — no
        separate folder needed. Unzip it first, then pick an option below.
      </p>

      {/* Netlify */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Option 1: Netlify{" "}
          <span className="text-xs font-normal text-indigo-600 ml-1">Easiest — drag and drop</span>
        </h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://app.netlify.com/drop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              app.netlify.com/drop
            </a>
            .
          </li>
          <li>Drag your unzipped folder (or both files) onto the page.</li>
          <li>Netlify gives you a live URL instantly — click it to see your site.</li>
          <li>
            Click <strong>Claim your site</strong> and create a free account to make it permanent
            (otherwise it expires in 24 hours).
          </li>
          <li>
            Optional: rename your URL under <strong>Site configuration → Change site name</strong>, or
            connect your own domain under <strong>Domain management</strong>.
          </li>
        </ol>
      </div>

      {/* GitHub Pages toggle */}
      <button
        type="button"
        onClick={() => setShowGitHub((v) => !v)}
        className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-4 flex items-center gap-1"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showGitHub ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {showGitHub ? "Hide" : "Show"} GitHub Pages option
      </button>

      {showGitHub && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Option 2: GitHub Pages</h3>
          <p className="text-xs text-gray-500 mb-3">
            You&rsquo;ll need a free{" "}
            <a
              href="https://github.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              GitHub account
            </a>
            .
          </p>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>
              Create a new <strong>public</strong> repository (click <strong>+</strong> → New repository).
              Check <strong>Add a README file</strong> so it isn&rsquo;t empty.
            </li>
            <li>
              Upload your files via <strong>Add file → Upload files</strong>, then commit.
            </li>
            <li>
              Go to <strong>Settings → Pages</strong>, set Source to <strong>Deploy from a branch</strong>,
              pick <code className="bg-gray-100 px-1 rounded">main</code> /{" "}
              <code className="bg-gray-100 px-1 rounded">root</code>, and save.
            </li>
            <li>Wait 1–2 minutes — GitHub will show a green banner with your live URL.</li>
            <li>
              Optional: add your own domain under <strong>Settings → Pages → Custom domain</strong> and
              follow the DNS instructions.
            </li>
          </ol>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6">
        Need help? Reach out through your Ziply dashboard and we&rsquo;ll get you sorted.
      </p>
    </div>
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
          <>
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
          <DeploymentGuide />
          <Link
            href="/deploy"
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View full deployment guide &rarr;
          </Link>
        </>
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
