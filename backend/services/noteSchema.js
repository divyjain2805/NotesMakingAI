import { z } from "zod";

export const createNoteSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().default(""),
    person: z.string().nullable().default(null),
    date: z.string().date().nullable().default(null),
    time: z.string().nullable().default(null)
}).strict();

export const updateNoteSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB note ID"),
    title: z.string().trim().min(1).optional(),
    content: z.string().optional(),
    person: z.string().nullable().optional(),
    date: z.string().date().nullable().optional(),
    time: z.string().nullable().optional()
}).strict();

export const noteIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB note ID")
}).strict();

export const checkNoteSchema = z.object({
    title: z.string().trim().min(1, "Title is required")
}).strict();