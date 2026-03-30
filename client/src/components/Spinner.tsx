"use client";

export default function Spinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  }[size];

  return (
    <div
      className={`${sizeClass} rounded-full border-gray-200 border-t-indigo-600 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
