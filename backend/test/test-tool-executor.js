import { executeTool } from "./services/toolExecutor.js";

console.log(
    executeTool("createNote", {
        title: "Docker Discussion",
        content: "Discuss Docker with Raj",
        person: "Raj",
        date: null,
        time: "5:00 PM"
    })
);

console.log(executeTool("getAllNotes"));

console.log(executeTool("unknownTool", {}));