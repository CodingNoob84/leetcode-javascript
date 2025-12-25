"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Layers, Filter, X, CheckCircle2, BookOpen, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTagFromProblem } from "@/server-actions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LearningAnalytics } from "./learning-analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardProps {
  solutions: Solution[];
  totalSolutions: number;
  page: number;
  pageSize: number;
  customTitle?: string;
  customDescription?: string;
  allowTagRemoval?: boolean;
  tagSlug?: string;
  onPageChange?: (p: number) => void;
  statusFilter?: string;
  onStatusChange?: (s: string) => void;
  analytics?: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
    total: number;
  };
}

export function DashboardClient({
  solutions,
  totalSolutions,
  page,
  pageSize,
  allowTagRemoval,
  tagSlug,
  onPageChange,
  statusFilter,
  onStatusChange,
  analytics,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const removeTagMutation = useMutation({
    mutationFn: ({ problemSlug, tagName }: { problemSlug: string; tagName: string }) =>
      removeTagFromProblem(problemSlug, tagName),
    onSuccess: (res, { tagName }) => {
      if (res.success) {
        toast.success(`Tag "${tagName}" removed`);
        queryClient.invalidateQueries({ queryKey: ["tag-counts"] });
        router.refresh();
      } else {
        toast.error("Failed to remove tag");
      }
    }
  });

  const handleRemoveTag = (
    e: React.MouseEvent,
    problemSlug: string,
    tagName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    removeTagMutation.mutate({ problemSlug, tagName });
  };

  const totalPages = Math.ceil(totalSolutions / pageSize);

  const filteredSolutions = solutions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      <div className="container mx-auto py-5 px-4">
        {analytics && <LearningAnalytics analytics={analytics} />}

        {/* Search & Actions */}
        <div className="mb-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full text-left">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search problems..."
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 transition-colors w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-auto border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 transition-all",
                    statusFilter && "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter || "All Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                <DropdownMenuItem onClick={() => onStatusChange?.("")} className="cursor-pointer">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("Mastered")} className="gap-2 cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mastered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("Learning")} className="gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4 text-blue-500" /> Learning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("To Do")} className="gap-2 cursor-pointer">
                  <Circle className="h-4 w-4 text-zinc-400" /> To Do
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/tags" className="w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full md:w-auto border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-zinc-900"
              >
                <Layers className="mr-2 h-4 w-4" />
                Tags
              </Button>
            </Link>
          </div>
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
                      href={`/solution/${solution.slug}?${new URLSearchParams({
                        ...(tagSlug ? { tag: tagSlug } : {}),
                        ...(statusFilter ? { status: statusFilter } : {})
                      }).toString()}`}
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
                        <div className="flex items-center gap-2">
                          {solution.learningStatus === "Mastered" && <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />}
                          {solution.learningStatus === "Learning" && <BookOpen className="h-4 w-4 text-blue-500/50" />}
                          <Badge
                            variant="outline"
                            className={`shrink-0 
                                                      ${solution.difficulty ===
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
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow relative z-10 pointer-events-none">
                      {solution.categories &&
                        solution.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 pointer-events-auto">
                            {solution.categories.slice(0, 3).map((cat) => (
                              <Badge
                                key={cat.slug}
                                variant="secondary"
                                className="bg-zinc-800 text-zinc-400 text-[10px] hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Link
                                  href={`/tag/${cat.slug}`}
                                  className="hover:text-emerald-400 hover:underline transition-colors"
                                >
                                  {cat.name}
                                </Link>
                                {allowTagRemoval && (
                                  <button
                                    onClick={(e) =>
                                      handleRemoveTag(e, solution.slug, cat.name)
                                    }
                                    className="hover:text-red-400 focus:outline-none ml-1 rounded-full hover:bg-zinc-600 p-0.5 transition-colors"
                                    disabled={removeTagMutation.isPending}
                                  >
                                    <X className="h-2 w-2" />
                                    <span className="sr-only">
                                      Remove {cat.name}
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
                    href={onPageChange ? "#" : `?page=${page - 1}`}
                    onClick={onPageChange ? (e) => { e.preventDefault(); onPageChange(page - 1); } : undefined}
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

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page > 3) p = page - 2 + i;
                  if (p > totalPages) p = totalPages - 4 + i;
                }
                if (p <= 0) return null;

                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={onPageChange ? "#" : `?page=${p}`}
                      onClick={onPageChange ? (e) => { e.preventDefault(); onPageChange(p); } : undefined}
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
                    href={onPageChange ? "#" : `?page=${page + 1}`}
                    onClick={onPageChange ? (e) => { e.preventDefault(); onPageChange(page + 1); } : undefined}
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
