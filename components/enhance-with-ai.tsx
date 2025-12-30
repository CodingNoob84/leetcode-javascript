"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, Wand2, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enhanceProblemWithAI } from "@/server-actions/actions";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

interface EnhanceWithAIProps {
    slug: string;
    title: string;
    size?: "default" | "compact";
}

export function EnhanceWithAI({ slug, title, size = "default" }: EnhanceWithAIProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (provider: "gemini" | "zai") => enhanceProblemWithAI(slug, title, provider),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Solution enhanced with AI!");
                queryClient.invalidateQueries({ queryKey: ["solution", slug] });
                router.refresh();
            } else {
                toast.error(`Failed to enhance: ${result.error}`);
            }
        },
        onError: (error: any) => {
            toast.error(`An error occurred: ${error.message || "Unknown error"}`);
        }
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        disabled={mutation.isPending}
                        variant="outline"
                        size="sm"
                        className={cn(
                            "relative overflow-hidden group border-emerald-500/30 bg-zinc-900 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 gap-2 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]",
                            size === "compact" ? "h-8 px-2 text-[10px] uppercase font-bold" : "h-9 px-3 sm:px-4 text-sm font-semibold tracking-tight"
                        )}
                    >
                        {/* Shimmer effect */}
                        {size === "default" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                        )}

                        {mutation.isPending ? (
                            <Loader2 className={cn("animate-spin text-emerald-500", size === "compact" ? "h-3.5 w-3.5" : "h-4 w-4")} />
                        ) : (
                            <Wand2 className={cn("text-emerald-500", size === "compact" ? "h-3.5 w-3.5" : "h-4 w-4")} />
                        )}

                        <span className={cn(size === "default" && "font-semibold tracking-tight")}>
                            {mutation.isPending ? (size === "compact" ? "..." : "Magicking...") : (
                                <>
                                    <span className={cn(size === "compact" ? "inline" : "hidden sm:inline")}>Enhance</span>
                                    {size === "default" && (
                                        <>
                                            <span className="sm:hidden"> AI</span>
                                            <span className="hidden sm:inline"> with AI</span>
                                        </>
                                    )}
                                </>
                            )}
                        </span>

                        {!mutation.isPending && (
                            <ChevronDown className={cn("opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180", size === "compact" ? "h-3 w-3" : "h-3 w-3")} />
                        )}
                    </Button>
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300 shadow-2xl p-1.5"
                sideOffset={8}
            >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-2 py-1.5">
                    Select Intelligence
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800/50 mx-1" />

                <DropdownMenuItem
                    onClick={() => mutation.mutate("gemini")}
                    className="hover:bg-zinc-900/50 cursor-pointer flex flex-col items-start gap-0.5 rounded-md p-2.5 transition-colors focus:bg-emerald-500/10 focus:text-emerald-400 outline-none"
                >
                    <div className="flex items-center gap-2 w-full">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold text-zinc-100">Gemini 2.0 Flash</span>
                        <Badge variant="outline" className="ml-auto text-[8px] h-4 bg-blue-500/5 border-blue-500/20 text-blue-400 font-bold px-1 uppercase">Fast</Badge>
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-relaxed">Google's optimized multimodal model</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => mutation.mutate("zai")}
                    className="hover:bg-zinc-900/50 cursor-pointer flex flex-col items-start gap-0.5 rounded-md p-2.5 mt-1 transition-colors focus:bg-emerald-500/10 focus:text-emerald-400 outline-none"
                >
                    <div className="flex items-center gap-2 w-full">
                        <Zap className="h-4 w-4 text-emerald-400" />
                        <span className="font-semibold text-zinc-100">Z.AI GLM-4.5</span>
                        <Badge variant="outline" className="ml-auto text-[8px] h-4 bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-bold px-1 uppercase">Smart</Badge>
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-relaxed">State-of-the-art coding specialist</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Ensure Badge is available here as it's used in the dropdown
import { Badge } from "@/components/ui/badge";
