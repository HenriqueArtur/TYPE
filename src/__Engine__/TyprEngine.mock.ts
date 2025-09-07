import { vi } from "vitest";
import type { GameObjectSerialized } from "./Engines/Entity/__types__";
import { TypeEngine } from "./TypeEngine";

export interface MockSceneSetupResult {
  systemsEnabled: string[];
  entities: GameObjectSerialized[];
}

export function createMockSceneSetupResult(
  systemsEnabled: string[] = [],
  entities: GameObjectSerialized[] = [],
): MockSceneSetupResult {
  return { systemsEnabled, entities };
}

export async function TypeEngineMock() {
  const typeEngine = new TypeEngine({
    projectPath: "/test",
    Render: {
      width: 800,
      height: 600,
      html_tag_id: "game",
    },
    Physics: {
      gravity: { x: 0, y: 0.8 },
    },
  });

  vi.spyOn(typeEngine.RenderEngine, "setup").mockImplementation(async () => {});
  vi.spyOn(typeEngine.SceneEngine, "setup").mockImplementation(async () =>
    createMockSceneSetupResult(),
  );
  vi.spyOn(typeEngine.SceneEngine, "transition").mockImplementation(async () =>
    createMockSceneSetupResult(),
  );
  vi.spyOn(typeEngine.SystemEngine, "setup").mockImplementation(async () => {});
  vi.spyOn(typeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});

  await typeEngine.setup();

  vi.spyOn(typeEngine.EventEngine, "emit");
  vi.spyOn(typeEngine.EventEngine, "on");
  vi.spyOn(typeEngine.EventEngine, "off");

  return typeEngine;
}

export function setupBasicTypeEngineMocks(typeEngine: TypeEngine) {
  vi.spyOn(typeEngine.RenderEngine, "setup").mockImplementation(async () => {});
  vi.spyOn(typeEngine.SceneEngine, "setup").mockImplementation(async () =>
    createMockSceneSetupResult(),
  );
  vi.spyOn(typeEngine.SceneEngine, "transition").mockImplementation(async () =>
    createMockSceneSetupResult(),
  );
  vi.spyOn(typeEngine.SystemEngine, "setup").mockImplementation(async () => {});
  vi.spyOn(typeEngine.PhysicsEngine, "setupScene").mockImplementation(() => {});
}
