import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import connectDB from "./db/connectdb.js";

import assistantRoutes from "./routes/assistantRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { assertAuthConfig } from "./services/auth.js";

const app = express();

const allowedOrigins = new Set([
    process.env.FRONTEND_URL,
    ...(process.env.NODE_ENV === "production"
        ? []
        : ["http://localhost:5173", "http://127.0.0.1:5173"])
].filter(Boolean));

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    }
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "ai notes making" });
});

app.use("/api/auth", authRoutes);
app.use("/api/assistant", requireAuth, assistantRoutes);
app.use("/api/notes", requireAuth, notesRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    assertAuthConfig();
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();



