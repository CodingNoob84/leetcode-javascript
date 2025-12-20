
import { getAllSolutions } from "@/lib/solutions";
import TagsPageContent from "@/components/tags-page-content";
import { getAllTags } from "@/app/actions";

export default async function TagsPage() {
    // We want ALL tags, including unused ones?
    // getAllSolutions only returns used categories.
    // getAllTags returns all available from DB.

    // Let's mix both. Solutions count is easier from getAllSolutions (for now, or DB aggregation)

    const solutions = await getAllSolutions();
    const allTags = await getAllTags();

    // Aggregate categories and counts from current solutions
    const categoryCounts: Record<string, number> = {};

    // Initialize with all DB tags (count 0)
    allTags.forEach(t => {
        categoryCounts[t.name] = 0;
    });

    solutions.forEach(s => {
        s.categories.forEach(cat => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
    });

    return <TagsPageContent categories={categoryCounts} />;
}
