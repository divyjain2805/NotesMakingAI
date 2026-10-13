import { z } from "zod";
import { updateNote as saveNoteUpdate } from "../services/notesStore.js";

const updateNoteSchema = z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).optional(),
    content: z.string().optional(),
    person: z.string().nullable().optional(),
    date: z.string().date().nullable().optional(),
    time: z.string().nullable().optional()
}).strict();

export const updateNote = async (args = {}, ownerId) => {
    const validation = updateNoteSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid update data",
            errors: validation.error.issues
        };
    }

    const { id, ...updates } = validation.data;

    if (Object.keys(updates).length === 0) {
        return {
            success: false,
            message: "Provide at least one field to update"
        };
    }

    try {
        const note = await saveNoteUpdate(ownerId, id, updates);

        if (!note) {
            return {
                success: false,
                message: "Note not found"
            };
        }

        return {
            success: true,
            message: "Note updated successfully",
            data: note
        };
    } catch (error) {
        console.error("Update note failed:", error.message);

        return {
            success: false,
            message: "Failed to update note"
        };
    }
};