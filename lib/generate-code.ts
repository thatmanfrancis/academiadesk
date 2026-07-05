import { randomBytes } from "crypto";

/**
 * Generates a unique 8-character uppercase hex application code.
 * e.g. "3F8A2C1D"
 * Collisions are astronomically rare (16^8 = 4 billion combinations)
 * but callers can retry if a unique constraint violation occurs.
 */
export function generateApplicationCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}
