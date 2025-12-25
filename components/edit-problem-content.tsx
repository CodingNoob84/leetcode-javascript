"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProblem } from "@/server-actions/actions";
import { Textarea } from "./ui/textarea";

interface EditProblemContentProps {
    problem: {
        slug: string;
        title: string;
        description: string;
        solution: string;
        id: string;
    };
    tag?: string;
    status?: string;
}

export function EditProblemContent({ problem, tag, status }: EditProblemContentProps) {
    const [description, setDescription] = useState(problem.description);
    const [solution, setSolution] = useState(problem.solution);
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => updateProblem(problem.slug, description, solution),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Problem updated successfully");
                queryClient.invalidateQueries({ queryKey: ["solution", problem.slug] });

                // Construct redirect URL with filters
                const params = new URLSearchParams();
                if (tag) params.set("tag", tag);
                if (status) params.set("status", status);

                const queryString = params.toString();
                const redirectPath = `/solution/${problem.slug}${queryString ? `?${queryString}` : ""}`;

                router.push(redirectPath);
                router.refresh();
            } else {
                toast.error(res.error || "Failed to update problem");
            }
        }
    });

    const handleSave = () => {
        mutation.mutate();
    };

    // Construct back link with filters
    const backParams = new URLSearchParams();
    if (tag) backParams.set("tag", tag);
    if (status) backParams.set("status", status);
    const backQuery = backParams.toString();
    const backLink = `/solution/${problem.slug}${backQuery ? `?${backQuery}` : ""}`;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={backLink}>
                            <Button variant="ghost" size="icon" className="text-zinc-400">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">
                            Edit <span className="text-emerald-500 font-mono">#{parseInt(problem.id)}</span> {problem.title}
                        </h1>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={mutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Description Editor */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                Problem Description
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-zinc-500 hover:text-zinc-300"
                                    onClick={() => {
                                        navigator.clipboard.writeText(description);
                                        toast.success("Description copied");
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-zinc-500 hover:text-red-400"
                                    onClick={() => {
                                        setDescription("");
                                        toast.success("Description cleared");
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Clear
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                placeholder="Enter problem description..."
                                className="min-h-[500px] bg-zinc-950 border-zinc-800 focus:border-emerald-500 font-sans text-zinc-300 resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Solution Editor */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                JavaScript Solution
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-zinc-500 hover:text-zinc-300"
                                    onClick={() => {
                                        navigator.clipboard.writeText(solution);
                                        toast.success("Solution copied");
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-zinc-500 hover:text-red-400"
                                    onClick={() => {
                                        setSolution("");
                                        toast.success("Solution cleared");
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Clear
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={solution}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSolution(e.target.value)}
                                placeholder="Enter JavaScript solution..."
                                className="min-h-[500px] bg-zinc-950 border-zinc-800 focus:border-emerald-500 font-mono text-zinc-300 resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
