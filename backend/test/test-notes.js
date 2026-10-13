import { createNote } from "./tools/createNote.js";
import { getNote } from "./tools/getNote.js";
import { getAllNotes } from "./tools/getAllNotes.js";

const created = createNote({
    title: "Docker Discussion",
    content: "Meeting with Raj",
    person: "Raj",
    date: null,
    time: "5:00 PM"
});

console.log("\n--- CREATED NOTE ---");
console.log(JSON.stringify(created, null, 2));

const noteId = created.data.id;

console.log("\n--- GET NOTE ---");
console.log(JSON.stringify(getNote({ id: noteId }), null, 2));

console.log("\n--- GET ALL NOTES ---");
console.log(JSON.stringify(getAllNotes(), null, 2));