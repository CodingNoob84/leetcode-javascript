"use client"

import { useState } from "react"
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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTagName, deleteTag } from "@/server-actions/actions"
import { toast } from "sonner"

interface TagHeaderActionsProps {
    slug: string;
    currentName: string;
}

export function TagHeaderActions({ slug, currentName }: TagHeaderActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [newName, setNewName] = useState(currentName)
    const router = useRouter()
    const queryClient = useQueryClient()

    const updateMutation = useMutation({
        mutationFn: () => updateTagName(slug, newName),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Tag updated successfully")
                setIsEditOpen(false)
                queryClient.invalidateQueries({ queryKey: ["all-tags"] })
                if (res.newSlug) {
                    router.push(`/tag/${res.newSlug}`)
                }
            } else {
                toast.error("Failed to update tag")
            }
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => deleteTag(slug),
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Tag deleted successfully")
                queryClient.invalidateQueries({ queryKey: ["all-tags"] })
                router.push("/tags")
            } else {
                toast.error("Failed to delete tag")
            }
        }
    })

    const handleUpdate = () => {
        if (!newName.trim() || newName === currentName) return;
        updateMutation.mutate();
    }

    const handleDelete = () => {
        deleteMutation.mutate();
    }

    const isPending = updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white h-9 px-3 sm:px-4">
                <Pencil className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Name</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)} className="border-red-900/30 hover:bg-red-900/20 text-red-400 hover:text-red-300 h-9 px-3 sm:px-4">
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete Tag</span>
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
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
                            {deleteMutation.isPending ? "Deleting..." : "Delete Tag"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
