"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, WIZARD_STORAGE_KEY, GENERATION_ID_KEY } from "@/types/template";

const FLOW_STEPS = [
  { label: "Template", path: "/wizard" },
  { label: "Enhance", path: "/enhance" },
  { label: "Preview", path: "/preview" },
  { label: "Payment", path: "/payment" },
] as const;

export default function FlowNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = FLOW_STEPS.findIndex(
    (s) => pathname === s.path || pathname.startsWith(s.path + "/")
  );

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(WIZARD_STORAGE_KEY);
    localStorage.removeItem(GENERATION_ID_KEY);
    router.push("/");
  };

  return (
    <nav className="border-b border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        Ziply
      </Link>

      <ol className="hidden sm:flex items-center gap-1 text-xs font-medium">
        {FLOW_STEPS.map((step, i) => {
          const isCurrent = i === currentIndex;
          const isPast = currentIndex > i;

          return (
            <li key={step.path} className="flex items-center">
              {i > 0 && (
                <span className="mx-2 text-gray-300" aria-hidden="true">
                  /
                </span>
              )}
              <span
                className={
                  isCurrent
                    ? "text-indigo-600"
                    : isPast
                    ? "text-gray-500"
                    : "text-gray-300"
                }
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Log out
      </button>
    </nav>
  );
}
