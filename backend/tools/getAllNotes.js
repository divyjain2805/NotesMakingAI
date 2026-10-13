import { getAllNotes as fetchAllNotes } from "../services/notesStore.js";

export const getAllNotes = async (_args, ownerId) => {
    try {
        const notes = await fetchAllNotes(ownerId);

        return {
            success: true,
            count: notes.length,
            data: notes
        };
    } catch (error) {
        console.error("Get all notes failed:", error.message);

        return {
            success: false,
            message: "Failed to retrieve notes"
        };
    }
};