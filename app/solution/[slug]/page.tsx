import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Tag } from "lucide-react";

import { getAllSolutions, getSolution } from "@/lib/solutions";
import { CodeViewer } from "@/components/code-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TagManager } from "@/components/tag-manager";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
    const solutions = await getAllSolutions();
    return solutions.map((solution) => ({
        slug: solution.slug,
    }));
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const solution = await getSolution(slug);
    const allSolutions = await getAllSolutions();

    if (!solution) {
        notFound();
    }

    const currentIndex = allSolutions.findIndex(s => s.id === solution.id);
    const prevSolution = currentIndex > 0 ? allSolutions[currentIndex - 1] : null;
    const nextSolution = currentIndex < allSolutions.length - 1 ? allSolutions[currentIndex + 1] : null;

    // Description is now available from the DB
    const description = solution.description || "No description available.";

    // Code should be the content, but we want to strip the JSDoc comment if present for cleaner display
    let code = solution.content;
    const commentMatch = solution.content.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
        code = solution.content.replace(commentMatch[0], '').trim();
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
            {/* Desktop Header (Hidden on Mobile) */}
            <header className="hidden md:flex border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-lg font-semibold flex items-center gap-2 truncate">
                                <span className="text-emerald-500 font-mono">#{parseInt(solution.id)}</span>
                                <span className="truncate">{solution.title}</span>
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <Badge variant="outline" className={`
                        shrink-0
                        ${solution.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-400' : ''}
                        ${solution.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-400' : ''}
                        ${solution.difficulty === 'Hard' ? 'border-red-500/20 text-red-400' : ''}
                    `}>
                                    {solution.difficulty}
                                </Badge>
                                <TagManager slug={solution.slug} currentTags={solution.categories} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {prevSolution ? (
                            <Link href={`/solution/${prevSolution.slug}`}>
                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled className="border-zinc-800 text-zinc-600">
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                        )}

                        {nextSolution ? (
                            <Link href={`/solution/${nextSolution.slug}`}>
                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled className="border-zinc-800 text-zinc-600">
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Header & Layout (Visible only on Mobile) */}
            <div className="md:hidden flex flex-col min-h-screen">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
                    {/* Row 1: Nav Buttons */}
                    <div className="flex items-center justify-between mb-3">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="-ml-2 text-zinc-400 hover:text-white">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-1">
                            {prevSolution ? (
                                <Link href={`/solution/${prevSolution.slug}`}>
                                    <Button variant="outline" size="icon" className="h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="icon" disabled className="h-8 w-8 border-zinc-900 bg-zinc-900/50 text-zinc-700">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            )}
                            {nextSolution ? (
                                <Link href={`/solution/${nextSolution.slug}`}>
                                    <Button variant="outline" size="icon" className="h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" size="icon" disabled className="h-8 w-8 border-zinc-900 bg-zinc-900/50 text-zinc-700">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Title */}
                    <h1 className="text-xl font-bold text-zinc-100 mb-2 leading-tight">
                        <span className="text-emerald-500 font-mono mr-2">#{parseInt(solution.id)}</span>
                        {solution.title}
                    </h1>

                    {/* Row 3: Tags & Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`
                        ${solution.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-400' : ''}
                        ${solution.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-400' : ''}
                        ${solution.difficulty === 'Hard' ? 'border-red-500/20 text-red-400' : ''}
                    `}>
                            {solution.difficulty}
                        </Badge>
                        <TagManager slug={solution.slug} currentTags={solution.categories} />
                    </div>
                </div>

                {/* Mobile Content: Tabs */}
                <div className="flex-1 bg-zinc-950">
                    <Tabs defaultValue="description" className="w-full flex flex-col h-full">
                        <div className="px-4 border-b border-zinc-800 sticky top-[133px] z-40 bg-zinc-950">
                            <TabsList className="w-full grid grid-cols-2 bg-transparent h-12 p-0">
                                <TabsTrigger
                                    value="description"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 text-zinc-500"
                                >
                                    Description
                                </TabsTrigger>
                                <TabsTrigger
                                    value="solution"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-500 text-zinc-500"
                                >
                                    Solution
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="description" className="flex-1 p-4 mt-0">
                            <div className="prose prose-invert prose-sm max-w-none pb-20">
                                <pre className="whitespace-pre-wrap font-sans text-zinc-300 text-sm leading-relaxed">
                                    {description}
                                </pre>
                            </div>
                        </TabsContent>

                        <TabsContent value="solution" className="flex-1 p-0 mt-0 h-full min-h-[500px]">
                            <div className="h-full bg-zinc-950">
                                <CodeViewer code={code} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Desktop Content (Hidden on Mobile) */}
            <main className="hidden md:flex flex-1 container mx-auto p-4 md:p-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden flex-col lg:flex-row gap-6">
                {/* Description Column */}
                <div className="lg:w-1/3 flex flex-col h-full bg-zinc-900/30 rounded-lg border border-zinc-800 overflow-hidden shrink-0">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <h2 className="font-semibold text-zinc-200">Problem Description</h2>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-zinc-300 text-sm leading-relaxed">
                                {description}
                            </pre>
                        </div>
                    </ScrollArea>
                </div>

                {/* Code Column */}
                <div className="lg:w-2/3 flex flex-col h-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl shrink-0">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                            </div>
                            <span className="text-xs text-zinc-500 ml-2 font-mono">solution.js</span>
                        </div>
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 font-mono text-xs">JavaScript</Badge>
                    </div>
                    <div className="flex-1 overflow-hidden bg-zinc-950">
                        <CodeViewer code={code} />
                    </div>
                </div>
            </main>
        </div>
    );
}
