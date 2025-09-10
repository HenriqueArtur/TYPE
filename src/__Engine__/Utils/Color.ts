/**
 * Converts a hex color string to a number compatible with PIXI.js Graphics
 * @param hex - Hex color string (e.g., "#ff0000", "ff0000", "#f00", "f00")
 * @returns Number representation of the color
 * @throws Error if the hex string is invalid
 */
export function hexToNumber(hex: string): number {
  // Remove # if present
  let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  // Validate hex string
  if (!cleanHex || !/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // Handle 3-digit hex colors (e.g., "f00" -> "ff0000")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Validate 6-digit hex
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color length: ${hex}. Expected 3 or 6 characters.`);
  }

  // Convert to number
  const number = parseInt(cleanHex, 16);

  if (Number.isNaN(number)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return number;
}

/**
 * Converts a number to a hex color string
 * @param number - Number representation of the color (0-16777215)
 * @returns Hex color string with # prefix (e.g., "#ff0000")
 * @throws Error if the number is invalid
 */
export function numberToHex(number: number): string {
  // Validate input
  if (!Number.isInteger(number) || number < 0 || number > 0xffffff) {
    throw new Error(`Invalid color number: ${number}. Must be an integer between 0 and 16777215.`);
  }

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid color number: ${number}. Must be a finite number.`);
  }

  // Convert to hex and pad with zeros
  const hex = number.toString(16).toLowerCase().padStart(6, "0");

  return `#${hex}`;
}

/**
 * Common color constants for convenience
 */
export const Colors = {
  // Basic colors
  BLACK: 0x000000,
  WHITE: 0xffffff,
  RED: 0xff0000,
  GREEN: 0x00ff00,
  BLUE: 0x0000ff,
  YELLOW: 0xffff00,
  CYAN: 0x00ffff,
  MAGENTA: 0xff00ff,

  // Grays
  GRAY: 0x808080,
  LIGHT_GRAY: 0xc0c0c0,
  DARK_GRAY: 0x404040,

  // Common UI colors
  TRANSPARENT: 0x000000, // Use with alpha
} as const;
