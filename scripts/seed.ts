
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import * as dotenv from 'dotenv';
import { getSolutionsFromFS } from './fs-parser';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
    console.log('🌱 Seeding database...');

    try {
        // 1. Get all solutions from FS
        const solutions = getSolutionsFromFS();
        console.log(`Found ${solutions.length} solutions to seed.`);

        for (const s of solutions) {
            // 2. Upsert Problem
            const leetcodeId = parseInt(s.id);

            const [problem] = await db.insert(schema.problems).values({
                leetcodeId,
                slug: s.slug,
                title: s.title,
                description: s.description,
                difficulty: s.difficulty as "Easy" | "Medium" | "Hard" | "Unknown",
                content: s.content,
            }).onConflictDoUpdate({
                target: schema.problems.slug,
                set: {
                    title: s.title,
                    description: s.description,
                    difficulty: s.difficulty as "Easy" | "Medium" | "Hard" | "Unknown",
                    content: s.content,
                }
            }).returning();

            // 3. Upsert Categories and Link
            for (const catName of s.categories) {
                const catSlug = catName.toLowerCase().replace(/\s+/g, '-');

                let [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, catSlug));

                if (!category) {
                    [category] = await db.insert(schema.categories).values({
                        name: catName,
                        slug: catSlug,
                    }).returning();
                    console.log(`Created category: ${catName}`);
                }

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
            }
            process.stdout.write('.');
        }

        console.log('\n✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
