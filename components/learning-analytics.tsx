"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningAnalyticsProps {
    analytics: {
        counts: Record<string, number>;
        percentages: Record<string, number>;
        total: number;
    };
}

export function LearningAnalytics({ analytics }: LearningAnalyticsProps) {
    if (analytics.total === 0) return null;

    const stats = [
        {
            label: "Mastered",
            count: analytics.counts["Mastered"] || 0,
            percent: analytics.percentages["Mastered"] || 0,
            icon: CheckCircle2,
            color: "bg-emerald-500",
            textColor: "text-emerald-500",
            borderColor: "border-emerald-500/20",
            bgColor: "bg-emerald-500/5",
        },
        {
            label: "Learning",
            count: analytics.counts["Learning"] || 0,
            percent: analytics.percentages["Learning"] || 0,
            icon: BookOpen,
            color: "bg-blue-500",
            textColor: "text-blue-500",
            borderColor: "border-blue-500/20",
            bgColor: "bg-blue-500/5",
        },
        {
            label: "To Do",
            count: analytics.counts["To Do"] || 0,
            percent: analytics.percentages["To Do"] || 0,
            icon: Circle,
            color: "bg-zinc-400",
            textColor: "text-zinc-400",
            borderColor: "border-zinc-400/20",
            bgColor: "bg-zinc-400/5",
        },
    ];

    return (
        <div className="mb-4">
            {/* Compact Mobile View: Segmented Progress Bar */}
            <div className="block md:hidden">
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        Mastery <span className="text-zinc-200 ml-1">{analytics.counts["Mastered"] || 0} / {analytics.total}</span>
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                        {Math.round(analytics.percentages["Mastered"] || 0)}%
                    </span>
                </div>

                <div className="h-2.5 w-full bg-zinc-900/50 rounded-full flex overflow-hidden border border-white/5 p-0.5">
                    {stats.filter(s => s.count > 0).map((stat, idx) => (
                        <motion.div
                            key={`segment-${stat.label}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percent}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 }}
                            className={`${stat.color} h-full first:rounded-l-full last:rounded-r-full`}
                        />
                    ))}
                </div>

                <div className="flex justify-between items-center mt-3 px-1">
                    {stats.map(stat => (
                        <div key={`label-${stat.label}`} className="flex flex-col items-center gap-1">
                            <span className={cn("text-xs font-black", stat.textColor)}>
                                {stat.count}
                            </span>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Desktop View: Cards */}
            <div className="hidden md:grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-2xl glass-card flex flex-col gap-3 min-w-0 group`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={cn("p-2 rounded-xl", stat.bgColor, "ring-1", stat.borderColor)}>
                                    <stat.icon className={`h-4 w-4 shrink-0 ${stat.textColor}`} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] block leading-none mb-1">{stat.label}</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-white leading-none">{stat.count}</span>
                                        <span className="text-[10px] font-bold text-zinc-600">/ {analytics.total}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={cn("text-xs font-black px-2 py-1 rounded-lg", stat.bgColor, stat.textColor)}>
                                {Math.round(stat.percent)}%
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-zinc-950/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.percent}%` }}
                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 + 0.3 }}
                                className={`h-full ${stat.color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
