import express from "express";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
    createAuthToken,
    hashPassword,
    verifyPassword
} from "../services/auth.js";

const router = express.Router();

const credentialsSchema = z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(8).max(128)
}).strict();

const publicUser = (user) => ({
    id: user._id.toString(),
    email: user.email
});

router.post("/register", async (req, res) => {
    const validation = credentialsSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email and a password of at least 8 characters"
        });
    }

    try {
        const { email, password } = validation.data;
        const existingUser = await User.exists({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const { salt, hash } = await hashPassword(password);
        const user = await User.create({
            email,
            passwordSalt: salt,
            passwordHash: hash
        });
        return res.status(201).json({
            success: true,
            user: publicUser(user),
            token: createAuthToken(user._id.toString())
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }
        console.error("Account registration failed:", error);
        return res.status(500).json({
            success: false,
            message: "Could not create your account"
        });
    }
});

router.post("/login", async (req, res) => {
    const validation = credentialsSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email and password"
        });
    }

    try {
        const { email, password } = validation.data;
        const user = await User.findOne({ email })
            .select("+passwordHash +passwordSalt");
        const passwordMatches = user
            ? await verifyPassword(password, user.passwordSalt, user.passwordHash)
            : false;

        if (!user || !passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Email or password is incorrect"
            });
        }

        return res.status(200).json({
            success: true,
            user: publicUser(user),
            token: createAuthToken(user._id.toString())
        });
    } catch (error) {
        console.error("Account sign-in failed:", error);
        return res.status(500).json({
            success: false,
            message: "Could not sign in"
        });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("email");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Your account is no longer available"
            });
        }
        return res.status(200).json({ success: true, user: publicUser(user) });
    } catch (error) {
        console.error("Account lookup failed:", error);
        return res.status(500).json({
            success: false,
            message: "Could not verify your account"
        });
    }
});

export default router;
