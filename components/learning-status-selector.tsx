"use client";

import { useState } from "react";
import { Check, ChevronDown, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLearningStatus, LearningStatus } from "@/server-actions/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LearningStatusSelectorProps {
    slug: string;
    initialStatus: LearningStatus;
    size?: "default" | "compact";
}

const statusConfig = {
    "Mastered": {
        label: "Mastered",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
    },
    "Learning": {
        label: "Learning",
        icon: BookOpen,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
    },
    "To Do": {
        label: "To Do",
        icon: Circle,
        color: "text-zinc-400",
        bgColor: "bg-zinc-400/10",
        borderColor: "border-zinc-400/20",
    },
};

export function LearningStatusSelector({ slug, initialStatus, size = "default" }: LearningStatusSelectorProps) {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<LearningStatus>(initialStatus);

    const mutation = useMutation({
        mutationFn: ({ newStatus }: { newStatus: LearningStatus }) =>
            updateLearningStatus(slug, newStatus),
        onMutate: async ({ newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ["solution", slug] });
            const previousStatus = status;
            setStatus(newStatus);
            return { previousStatus };
        },
        onError: (err, variables, context) => {
            if (context?.previousStatus) {
                setStatus(context.previousStatus);
            }
            toast.error("Failed to update status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["solution", slug] });
            queryClient.invalidateQueries({ queryKey: ["learning-analytics"] });
        },
        onSuccess: () => {
            toast.success("Status updated!");
        }
    });

    const handleStatusChange = (newStatus: LearningStatus) => {
        if (newStatus === status) return;
        mutation.mutate({ newStatus });
    };

    const current = statusConfig[status as keyof typeof statusConfig];
    const Icon = current.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 transition-all",
                        size === "compact" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
                        current.bgColor,
                        current.borderColor
                    )}
                    disabled={mutation.isPending}
                >
                    <Icon className={cn(size === "compact" ? "h-3.5 w-3.5" : "h-4 w-4", current.color)} />
                    <span className={cn("font-medium", current.color, size === "compact" && "text-[11px]")}>{current.label}</span>
                    <ChevronDown className={cn("opacity-50 ml-0.5", size === "compact" ? "h-3 w-3" : "h-4 w-4")} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                {(Object.entries(statusConfig) as [LearningStatus, typeof statusConfig["Mastered"]][]).map(([key, config]) => {
                    const ItemIcon = config.icon;
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => handleStatusChange(key)}
                            className="gap-2 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                        >
                            <ItemIcon className={cn("h-4 w-4", config.color)} />
                            <span className="flex-1">{config.label}</span>
                            {status === key && <Check className="h-4 w-4 text-emerald-500" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
