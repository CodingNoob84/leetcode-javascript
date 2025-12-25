"use client"

import { useState } from "react"
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createTag } from "@/server-actions/actions"
import { getCategoriesWithCounts } from "@/server-actions/queries"
import { useRouter } from "next/navigation"
import { Label } from "./ui/label";
import { toast } from "sonner"

interface CategoryInfo {
    name: string;
    slug: string;
}

interface TagsPageProps {
    initialCategories: CategoryInfo[];
}

export default function TagsPageContent({ initialCategories }: TagsPageProps) {
    const [open, setOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: counts } = useQuery({
        queryKey: ["tag-counts"],
        queryFn: () => getCategoriesWithCounts(),
        staleTime: 5 * 60 * 1000,
    });

    const mutation = useMutation({
        mutationFn: (name: string) => createTag(name),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Tag created!");
                setOpen(false);
                setNewItemName("");
                queryClient.invalidateQueries({ queryKey: ["tag-counts"] });
                queryClient.invalidateQueries({ queryKey: ["all-tags"] });
                router.refresh();
            } else {
                toast.error(res.error || "Failed to create tag");
            }
        }
    });

    // Sort categories by count if available, otherwise by name
    const sortedCategories = [...initialCategories].sort((a, b) => {
        if (counts) {
            const countA = (counts as Record<string, number>)[a.name] || 0;
            const countB = (counts as Record<string, number>)[b.name] || 0;
            if (countB !== countA) return countB - countA;
        }
        return a.name.localeCompare(b.name);
    });

    const handleCreate = () => {
        if (!newItemName.trim()) return;
        mutation.mutate(newItemName);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <Link href="/">
                            <Button variant="ghost" className="pl-0 text-zinc-400 hover:text-white mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
                            <Tag className="h-8 w-8 text-emerald-500" />
                            All Tags
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Browse problems by {sortedCategories.length} unique topic tags.
                        </p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-semibold">
                                <Plus className="mr-2 h-4 w-4" /> Create Tag
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50">
                            <DialogHeader>
                                <DialogTitle>Create New Tag</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Add a new category tag to organize problems.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right text-zinc-400">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="col-span-3 bg-zinc-900 border-zinc-700 focus:border-emerald-500 text-zinc-100 placeholder:text-zinc-600"
                                        placeholder="e.g. Dynamic Programming"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreate}
                                    disabled={mutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {mutation.isPending ? "Creating..." : "Create Tag"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedCategories.map((category) => (
                        <Link key={category.slug} href={`/tag/${category.slug}`}>
                            <Card className="bg-zinc-900/40 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all cursor-pointer h-full group">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                                        {category.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-500">
                                        {counts ? (
                                            (counts as Record<string, number>)[category.name] ?? 0
                                        ) : (
                                            <Skeleton className="h-8 w-12" />
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500">problems</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
