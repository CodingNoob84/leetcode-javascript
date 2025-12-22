import { notFound } from "next/navigation";
import { getSolution } from "@/lib/solutions";
import { EditProblemContent } from "@/components/edit-problem-content";

export default async function EditProblemPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const problem = await getSolution(slug);

    if (!problem) {
        notFound();
    }

    return <EditProblemContent problem={problem} />;
}
