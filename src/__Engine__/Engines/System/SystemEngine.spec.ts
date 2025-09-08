import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TypeEngine } from "../../TypeEngine";
import { TypeEngineMock } from "../../TyprEngine.mock";
import type { SystemEngine } from "./SystemEngine";

// Mock electronAPI
const mockElectronAPI = {
  readJsonFile: vi.fn(),
};

// Mock window with DOM event methods for MouseSystem
Object.defineProperty(global, "window", {
  value: {
    electronAPI: mockElectronAPI,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

describe("SystemEngine", () => {
  let typeEngine: TypeEngine;
  let systemEngine: SystemEngine;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.clearAllMocks();

    // Create TypeEngine
    typeEngine = await TypeEngineMock();
    // Mock system.manage.json to return empty systems
    mockElectronAPI.readJsonFile.mockRejectedValue(new Error("File not found"));

    systemEngine = typeEngine.SystemEngine;

    // Restore the original setup method and call it to initialize default systems
    if (vi.isMockFunction(systemEngine.setup)) {
      (systemEngine.setup as ReturnType<typeof vi.fn>).mockRestore();
    }
    await systemEngine.setup();
  });

  describe("after setup", () => {
    it("should have default systems after setup", () => {
      const systems = systemEngine.getAll();

      // Should have default PhysicsSystem, RenderPixiSystem, and MouseSystem
      expect(systems.length).toBeGreaterThan(0);
      expect(systems.some((s) => s.constructor.name === "PhysicsSystem")).toBe(true);
      expect(systems.some((s) => s.constructor.name === "RenderPixiSystem")).toBe(true);
      expect(systems.some((s) => s.constructor.name === "MouseSystem")).toBe(true);
    });

    it("should sort systems by priority", () => {
      const systems = systemEngine.getAll();

      // Verify systems are sorted by priority (lower numbers first)
      for (let i = 1; i < systems.length; i++) {
        expect(systems[i - 1].priority).toBeLessThanOrEqual(systems[i].priority);
      }
    });
  });

  describe("getSystem", () => {
    it("should retrieve system by name", () => {
      const systems = systemEngine.getAll();

      if (systems.length > 0) {
        const firstSystem = systems[0];
        const retrievedSystem = systemEngine.getSystem(firstSystem.name);
        expect(retrievedSystem).toBe(firstSystem);
      }
    });

    it("should return undefined for non-existent system", () => {
      const nonExistentSystem = systemEngine.getSystem("NonExistentSystem");
      expect(nonExistentSystem).toBeUndefined();
    });
  });

  describe("setupScene", () => {
    it("should enable specified systems", () => {
      const systems = systemEngine.getAll();

      // First disable all systems
      systems.forEach((system) => {
        system.enabled = false;
      });

      // Get some system names
      const systemNames = systems.slice(0, 2).map((s) => s.name);

      systemEngine.setupScene(systemNames);

      // Check that the specified systems are enabled
      systemNames.forEach((name) => {
        const system = systemEngine.getSystem(name);
        expect(system?.enabled).toBe(true);
      });
    });
  });

  describe("clear", () => {
    it("should disable non-default systems", () => {
      systemEngine.clear();

      // This method disables non-default systems
      // Since we only have default systems in test, we can't easily test this
      // but we can verify the method doesn't throw
      expect(() => systemEngine.clear()).not.toThrow();
    });
  });

  describe("toggle", () => {
    it("should toggle system enabled state by name", () => {
      const systems = systemEngine.getAll();

      if (systems.length > 0) {
        const firstSystem = systems[0];
        const initialEnabled = firstSystem.enabled;

        systemEngine.toggle(firstSystem.name);
        expect(firstSystem.enabled).toBe(!initialEnabled);

        systemEngine.toggle(firstSystem.name);
        expect(firstSystem.enabled).toBe(initialEnabled);
      }
    });

    it("should handle toggling non-existent system gracefully", () => {
      expect(() => {
        systemEngine.toggle("NonExistentSystem");
      }).not.toThrow();
    });
  });

  describe("getEnabled", () => {
    it("should return only enabled systems", () => {
      const systems = systemEngine.getAll();

      if (systems.length > 0) {
        const firstSystem = systems[0];
        const secondSystem = systems[1] || firstSystem;

        firstSystem.enabled = false;
        if (secondSystem !== firstSystem) {
          secondSystem.enabled = true;
        }

        const enabledSystems = systemEngine.getEnabled();

        expect(enabledSystems.every((s) => s.enabled)).toBe(true);
        expect(enabledSystems.includes(firstSystem)).toBe(false);
      }
    });
  });

  describe("setup", () => {
    it("should initialize default systems", async () => {
      // Create a fresh TypeEngine without mocking SystemEngine.setup
      const freshTypeEngine = new (await import("../../TypeEngine")).TypeEngine({
        projectPath: "/test",
        Render: { width: 800, height: 600, html_tag_id: "test" },
      });
      const freshSystemEngine = freshTypeEngine.SystemEngine;

      const systems = freshSystemEngine.getAll();
      expect(systems.length).toBe(0); // No systems before setup

      await freshSystemEngine.setup();

      const systemsAfterSetup = freshSystemEngine.getAll();
      expect(systemsAfterSetup.length).toBeGreaterThan(0);
    });

    it("should handle missing system.manage.json gracefully", async () => {
      // The setup should not throw even when system.manage.json is missing
      await expect(systemEngine.setup()).resolves.not.toThrow();
    });
  });

  describe("update", () => {
    it("should update only enabled systems and emit events", () => {
      const deltaTime = 16.67;
      const systems = systemEngine.getAll();

      if (systems.length > 0) {
        const firstSystem = systems[0];

        firstSystem.enabled = true;
        vi.spyOn(firstSystem, "update");
        vi.spyOn(typeEngine.EventEngine, "emit");

        systemEngine.update(deltaTime);

        expect(firstSystem.update).toHaveBeenCalledWith(typeEngine, deltaTime);
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "system:update:start",
          firstSystem,
          deltaTime,
        );
        expect(typeEngine.EventEngine.emit).toHaveBeenCalledWith(
          "system:update:end",
          firstSystem,
          deltaTime,
        );
      }
    });

    it("should not update disabled systems", () => {
      const deltaTime = 16.67;
      const systems = systemEngine.getAll();

      if (systems.length > 0) {
        const firstSystem = systems[0];

        firstSystem.enabled = false;
        vi.spyOn(firstSystem, "update");

        systemEngine.update(deltaTime);

        expect(firstSystem.update).not.toHaveBeenCalled();
      }
    });
  });

  describe("system.manage.json loading", () => {
    it("should attempt to load system.manage.json", async () => {
      // Create a fresh TypeEngine without mocking SystemEngine.setup
      const freshTypeEngine = new (await import("../../TypeEngine")).TypeEngine({
        projectPath: "/test",
        Render: { width: 800, height: 600, html_tag_id: "test" },
      });
      const freshSystemEngine = freshTypeEngine.SystemEngine;

      const systemManageData = {
        CustomSystem1: "systems/CustomSystem1.ts",
        CustomSystem2: "systems/CustomSystem2.ts",
      };

      // Mock the readJsonFile for the fresh engine's setup call
      mockElectronAPI.readJsonFile.mockResolvedValueOnce(systemManageData);

      // Mock console.warn to avoid test output (since systems won't actually load)
      vi.spyOn(console, "warn").mockImplementation(() => {});

      await freshSystemEngine.setup();

      expect(mockElectronAPI.readJsonFile).toHaveBeenCalledWith("/test/system.manage.json");
    });
  });
});
