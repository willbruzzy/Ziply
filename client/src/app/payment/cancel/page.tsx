"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Ziply
        </Link>
        <span className="text-sm text-gray-500">Payment Cancelled</span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            No charges were made. Your preview is still available if you&apos;d
            like to try again.
          </p>
          <Link
            href="/preview"
            className="inline-block bg-indigo-600 text-white px-8 py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition-colors"
          >
            &larr; Back to Preview
          </Link>
        </div>
      </div>
    </div>
  );
}
