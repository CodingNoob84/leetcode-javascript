'use server';

import * as solutions from "@/lib/solutions";

export async function getSolution(slug: string) {
    return await solutions.getSolution(slug);
}

export async function getPaginatedSolutions(page: number, pageSize: number, status?: string) {
    return await solutions.getPaginatedSolutions(page, pageSize, status);
}

export async function getPaginatedSolutionsByTag(tag: string, page: number, pageSize: number, status?: string) {
    return await solutions.getPaginatedSolutionsByTag(tag, page, pageSize, status);
}

export async function getCategoriesWithCounts() {
    return await solutions.getCategoriesWithCounts();
}

export async function getLearningAnalytics() {
    return await solutions.getLearningAnalytics();
}

export async function getLearningAnalyticsByTag(tagSlug: string) {
    return await solutions.getLearningAnalyticsByTag(tagSlug);
}

export async function getAdjacentSolutions(leetcodeId: number, tagSlug?: string, status?: string) {
    return await solutions.getAdjacentSolutions(leetcodeId, tagSlug, status);
}

export async function getAllTags() {
    return await solutions.getAllCategories();
}

export async function searchProblems(query: string) {
    return await solutions.searchProblems(query);
}
