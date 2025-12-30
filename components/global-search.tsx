"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProblems } from "@/server-actions/queries";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const { data: results, isLoading } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: () => searchProblems(debouncedQuery),
        enabled: debouncedQuery.length > 0,
    });

    const handleSelect = (slug: string) => {
        setIsOpen(false);
        setQuery("");
        router.push(`/solution/${slug}`);
    };

    return (
        <div className="relative w-full">
            <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors z-10" />
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search 100+ problems..."
                    className="pl-11 h-9 md:h-12 bg-zinc-950/30 border-zinc-800/30 focus:border-emerald-500/30 focus:ring-emerald-500/10 transition-all w-full rounded-lg md:rounded-xl text-xs md:text-sm text-zinc-200 outline-none"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 animate-spin" />
                )}
            </div>

            <AnimatePresence>
                {isOpen && debouncedQuery.length > 0 && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 border border-white/5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 backdrop-blur-xl"
                        >
                            <div className="max-h-[440px] overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                                {results && results.length > 0 ? (
                                    results.map((solution) => (
                                        <button
                                            key={solution.id}
                                            onClick={() => handleSelect(solution.slug)}
                                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-zinc-200 font-semibold text-sm md:text-base group-hover:text-emerald-400 transition-colors">
                                                    {solution.title}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                                                    #{solution.id.padStart(4, '0')}
                                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    {solution.slug}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "px-2 py-0.5 text-[9px] font-black tracking-wider uppercase border-0",
                                                    solution.difficulty === "Easy"
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : solution.difficulty === "Medium"
                                                            ? "bg-amber-500/10 text-amber-400"
                                                            : "bg-red-500/10 text-red-500"
                                                )}
                                            >
                                                {solution.difficulty}
                                            </Badge>
                                        </button>
                                    ))
                                ) : !isLoading ? (
                                    <div className="px-4 py-12 text-center">
                                        <p className="text-zinc-500 text-sm font-medium">No results found for "{debouncedQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="px-4 py-12 text-center space-y-3">
                                        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto" />
                                        <p className="text-zinc-500 text-xs">Searching database...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
