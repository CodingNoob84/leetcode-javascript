"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { addTagToProblem, removeTagFromProblem, getAllTags } from "@/app/actions"
import { toast } from "sonner" // assuming sonner or similar usage, otherwise alert

interface TagManagerProps {
    slug: string;
    currentTags: { name: string, slug: string }[];
}

export function TagManager({ slug, currentTags }: TagManagerProps) {
    const [open, setOpen] = useState(false)
    const [availableTags, setAvailableTags] = useState<{ id: number, name: string, slug: string }[]>([])
    const [pending, startTransition] = useTransition()
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        getAllTags().then(tags => setAvailableTags(tags));
    }, [open]); // Refresh when opened

    const handleAddTag = (tagName: string) => {
        startTransition(async () => {
            const res = await addTagToProblem(slug, tagName);
            if (res.success) {
                // Optimistically updated by server revalidate, but we can also fetch available tags again
                getAllTags().then(tags => setAvailableTags(tags));
            } else {
                console.error(res.error);
            }
        });
    };

    const handleRemoveTag = (tagName: string) => {
        startTransition(async () => {
            const res = await removeTagFromProblem(slug, tagName);
            if (!res.success) {
                console.error(res.error);
            }
        });
    };

    // Filter available tags to excludes ones already added
    const unselectedTags = availableTags.filter(t => !currentTags.find(ct => ct.slug === t.slug));

    return (
        <div className="flex flex-wrap items-center gap-2">
            {currentTags.map(tag => (
                <Badge key={tag.slug} variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 flex items-center gap-1 pr-1">
                    <Link href={`/tag/${tag.slug}`} className="hover:text-emerald-400 hover:underline transition-colors">
                        {tag.name}
                    </Link>
                    <button
                        onClick={() => handleRemoveTag(tag.name)}
                        className="hover:text-red-400 focus:outline-none ml-1 rounded-full hover:bg-zinc-600 p-0.5 transition-colors"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag.name}</span>
                    </button>
                </Badge>
            ))}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 border-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs px-2 border-dashed">
                        <Plus className="h-3 w-3 mr-1" /> Add Tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px]" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Search or add tag..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                <div className="p-2">
                                    <p className="text-xs text-zinc-500 mb-2">Tag not found.</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full text-xs h-7"
                                        onClick={() => {
                                            if (inputValue.trim()) {
                                                handleAddTag(inputValue.trim());
                                                setOpen(false);
                                                setInputValue("");
                                            }
                                        }}
                                    >
                                        Create "{inputValue}"
                                    </Button>
                                </div>
                            </CommandEmpty>
                            <CommandGroup heading="Available Tags">
                                {unselectedTags.map(tag => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={(currentValue: string) => {
                                            handleAddTag(tag.name);
                                            setOpen(false);
                                        }}
                                        className="text-xs"
                                    >
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
