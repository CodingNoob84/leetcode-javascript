import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllSolutions, getPaginatedSolutionsByTag } from "@/lib/solutions";

import { DashboardClient } from "@/components/dashboard-client";
import { TagHeaderActions } from "@/components/tag-header-actions";

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const solutions = await getAllSolutions();
  const categories = new Set(solutions.flatMap((s) => s.categories));
  return Array.from(categories).map((category) => ({
    slug: category,
  }));
}

interface SearchParams {
  page?: string;
  limit?: string;
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Handle encoded slugs (e.g. "Dynamic%20Programming" -> "Dynamic Programming")
  const decodedSlug = decodeURIComponent(slug);

  // DB stores slugs often lowercased/hyphenated in `categories` table usually,
  // but here we are receiving the display name or slug?
  // In `actions.ts` we used `tagName.toLowerCase().replace(/\s+/g, '-')` as slug.
  // In `generateStaticParams` we return plain category names which might have spaces.
  // The `getPaginatedSolutionsByTag` expects a slug (or we matched it against slug in DB).
  // Let's ensure consistent slug usage.
  // If the URL is /tag/Dynamic%20Programming, decoded is "Dynamic Programming".
  // DB slug is "dynamic-programming".

  const dbSlug = decodedSlug.toLowerCase().replace(/\s+/g, "-");
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 12;

  const { solutions, total } = await getPaginatedSolutionsByTag(
    dbSlug,
    page,
    limit
  );

  if (total === 0 && page === 1) {
    // If no solutions found, it might be an invalid tag or just empty.
    // Check if it exists? getPaginatedSolutionsByTag returns empty if cat not found.
    // But `generateStaticParams` uses names.
    // If I navigated from /tags link, it uses `/tag/${category}`.
    // Let's rely on `getPaginatedSolutionsByTag` returning correct list.
    // If total is 0, arguably 404 is correct if tag doesn't exist, or just empty list.
    // Let's show empty list.
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="container mx-auto pt-4 px-4 pb-2">
        <div className="flex flex-col gap-4 md:flex-row justify-between items-center mb-4">
          <Link
            href="/tags"
            className="inline-flex items-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tags
          </Link>
          <TagHeaderActions slug={dbSlug} currentName={decodedSlug} />
        </div>
      </div>
      <DashboardClient
        solutions={solutions}
        totalSolutions={total}
        page={page}
        pageSize={limit}
        customTitle={`Tag: ${decodedSlug}`}
        customDescription={`Browse ${total} problems tagged with "${decodedSlug}".`}
        allowTagRemoval={true}
      />
    </main>
  );
}
