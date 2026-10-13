import { createNote } from "./tools/createNote.js";
import { updateNote } from "./tools/updateNote.js";
import { getNote } from "./tools/getNote.js";
import { deleteNote } from "./tools/deleteNote.js";
import { getAllNotes } from "./tools/getAllNotes.js";

const created = createNote({
    title: "Docker Discussion",
    content: "Meeting with Raj",
    person: "Raj",
    date: null,
    time: "5:00 PM"
});

if (!created.success) {
    console.log(created);
    process.exitCode = 1;
} else {
    const id = created.data.id;

    console.log("\n--- UPDATE NOTE ---");
    console.log(JSON.stringify(
        updateNote({ id, time: "6:00 PM" }),
        null,
        2
    ));

    console.log("\n--- VERIFY UPDATE ---");
    console.log(JSON.stringify(getNote({ id }), null, 2));

    console.log("\n--- DELETE NOTE ---");
    console.log(JSON.stringify(deleteNote({ id }), null, 2));

    console.log("\n--- VERIFY DELETION ---");
    console.log(JSON.stringify(getAllNotes(), null, 2));
}