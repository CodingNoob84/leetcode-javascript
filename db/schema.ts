import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard", "Unknown"]);

export const problems = pgTable("problems", {
    id: serial("id").primaryKey(),
    leetcodeId: integer("leetcode_id").notNull(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description"),
    difficulty: difficultyEnum("difficulty").default("Unknown"),
    content: text("content").notNull(), // The raw content (including JSDoc)
    solution: text("solution"), // The stripped code solution
    createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").unique().notNull(),
    slug: text("slug").unique().notNull(),
});

export const problemCategories = pgTable("problem_categories", {
    id: serial("id").primaryKey(),
    problemId: integer("problem_id").references(() => problems.id).notNull(),
    categoryId: integer("category_id").references(() => categories.id).notNull(),
});

// Relations
export const problemsRelations = relations(problems, ({ many }) => ({
    problemCategories: many(problemCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    problemCategories: many(problemCategories),
}));

export const problemCategoriesRelations = relations(problemCategories, ({ one }) => ({
    problem: one(problems, {
        fields: [problemCategories.problemId],
        references: [problems.id],
    }),
    category: one(categories, {
        fields: [problemCategories.categoryId],
        references: [categories.id],
    }),
}));
