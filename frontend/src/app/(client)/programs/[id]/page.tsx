import { MOCK_PROGRAMS } from "@/constants/mockData";
import ProgramDetailsContent from "./ProgramDetailsContent";
import Footer from "@/components/common/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const program = MOCK_PROGRAMS.find((p) => p.id === id);

  return (
    <div className="flex flex-col min-h-screen">
      <ProgramDetailsContent programId={id} initialProgram={program} />
      <Footer />
    </div>
  );
}
