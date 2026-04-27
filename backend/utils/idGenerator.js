import crypto from "crypto";

/**
 * Generate numeric-only custom ID after prefix
 * Format: ORD + DDMMYYHHmmss
 * Example: ORD260426123412
 */
export const generateCustomId = (prefix = "ORD") => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear().toString().slice(-2);

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();

    const numericPart = `${day}${month}${year}${hours}${minutes}${seconds}${randomPart}`;

    return `${prefix}${numericPart}`;
};