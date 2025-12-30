import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit2, X, Filter } from "lucide-react";
import {
  getSolution,
} from "@/lib/solutions";
import { CodeViewer } from "@/components/code-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagManager } from "@/components/tag-manager";
import { SolutionNavButtons } from "@/components/solution-nav-buttons";
import { LearningStatusSelector } from "@/components/learning-status-selector";
import { NavContextManager } from "@/components/nav-context-manager";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { EnhanceWithAI } from "@/components/enhance-with-ai";
import { SolutionContent } from "@/components/solution-content";



import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningStatus } from "@/server-actions/actions";

// We remove generateStaticParams to allow for a more dynamic and responsive feel
// as it was fetching all 2800+ solutions to pre-render every single page.

export default async function SolutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tag?: string; status?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const tagSlug = resolvedSearchParams.tag;

  const solution = await getSolution(slug);

  if (!solution) {
    notFound();
  }

  // Description is now available from the DB
  const description = solution.description || "No description available.";

  // Use the new solution column directly
  const code = solution.solution || solution.content;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      {/* Desktop Header (Hidden on Mobile) */}
      <header className="hidden md:flex glass sticky top-0 z-50">
        <div className="container mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-hidden">
            <Link href={tagSlug ? `/tag/${tagSlug}` : "/"}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-mono text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  #{solution.id.padStart(4, '0')}
                </span>
                <h1 className="text-xl font-bold text-white truncate">
                  {solution.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`
                        px-2 py-0 text-[10px] font-black uppercase tracking-wider border-0
                        ${solution.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : ""}
                        ${solution.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : ""}
                        ${solution.difficulty === "Hard" ? "bg-red-500/10 text-red-500" : ""}
                    `}
                >
                  {solution.difficulty}
                </Badge>
                <div className="h-3 w-px bg-zinc-800 mx-1" />
                <TagManager
                  slug={solution.slug}
                  currentTags={solution.categories}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <SolutionNavButtons
              leetcodeId={parseInt(solution.id)}
              tagSlug={tagSlug}
              status={resolvedSearchParams.status}
            />
          </div>
        </div>
      </header>

      {/* Navigation Context Bar - Hidden on mobile, moved inside mobile layout below */}
      <div className="hidden md:block">
        <NavContextManager
          slug={solution.slug}
          problemTags={solution.categories}
        />
      </div>

      {/* Mobile Header & Layout (Visible only on Mobile) */}
      <div className="md:hidden flex flex-col h-screen overflow-hidden">
        <div className="px-4 py-3 glass sticky top-0 z-50 rounded-b-2xl border-b border-white/10 shadow-lg">
          {/* Row 1: Nav & Mastery Controls (Most compact possible) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link href={tagSlug ? `/tag/${tagSlug}` : "/"}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-zinc-800 bg-zinc-900/50 text-zinc-400 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex flex-col min-w-0 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-mono text-[9px] font-bold bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 uppercase">
                    #{solution.id.padStart(4, '0')}
                  </span>
                  <Badge
                    variant="outline"
                    className={`
                      px-1.5 py-0 text-[8px] font-black uppercase tracking-wider border-0
                      ${solution.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : ""}
                      ${solution.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : ""}
                      ${solution.difficulty === "Hard" ? "bg-red-500/10 text-red-500" : ""}
                    `}
                  >
                    {solution.difficulty}
                  </Badge>
                </div>
                <h1 className="text-xs font-bold text-white leading-tight truncate">
                  {solution.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <SolutionNavButtons
                leetcodeId={parseInt(solution.id)}
                tagSlug={tagSlug}
                status={resolvedSearchParams.status}
                isMobile
              />
            </div>
          </div>

          {/* Row 2: Secondary Controls Row (Very compact) */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <div className="shrink-0 h-8 flex items-center">
              <LearningStatusSelector
                slug={solution.slug}
                initialStatus={solution.learningStatus as LearningStatus}
                size="compact"
              />
            </div>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <EnhanceWithAI slug={solution.slug} title={solution.title} size="compact" />
              <Link href={`/solution/${solution.slug}/edit?${new URLSearchParams({
                ...(tagSlug ? { tag: tagSlug } : {}),
                ...(resolvedSearchParams.status ? { status: resolvedSearchParams.status } : {})
              }).toString()}`} className="shrink-0">
                <Button
                  variant="outline"
                  className="h-8 px-2.5 rounded-lg border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">Edit</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Context Bar (Redesigned for extreme compactness) */}
        <NavContextManager
          slug={solution.slug}
          problemTags={solution.categories}
        />

        {/* Mobile Content Tabs (Fixed Height area) */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          <Tabs
            defaultValue="description"
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-4 bg-zinc-950/50 backdrop-blur-sm border-b border-white/5 shrink-0">
              <TabsList className="w-full grid grid-cols-2 bg-transparent h-10 p-0">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 text-[11px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="solution"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 text-[11px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Solution
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="description" className="h-full m-0 p-0 outline-none">
                <SolutionContent
                  slug={slug}
                  initialData={solution}
                  mode="description"
                  isMobile
                />
              </TabsContent>

              <TabsContent value="solution" className="h-full m-0 p-0 outline-none">
                <SolutionContent
                  slug={slug}
                  initialData={solution}
                  mode="solution"
                  isMobile
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Desktop Content (Hidden on Mobile) */}
      <main className="hidden md:flex flex-1 container mx-auto p-6 lg:h-[calc(100vh-4.5rem)] lg:overflow-hidden flex-col gap-6">
        {/* Actions Bar (Desktop) */}
        <div className="flex items-center justify-between bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Mastery Progress</span>
              <LearningStatusSelector
                slug={solution.slug}
                initialStatus={solution.learningStatus as LearningStatus}
              />
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Difficulty</span>
              <Badge
                variant="outline"
                className={`
                        w-fit px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl border-white/5
                        ${solution.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : ""}
                        ${solution.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : ""}
                        ${solution.difficulty === "Hard" ? "bg-red-500/10 text-red-500" : ""}
                    `}
              >
                {solution.difficulty}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <EnhanceWithAI slug={solution.slug} title={solution.title} />
            <Link href={`/solution/${solution.slug}/edit?${new URLSearchParams({
              ...(tagSlug ? { tag: tagSlug } : {}),
              ...(resolvedSearchParams.status ? { status: resolvedSearchParams.status } : {})
            }).toString()}`}>
              <Button
                variant="outline"
                className="h-11 px-6 rounded-xl border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span className="font-bold">Edit Solution</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row gap-6 lg:overflow-hidden min-h-0">
          {/* Description Column */}
          <div className="lg:w-[35%] flex flex-col h-full glass-card rounded-3xl overflow-hidden shrink-0 shadow-2xl">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="font-black text-white uppercase tracking-widest text-xs">Problem Description</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <SolutionContent
                slug={slug}
                initialData={solution}
                mode="description"
              />
            </div>
          </div>

          {/* Code Column */}
          <div className="lg:w-[65%] flex flex-col h-full bg-zinc-950/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0">
            <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center px-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                </div>
                <div className="h-4 w-px bg-white/5 mx-1" />
                <span className="text-xs text-zinc-400 font-mono tracking-wide">
                  solution.js
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest"
              >
                JavaScript
              </Badge>
            </div>
            <div className="flex-1 overflow-hidden">
              <SolutionContent
                slug={slug}
                initialData={solution}
                mode="solution"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
