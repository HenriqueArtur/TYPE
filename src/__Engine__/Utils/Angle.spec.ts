import { describe, expect, it } from "vitest";
import { Angle } from "./Angle";

describe("Angle", () => {
  describe("constructor", () => {
    it("should create angle from radians", () => {
      const angle = new Angle(Math.PI / 2);
      expect(angle.radians).toBe(Math.PI / 2);
    });
  });

  describe("fromDegrees", () => {
    it("should create angle from degrees", () => {
      const angle = Angle.fromDegrees(90);
      expect(angle.degrees).toBeCloseTo(90);
      expect(angle.radians).toBeCloseTo(Math.PI / 2);
    });

    it("should handle negative degrees", () => {
      const angle = Angle.fromDegrees(-90);
      expect(angle.degrees).toBeCloseTo(-90);
    });

    it("should handle zero degrees", () => {
      const angle = Angle.fromDegrees(0);
      expect(angle.degrees).toBe(0);
      expect(angle.radians).toBe(0);
    });
  });

  describe("degrees getter", () => {
    it("should convert radians to degrees correctly", () => {
      const angle = new Angle(Math.PI);
      expect(angle.degrees).toBeCloseTo(180);
    });

    it("should handle full circle", () => {
      const angle = new Angle(2 * Math.PI);
      expect(angle.degrees).toBeCloseTo(360);
    });
  });

  describe("fromRadians static method", () => {
    it("should create angle from radians", () => {
      const angle = Angle.fromRadians(Math.PI / 2);
      expect(angle.radians).toBeCloseTo(Math.PI / 2);
      expect(angle.degrees).toBeCloseTo(90);
    });

    it("should handle zero radians", () => {
      const angle = Angle.fromRadians(0);
      expect(angle.radians).toBe(0);
      expect(angle.degrees).toBe(0);
    });

    it("should handle negative radians", () => {
      const angle = Angle.fromRadians(-Math.PI / 4);
      expect(angle.radians).toBeCloseTo(-Math.PI / 4);
      expect(angle.degrees).toBeCloseTo(-45);
    });
  });

  describe("trigonometric functions", () => {
    it("should calculate sin correctly", () => {
      const angle90 = Angle.fromDegrees(90);
      const angle30 = Angle.fromDegrees(30);
      const angle0 = Angle.fromDegrees(0);

      expect(angle90.sin()).toBeCloseTo(1);
      expect(angle30.sin()).toBeCloseTo(0.5);
      expect(angle0.sin()).toBeCloseTo(0);
    });

    it("should calculate cos correctly", () => {
      const angle0 = Angle.fromDegrees(0);
      const angle60 = Angle.fromDegrees(60);
      const angle90 = Angle.fromDegrees(90);

      expect(angle0.cos()).toBeCloseTo(1);
      expect(angle60.cos()).toBeCloseTo(0.5);
      expect(angle90.cos()).toBeCloseTo(0);
    });

    it("should calculate tan correctly", () => {
      const angle0 = Angle.fromDegrees(0);
      const angle45 = Angle.fromDegrees(45);

      expect(angle0.tan()).toBeCloseTo(0);
      expect(angle45.tan()).toBeCloseTo(1);
    });
  });

  describe("edge cases", () => {
    it("should handle very small angles", () => {
      const angle = Angle.fromDegrees(0.001);
      expect(angle.degrees).toBeCloseTo(0.001);
    });

    it("should handle very large angles", () => {
      const angle = Angle.fromDegrees(720);
      expect(angle.degrees).toBeCloseTo(720);
    });

    it("should maintain precision in conversions", () => {
      const originalDegrees = 123.456789;
      const angle = Angle.fromDegrees(originalDegrees);
      expect(angle.degrees).toBeCloseTo(originalDegrees, 6);
    });
  });
});
