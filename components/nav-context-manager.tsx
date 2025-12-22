"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Plus, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavContextManagerProps {
    slug: string;
    problemTags: { name: string, slug: string }[];
}

const STATUS_OPTIONS = ["To Do", "Learning", "Mastered"];

export function NavContextManager({ slug, problemTags }: NavContextManagerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTag = searchParams.get("tag");
    const currentStatus = searchParams.get("status");

    const updateFilter = (type: "tag" | "status", value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(type, value);
        } else {
            params.delete(type);
        }
        router.push(`/solution/${slug}?${params.toString()}`);
    };

    const clearAll = () => {
        router.push(`/solution/${slug}`);
    };

    const isActive = !!(currentTag || currentStatus);

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 py-2 sm:py-3 px-4 sm:px-6 bg-zinc-900/30 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 whitespace-nowrap sm:border-r sm:border-zinc-800/50 sm:pr-4">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Context</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-grow">
                {/* Active Tag Context */}
                {currentTag ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1 h-8 pl-3 pr-1 gap-2 flex items-center">
                        <span className="text-[11px] font-medium">Tag: {currentTag}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-emerald-500/20 text-emerald-400/50 hover:text-emerald-400 rounded-full"
                            onClick={() => updateFilter("tag", null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-800 text-zinc-500 text-[11px] hover:text-zinc-300">
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Tag Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-zinc-950 border-zinc-800">
                            <DropdownMenuLabel className="text-xs text-zinc-500 uppercase">Solve within tag:</DropdownMenuLabel>
                            {problemTags.map(tag => (
                                <DropdownMenuItem
                                    key={tag.slug}
                                    onSelect={() => updateFilter("tag", tag.slug)}
                                    className="text-sm cursor-pointer"
                                >
                                    {tag.name}
                                </DropdownMenuItem>
                            ))}
                            {problemTags.length === 0 && (
                                <DropdownMenuItem disabled className="text-xs text-zinc-600">
                                    No tags to filter by.
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Active Status Context */}
                {currentStatus ? (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-1 h-8 pl-3 pr-1 gap-2 flex items-center">
                        <span className="text-[11px] font-medium">Status: {currentStatus}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-blue-500/20 text-blue-400/50 hover:text-blue-400 rounded-full"
                            onClick={() => updateFilter("status", null)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed border-zinc-800 text-zinc-500 text-[11px] hover:text-zinc-300">
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Status Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-zinc-950 border-zinc-800">
                            <DropdownMenuLabel className="text-xs text-zinc-500 uppercase">Solve within status:</DropdownMenuLabel>
                            {STATUS_OPTIONS.map(status => (
                                <DropdownMenuItem
                                    key={status}
                                    onSelect={() => updateFilter("status", status)}
                                    className="text-sm cursor-pointer"
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {isActive && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-zinc-500 hover:text-red-400 text-[10px] sm:text-[11px] h-7 sm:h-8 px-2"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            <div className="hidden lg:block text-[10px] text-zinc-600 font-mono tracking-tighter italic whitespace-nowrap">
                Next/Prev buttons will respect these filters
            </div>
        </div>
    );
}
