import express from "express";
import { getAllNotes } from "../services/notesStore.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const notes = await getAllNotes(req.userId);
        return res.status(200).json({ success: true, data: notes });
    } catch (error) {
        console.error("Notes route error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes"
        });
    }
});

export default router;
