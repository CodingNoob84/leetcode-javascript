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
            <div className="flex items-center gap-1">
                {prevHref ? (
                    <Link href={prevHref}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="h-8 w-8 border-zinc-900 bg-zinc-900/50 text-zinc-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                {nextHref ? (
                    <Link href={nextHref}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-zinc-800 bg-zinc-900 text-zinc-400"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        className="h-8 w-8 border-zinc-900 bg-zinc-900/50 text-zinc-700"
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
                        size="sm"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                </Link>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-zinc-800 text-zinc-600"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
            )}

            {nextHref ? (
                <Link href={nextHref}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-zinc-800 text-zinc-600"
                >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            )}
        </div>
    );
}
