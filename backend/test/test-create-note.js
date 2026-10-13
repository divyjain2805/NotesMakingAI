import { createNote } from "./tools/createNote.js";

const result = createNote({
    title: "Docker Discussion",
    content: "Schedule a meeting with Raj",
    person: "Raj",
    date: null,
    time: "5:00 PM"
});

console.log(JSON.stringify(result, null, 2));