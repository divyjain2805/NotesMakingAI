import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            default: ""
        },
        person: {
            type: String,
            default: null
        },
        date: {
            type: String,
            default: null
        },
        time: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;