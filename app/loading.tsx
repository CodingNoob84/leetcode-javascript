import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-zinc-950 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
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
