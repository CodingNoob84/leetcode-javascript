"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProblem } from "@/app/actions";
import { Textarea } from "./ui/textarea";

interface EditProblemContentProps {
    problem: {
        slug: string;
        title: string;
        description: string;
        solution: string;
        id: string;
    };
}

export function EditProblemContent({ problem }: EditProblemContentProps) {
    const [description, setDescription] = useState(problem.description);
    const [solution, setSolution] = useState(problem.solution);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateProblem(problem.slug, description, solution);
            if (res.success) {
                toast.success("Problem updated successfully");
                router.push(`/solution/${problem.slug}`);
                router.refresh();
            } else {
                toast.error(res.error || "Failed to update problem");
            }
        } catch (err) {
            toast.error("An error occurred while saving");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/solution/${problem.slug}`}>
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
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {isSaving ? (
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
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                Problem Description
                            </CardTitle>
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
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                JavaScript Solution
                            </CardTitle>
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
