import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
    createAuthToken,
    hashPassword,
    verifyAuthToken,
    verifyPassword
} from "../services/auth.js";

const originalSecret = process.env.AUTH_TOKEN_SECRET;
process.env.AUTH_TOKEN_SECRET = "test-secret-that-is-at-least-32-characters";
after(() => {
    if (originalSecret === undefined) {
        delete process.env.AUTH_TOKEN_SECRET;
    } else {
        process.env.AUTH_TOKEN_SECRET = originalSecret;
    }
});

test("password hashes verify only the original password", async () => {
    const { salt, hash } = await hashPassword("correct horse battery staple");

    assert.equal(
        await verifyPassword("correct horse battery staple", salt, hash),
        true
    );
    assert.equal(await verifyPassword("wrong password", salt, hash), false);
});

test("auth tokens are signed and contain the user identity", () => {
    const token = createAuthToken("user-123");

    assert.equal(verifyAuthToken(token)?.sub, "user-123");
    assert.equal(verifyAuthToken(`${token}tampered`), null);
    assert.equal(verifyAuthToken("not-a-token"), null);
});
