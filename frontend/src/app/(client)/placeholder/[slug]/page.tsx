"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DynamicPlaceholderPage() {
  const params = useParams();
  // slug might be a string or array, safely convert it
  const rawSlug = params?.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : "Page";
  
  // Format slug (e.g., "privacy-policy" -> "Privacy Policy")
  const formattedTitle = rawSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="flex-1 pt-[104px] pb-16 flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{formattedTitle}</h1>
        <h2 className="text-xl font-semibold text-gray-700 tracking-tight">Under Construction</h2>
        <p className="text-gray-600 leading-relaxed">
          The {formattedTitle} page is currently being developed. Please check back later.
        </p>
        <Button asChild className="rounded-xl shadow-sm">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
