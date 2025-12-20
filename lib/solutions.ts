import { db } from './db';
import * as schema from '../db/schema';
import { eq, asc, sql } from 'drizzle-orm';

export interface Solution {
    id: string;
    slug: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
    categories: string[];
    content: string;
    description: string;
}

export interface GroupedSolutions {
    category: string;
    solutions: Solution[];
}

export async function getSolutions(): Promise<GroupedSolutions[]> {
    const rows = await db.select({
        problem: schema.problems,
        category: schema.categories,
    })
        .from(schema.problems)
        .leftJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .leftJoin(schema.categories, eq(schema.problemCategories.categoryId, schema.categories.id));

    const solutionsMap = new Map<number, Solution>();

    for (const row of rows) {
        if (!solutionsMap.has(row.problem.id)) {
            solutionsMap.set(row.problem.id, {
                id: row.problem.leetcodeId.toString(),
                slug: row.problem.slug,
                title: row.problem.title,
                difficulty: row.problem.difficulty as any,
                categories: [],
                content: row.problem.content,
                description: row.problem.description || "",
            });
        }
        if (row.category) {
            solutionsMap.get(row.problem.id)!.categories.push(row.category.name);
        }
    }

    const solutions = Array.from(solutionsMap.values());

    const grouped: Record<string, Solution[]> = {};
    solutions.forEach(s => {
        if (s.categories.length === 0) {
            if (!grouped["Uncategorized"]) grouped["Uncategorized"] = [];
            grouped["Uncategorized"].push(s);
        }
        s.categories.forEach(cat => {
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(s);
        });
    });

    return Object.entries(grouped).map(([category, items]) => ({
        category,
        solutions: items.sort((a, b) => parseInt(a.id) - parseInt(b.id))
    })).sort((a, b) => b.solutions.length - a.solutions.length);
}

export async function getSolution(slug: string): Promise<Solution | null> {
    const rows = await db.select({
        problem: schema.problems,
        category: schema.categories,
    })
        .from(schema.problems)
        .leftJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .leftJoin(schema.categories, eq(schema.problemCategories.categoryId, schema.categories.id))
        .where(eq(schema.problems.slug, slug));

    if (rows.length === 0) return null;

    const solution: Solution = {
        id: rows[0].problem.leetcodeId.toString(),
        slug: rows[0].problem.slug,
        title: rows[0].problem.title,
        difficulty: rows[0].problem.difficulty as any,
        categories: [],
        content: rows[0].problem.content,
        description: rows[0].problem.description || "",
    };

    rows.forEach(row => {
        if (row.category) {
            if (!solution.categories.includes(row.category.name)) {
                solution.categories.push(row.category.name);
            }
        }
    });

    return solution;
}

export async function getAllSolutions(): Promise<Solution[]> {
    const rows = await db.select({
        problem: schema.problems,
        category: schema.categories,
    })
        .from(schema.problems)
        .leftJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .leftJoin(schema.categories, eq(schema.problemCategories.categoryId, schema.categories.id));

    const solutionsMap = new Map<number, Solution>();

    for (const row of rows) {
        if (!solutionsMap.has(row.problem.id)) {
            solutionsMap.set(row.problem.id, {
                id: row.problem.leetcodeId.toString(),
                slug: row.problem.slug,
                title: row.problem.title,
                difficulty: row.problem.difficulty as any,
                categories: [],
                content: row.problem.content,
                description: row.problem.description || "",
            });
        }
        if (row.category) {
            const sol = solutionsMap.get(row.problem.id)!;
            if (!sol.categories.includes(row.category.name)) {
                sol.categories.push(row.category.name);
            }
        }
    }
    return Array.from(solutionsMap.values()).sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

export async function getPaginatedSolutions(page: number, pageSize: number): Promise<{ solutions: Solution[], total: number }> {
    const offset = (page - 1) * pageSize;

    const problemsList = await db.select()
        .from(schema.problems)
        .limit(pageSize)
        .offset(offset)
        .orderBy(asc(schema.problems.leetcodeId));

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.problems);
    const total = Number(countResult[0].count);

    if (problemsList.length === 0) return { solutions: [], total };

    const problemIds = problemsList.map(p => p.id);

    const solutionsMap = new Map<number, Solution>();
    problemsList.forEach(p => {
        solutionsMap.set(p.id, {
            id: p.leetcodeId.toString(),
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty as any,
            categories: [], // Populate if needed
            content: p.content,
            description: p.description || "",
        });
    });

    return { solutions: Array.from(solutionsMap.values()), total };
}

export async function getPaginatedSolutionsByTag(tag: string, page: number, pageSize: number): Promise<{ solutions: Solution[], total: number }> {
    const offset = (page - 1) * pageSize;

    // Find category first
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tag));

    if (!category) return { solutions: [], total: 0 };

    // Get problems for this category
    const problemsList = await db.select({
        problem: schema.problems,
    })
        .from(schema.problems)
        .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .where(eq(schema.problemCategories.categoryId, category.id))
        .limit(pageSize)
        .offset(offset)
        .orderBy(asc(schema.problems.leetcodeId));

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(schema.problemCategories)
        .where(eq(schema.problemCategories.categoryId, category.id));

    const total = Number(countResult[0].count);

    if (problemsList.length === 0) return { solutions: [], total };

    const problemIds = problemsList.map(p => p.problem.id);

    // To get categories for these problems, strictly speaking we'd need another query or join 
    // but for the list view we just need the problem details mostly. 
    // If we want to show ALL categories for these problems, we can do a second fetch.
    // For performance, let's just return the problems populated.

    // Actually, DashboardClient expects categories array.

    // Let's re-fetch details with categories for these IDs
    // OR just fetch them in the first query with a group_by / aggregation.
    // But Drizzle aggregation is tricky. simpler to fetch problems then their cats.

    // Fetch filter: problems with these IDs
    const solutionsMap = new Map<number, Solution>();
    problemsList.forEach(p => {
        solutionsMap.set(p.problem.id, {
            id: p.problem.leetcodeId.toString(),
            slug: p.problem.slug,
            title: p.problem.title,
            difficulty: p.problem.difficulty as any,
            categories: [category.name], // at least include the current one
            content: p.problem.content,
            description: p.problem.description || "",
        });
    });

    return { solutions: Array.from(solutionsMap.values()), total };
}

export async function getSolutionsByTag(tag: string): Promise<Solution[]> {
    // Find category first
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tag));

    if (!category) return [];

    // Get all problems for this category
    const problemsList = await db.select({
        problem: schema.problems,
    })
        .from(schema.problems)
        .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .where(eq(schema.problemCategories.categoryId, category.id))
        .orderBy(asc(schema.problems.leetcodeId));

    if (problemsList.length === 0) return [];

    // Convert to Solution format
    const solutionsMap = new Map<number, Solution>();
    problemsList.forEach(p => {
        solutionsMap.set(p.problem.id, {
            id: p.problem.leetcodeId.toString(),
            slug: p.problem.slug,
            title: p.problem.title,
            difficulty: p.problem.difficulty as any,
            categories: [category.name],
            content: p.problem.content,
            description: p.problem.description || "",
        });
    });

    return Array.from(solutionsMap.values());
}
