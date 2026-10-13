import { z } from "zod";
import { getNoteById } from "../services/notesStore.js";

const noteIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB note ID")
}).strict();

export const getNote = async (args = {}, ownerId) => {
    const validation = noteIdSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid note ID",
            errors: validation.error.issues
        };
    }

    try {
        const note = await getNoteById(ownerId, validation.data.id);

        if (!note) {
            return {
                success: false,
                message: "Note not found"
            };
        }

        return {
            success: true,
            data: note
        };
    } catch (error) {
        console.error("Get note failed:", error.message);

        return {
            success: false,
            message: "Failed to retrieve note"
        };
    }
};