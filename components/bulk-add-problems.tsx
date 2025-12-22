"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { bulkAddTagByLeetcodeIds } from "@/app/actions";
import { useRouter } from "next/navigation";

interface BulkAddProblemsProps {
    tagSlug: string;
    tagName: string;
}

export function BulkAddProblems({ tagSlug, tagName }: BulkAddProblemsProps) {
    const [open, setOpen] = useState(false);
    const [idsString, setIdsString] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleBulkAdd = () => {
        const ids = idsString
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

        if (ids.length === 0) return;

        startTransition(async () => {
            const res = await bulkAddTagByLeetcodeIds(ids, tagSlug);
            if (res.success) {
                setOpen(false);
                setIdsString("");
                router.refresh();
            } else {
                alert(res.error || "Failed to add problems");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold h-9 px-3 sm:px-4">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Bulk Add</span>
                    <span className="sm:hidden ml-1">Bulk</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50">
                <DialogHeader>
                    <DialogTitle>Bulk Add Problems to "{tagName}"</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter LeetCode IDs separated by commas to add them to this tag.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="e.g. 1, 23, 456"
                        value={idsString}
                        onChange={(e) => setIdsString(e.target.value)}
                        className="min-h-[100px] bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500"
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleBulkAdd}
                        disabled={isPending || !idsString.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPending ? "Adding..." : "Add Problems"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
