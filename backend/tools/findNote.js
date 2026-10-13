import { getAllNotes } from "../services/notesStore.js";
import { z } from "zod";

const findNoteSchema = z.object({
    title: z.string().trim().min(1)
}).strict();

export const findNote = async (args = {}, ownerId) => {
    const validation = findNoteSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            message: "Invalid note title",
            errors: validation.error.issues
        };
    }

    try {
        const { title } = validation.data;
        const notes = await getAllNotes(ownerId);

        const matches = notes.filter((note) =>
            note.title.toLowerCase().includes(title.toLowerCase())
        );

        if (matches.length === 0) {
            return {
                success: true,
                found: false,
                message: "No matching note found",
                data: []
            };
        }

        return {
            success: true,
            found: true,
            message: `${matches.length} matching note(s) found`,
            data: matches
        };
    } catch (error) {
        console.error("Find note failed:", error.message);

        return {
            success: false,
            message: "Failed to search notes"
        };
    }
};