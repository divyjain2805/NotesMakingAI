import { verifyAuthToken } from "../services/auth.js";

export const requireAuth = (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const claims = match ? verifyAuthToken(match[1]) : null;

    if (!claims) {
        return res.status(401).json({
            success: false,
            message: "Please sign in to continue"
        });
    }

    req.userId = claims.sub;
    return next();
};
