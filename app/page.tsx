import { getPaginatedSolutions, getLearningAnalytics } from "@/lib/solutions";
import { DashboardClient } from "@/components/dashboard-client";

interface SearchParams {
  page?: string;
  limit?: string;
  status?: string;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const status = resolvedParams.status || undefined;
  const limit = 12;

  const [{ solutions, total }, analytics] = await Promise.all([
    getPaginatedSolutions(page, limit, status),
    getLearningAnalytics()
  ]);

  return (
    <main className="min-h-screen bg-zinc-950">
      <DashboardClient
        solutions={solutions}
        totalSolutions={total}
        page={page}
        pageSize={limit}
        statusFilter={status}
        analytics={analytics}
      />
    </main>
  );
}
