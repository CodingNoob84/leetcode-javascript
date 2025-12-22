import { NextRequest, NextResponse } from "next/server";
import { getPaginatedSolutions, getPaginatedSolutionsByTag } from "@/lib/solutions";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get("tag") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    try {
        let result;
        if (tag) {
            result = await getPaginatedSolutionsByTag(tag, page, limit, status);
        } else {
            result = await getPaginatedSolutions(page, limit, status);
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error("API error fetching solutions:", error);
        return NextResponse.json({ error: "Failed to fetch solutions" }, { status: 500 });
    }
}
