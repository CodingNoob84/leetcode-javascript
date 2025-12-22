import { Skeleton } from "@/components/ui/skeleton";

export default function TagLoading() {
    return (
        <main className="min-h-screen bg-zinc-950">
            <div className="container mx-auto pt-4 px-4 pb-2">
                <div className="flex flex-col gap-4 md:flex-row justify-between items-center mb-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
