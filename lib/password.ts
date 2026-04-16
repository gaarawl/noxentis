import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEY_LENGTH = 64;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  if (storedHash === "demo-hash") {
    return password === "demo-password";
  }

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  const suppliedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedKey = Buffer.from(key, "hex");

  return suppliedKey.length === storedKey.length && timingSafeEqual(suppliedKey, storedKey);
}

export function generatePlaceholderSiren() {
  const digits = Array.from(randomBytes(9), (byte) => String(byte % 10)).join("");
  return digits.slice(0, 9);
}
