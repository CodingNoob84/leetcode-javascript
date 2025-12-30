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
      <div className="container mx-auto px-4 py-3 md:py-8">
        {/* Mobile Header (Compact) */}
        <div className="flex flex-col gap-3 md:hidden glass p-4 rounded-2xl border-b border-white/5 mb-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/tags"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-sm font-bold text-zinc-100 truncate">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block leading-none mb-0.5">Tag</span>
                <span className="text-emerald-500">{decodedSlug}</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <TagHeaderActions slug={dbSlug} currentName={decodedSlug} isMobile />
            </div>
          </div>

          {analytics && (
            <div className="w-full">
              <LearningAnalytics analytics={analytics} />
            </div>
          )}

          <div className="w-full">
            <BulkAddProblems tagSlug={dbSlug} tagName={decodedSlug} />
          </div>
        </div>

        {/* Desktop Header (Existing) */}
        <div className="hidden md:flex flex-col gap-6 md:flex-row justify-between items-start md:items-center mb-8">
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
