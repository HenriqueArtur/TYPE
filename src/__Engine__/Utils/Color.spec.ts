import { describe, expect, it } from "vitest";
import { hexToNumber, numberToHex } from "./Color";

describe("Color Utilities", () => {
  describe("hexToNumber", () => {
    it("should convert 6-digit hex color with # to number", () => {
      expect(hexToNumber("#ff0000")).toBe(16711680); // Red
      expect(hexToNumber("#00ff00")).toBe(65280); // Green
      expect(hexToNumber("#0000ff")).toBe(255); // Blue
      expect(hexToNumber("#ffffff")).toBe(16777215); // White
      expect(hexToNumber("#000000")).toBe(0); // Black
    });

    it("should convert 6-digit hex color without # to number", () => {
      expect(hexToNumber("ff0000")).toBe(16711680); // Red
      expect(hexToNumber("00ff00")).toBe(65280); // Green
      expect(hexToNumber("0000ff")).toBe(255); // Blue
      expect(hexToNumber("ffffff")).toBe(16777215); // White
      expect(hexToNumber("000000")).toBe(0); // Black
    });

    it("should convert 3-digit hex color with # to number", () => {
      expect(hexToNumber("#f00")).toBe(16711680); // Red (#f00 -> #ff0000)
      expect(hexToNumber("#0f0")).toBe(65280); // Green (#0f0 -> #00ff00)
      expect(hexToNumber("#00f")).toBe(255); // Blue (#00f -> #0000ff)
      expect(hexToNumber("#fff")).toBe(16777215); // White (#fff -> #ffffff)
      expect(hexToNumber("#000")).toBe(0); // Black (#000 -> #000000)
    });

    it("should convert 3-digit hex color without # to number", () => {
      expect(hexToNumber("f00")).toBe(16711680); // Red
      expect(hexToNumber("0f0")).toBe(65280); // Green
      expect(hexToNumber("00f")).toBe(255); // Blue
      expect(hexToNumber("fff")).toBe(16777215); // White
      expect(hexToNumber("000")).toBe(0); // Black
    });

    it("should handle mixed case hex colors", () => {
      expect(hexToNumber("#Ff0000")).toBe(16711680); // Red
      expect(hexToNumber("#00FF00")).toBe(65280); // Green
      expect(hexToNumber("#0000FF")).toBe(255); // Blue
      expect(hexToNumber("A6A6A6")).toBe(10921638); // Gray
    });

    it("should throw error for invalid hex colors", () => {
      expect(() => hexToNumber("")).toThrow();
      expect(() => hexToNumber("#")).toThrow();
      expect(() => hexToNumber("#12")).toThrow();
      expect(() => hexToNumber("#1234")).toThrow();
      expect(() => hexToNumber("#12345")).toThrow();
      expect(() => hexToNumber("#1234567")).toThrow();
      expect(() => hexToNumber("#gggggg")).toThrow();
      expect(() => hexToNumber("xyz")).toThrow();
    });
  });

  describe("numberToHex", () => {
    it("should convert number to 6-digit hex color with #", () => {
      expect(numberToHex(16711680)).toBe("#ff0000"); // Red
      expect(numberToHex(65280)).toBe("#00ff00"); // Green
      expect(numberToHex(255)).toBe("#0000ff"); // Blue
      expect(numberToHex(16777215)).toBe("#ffffff"); // White
      expect(numberToHex(0)).toBe("#000000"); // Black
    });

    it("should pad with zeros for small numbers", () => {
      expect(numberToHex(1)).toBe("#000001");
      expect(numberToHex(15)).toBe("#00000f");
      expect(numberToHex(255)).toBe("#0000ff");
      expect(numberToHex(4095)).toBe("#000fff");
    });

    it("should handle gray colors correctly", () => {
      expect(numberToHex(10921638)).toBe("#a6a6a6"); // Gray
      expect(numberToHex(8421504)).toBe("#808080"); // Medium gray
      expect(numberToHex(12632256)).toBe("#c0c0c0"); // Silver
    });

    it("should return lowercase hex", () => {
      expect(numberToHex(16711680)).toBe("#ff0000"); // Lowercase
      expect(numberToHex(10921638)).toBe("#a6a6a6"); // Lowercase
    });

    it("should throw error for invalid numbers", () => {
      expect(() => numberToHex(-1)).toThrow();
      expect(() => numberToHex(16777216)).toThrow(); // > 0xFFFFFF
      expect(() => numberToHex(NaN)).toThrow();
      expect(() => numberToHex(Infinity)).toThrow();
    });

    it("should handle edge cases", () => {
      expect(numberToHex(0)).toBe("#000000"); // Minimum
      expect(numberToHex(16777215)).toBe("#ffffff"); // Maximum (0xFFFFFF)
    });
  });

  describe("round trip conversions", () => {
    it("should maintain consistency when converting back and forth", () => {
      const testColors = [
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffffff",
        "#000000",
        "#a6a6a6",
        "#123456",
        "#abcdef",
        "#f0f0f0",
      ];

      testColors.forEach((hex) => {
        const number = hexToNumber(hex);
        const backToHex = numberToHex(number);
        expect(backToHex).toBe(hex.toLowerCase());
      });
    });

    it("should maintain consistency with 3-digit hex colors", () => {
      const testColors = ["#f00", "#0f0", "#00f", "#fff", "#000"];
      const expected = ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"];

      testColors.forEach((hex, index) => {
        const number = hexToNumber(hex);
        const backToHex = numberToHex(number);
        expect(backToHex).toBe(expected[index]);
      });
    });
  });
});
