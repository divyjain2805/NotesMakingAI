import {
    createHmac,
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_KEY_LENGTH = 64;

const getTokenSecret = () => {
    const secret = process.env.AUTH_TOKEN_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters");
    }
    return secret;
};

export const assertAuthConfig = () => {
    getTokenSecret();
};

export const hashPassword = async (password) => {
    const salt = randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, PASSWORD_KEY_LENGTH);
    return { salt, hash: hash.toString("hex") };
};

export const verifyPassword = async (password, salt, expectedHash) => {
    const actualHash = await scrypt(password, salt, PASSWORD_KEY_LENGTH);
    const expected = Buffer.from(expectedHash, "hex");
    return expected.length === actualHash.length &&
        timingSafeEqual(actualHash, expected);
};

const sign = (value) =>
    createHmac("sha256", getTokenSecret()).update(value).digest("base64url");

export const createAuthToken = (userId) => {
    const payload = Buffer.from(
        JSON.stringify({
            sub: userId,
            exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
        })
    ).toString("base64url");
    return `${payload}.${sign(payload)}`;
};

export const verifyAuthToken = (token) => {
    if (typeof token !== "string") return null;

    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) return null;

    const expectedSignature = Buffer.from(sign(payload), "base64url");
    const providedSignature = Buffer.from(signature, "base64url");
    if (
        expectedSignature.length !== providedSignature.length ||
        !timingSafeEqual(expectedSignature, providedSignature)
    ) {
        return null;
    }

    try {
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
        if (
            typeof claims.sub !== "string" ||
            !Number.isInteger(claims.exp) ||
            claims.exp <= Math.floor(Date.now() / 1000)
        ) {
            return null;
        }
        return claims;
    } catch {
        return null;
    }
};
