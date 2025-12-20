import fs from 'fs';
import path from 'path';

export interface Solution {
    id: string;
    slug: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
    categories: string[];
    content: string;
    description: string;
}

const SOLUTIONS_DIR = path.join(process.cwd(), '../solutions');

const PATTERNS = [
    { name: "Palindrome", keywords: ["palindrome"] },
    { name: "Parentheses", keywords: ["parentheses", "bracket"] },
    { name: "Intervals", keywords: ["interval"] },
    { name: "Tree", keywords: ["tree", "bst", "traversal"] },
    { name: "Linked List", keywords: ["linked list", "list node"] },
    { name: "Matrix", keywords: ["matrix", "grid"] },
    { name: "Dynamic Programming", keywords: ["dp", "dynamic programming", "climbing stairs", "subsequence"] },
    { name: "String", keywords: ["substring", "string", "anagram"] },
    { name: "Array", keywords: ["array", "sum", "subarray"] },
    { name: "Math", keywords: ["math", "number", "digit"] },
];

export function getSolutionsFromFS(): Solution[] {
    if (!fs.existsSync(SOLUTIONS_DIR)) {
        console.error(`Solutions directory not found: ${SOLUTIONS_DIR}`);
        return [];
    }
    const files = fs.readdirSync(SOLUTIONS_DIR);
    const solutions: Solution[] = [];

    for (const file of files) {
        if (!file.endsWith('.js')) continue;
        const fullPath = path.join(SOLUTIONS_DIR, file);
        const content = fs.readFileSync(fullPath, 'utf-8');

        const match = file.match(/^(\d+)-(.+)\.js$/);
        if (!match) continue;

        const [_, id, slug] = match;

        let title = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        let difficulty: Solution['difficulty'] = "Unknown";

        const titleMatch = content.match(/\d+\.\s+(.+)/);
        if (titleMatch) title = titleMatch[1];

        const diffMatch = content.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
        if (diffMatch) difficulty = diffMatch[1] as Solution['difficulty'];

        let description = "";
        const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
        if (commentMatch) {
            description = commentMatch[1]
                .split('\n')
                .map(line => line.replace(/^\s*\*\s?/, ''))
                .join('\n')
                .trim();
        }

        let categories: string[] = [];
        const lowerSlug = slug.toLowerCase();
        const lowerTitle = title.toLowerCase();

        for (const pattern of PATTERNS) {
            if (pattern.keywords.some(k => lowerSlug.includes(k) || lowerTitle.includes(k))) {
                categories.push(pattern.name);
            }
        }
        if (categories.length === 0) categories.push("Uncategorized");

        solutions.push({
            id,
            slug,
            title,
            difficulty,
            categories,
            content,
            description,
        });
    }
    return solutions.sort((a, b) => parseInt(a.id) - parseInt(b.id));
}
