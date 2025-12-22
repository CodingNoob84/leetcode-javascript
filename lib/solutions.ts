import { db } from './db';
import * as schema from '../db/schema';
import { eq, asc, sql, and } from 'drizzle-orm';

export interface Solution {
    id: string;
    slug: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
    learningStatus: "Mastered" | "Learning" | "To Do";
    categories: { name: string, slug: string }[];
    content: string;
    description: string;
    solution: string;
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
                learningStatus: row.problem.learningStatus as any,
                categories: [],
                content: row.problem.content,
                description: row.problem.description || "",
                solution: row.problem.solution || "",
            });
        }
        if (row.category) {
            const sol = solutionsMap.get(row.problem.id)!;
            if (!sol.categories.find(c => c.slug === row.category!.slug)) {
                sol.categories.push({ name: row.category.name, slug: row.category.slug });
            }
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
            if (!grouped[cat.name]) grouped[cat.name] = [];
            grouped[cat.name].push(s);
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
        learningStatus: rows[0].problem.learningStatus as any,
        categories: [],
        content: rows[0].problem.content,
        description: rows[0].problem.description || "",
        solution: rows[0].problem.solution || "",
    };

    rows.forEach(row => {
        if (row.category) {
            if (!solution.categories.find(c => c.slug === row.category!.slug)) {
                solution.categories.push({ name: row.category.name, slug: row.category.slug });
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
                learningStatus: row.problem.learningStatus as any,
                categories: [],
                content: row.problem.content,
                description: row.problem.description || "",
                solution: row.problem.solution || "",
            });
        }
        if (row.category) {
            const sol = solutionsMap.get(row.problem.id)!;
            if (!sol.categories.find(c => c.slug === row.category!.slug)) {
                sol.categories.push({ name: row.category.name, slug: row.category.slug });
            }
        }
    }
    return Array.from(solutionsMap.values()).sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

export async function getPaginatedSolutions(page: number, pageSize: number, status?: string): Promise<{ solutions: Solution[], total: number }> {
    const offset = (page - 1) * pageSize;

    let query = db.select().from(schema.problems);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(schema.problems);

    if (status) {
        query = query.where(eq(schema.problems.learningStatus, status as any)) as any;
        countQuery = countQuery.where(eq(schema.problems.learningStatus, status as any)) as any;
    }

    const problemsList = await query
        .limit(pageSize)
        .offset(offset)
        .orderBy(asc(schema.problems.leetcodeId));

    const countResult = await countQuery;
    const total = Number(countResult[0].count);

    if (problemsList.length === 0) return { solutions: [], total };

    const solutionsMap = new Map<number, Solution>();
    problemsList.forEach(p => {
        solutionsMap.set(p.id, {
            id: p.leetcodeId.toString(),
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty as any,
            learningStatus: p.learningStatus as any,
            categories: [], // Populate if needed
            content: p.content,
            description: p.description || "",
            solution: p.solution || "",
        });
    });

    return { solutions: Array.from(solutionsMap.values()), total };
}

export async function getPaginatedSolutionsByTag(tag: string, page: number, pageSize: number, status?: string): Promise<{ solutions: Solution[], total: number }> {
    const offset = (page - 1) * pageSize;

    // Find category first
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tag));

    if (!category) return { solutions: [], total: 0 };

    // Build conditions
    const conditions = [eq(schema.problemCategories.categoryId, category.id)];
    if (status) {
        conditions.push(eq(schema.problems.learningStatus, status as any));
    }

    // Get problems for this category
    const problemsList = await db.select({
        problem: schema.problems,
    })
        .from(schema.problems)
        .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .where(and(...conditions))
        .limit(pageSize)
        .offset(offset)
        .orderBy(asc(schema.problems.leetcodeId));

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(schema.problemCategories)
        .innerJoin(schema.problems, eq(schema.problemCategories.problemId, schema.problems.id))
        .where(and(...conditions));

    const total = Number(countResult[0].count);

    if (problemsList.length === 0) return { solutions: [], total };

    // Fetch filter: problems with these IDs
    const solutionsMap = new Map<number, Solution>();
    problemsList.forEach(p => {
        solutionsMap.set(p.problem.id, {
            id: p.problem.leetcodeId.toString(),
            slug: p.problem.slug,
            title: p.problem.title,
            difficulty: p.problem.difficulty as any,
            learningStatus: p.problem.learningStatus as any,
            categories: [{ name: category.name, slug: category.slug }], // at least include the current one
            content: p.problem.content,
            description: p.problem.description || "",
            solution: p.problem.solution || "",
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
            learningStatus: p.problem.learningStatus as any,
            categories: [{ name: category.name, slug: category.slug }],
            content: p.problem.content,
            description: p.problem.description || "",
            solution: p.problem.solution || "",
        });
    });

    return Array.from(solutionsMap.values());
}

export async function getAllCategories(): Promise<{ slug: string, name: string }[]> {
    return db.select({
        slug: schema.categories.slug,
        name: schema.categories.name
    }).from(schema.categories).orderBy(asc(schema.categories.name));
}

export async function getCategoriesWithCounts(): Promise<Record<string, number>> {
    const results = await db.select({
        name: schema.categories.name,
        count: sql<number>`count(${schema.problemCategories.problemId})`
    })
        .from(schema.categories)
        .leftJoin(schema.problemCategories, eq(schema.categories.id, schema.problemCategories.categoryId))
        .groupBy(schema.categories.id, schema.categories.name);

    const counts: Record<string, number> = {};
    results.forEach(r => {
        counts[r.name] = Number(r.count);
    });
    return counts;
}

export async function getAdjacentSolutions(leetcodeId: number, tagSlug?: string, status?: string): Promise<{ prev: { slug: string, title: string } | null, next: { slug: string, title: string } | null }> {
    const baseConditions = [];
    if (status) {
        baseConditions.push(eq(schema.problems.learningStatus, status as any));
    }

    let prevQuery = db.select({ slug: schema.problems.slug, title: schema.problems.title })
        .from(schema.problems)
        .where(and(...baseConditions, sql`${schema.problems.leetcodeId} < ${leetcodeId}`))
        .orderBy(sql`${schema.problems.leetcodeId} desc`)
        .limit(1);

    let nextQuery = db.select({ slug: schema.problems.slug, title: schema.problems.title })
        .from(schema.problems)
        .where(and(...baseConditions, sql`${schema.problems.leetcodeId} > ${leetcodeId}`))
        .orderBy(asc(schema.problems.leetcodeId))
        .limit(1);

    if (tagSlug) {
        const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tagSlug));
        if (category) {
            prevQuery = db.select({ slug: schema.problems.slug, title: schema.problems.title })
                .from(schema.problems)
                .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
                .where(and(
                    eq(schema.problemCategories.categoryId, category.id),
                    ...baseConditions,
                    sql`${schema.problems.leetcodeId} < ${leetcodeId}`
                ))
                .orderBy(sql`${schema.problems.leetcodeId} desc`)
                .limit(1);

            nextQuery = db.select({ slug: schema.problems.slug, title: schema.problems.title })
                .from(schema.problems)
                .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
                .where(and(
                    eq(schema.problemCategories.categoryId, category.id),
                    ...baseConditions,
                    sql`${schema.problems.leetcodeId} > ${leetcodeId}`
                ))
                .orderBy(asc(schema.problems.leetcodeId))
                .limit(1);
        }
    }

    const [prevArr, nextArr] = await Promise.all([prevQuery, nextQuery]);

    return {
        prev: prevArr[0] || null,
        next: nextArr[0] || null
    };
}

export async function getLearningAnalytics() {
    const results = await db.select({
        status: schema.problems.learningStatus,
        count: sql<number>`count(*)`
    })
        .from(schema.problems)
        .groupBy(schema.problems.learningStatus);

    const analytics: Record<string, number> = {
        "Mastered": 0,
        "Learning": 0,
        "To Do": 0
    };

    let total = 0;
    results.forEach(r => {
        if (r.status) {
            analytics[r.status] = Number(r.count);
            total += Number(r.count);
        }
    });

    return {
        counts: analytics,
        percentages: {
            "Mastered": total > 0 ? (analytics["Mastered"] / total) * 100 : 0,
            "Learning": total > 0 ? (analytics["Learning"] / total) * 100 : 0,
            "To Do": total > 0 ? (analytics["To Do"] / total) * 100 : 0,
        },
        total
    };
}

export async function getLearningAnalyticsByTag(tagSlug: string) {
    // Find category first
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, tagSlug));

    if (!category) return null;

    const results = await db.select({
        status: schema.problems.learningStatus,
        count: sql<number>`count(*)`
    })
        .from(schema.problems)
        .innerJoin(schema.problemCategories, eq(schema.problems.id, schema.problemCategories.problemId))
        .where(eq(schema.problemCategories.categoryId, category.id))
        .groupBy(schema.problems.learningStatus);

    const analytics: Record<string, number> = {
        "Mastered": 0,
        "Learning": 0,
        "To Do": 0
    };

    let total = 0;
    results.forEach(r => {
        if (r.status) {
            analytics[r.status] = Number(r.count);
            total += Number(r.count);
        }
    });

    return {
        counts: analytics,
        percentages: {
            "Mastered": total > 0 ? (analytics["Mastered"] / total) * 100 : 0,
            "Learning": total > 0 ? (analytics["Learning"] / total) * 100 : 0,
            "To Do": total > 0 ? (analytics["To Do"] / total) * 100 : 0,
        },
        total
    };
}
