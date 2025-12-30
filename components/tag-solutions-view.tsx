"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardClient } from "@/components/dashboard-client";
import DashboardLoading from "@/app/loading";

interface TagSolutionsViewProps {
    tagSlug: string;
    initialPage?: number;
}

export function TagSolutionsView({ tagSlug, initialPage = 1 }: TagSolutionsViewProps) {
    const [page, setPage] = useState(initialPage);
    const [status, setStatus] = useState<string>("");
    const limit = 12;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["solutions", { tagSlug, page, status }],
        queryFn: async () => {
            const params = new URLSearchParams({
                tag: tagSlug,
                page: page.toString(),
                limit: limit.toString(),
            });
            if (status) params.append("status", status);

            const res = await fetch(`/api/solutions?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch solutions");
            return res.json();
        },
    });

    if (isLoading && !data) {
        return <DashboardLoading />;
    }

    if (isError) {
        return <div className="text-center py-10 text-red-500">Failed to load solutions. Please try again.</div>;
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
