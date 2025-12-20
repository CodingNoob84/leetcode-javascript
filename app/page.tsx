
import { getPaginatedSolutions } from "@/lib/solutions";
import { DashboardClient } from "@/components/dashboard-client";

interface SearchParams {
  page?: string;
  limit?: string;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const limit = 12;

  const { solutions, total } = await getPaginatedSolutions(page, limit);

  return (
    <main className="min-h-screen bg-zinc-950">
      <DashboardClient
        solutions={solutions}
        totalSolutions={total}
        page={page}
        pageSize={limit}
      />
    </main>
  );
}
