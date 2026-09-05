/**
 * Cryptographically Secure Short Code Generator (Base62)
 * Based on TechSpec Section 6.1 & Decisions Log PRD Section 15
 */

import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const SHORT_CODE_LENGTH = 7;
const MAX_COLLISION_ATTEMPTS = 5;

// Largest multiple of 62 below 256. Bytes >= 248 are discarded so that each
// of the 62 characters is exactly equally likely (no modulo bias).
const REJECTION_THRESHOLD = 62 * 4; // 248

/**
 * Generates a random Base62 string using CSPRNG (crypto.randomBytes).
 * Math.random() is strictly forbidden to prevent short code enumeration/prediction attacks.
 */
export function generateBase62Code(length: number = SHORT_CODE_LENGTH): string {
  let result = "";
  while (result.length < length) {
    const bytes = randomBytes((length - result.length) * 2);
    for (const byte of bytes) {
      if (byte >= REJECTION_THRESHOLD) continue;
      result += BASE62_CHARS[byte % BASE62_CHARS.length];
      if (result.length === length) break;
    }
  }
  return result;
}

/**
 * Generates a collision-checked unique short code against the database.
 * Retries up to MAX_COLLISION_ATTEMPTS before throwing an error.
 */
export async function generateUniqueShortCode(
  prismaClient: PrismaClient,
  length: number = SHORT_CODE_LENGTH
): Promise<string> {
  let code: string;
  let attempts = 0;

  do {
    code = generateBase62Code(length);
    const existing = await prismaClient.link.findUnique({
      where: { shortCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }

    attempts++;
  } while (attempts < MAX_COLLISION_ATTEMPTS);

  throw new Error(
    `Failed to generate a unique short code after ${MAX_COLLISION_ATTEMPTS} attempts.`
  );
}
