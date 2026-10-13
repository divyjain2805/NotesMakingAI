import { z } from "zod";
import { deleteNote as removeNote } from "../services/notesStore.js";

const deleteNoteSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB note ID")
}).strict();

export const deleteNote = async (args = {}, ownerId) => {
    const validation = deleteNoteSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid note ID",
            errors: validation.error.issues
        };
    }

    try {
        const note = await removeNote(ownerId, validation.data.id);

        if (!note) {
            return {
                success: false,
                message: "Note not found"
            };
        }

        return {
            success: true,
            message: "Note deleted successfully",
            data: note
        };
    } catch (error) {
        console.error("Delete note failed:", error.message);

        return {
            success: false,
            message: "Failed to delete note"
        };
    }
};