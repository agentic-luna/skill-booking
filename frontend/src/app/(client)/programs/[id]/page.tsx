import ProgramDetailsContent from "./ProgramDetailsContent";
import Footer from "@/components/common/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <ProgramDetailsContent programId={id} />
      <Footer />
    </div>
  );
}
