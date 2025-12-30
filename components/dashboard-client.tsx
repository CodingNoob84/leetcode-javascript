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
import { GlobalSearch } from "./global-search";

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

  const filteredSolutions = solutions;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      <div className="container mx-auto py-4 md:py-8 px-4">
        {/* Hero Section - More compact on mobile */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              LeetCode <span className="text-emerald-500">JS</span>
            </h1>
            <p className="text-zinc-500 text-sm md:text-lg font-medium max-w-md leading-snug">
              Master JavaScript through LeetCode solutions, patterns, and AI-powered insights.
            </p>
          </div>
          {analytics && (
            <div className="w-full md:w-auto md:min-w-[400px]">
              <LearningAnalytics analytics={analytics} />
            </div>
          )}
        </div>

        {/* Search & Actions - Optimized for mobile compactness */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center bg-zinc-900/40 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-md sticky top-2 z-30 shadow-2xl">
          <div className="relative flex-1 w-full text-left group">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 md:h-12 flex-1 md:w-auto px-3 md:px-6 border-zinc-800/30 bg-zinc-950/30 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 transition-all rounded-lg md:rounded-xl gap-2 text-[10px] md:text-sm font-bold uppercase tracking-wider",
                    statusFilter && "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="truncate">{statusFilter || "All Status"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 md:w-48 bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl p-1 shadow-2xl">
                <DropdownMenuItem onClick={() => onStatusChange?.("")} className="text-xs md:text-sm rounded-lg cursor-pointer focus:bg-zinc-800 focus:text-emerald-400">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("Mastered")} className="text-xs md:text-sm gap-2 cursor-pointer rounded-lg focus:bg-zinc-800 focus:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mastered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("Learning")} className="text-xs md:text-sm gap-2 cursor-pointer rounded-lg focus:bg-zinc-800 focus:text-emerald-400">
                  <BookOpen className="h-4 w-4 text-blue-500" /> Learning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.("To Do")} className="text-xs md:text-sm gap-2 cursor-pointer rounded-lg focus:bg-zinc-800 focus:text-emerald-400">
                  <Circle className="h-4 w-4 text-zinc-400" /> To Do
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/tags" className="flex-1 md:w-auto">
              <Button
                variant="outline"
                className="h-9 md:h-12 w-full md:w-auto px-3 md:px-6 border-zinc-800/30 bg-zinc-950/30 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 transition-all rounded-lg md:rounded-xl gap-2 text-[10px] md:text-sm font-bold uppercase tracking-wider"
              >
                <Layers className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                  <Card className="glass-card md:hover:scale-[1.02] md:hover:-translate-y-1 group h-full flex flex-col relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300">
                    {/* Main Solution Link */}
                    <Link
                      href={`/solution/${solution.slug}?${new URLSearchParams({
                        ...(tagSlug ? { tag: tagSlug } : {}),
                        ...(statusFilter ? { status: statusFilter } : {})
                      }).toString()}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View solution for ${solution.title}`}
                    />

                    <CardHeader className="relative z-10 pointer-events-none p-3.5 md:p-5 pb-2 md:pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-sm md:text-xl font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors leading-tight">
                          <span className="text-zinc-600 font-mono text-[9px] md:text-sm mr-2 block mb-0.5 md:mb-1">
                            #{solution.id.padStart(4, '0')}
                          </span>
                          {solution.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 pt-0.5 md:pt-1">
                          {solution.learningStatus === "Mastered" && (
                            <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                              <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-500" />
                            </div>
                          )}
                          {solution.learningStatus === "Learning" && (
                            <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                              <BookOpen className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow relative z-10 pointer-events-none p-3.5 md:p-5 pt-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-3 md:mb-4">
                        <Badge
                          variant="outline"
                          className={`px-1.5 md:px-3 py-0 md:py-0.5 text-[8px] md:text-[10px] font-black tracking-wider uppercase border-0
                            ${solution.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : solution.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-500"
                            }`}
                        >
                          {solution.difficulty}
                        </Badge>
                      </div>

                      {solution.categories && solution.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 md:gap-1.5 mt-auto pointer-events-auto">
                          {solution.categories.slice(0, 2).map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/tag/${cat.slug}`}
                              className="text-[9px] md:text-[10px] bg-zinc-900/50 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 px-1.5 md:px-2 py-0.5 rounded-md transition-all border border-white/5 hover:border-emerald-500/30 whitespace-nowrap"
                            >
                              {cat.name}
                            </Link>
                          ))}
                          {solution.categories.length > 2 && (
                            <span className="text-[9px] md:text-[10px] text-zinc-600 px-0.5 self-center">
                              +{solution.categories.length - 2}
                            </span>
                          )}
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
