import { createNote } from "../tools/createNote.js";
import { updateNote } from "../tools/updateNote.js";
import { deleteNote } from "../tools/deleteNote.js";
import { getNote } from "../tools/getNote.js";
import { getAllNotes } from "../tools/getAllNotes.js";
import { checkNoteExists } from "../tools/checkNoteExists.js";
import { findNote } from "../tools/findNote.js";

const tools = {
    createNote,
    updateNote,
    deleteNote,
    getNote,
    getAllNotes,
    checkNoteExists,
    findNote
};

export const executeTool = async (toolName, args = {}, ownerId) => {
    const selectedTool = tools[toolName];

    if (!selectedTool) {
        return {
            success: false,
            error: `Unknown tool: ${toolName}`
        };
    }

    try {
        return await selectedTool(args, ownerId);
    } catch (error) {
        console.error("Tool execution failed:", error.message);

        return {
            success: false,
            error: "Tool execution failed"
        };
    }
};