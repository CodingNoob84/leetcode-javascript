import { Skeleton } from "@/components/ui/skeleton";
import { Tag, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TagsLoading() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center text-zinc-400 mb-4 opacity-50">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
                            <Tag className="h-8 w-8 text-emerald-500/50" />
                            All Tags
                        </h1>
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-4">
                            <Skeleton className="h-5 w-3/4" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
