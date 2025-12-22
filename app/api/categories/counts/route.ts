import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/solutions";

export async function GET() {
    try {
        const counts = await getCategoriesWithCounts();
        return NextResponse.json(counts);
    } catch (error) {
        console.error("API error fetching category counts:", error);
        return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
    }
}
