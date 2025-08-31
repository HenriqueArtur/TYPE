import { beforeEach, describe, expect, it, vi } from "vitest";
import { TimeEngine } from "./TimeEngine";

// Mock performance.now for consistent timing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, "performance", {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();
Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
  writable: true,
});
Object.defineProperty(global, "cancelAnimationFrame", {
  value: mockCancelAnimationFrame,
  writable: true,
});

describe("TimeEngine", () => {
  let timeEngine: TimeEngine;
  let mockFunction1: ReturnType<typeof vi.fn>;
  let mockFunction2: ReturnType<typeof vi.fn>;
  let mockFixedFunction1: ReturnType<typeof vi.fn>;
  let mockFixedFunction2: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    timeEngine = new TimeEngine(); // Default 60 FPS
    mockFunction1 = vi.fn();
    mockFunction2 = vi.fn();
    mockFixedFunction1 = vi.fn();
    mockFixedFunction2 = vi.fn();

    // Reset performance.now to return predictable values
    mockPerformanceNow.mockReturnValue(0);

    // Mock requestAnimationFrame to not actually schedule frames
    mockRequestAnimationFrame.mockImplementation((_callback) => {
      // Store the callback for manual triggering in tests
      return 1;
    });
  });

  describe("constructor", () => {
    it("should initialize with empty function list", () => {
      expect(timeEngine.getFunctionCount()).toBe(0);
    });

    it("should initialize with stopped state", () => {
      expect(timeEngine.getIsRunning()).toBe(false);
    });

    it("should initialize with empty fixed function list", () => {
      expect(timeEngine.getFixedFunctionCount()).toBe(0);
    });

    it("should initialize with default fixed timestep (60 FPS)", () => {
      expect(timeEngine.getFixedTimeStep()).toBeCloseTo(1000 / 60, 2);
    });

    it("should initialize with custom fixed FPS when specified", () => {
      const customEngine = new TimeEngine({ fixedFps: 30 });
      expect(customEngine.getFixedTimeStep()).toBeCloseTo(1000 / 30, 2);
    });

    it("should initialize with different custom fixed FPS rates", () => {
      const engine120fps = new TimeEngine({ fixedFps: 120 });
      expect(engine120fps.getFixedTimeStep()).toBeCloseTo(1000 / 120, 2);

      const engine10fps = new TimeEngine({ fixedFps: 10 });
      expect(engine10fps.getFixedTimeStep()).toBeCloseTo(1000 / 10, 2);
    });
  });

  describe("add", () => {
    it("should add a function to the list", () => {
      timeEngine.add(mockFunction1);

      expect(timeEngine.getFunctionCount()).toBe(1);
    });

    it("should add multiple functions to the list", () => {
      timeEngine.add(mockFunction1);
      timeEngine.add(mockFunction2);

      expect(timeEngine.getFunctionCount()).toBe(2);
    });

    it("should allow adding the same function multiple times", () => {
      timeEngine.add(mockFunction1);
      timeEngine.add(mockFunction1);

      expect(timeEngine.getFunctionCount()).toBe(2);
    });
  });

  describe("remove", () => {
    beforeEach(() => {
      timeEngine.add(mockFunction1);
      timeEngine.add(mockFunction2);
    });

    it("should remove a function from the list", () => {
      timeEngine.remove(mockFunction1);

      expect(timeEngine.getFunctionCount()).toBe(1);
    });

    it("should remove only the first occurrence of a function", () => {
      timeEngine.add(mockFunction1);
      timeEngine.remove(mockFunction1);

      expect(timeEngine.getFunctionCount()).toBe(2);
    });

    it("should do nothing when removing non-existent function", () => {
      const nonExistentFunction = vi.fn();
      timeEngine.remove(nonExistentFunction);

      expect(timeEngine.getFunctionCount()).toBe(2);
    });

    it("should handle removing from empty list", () => {
      const emptyEngine = new TimeEngine();
      emptyEngine.remove(mockFunction1);

      expect(emptyEngine.getFunctionCount()).toBe(0);
    });
  });

  describe("addFixed", () => {
    it("should add a function to the fixed timestep list", () => {
      timeEngine.addFixed(mockFixedFunction1);

      expect(timeEngine.getFixedFunctionCount()).toBe(1);
    });

    it("should add multiple functions to the fixed timestep list", () => {
      timeEngine.addFixed(mockFixedFunction1);
      timeEngine.addFixed(mockFixedFunction2);

      expect(timeEngine.getFixedFunctionCount()).toBe(2);
    });

    it("should use constructor-defined fixed timestep", () => {
      timeEngine.addFixed(mockFixedFunction1);

      expect(timeEngine.getFixedTimeStep()).toBeCloseTo(1000 / 60, 2);
    });

    it("should work with custom constructor FPS", () => {
      const customEngine = new TimeEngine({ fixedFps: 30 });
      customEngine.addFixed(mockFixedFunction1);

      expect(customEngine.getFixedTimeStep()).toBeCloseTo(1000 / 30, 2);
      expect(customEngine.getFixedFunctionCount()).toBe(1);
    });
  });

  describe("removeFixed", () => {
    beforeEach(() => {
      timeEngine.addFixed(mockFixedFunction1);
      timeEngine.addFixed(mockFixedFunction2);
    });

    it("should remove a function from the fixed timestep list", () => {
      timeEngine.removeFixed(mockFixedFunction1);

      expect(timeEngine.getFixedFunctionCount()).toBe(1);
    });

    it("should remove only the first occurrence of a function", () => {
      timeEngine.addFixed(mockFixedFunction1);
      timeEngine.removeFixed(mockFixedFunction1);

      expect(timeEngine.getFixedFunctionCount()).toBe(2);
    });

    it("should do nothing when removing non-existent function", () => {
      const nonExistentFunction = vi.fn();
      timeEngine.removeFixed(nonExistentFunction);

      expect(timeEngine.getFixedFunctionCount()).toBe(2);
    });
  });

  describe("clear", () => {
    it("should remove all functions (variable and fixed)", () => {
      timeEngine.add(mockFunction1);
      timeEngine.add(mockFunction2);
      timeEngine.addFixed(mockFixedFunction1);
      timeEngine.addFixed(mockFixedFunction2);

      timeEngine.clear();

      expect(timeEngine.getFunctionCount()).toBe(0);
      expect(timeEngine.getFixedFunctionCount()).toBe(0);
    });

    it("should work on empty lists", () => {
      timeEngine.clear();

      expect(timeEngine.getFunctionCount()).toBe(0);
      expect(timeEngine.getFixedFunctionCount()).toBe(0);
    });
  });

  describe("start", () => {
    it("should set running state to true", () => {
      timeEngine.start();

      expect(timeEngine.getIsRunning()).toBe(true);
    });

    it("should call requestAnimationFrame", () => {
      timeEngine.start();

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should do nothing when already running", () => {
      timeEngine.start();
      timeEngine.start();

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it("should initialize lastTime with performance.now", () => {
      mockPerformanceNow.mockReturnValue(1000);

      timeEngine.start();

      expect(mockPerformanceNow).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should set running state to false", () => {
      timeEngine.start();
      timeEngine.stop();

      expect(timeEngine.getIsRunning()).toBe(false);
    });

    it("should cancel animation frame when running", () => {
      mockRequestAnimationFrame.mockReturnValue(123);
      timeEngine.start();

      timeEngine.stop();

      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    it("should work when not running", () => {
      timeEngine.stop();

      expect(timeEngine.getIsRunning()).toBe(false);
      expect(mockCancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("update loop", () => {
    it("should call registered functions with delta time", () => {
      timeEngine.add(mockFunction1);
      timeEngine.add(mockFunction2);

      // Mock time progression
      mockPerformanceNow.mockReturnValueOnce(0); // start time
      mockPerformanceNow.mockReturnValueOnce(16.67); // first update (60fps)

      timeEngine.start();

      // Manually trigger the update loop
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(16.67);
      expect(mockFunction2).toHaveBeenCalledWith(16.67);
    });

    it("should calculate correct delta time between frames", () => {
      timeEngine.add(mockFunction1);

      mockPerformanceNow
        .mockReturnValueOnce(100) // start time
        .mockReturnValueOnce(116.67) // first update
        .mockReturnValueOnce(133.34); // second update

      timeEngine.start();

      // First update
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(16.67);

      // Second update
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(16.67);
    });

    it("should schedule next frame when running", () => {
      timeEngine.add(mockFunction1);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockRequestAnimationFrame.mockClear();

      updateCallback();

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it("should not schedule next frame when stopped", () => {
      timeEngine.add(mockFunction1);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      timeEngine.stop();
      mockRequestAnimationFrame.mockClear();

      updateCallback();

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it("should handle function errors gracefully", () => {
      const errorFunction = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      timeEngine.add(errorFunction);
      timeEngine.add(mockFunction1);

      mockPerformanceNow.mockReturnValueOnce(0);
      mockPerformanceNow.mockReturnValueOnce(16);

      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      updateCallback();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Error in TimeEngine function:",
        expect.any(Error),
      );
      expect(mockFunction1).toHaveBeenCalledWith(16); // Other functions should still be called

      consoleWarnSpy.mockRestore();
    });
  });

  describe("fixed timestep update loop", () => {
    it("should call fixed functions at exact intervals", () => {
      timeEngine.addFixed(mockFixedFunction1); // Default 60 FPS = 16.67ms intervals

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      // First update with 16.67ms - should trigger one fixed update
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(16.67);
      updateCallback();

      expect(mockFixedFunction1).toHaveBeenCalledTimes(1);
      expect(mockFixedFunction1).toHaveBeenCalledWith(1000 / 60);
    });

    it("should call fixed functions multiple times for large delta", () => {
      timeEngine.addFixed(mockFixedFunction1); // Default 60 FPS = 16.67ms intervals

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      // Update with 50ms - should trigger 2 fixed updates (50 / 16.67 = 2.99, so 2 calls)
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(50);
      updateCallback();

      expect(mockFixedFunction1).toHaveBeenCalledTimes(2);
    });

    it("should not call fixed functions for small delta", () => {
      timeEngine.addFixed(mockFixedFunction1); // Default 60 FPS = 16.67ms intervals

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      // Update with 10ms - should not trigger any fixed updates
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(10);
      updateCallback();

      expect(mockFixedFunction1).not.toHaveBeenCalled();
    });

    it("should accumulate time across frames", () => {
      timeEngine.addFixed(mockFixedFunction1); // Default 60 FPS = 16.67ms intervals

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];

      // First update: 10ms (not enough for fixed update)
      mockPerformanceNow.mockReturnValueOnce(10);
      updateCallback();
      expect(mockFixedFunction1).not.toHaveBeenCalled();

      // Second update: 8ms more (total 18ms, should trigger one fixed update)
      mockPerformanceNow.mockReturnValueOnce(18);
      updateCallback();
      expect(mockFixedFunction1).toHaveBeenCalledTimes(1);
    });

    it("should call both variable and fixed functions", () => {
      timeEngine.add(mockFunction1);
      timeEngine.addFixed(mockFixedFunction1);

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(16.67);
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(16.67); // Variable timestep
      expect(mockFixedFunction1).toHaveBeenCalledWith(1000 / 60); // Fixed timestep
    });

    it("should handle different fixed timestep rates from constructor", () => {
      const customEngine = new TimeEngine({ fixedFps: 30 }); // 33.33ms intervals
      customEngine.addFixed(mockFixedFunction1);

      mockPerformanceNow.mockReturnValueOnce(0);
      customEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(34); // Use 34ms to ensure it triggers
      updateCallback();

      expect(mockFixedFunction1).toHaveBeenCalledWith(1000 / 30);
    });

    it("should handle fixed function errors gracefully", () => {
      const errorFixedFunction = vi.fn().mockImplementation(() => {
        throw new Error("Fixed function error");
      });
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      timeEngine.addFixed(errorFixedFunction);
      timeEngine.addFixed(mockFixedFunction1);

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(16.67);
      updateCallback();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Error in TimeEngine fixed function:",
        expect.any(Error),
      );
      expect(mockFixedFunction1).toHaveBeenCalled(); // Other fixed functions should still be called

      consoleWarnSpy.mockRestore();
    });
  });

  describe("start after stop", () => {
    it("should resume calling functions when restarted", () => {
      timeEngine.add(mockFunction1);

      // Start and then stop
      timeEngine.start();
      timeEngine.stop();

      // Clear previous calls
      mockFunction1.mockClear();
      mockRequestAnimationFrame.mockClear();

      // Restart
      mockPerformanceNow.mockReturnValue(200);
      timeEngine.start();

      expect(timeEngine.getIsRunning()).toBe(true);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      // Trigger update after restart
      mockPerformanceNow.mockReturnValue(216);
      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(16);
    });

    it("should reset lastTime when restarted", () => {
      timeEngine.add(mockFunction1);

      // First run
      mockPerformanceNow.mockReturnValue(100);
      timeEngine.start();

      const firstUpdateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValue(150);
      firstUpdateCallback();

      timeEngine.stop();
      mockRequestAnimationFrame.mockClear();
      mockFunction1.mockClear();

      // Second run with different starting time
      mockPerformanceNow.mockReturnValue(1000); // New start time
      timeEngine.start();

      const secondUpdateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValue(1020); // 20ms later
      secondUpdateCallback();

      expect(mockFunction1).toHaveBeenLastCalledWith(20);
    });
  });

  describe("edge cases", () => {
    it("should handle zero delta time", () => {
      timeEngine.add(mockFunction1);

      mockPerformanceNow.mockReturnValue(100);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      // Same time = 0 delta
      mockPerformanceNow.mockReturnValue(100);
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(0);
    });

    it("should handle negative delta time (clock adjustments)", () => {
      timeEngine.add(mockFunction1);

      mockPerformanceNow.mockReturnValue(100);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValue(50); // Time went backwards
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(-50);
    });

    it("should handle large delta time", () => {
      timeEngine.add(mockFunction1);

      mockPerformanceNow.mockReturnValueOnce(0);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValueOnce(5000); // 5 seconds later
      updateCallback();

      expect(mockFunction1).toHaveBeenCalledWith(5000);
    });

    it("should work with no registered functions", () => {
      mockPerformanceNow.mockReturnValue(100);
      timeEngine.start();

      const updateCallback = mockRequestAnimationFrame.mock.calls[0][0];
      mockPerformanceNow.mockReturnValue(116);

      expect(() => updateCallback()).not.toThrow();
    });
  });

  describe("function count and state queries", () => {
    it("should return correct function count", () => {
      expect(timeEngine.getFunctionCount()).toBe(0);

      timeEngine.add(mockFunction1);
      expect(timeEngine.getFunctionCount()).toBe(1);

      timeEngine.add(mockFunction2);
      expect(timeEngine.getFunctionCount()).toBe(2);

      timeEngine.remove(mockFunction1);
      expect(timeEngine.getFunctionCount()).toBe(1);
    });

    it("should return correct fixed function count", () => {
      expect(timeEngine.getFixedFunctionCount()).toBe(0);

      timeEngine.addFixed(mockFixedFunction1);
      expect(timeEngine.getFixedFunctionCount()).toBe(1);

      timeEngine.addFixed(mockFixedFunction2);
      expect(timeEngine.getFixedFunctionCount()).toBe(2);

      timeEngine.removeFixed(mockFixedFunction1);
      expect(timeEngine.getFixedFunctionCount()).toBe(1);
    });

    it("should return correct fixed timestep", () => {
      expect(timeEngine.getFixedTimeStep()).toBeCloseTo(1000 / 60, 2);

      const customEngine = new TimeEngine({ fixedFps: 30 });
      expect(customEngine.getFixedTimeStep()).toBeCloseTo(1000 / 30, 2);
    });

    it("should return correct running state", () => {
      expect(timeEngine.getIsRunning()).toBe(false);

      timeEngine.start();
      expect(timeEngine.getIsRunning()).toBe(true);

      timeEngine.stop();
      expect(timeEngine.getIsRunning()).toBe(false);
    });
  });
});
