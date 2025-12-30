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
        <div className="bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-4 md:px-6 py-2 md:py-2.5 flex flex-row items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 text-zinc-500 whitespace-nowrap md:border-r md:border-white/10 md:pr-6">
                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500/50" />
                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em]">Navigation Context</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-grow overflow-hidden">
                    {/* Active Tag Context */}
                    {currentTag ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0 h-7 md:h-9 pl-2 md:pl-3 pr-0.5 md:pr-1 gap-1 md:gap-2 flex items-center rounded-lg md:rounded-xl shadow-lg shadow-emerald-500/5 max-w-[120px] md:max-w-none">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">Tag: {currentTag}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 hover:bg-emerald-500/20 text-emerald-400/50 hover:text-emerald-400 rounded-md"
                                onClick={() => updateFilter("tag", null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 md:h-9 rounded-lg md:rounded-xl border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider hover:text-emerald-400 hover:border-emerald-500/30 transition-all px-2 md:px-4">
                                    <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2" /> <span className="hidden xs:inline">Tag</span><span className="hidden md:inline"> Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800 shadow-2xl rounded-xl">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-2">Solve within tag:</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <div className="max-h-[300px] overflow-y-auto">
                                    {problemTags.map(tag => (
                                        <DropdownMenuItem
                                            key={tag.slug}
                                            onSelect={() => updateFilter("tag", tag.slug)}
                                            className="text-xs py-2 px-3 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400 rounded-lg mx-1"
                                        >
                                            {tag.name}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                                {problemTags.length === 0 && (
                                    <DropdownMenuItem disabled className="text-xs text-zinc-600 italic">
                                        No tags available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Active Status Context */}
                    {currentStatus ? (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 py-0 h-7 md:h-9 pl-2 md:pl-3 pr-0.5 md:pr-1 gap-1 md:gap-2 flex items-center rounded-lg md:rounded-xl shadow-lg shadow-blue-500/5 max-w-[120px] md:max-w-none">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate">Status: {currentStatus}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 hover:bg-blue-500/20 text-blue-400/50 hover:text-blue-400 rounded-md"
                                onClick={() => updateFilter("status", null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 md:h-9 rounded-lg md:rounded-xl border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider hover:text-blue-400 hover:border-blue-500/30 transition-all px-2 md:px-4">
                                    <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2" /> <span className="hidden xs:inline">Status</span><span className="hidden md:inline"> Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800 shadow-2xl rounded-xl">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-2">Solve within status:</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                {STATUS_OPTIONS.map(status => (
                                    <DropdownMenuItem
                                        key={status}
                                        onSelect={() => updateFilter("status", status)}
                                        className="text-xs py-2 px-3 cursor-pointer focus:bg-blue-500/10 focus:text-blue-400 rounded-lg mx-1"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            {status}
                                            {currentStatus === status && <Check className="h-3 w-3" />}
                                        </div>
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
                            className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest h-7 md:h-9 px-2 md:px-4 rounded-lg md:rounded-xl transition-all"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div className="hidden xl:block text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] italic opacity-40">
                    Navigation respects active filters
                </div>
            </div>
        </div>
    );
}
