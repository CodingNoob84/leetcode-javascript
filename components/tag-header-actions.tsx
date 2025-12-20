"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateTagName, deleteTag } from "@/app/actions"
import { toast } from "sonner"

interface TagHeaderActionsProps {
    slug: string;
    currentName: string;
}

export function TagHeaderActions({ slug, currentName }: TagHeaderActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [newName, setNewName] = useState(currentName)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleUpdate = () => {
        if (!newName.trim() || newName === currentName) return;

        startTransition(async () => {
            const res = await updateTagName(slug, newName);
            if (res.success) {
                toast.success("Tag updated successfully");
                setIsEditOpen(false);
                if (res.newSlug) {
                    router.push(`/tag/${res.newSlug}`);
                }
            } else {
                toast.error("Failed to update tag");
            }
        });
    }

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteTag(slug);
            if (res.success) {
                toast.success("Tag deleted successfully");
                router.push("/tags");
            } else {
                toast.error("Failed to delete tag");
            }
        });
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Name
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)} className="border-red-900/30 hover:bg-red-900/20 text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Tag
            </Button>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Edit Tag Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the tag "{currentName}" and remove it from all associated problems. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">
                            {isPending ? "Deleting..." : "Delete Tag"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
