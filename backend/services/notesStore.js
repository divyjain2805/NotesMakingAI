import Note from "../models/Note.js";

const formatNote = (note) => {
    const data = note.toObject ? note.toObject() : note;

    return {
        id: data._id ? data._id.toString() : data.id,
        title: data.title,
        content: data.content,
        person: data.person,
        date: data.date,
        time: data.time,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
};

export const createNote = async (ownerId, data) => {
    const note = await Note.create({ ...data, ownerId });
    return formatNote(note);
};

export const getAllNotes = async (ownerId) => {
    const notes = await Note.find({ ownerId }).sort({ createdAt: -1 }).lean();

    return notes.map(formatNote);
};

export const getNoteById = async (ownerId, id) => {
    if (!id) return null;

    const note = await Note.findOne({ _id: id, ownerId }).lean();

    return note ? formatNote(note) : null;
};

export const updateNote = async (ownerId, id, data) => {
    if (!id) return null;

    const note = await Note.findOneAndUpdate(
        { _id: id, ownerId },
        { $set: data },
        { new: true, runValidators: true }
    ).lean();

    return note ? formatNote(note) : null;
};

export const deleteNote = async (ownerId, id) => {
    if (!id) return null;

    const note = await Note.findOneAndDelete({ _id: id, ownerId }).lean();

    return note ? formatNote(note) : null;
};

export const checkNoteExists = async (ownerId, title) => {
    const note = await Note.findOne({
        ownerId,
        title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    }).lean();

    return Boolean(note);
};