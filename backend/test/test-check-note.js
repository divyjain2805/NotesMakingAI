import { createNote } from "./tools/createNote.js";
import { checkNoteExists } from "./tools/checkNoteExists.js";

createNote({
    title: "Docker Discussion",
    content: "Meeting with Raj",
    person: "Raj",
    date: null,
    time: "5:00 PM"
});

console.log(
    checkNoteExists({ title: "Docker Discussion" })
);

console.log(
    checkNoteExists({ title: "Unknown Topic" })
);