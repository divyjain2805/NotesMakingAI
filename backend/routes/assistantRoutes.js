import express from "express";
import { getToolDecision } from "../services/llm.js";
import { executeTool } from "../services/toolExecutor.js";
import { getAllNotes } from "../services/notesStore.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { query } = req.body;

        if (typeof query !== "string" || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid query is required"
            });
        }

        const noteHistory = await getAllNotes(req.userId);

        const messages = [
            {
    role: "system",
    content: `
You are a helpful AI notes assistant.

The user's existing notes are provided below as context:
${JSON.stringify(noteHistory)}

Rules:
1. Use the notes context to understand references to existing notes.
2. For updates and deletions, use findNote to verify the target.
3. Never invent note IDs.
4. If multiple notes could match, ask the user to clarify.
5. Do not modify or delete a note unless the intended target is clear.
6. Only claim success when a tool confirms it.
7. Creating a note does not create a real calendar event.
`
},
            {
                role: "user",
                content: query.trim()
            }
        ];

        const results = [];
        const maxIterations = 5;

        for (let i = 0; i < maxIterations; i++) {
            const decision = await getToolDecision(messages);

            // No more tool calls: return the assistant's final message.
            if (decision.toolCalls.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: decision.message.content ?? "",
                    results
                });
            }

            // Preserve Groq's original assistant message and tool-call IDs.
            messages.push(decision.message);

            for (const toolCall of decision.toolCalls) {
                let result;
                const toolName = toolCall.function.name;

                try {
                    const args = JSON.parse(
                        toolCall.function.arguments || "{}"
                    );

                    result = await executeTool(toolName, args, req.userId);
                } catch (error) {
                    result = {
                        success: false,
                        message: "Tool execution failed"
                    };
                }

                results.push({
                    tool: toolName,
                    result
                });

                // Send the actual tool result back to Groq.
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "I reached the tool-call limit. Please try a simpler request.",
            results
        });
    } catch (error) {
        console.error("Assistant route error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request."
        });
    }
});

export default router;