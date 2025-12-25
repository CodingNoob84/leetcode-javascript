import { notFound } from "next/navigation";
import { getSolution } from "@/lib/solutions";
import { EditProblemContent } from "@/components/edit-problem-content";

export default async function EditProblemPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ tag?: string; status?: string }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const problem = await getSolution(slug);

    if (!problem) {
        notFound();
    }

    return (
        <EditProblemContent
            problem={problem}
            tag={resolvedSearchParams.tag}
            status={resolvedSearchParams.status}
        />
    );
}
