"use client";

import { useQuery } from "@tanstack/react-query";
import { getSolution } from "@/server-actions/queries";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { CodeViewer } from "@/components/code-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";

interface SolutionContentProps {
    slug: string;
    initialData: any;
    mode: "description" | "solution";
    isMobile?: boolean;
}

export function SolutionContent({ slug, initialData, mode, isMobile }: SolutionContentProps) {
    const { data: solution } = useQuery({
        queryKey: ["solution", slug],
        queryFn: () => getSolution(slug),
        initialData: initialData,
    });

    if (!solution) return null;

    const description = solution.description || "No description available.";
    const code = solution.solution || solution.content;

    if (isMobile) {
        if (mode === "description") {
            return (
                <div className="prose prose-invert prose-sm max-w-none pb-20">
                    <MarkdownRenderer content={description} />
                </div>
            );
        }
        return (
            <div className="h-full bg-zinc-950">
                <CodeViewer code={code} />
            </div>
        );
    }

    // Desktop modes
    if (mode === "description") {
        return (
            <ScrollArea className="flex-1 p-4">
                <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownRenderer content={description} />
                </div>
            </ScrollArea>
        );
    }

    return (
        <div className="flex-1 overflow-hidden bg-zinc-950">
            <CodeViewer code={code} />
        </div>
    );
}
