import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMS } from "@/constants/mockData";
import ProgramCard from "./_components/ProgramCard";

export default function HostProgramsPage() {
  const programsList = MOCK_PROGRAMS;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Program Management</h1>
          <p className="text-sm text-muted-foreground">List, check validation status, and edit details of your skill classes.</p>
        </div>
        <Link href="/host/programs/create">
          <Button className="rounded-xl h-10 text-xs font-semibold">
            <Plus className="mr-1.5 h-4 w-4" /> Create Workshop
          </Button>
        </Link>
      </div>

      {/* Program grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programsList.map((prog) => (
          <ProgramCard key={prog.id} program={prog} />
        ))}
      </div>

      {/* Empty state */}
      {programsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="bg-muted/50 p-4 rounded-full">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No programs yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create your first workshop to start accepting bookings from learners.
            </p>
          </div>
          <Link href="/host/programs/create">
            <Button className="rounded-xl h-9 text-xs font-semibold">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Your First Workshop
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
