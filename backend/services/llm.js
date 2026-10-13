import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const model = "openai/gpt-oss-20b";

const toolDefinitions = [
    {
        type: "function",
        function: {
            name: "createNote",
            description: "Create a new note or reminder.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Short, meaningful note title"
                    },
                    content: {
                        type: "string",
                        description: "Details about the note"
                    },
                    person: {
                        type: ["string", "null"],
                        description: "Person involved, or null"
                    },
                    date: {
                        type: ["string", "null"],
                        description: "Date in YYYY-MM-DD format, or null if unknown"
                    },
                    time: {
                        type: ["string", "null"],
                        description: "Time such as 5:00 PM, or null if unknown"
                    }
                },
                required: ["title", "content", "person", "date", "time"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getNote",
            description: "Retrieve a specific note by its unique ID.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "UUID of the note"
                    }
                },
                required: ["id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getAllNotes",
            description: "Retrieve all saved notes. Use when the user asks to list or show all notes.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "checkNoteExists",
            description: "Check whether a note with a given title exists.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Title to search for"
                    }
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateNote",
            description: "Update an existing note when its unique ID is known.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "UUID of the note to update"
                    },
                    title: { type: "string" },
                    content: { type: "string" },
                    person: { type: ["string", "null"] },
                    date: { type: ["string", "null"] },
                    time: { type: ["string", "null"] }
                },
                required: ["id"],
                additionalProperties: false
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteNote",
            description: "Delete an existing note when its unique ID is known.",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "UUID of the note to delete"
                    }
                },
                required: ["id"]
            }
        }
    },
    {
    type: "function",
    function: {
        name: "findNote",
        description:
            "Find existing notes by title or partial title. Use this before updating or deleting a note when the user identifies it by title instead of UUID. If multiple notes match, ask the user to clarify.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "The exact or partial title of the note to find"
                }
            },
            required: ["title"],
            additionalProperties: false
        }
    }
}
];



// export const getToolDecision = async (query, toolResults = []) => {
       
    //     const messages = [
//         {
//             role: "system",
//             content: `
// You are a helpful notes assistant.

// Rules:
// 1. Create notes using createNote.
// 2. For updating or deleting a note by title, call findNote first.
// 3. Never invent a note ID.
// 4. If no note matches, explain that no matching note was found.
// 5. If multiple notes match, ask the user to clarify.
// 6. If exactly one note matches, use its ID for updateNote or deleteNote.
// 7. Only update fields the user requested.
// 8. Use getAllNotes to list notes.
// 9. Never claim success unless a tool confirms it.
// 10. Creating a note does not create a real calendar event.
// 11. After receiving tool results, decide whether another tool is needed.
// 12. If all requested operations are complete, respond naturally.
// `
//         },
//         {
//             role: "user",
//             content: query
//         }
//     ];


//     // Include results from tools already executed in this request.
//     for (const item of toolResults) {
//         messages.push({
//             role: "assistant",
//             content: `Previous tool result: ${JSON.stringify(item)}`
//         });
//     }

//     const response = await groq.chat.completions.create({
//         model,
//         messages,
//         tools: toolDefinitions,
//         tool_choice: "auto",
//         temperature: 0
//     });

//     const message = response.choices[0].message;

//     if (message.tool_calls?.length) {
//         return {
//             type: "tool_calls",
//             toolCalls: message.tool_calls
//         };
//     }

//     return {
//         type: "message",
//         message: message.content
//     };
// };

export const getToolDecision = async (messages) => {
    

    const response = await groq.chat.completions.create({
        model,
        messages,
        tools: toolDefinitions,
        tool_choice: "auto",
        temperature: 0
    });

    const message = response.choices[0].message;

    return {
        message,
        toolCalls: message.tool_calls ?? []
    };
};


export const getFinalResponse = async (query, toolResults) => {
    const response = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: `
You are a helpful notes assistant.
Summarize the tool results clearly and naturally.
Only claim an operation succeeded if the tool result confirms success.
If an operation failed, explain the error honestly.
Do not claim that a real calendar event was created.
`
            },
            {
                role: "user",
                content: query
            },
            {
                role: "assistant",
                content: "I executed the requested tool operation."
            },
            {
                role: "user",
                content: `Tool execution results:\n${JSON.stringify(toolResults)}`
            }
        ],
        temperature: 0.3
    });

    return response.choices[0].message.content;
};