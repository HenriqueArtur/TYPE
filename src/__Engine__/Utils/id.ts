import { nanoid } from "nanoid";

export function generateId(prefix?: string): string {
  if (prefix) {
    return `${prefix}_${nanoid()}`;
  }
  return nanoid();
}
