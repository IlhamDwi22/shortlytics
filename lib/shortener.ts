/**
 * Cryptographically Secure Short Code Generator (Base62)
 * Based on TechSpec Section 6.1 & Decisions Log PRD Section 15
 */

import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const BASE62_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const SHORT_CODE_LENGTH = 7;
const MAX_COLLISION_ATTEMPTS = 5;

/**
 * Generates a random Base62 string using CSPRNG (crypto.randomBytes).
 * Math.random() is strictly forbidden to prevent short code enumeration/prediction attacks.
 */
export function generateBase62Code(length: number = SHORT_CODE_LENGTH): string {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
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
