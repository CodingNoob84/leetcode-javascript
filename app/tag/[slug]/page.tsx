import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TagHeaderActions } from "@/components/tag-header-actions";
import { BulkAddProblems } from "@/components/bulk-add-problems";
import { TagSolutionsView } from "@/components/tag-solutions-view";
import { getLearningAnalyticsByTag } from "@/lib/solutions";
import { LearningAnalytics } from "@/components/learning-analytics";

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

  const decodedSlug = decodeURIComponent(slug);
  const dbSlug = decodedSlug.toLowerCase().replace(/\s+/g, "-");
  const page = parseInt(resolvedSearchParams.page || "1");

  const analytics = await getLearningAnalyticsByTag(dbSlug);

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="container mx-auto pt-8 px-4 pb-2">
        <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-center mb-8">
          <div className="space-y-4">
            <Link
              href="/tags"
              className="inline-flex items-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tags
            </Link>
            <h1 className="text-4xl font-bold text-zinc-100 italic">
              Tag: <span className="text-emerald-500 not-italic">{decodedSlug}</span>
            </h1>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 w-full xl:w-auto">
            {analytics && (
              <div className="w-full xl:w-auto xl:min-w-[450px]">
                <LearningAnalytics analytics={analytics} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <TagHeaderActions slug={dbSlug} currentName={decodedSlug} />
              <BulkAddProblems tagSlug={dbSlug} tagName={decodedSlug} />
            </div>
          </div>
        </div>
      </div>

      <TagSolutionsView tagSlug={dbSlug} initialPage={page} />
    </main>
  );
}
