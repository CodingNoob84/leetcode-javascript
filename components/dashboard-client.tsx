"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code2, Layers, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Solution } from "@/lib/solutions";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface DashboardProps {
  solutions: Solution[];
  totalSolutions: number;
  page: number;
  pageSize: number;
  customTitle?: string;
  customDescription?: string;
  allowTagRemoval?: boolean;
  tagSlug?: string; // Add tagSlug prop for tag-specific navigation
}

import { X } from "lucide-react";
import { removeTagFromProblem } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function DashboardClient({
  solutions,
  totalSolutions,
  page,
  pageSize,
  customTitle,
  customDescription,
  allowTagRemoval,
  tagSlug,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleRemoveTag = async (
    e: React.MouseEvent,
    problemSlug: string,
    tagName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await removeTagFromProblem(problemSlug, tagName);
      if (res.success) {
        toast.success(`Tag "${tagName}" removed`);
        router.refresh(); // Or better optimistic update, but filter might change list
      } else {
        toast.error("Failed to remove tag");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalSolutions / pageSize);

  // Client-side search within current page (temporary, ideal is server-side)
  const filteredSolutions = solutions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            {customTitle || "LeetCode JavaScript"}
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            {customDescription || (
              <>
                Explore {totalSolutions} optimized solutions. Master the art of
                algorithms with clean code.
              </>
            )}
          </p>
        </motion.div>

        {/* Search & Actions */}
        <div className="mb-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full text-left">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search problems..."
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 transition-colors w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/tags" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <Layers className="mr-2 h-4 w-4" />
              Browse Tags
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSolutions.map((solution, idx) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="h-full">
                  <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all group h-full flex flex-col relative">
                    {/* Main Solution Link */}
                    <Link
                      href={`/solution/${solution.slug}${
                        tagSlug ? `?tag=${encodeURIComponent(tagSlug)}` : ""
                      }`}
                      className="absolute inset-0 z-0"
                      aria-label={`View solution for ${solution.title}`}
                    />

                    <CardHeader className="relative z-10 pointer-events-none">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                          <span className="text-emerald-500/50 mr-2">
                            #{parseInt(solution.id)}
                          </span>
                          {solution.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`shrink-0 
                                                    ${
                                                      solution.difficulty ===
                                                      "Easy"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : solution.difficulty ===
                                                          "Medium"
                                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                                                    }`}
                        >
                          {solution.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow relative z-10 pointer-events-none">
                      {/* Categories (if available) - currently solutions might need manual join for categories in list view if desired */}
                      {solution.categories &&
                        solution.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 pointer-events-auto">
                            {solution.categories.slice(0, 3).map((cat) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="bg-zinc-800 text-zinc-400 text-[10px] hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Link
                                  href={`/tag/${cat
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                  className="hover:text-emerald-400 hover:underline transition-colors"
                                >
                                  {cat}
                                </Link>
                                {allowTagRemoval && (
                                  <button
                                    onClick={(e) =>
                                      handleRemoveTag(e, solution.slug, cat)
                                    }
                                    className="hover:text-red-400 focus:outline-none ml-1 rounded-full hover:bg-zinc-600 p-0.5 transition-colors"
                                  >
                                    <X className="h-2 w-2" />
                                    <span className="sr-only">
                                      Remove {cat}
                                    </span>
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              {page > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    href={`?page=${page - 1}`}
                    className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  />
                </PaginationItem>
              ) : (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="pointer-events-none opacity-50 bg-zinc-900 border-zinc-800 text-zinc-400"
                  />
                </PaginationItem>
              )}

              {/* Simplified pagination: First, Prev (if gap), Current, Next (if gap), Last */}
              {/* Uses window.location or href replacement, but better to use simple logic for now */}
              {/* NOTE: We need to preserve filtered params if any, or just use `?page=` */}
              {/* Since this is reused in TagPage, the Base URL changes. */}
              {/* We should probably accept a baseURL prop, or use standard anchor tags with current pathname + query */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to center the window
                let p = i + 1;
                if (totalPages > 5) {
                  if (page > 3) p = page - 2 + i;
                  if (p > totalPages) p = totalPages - 4 + i;
                }
                if (p <= 0) return null; // should not happen with above logic but safe guard

                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={`?page=${p}`}
                      isActive={page === p}
                      className={
                        page === p
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      }
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page < totalPages ? (
                <PaginationItem>
                  <PaginationNext
                    href={`?page=${page + 1}`}
                    className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  />
                </PaginationItem>
              ) : (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className="pointer-events-none opacity-50 bg-zinc-900 border-zinc-800 text-zinc-400"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
