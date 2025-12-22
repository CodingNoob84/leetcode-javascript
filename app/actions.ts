'use server'

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addTagToProblem(slug: string, tagName: string) {
    try {
        const problem = await db.query.problems.findFirst({
            where: eq(schema.problems.slug, slug)
        });

        if (!problem) throw new Error("Problem not found");

        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');

        // Find or create category/tag
        let [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tagSlug));

        if (!category) {
            [category] = await db.insert(schema.categories).values({
                name: tagName,
                slug: tagSlug,
            }).returning();
        }

        // Link
        const existingLink = await db.query.problemCategories.findFirst({
            where: (pc, { and, eq }) => and(
                eq(pc.problemId, problem.id),
                eq(pc.categoryId, category.id)
            )
        });

        if (!existingLink) {
            await db.insert(schema.problemCategories).values({
                problemId: problem.id,
                categoryId: category.id,
            });
        }

        revalidatePath(`/solution/${slug}`);
        revalidatePath(`/tag/${tagSlug}`);
        revalidatePath(`/tags`);
        revalidatePath(`/`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add tag:", error);
        return { success: false, error: "Failed to add tag" };
    }
}

export async function removeTagFromProblem(slug: string, tagName: string) {
    try {
        const problem = await db.query.problems.findFirst({
            where: eq(schema.problems.slug, slug)
        });
        if (!problem) throw new Error("Problem not found");

        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        const category = await db.query.categories.findFirst({
            where: eq(schema.categories.slug, tagSlug)
        });

        if (!category) throw new Error("Category not found");

        await db.delete(schema.problemCategories)
            .where(and(
                eq(schema.problemCategories.problemId, problem.id),
                eq(schema.problemCategories.categoryId, category.id)
            ));

        revalidatePath(`/solution/${slug}`);
        revalidatePath(`/tag/${tagSlug}`);
        revalidatePath(`/tags`);
        revalidatePath(`/`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove tag:", error);
        return { success: false, error: "Failed to remove tag" };
    }
}

export async function createTag(tagName: string) {
    try {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
        let [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tagSlug));

        if (!category) {
            await db.insert(schema.categories).values({
                name: tagName,
                slug: tagSlug,
            });
        }

        revalidatePath(`/tags`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create tag:", error);
        return { success: false, error: "Failed to create tag" };
    }
}

export async function getAllTags() {
    return await db.select().from(schema.categories).orderBy(schema.categories.name);
}

export async function updateTagName(oldSlug: string, newName: string) {
    try {
        const newSlug = newName.toLowerCase().replace(/\s+/g, '-');

        // Check if new slug exists and it's not the same tag
        if (newSlug !== oldSlug) {
            const existing = await db.query.categories.findFirst({
                where: eq(schema.categories.slug, newSlug)
            });
            if (existing) throw new Error("Tag name already exists");
        }

        await db.update(schema.categories)
            .set({ name: newName, slug: newSlug })
            .where(eq(schema.categories.slug, oldSlug));

        revalidatePath(`/tags`);
        revalidatePath(`/tag/${oldSlug}`);
        revalidatePath(`/tag/${newSlug}`);
        return { success: true, newSlug };
    } catch (error) {
        console.error("Failed to update tag:", error);
        return { success: false, error: "Failed to update tag" };
    }
}

export async function deleteTag(slug: string) {
    try {
        await db.delete(schema.categories).where(eq(schema.categories.slug, slug));

        // Cascade delete of problem_categories is handled by DB FK if defined, 
        // or we should manually delete. Schema definition for relations exists but Drizzle doesn't enforce cascade on delete in app code 
        // unless defined in schema with `onDelete: 'cascade'`.
        // Let's check schema/migration. Usually good to be explicit if not sure.
        // But assuming standar ref, we might need to delete links first or rely on constraints.
        // Let's try explicit delete of links first to be safe.

        // Wait, logic: delete from categories where slug matches.
        // But first get ID.

        // Actually, let's just let the DB handle it if configured, or manually does it.
        // Given existing schema doesn't seemingly explicitly state `onDelete: cascade` in `schema.ts`,
        // I should manually clean up `problemCategories`.

        const category = await db.query.categories.findFirst({
            where: eq(schema.categories.slug, slug)
        });

        if (category) {
            await db.delete(schema.problemCategories)
                .where(eq(schema.problemCategories.categoryId, category.id));

            await db.delete(schema.categories)
                .where(eq(schema.categories.id, category.id));
        }

        revalidatePath(`/tags`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete tag:", error);
        return { success: false, error: "Failed to delete tag" };
    }
}
export async function updateProblem(slug: string, description: string, solution: string) {
    try {
        await db.update(schema.problems)
            .set({ description, solution })
            .where(eq(schema.problems.slug, slug));

        revalidatePath(`/solution/${slug}`);
        revalidatePath(`/solution/${slug}/edit`);
        revalidatePath(`/`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update problem:", error);
        return { success: false, error: "Failed to update problem" };
    }
}
