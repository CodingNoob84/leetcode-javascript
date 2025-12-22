import { getAllCategories } from "@/lib/solutions";
import TagsPageContent from "@/components/tags-page-content";

export default async function TagsPage() {
    const categories = await getAllCategories();

    return <TagsPageContent initialCategories={categories} />;
}
