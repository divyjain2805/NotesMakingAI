import { z } from "zod";
import { checkNoteExists as findExistingNote } from "../services/notesStore.js";

const checkNoteExistsSchema = z.object({
    title: z.string().trim().min(1)
}).strict();

export const checkNoteExists = async (args = {}, ownerId) => {
    const validation = checkNoteExistsSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid note title",
            errors: validation.error.issues
        };
    }

    try {
        const exists = await findExistingNote(ownerId, validation.data.title);

        return {
            success: true,
            exists,
            message: exists
                ? "A note with this title already exists"
                : "No note with this title exists"
        };
    } catch (error) {
        console.error("Check note exists failed:", error.message);

        return {
            success: false,
            message: "Failed to check note"
        };
    }
};