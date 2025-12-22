import { Skeleton } from "@/components/ui/skeleton";

export default function SolutionLoading() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
            {/* Desktop Header Skeleton */}
            <header className="hidden md:flex border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="flex-1 container mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 h-[600px] bg-zinc-900/30 rounded-lg border border-zinc-800 p-4 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="lg:w-2/3 h-[600px] bg-zinc-950 rounded-lg border border-zinc-800 p-4 flex flex-col">
                    <div className="flex justify-between mb-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="flex-1 w-full rounded-md" />
                </div>
            </main>
        </div>
    );
}
