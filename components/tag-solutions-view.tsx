"use client";

import { useEffect, useState } from "react";
import { DashboardClient } from "@/components/dashboard-client";
import DashboardLoading from "@/app/loading";

interface TagSolutionsViewProps {
    tagSlug: string;
    initialPage?: number;
}

export function TagSolutionsView({ tagSlug, initialPage = 1 }: TagSolutionsViewProps) {
    const [data, setData] = useState<{ solutions: any[]; total: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(initialPage);
    const [status, setStatus] = useState<string>("");
    const limit = 12;

    useEffect(() => {
        async function fetchSolutions() {
            setLoading(true);
            try {
                const res = await fetch(`/api/solutions?tag=${encodeURIComponent(tagSlug)}&page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to fetch solutions:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSolutions();
    }, [tagSlug, page, status]);

    if (loading && !data) {
        return <DashboardLoading />;
    }

    return (
        <DashboardClient
            solutions={data?.solutions || []}
            totalSolutions={data?.total || 0}
            page={page}
            pageSize={limit}
            allowTagRemoval={true}
            tagSlug={tagSlug}
            onPageChange={(p) => setPage(p)}
            statusFilter={status}
            onStatusChange={(s) => { setStatus(s); setPage(1); }}
        />
    );
}
