"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enhanceProblemWithAI } from "@/server-actions/actions";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

interface EnhanceWithAIProps {
    slug: string;
    title: string;
}

export function EnhanceWithAI({ slug, title }: EnhanceWithAIProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: () => enhanceProblemWithAI(slug, title),
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
        <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            variant="outline"
            size="sm"
            className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 gap-2 h-9"
        >
            {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {mutation.isPending ? "Enhancing..." : "Enhance with AI"}
            </span>
            <span className="sm:hidden">
                {mutation.isPending ? "..." : "AI"}
            </span>
        </Button>
    );
}
