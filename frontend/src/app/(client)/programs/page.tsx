import { Suspense } from "react";
import ProgramsListContent from "./ProgramsListContent";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Skeleton } from "@/components/common/SkeletonLoader";

export default function ProgramsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-96 bg-muted animate-pulse rounded-xl" />
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      }>
        <ProgramsListContent />
      </Suspense>
      <Footer />
    </div>
  );
}
