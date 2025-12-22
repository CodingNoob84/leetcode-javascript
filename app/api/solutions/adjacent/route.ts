import { NextRequest, NextResponse } from "next/server";
import { getAdjacentSolutions } from "@/lib/solutions";

export async function GET(
    request: NextRequest,
    { params }: { params: any }
) {
    const searchParams = request.nextUrl.searchParams;
    const leetcodeId = parseInt(searchParams.get("leetcodeId") || "");
    const tagSlug = searchParams.get("tagSlug") || undefined;
    const status = searchParams.get("status") || undefined;

    if (isNaN(leetcodeId)) {
        return NextResponse.json({ error: "Invalid leetcodeId" }, { status: 400 });
    }

    try {
        const data = await getAdjacentSolutions(leetcodeId, tagSlug, status);
        return NextResponse.json(data);
    } catch (error) {
        console.error("API error fetching adjacent solutions:", error);
        return NextResponse.json({ error: "Failed to fetch adjacent solutions" }, { status: 500 });
    }
}
