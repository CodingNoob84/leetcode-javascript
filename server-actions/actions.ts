'use server'

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const zaiClient = new OpenAI({
    apiKey: process.env.ZAI_API_KEY || "",
    baseURL: process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4/"
});

const ENHANCE_PROMPT = (title: string) => `Provide a detailed solution for the LeetCode problem: "${title}". 

Format the response as a JSON object with two fields:
- "description": The problem description in professional Markdown format. 
  - Use headers (##) for sections like "Example 1", "Constraints".
  - Use **bold** for key terms and "Example" labels.
  - Use code blocks ( \`\`\` ) for example inputs, outputs, and explanations.
  - Ensure the description is clear, concise, and well-formatted.
- "solution": One clean, optimized JavaScript solution with comments explaining the important lines.

Ensure the "solution" field ONLY contains the JavaScript code, and the "description" field ONLY contains the Markdown description. Do not include triple backticks for JSON formatting in the response, just the raw JSON object.`;

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

            // If we added a tag that isn't 'uncategorized', remove 'uncategorized'
            if (tagSlug !== 'uncategorized') {
                const uncategorized = await db.query.categories.findFirst({
                    where: eq(schema.categories.slug, 'uncategorized')
                });
                if (uncategorized) {
                    await db.delete(schema.problemCategories)
                        .where(and(
                            eq(schema.problemCategories.problemId, problem.id),
                            eq(schema.problemCategories.categoryId, uncategorized.id)
                        ));
                }
            }
        }

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

        // Check if any tags remain
        const remainingTags = await db.query.problemCategories.findMany({
            where: eq(schema.problemCategories.problemId, problem.id)
        });

        if (remainingTags.length === 0 && tagSlug !== 'uncategorized') {
            // Find or create uncategorized category
            let [uncategorized] = await db.select().from(schema.categories).where(eq(schema.categories.slug, 'uncategorized'));
            if (!uncategorized) {
                [uncategorized] = await db.insert(schema.categories).values({
                    name: "Uncategorized",
                    slug: "uncategorized",
                }).returning();
            }
            await db.insert(schema.problemCategories).values({
                problemId: problem.id,
                categoryId: uncategorized.id,
            });
        }

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

        return { success: true, newSlug };
    } catch (error) {
        console.error("Failed to update tag:", error);
        return { success: false, error: "Failed to update tag" };
    }
}

export async function deleteTag(slug: string) {
    try {
        const category = await db.query.categories.findFirst({
            where: eq(schema.categories.slug, slug)
        });

        if (category) {
            // Find problems that only have THIS category
            const problemsToMarkUncategorized = await db.select({ id: schema.problemCategories.problemId })
                .from(schema.problemCategories)
                .where(eq(schema.problemCategories.categoryId, category.id));

            await db.delete(schema.problemCategories)
                .where(eq(schema.problemCategories.categoryId, category.id));

            await db.delete(schema.categories)
                .where(eq(schema.categories.id, category.id));

            // For each affected problem, check if it now has 0 tags
            for (const p of problemsToMarkUncategorized) {
                const remaining = await db.query.problemCategories.findMany({
                    where: eq(schema.problemCategories.problemId, p.id)
                });
                if (remaining.length === 0) {
                    let [uncat] = await db.select().from(schema.categories).where(eq(schema.categories.slug, 'uncategorized'));
                    if (!uncat) {
                        [uncat] = await db.insert(schema.categories).values({
                            name: "Uncategorized",
                            slug: "uncategorized",
                        }).returning();
                    }
                    await db.insert(schema.problemCategories).values({
                        problemId: p.id,
                        categoryId: uncat.id,
                    });
                }
            }
        }

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

        return { success: true };
    } catch (error) {
        console.error("Failed to update problem:", error);
        return { success: false, error: "Failed to update problem" };
    }
}

export async function bulkAddTagByLeetcodeIds(leetcodeIds: number[], tagSlug: string) {
    try {
        const category = await db.query.categories.findFirst({
            where: eq(schema.categories.slug, tagSlug)
        });

        if (!category) throw new Error("Category not found");

        // Find all problems with these LeetCode IDs
        const problems = await db.select()
            .from(schema.problems)
            .where(sql`${schema.problems.leetcodeId} IN (${sql.join(leetcodeIds, sql`, `)})`);

        if (problems.length === 0) return { success: false, error: "No problems found with these IDs" };

        const problemIds = problems.map(p => p.id);

        // Filter out existing links to avoid duplicates
        const existingLinks = await db.select()
            .from(schema.problemCategories)
            .where(and(
                eq(schema.problemCategories.categoryId, category.id),
                sql`${schema.problemCategories.problemId} IN (${sql.join(problemIds, sql`, `)})`
            ));

        const existingProblemIds = new Set(existingLinks.map(l => l.problemId));
        const newProblemIds = problemIds.filter(id => !existingProblemIds.has(id));

        if (newProblemIds.length > 0) {
            await db.insert(schema.problemCategories).values(
                newProblemIds.map(problemId => ({
                    problemId,
                    categoryId: category.id
                }))
            );

            // If we're adding something other than uncategorized, remove uncategorized from these problems
            if (tagSlug !== 'uncategorized') {
                const uncategorized = await db.query.categories.findFirst({
                    where: eq(schema.categories.slug, 'uncategorized')
                });
                if (uncategorized) {
                    await db.delete(schema.problemCategories)
                        .where(and(
                            eq(schema.problemCategories.categoryId, uncategorized.id),
                            sql`${schema.problemCategories.problemId} IN (${sql.join(problemIds, sql`, `)})`
                        ));
                }
            }
        }

        return {
            success: true,
            addedCount: newProblemIds.length,
            totalFound: problems.length
        };
    } catch (error) {
        console.error("Failed bulk tagging:", error);
        return { success: false, error: "Failed bulk tagging" };
    }
}

export type LearningStatus = "Mastered" | "Learning" | "To Do";

export async function updateLearningStatus(slug: string, status: LearningStatus) {
    try {
        await db.update(schema.problems)
            .set({ learningStatus: status })
            .where(eq(schema.problems.slug, slug));

        return { success: true };
    } catch (error) {
        console.error("Failed to update learning status:", error);
        return { success: false, error: "Failed to update learning status" };
    }
}

export async function enhanceProblemWithAI(slug: string, title: string, provider: "gemini" | "zai" = "gemini") {
    try {
        let text = "";

        if (provider === "gemini") {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not configured");
            }
            const result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ parts: [{ text: ENHANCE_PROMPT(title) }] }]
            });
            text = result.text || "";
        } else {
            if (!process.env.ZAI_API_KEY) {
                throw new Error("ZAI_API_KEY is not configured");
            }
            const completion = await zaiClient.chat.completions.create({
                model: "glm-4.5-Flash",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that provides LeetCode solutions in JSON format." },
                    { role: "user", content: ENHANCE_PROMPT(title) }
                ],
                response_format: { type: "json_object" }
            });
            text = completion.choices[0].message.content || "";
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response as JSON");
        }

        const enhancedData = JSON.parse(jsonMatch[0]);

        await db.update(schema.problems)
            .set({
                description: enhancedData.description,
                solution: enhancedData.solution
            })
            .where(eq(schema.problems.slug, slug));

        return { success: true };
    } catch (error) {
        console.error("AI Enhancement failed:", error);
        return { success: false, error: error instanceof Error ? error.message : "AI Enhancement failed" };
    }
}
