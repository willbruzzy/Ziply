"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowNav from "@/components/FlowNav";
import Spinner from "@/components/Spinner";
import { AUTH_TOKEN_KEY, GENERATION_ID_KEY } from "@/types/template";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      router.push("/login");
      return;
    }

    const generationId = localStorage.getItem(GENERATION_ID_KEY);
    if (!generationId) {
      router.push("/wizard");
      return;
    }

    // Create Stripe Checkout session and redirect
    const createSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stripe/create-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ generationId }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to start checkout");
        }

        const data = (await res.json()) as { sessionUrl: string };
        window.location.href = data.sessionUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start checkout");
        setLoading(false);
      }
    };

    void createSession();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <FlowNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <p className="text-sm font-medium text-red-600 mb-2">
              Payment setup failed
            </p>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link
              href="/preview"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              &larr; Back to preview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FlowNav />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {loading && (
          <>
            <Spinner />
            <p className="text-sm text-gray-500">
              Redirecting to secure checkout&hellip;
            </p>
          </>
        )}
      </div>
    </div>
  );
}
