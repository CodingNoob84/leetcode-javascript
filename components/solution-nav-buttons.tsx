"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdjacentInfo {
    slug: string;
    title: string;
}

interface AdjacentResponse {
    prev: AdjacentInfo | null;
    next: AdjacentInfo | null;
}

interface SolutionNavButtonsProps {
    leetcodeId: number;
    tagSlug?: string;
    status?: string;
    isMobile?: boolean;
}

export function SolutionNavButtons({ leetcodeId, tagSlug, status, isMobile }: SolutionNavButtonsProps) {
    const [adjacent, setAdjacent] = useState<AdjacentResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdjacent() {
            setLoading(true);
            try {
                const url = `/api/solutions/adjacent?leetcodeId=${leetcodeId}${tagSlug ? `&tagSlug=${encodeURIComponent(tagSlug)}` : ""}${status ? `&status=${status}` : ""}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setAdjacent(data);
                }
            } catch (err) {
                console.error("Failed to fetch adjacent solutions:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchAdjacent();
    }, [leetcodeId, tagSlug]);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${isMobile ? "justify-end flex-1" : ""}`}>
                <Skeleton className={`h-8 ${isMobile ? "w-8" : "w-16"}`} />
                <Skeleton className={`h-8 ${isMobile ? "w-8" : "w-16"}`} />
            </div>
        );
    }

    const prevHref = adjacent?.prev ? `/solution/${adjacent.prev.slug}?${new URLSearchParams({
        ...(tagSlug ? { tag: tagSlug } : {}),
        ...(status ? { status } : {})
    }).toString()}` : null;
    const nextHref = adjacent?.next ? `/solution/${adjacent.next.slug}?${new URLSearchParams({
        ...(tagSlug ? { tag: tagSlug } : {}),
        ...(status ? { status } : {})
    }).toString()}` : null;

    if (isMobile) {
        return (
            <div className="flex items-center gap-1.5">
                {prevHref ? (
                    <Link href={prevHref}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-zinc-800 bg-zinc-900/50 text-zinc-400 rounded-xl hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="h-9 w-9 border-zinc-900/30 bg-zinc-950/30 text-zinc-700 rounded-xl"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                {nextHref ? (
                    <Link href={nextHref}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-zinc-800 bg-zinc-900/50 text-zinc-400 rounded-xl hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="h-9 w-9 border-zinc-900/30 bg-zinc-950/30 text-zinc-700 rounded-xl"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 shrink-0">
            {prevHref ? (
                <Link href={prevHref}>
                    <Button
                        variant="outline"
                        className="h-10 px-4 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl transition-all font-bold gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                </Link>
            ) : (
                <Button
                    variant="outline"
                    disabled
                    className="h-10 px-4 border-zinc-900/30 bg-zinc-950/30 text-zinc-700 rounded-xl font-bold gap-2"
                >
                    <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
            )}

            {nextHref ? (
                <Link href={nextHref}>
                    <Button
                        variant="outline"
                        className="h-10 px-4 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl transition-all font-bold gap-2"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
            ) : (
                <Button
                    variant="outline"
                    disabled
                    className="h-10 px-4 border-zinc-900/30 bg-zinc-950/30 text-zinc-700 rounded-xl font-bold gap-2"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
