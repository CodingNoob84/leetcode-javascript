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
                <div className="flex justify-between items-end mb-1.5 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Pattern Mastery: <span className="text-zinc-200">{analytics.counts["Mastered"] || 0} / {analytics.total}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                        {Math.round(analytics.percentages["Mastered"] || 0)}%
                    </span>
                </div>

                <div className="h-2 w-full bg-zinc-900 rounded-full flex overflow-hidden ring-1 ring-white/5">
                    {stats.filter(s => s.count > 0).map((stat, idx) => (
                        <motion.div
                            key={`segment-${stat.label}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percent}%` }}
                            transition={{ duration: 0.8, ease: "circOut", delay: idx * 0.1 }}
                            className={`${stat.color} h-full`}
                        />
                    ))}
                </div>

                <div className="flex gap-4 mt-2 px-1">
                    {stats.map(stat => (
                        <div key={`label-${stat.label}`} className="flex items-center gap-1.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full", stat.color)} />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                {stat.count} {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Desktop View: Cards */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${stat.borderColor} ${stat.bgColor} flex flex-col gap-3`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                                <span className="text-sm font-medium text-zinc-300">{stat.label}</span>
                            </div>
                            <span className="text-2xl font-bold text-zinc-100">{stat.count}</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                <span>Progress</span>
                                <span>{Math.round(stat.percent)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.percent}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                                    className={`h-full ${stat.color} rounded-full`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
