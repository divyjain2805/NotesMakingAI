import { createNoteSchema } from "../services/noteSchema.js";
import { createNote as saveNote } from "../services/notesStore.js";

export const createNote = async (args, ownerId) => {
    const validation = createNoteSchema.safeParse(args);

    if (!validation.success) {
        return {
            success: false,
            error: "Invalid note data",
            details: validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        };
    }

    const note = await saveNote(ownerId, validation.data);

    return {
        success: true,
        message: "Note created successfully",
        data: note
    };
};