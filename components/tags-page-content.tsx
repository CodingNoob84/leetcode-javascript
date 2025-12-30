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
            console.log("res", res);
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
            <div className="container mx-auto py-6 md:py-12 px-4 md:px-6">
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
                        <Link href="/">
                            <Button variant="ghost" className="-ml-3 md:-ml-4 text-zinc-500 hover:text-emerald-400 transition-colors text-xs md:text-sm">
                                <ArrowLeft className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" /> Back to Dashboard
                            </Button>
                        </Link>
                        <div className="space-y-1 md:space-y-2">
                            <h1 className="text-2xl md:text-5xl font-black text-white flex items-center gap-3 md:gap-4">
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                    <Tag className="h-5 w-5 md:h-8 md:w-8 text-emerald-500" />
                                </div>
                                Tag Library
                            </h1>
                            <p className="text-zinc-500 text-xs md:text-lg font-medium max-w-xl">
                                Explore <span className="text-emerald-500">{sortedCategories.length}</span> categories of JavaScript challenges.
                            </p>
                        </div>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 md:h-12 px-6 md:px-8 rounded-lg md:rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Create Tag
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 rounded-2xl max-w-[90vw] md:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl md:text-2xl font-black">Create New Tag</DialogTitle>
                                <DialogDescription className="text-zinc-400 text-xs md:text-base">
                                    Add a new category tag to organize your problem collection.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 md:py-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">
                                        Tag Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="h-10 md:h-12 bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-zinc-100 placeholder:text-zinc-600 rounded-lg md:rounded-xl text-xs md:text-base"
                                        placeholder="e.g. Dynamic Programming"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreate}
                                    disabled={mutation.isPending}
                                    className="w-full h-10 md:h-12 rounded-lg md:rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all text-xs md:text-base"
                                >
                                    {mutation.isPending ? "Creating..." : "Confirm Create Tag"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {sortedCategories.map((category) => (
                        <Link key={category.slug} href={`/tag/${category.slug}`}>
                            <Card className="glass-card md:hover:scale-[1.02] md:hover:-translate-y-1 group h-full flex flex-col relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 pb-2 md:pb-2">
                                    <CardTitle className="text-sm md:text-lg font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors leading-tight">
                                        {category.name}
                                    </CardTitle>
                                    <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 text-zinc-600 group-hover:text-emerald-500/50 transition-colors" />
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 pt-0">
                                    <div className="flex items-baseline gap-1.5 md:gap-2">
                                        <div className="text-xl md:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">
                                            {counts ? (
                                                (counts as Record<string, number>)[category.name] ?? 0
                                            ) : (
                                                <Skeleton className="h-6 w-10 md:h-8 md:w-12 bg-zinc-800" />
                                            )}
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Problems</span>
                                    </div>

                                    <div className="mt-3 md:mt-6 flex items-center text-[9px] md:text-[10px] font-black text-emerald-500/0 group-hover:text-emerald-500 transition-all uppercase tracking-widest">
                                        View Solutions <ArrowLeft className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3 rotate-180" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
