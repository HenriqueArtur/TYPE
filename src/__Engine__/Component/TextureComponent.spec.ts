import { Assets, type Texture } from "pixi.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TextureComponent, type TextureComponentData } from "./TextureComponent";

// Mock PIXI.js Assets
vi.mock("pixi.js", () => ({
  Assets: {
    load: vi.fn(),
  },
}));

const mockTexture = {
  width: 128,
  height: 128,
  source: { resource: "mock-texture" },
} as Texture;

describe("TextureComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Assets.load as ReturnType<typeof vi.fn>).mockResolvedValue(mockTexture);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create texture component with provided path", () => {
      const data: TextureComponentData = { path: "bunny.png" };
      const texture = new TextureComponent(data);

      expect(texture.path).toBe("../bunny.png");
      expect(texture.type).toBe("TextureComponent");
    });

    it("should prepend '../' to the provided path", () => {
      const data: TextureComponentData = { path: "sprites/character.png" };
      const texture = new TextureComponent(data);

      expect(texture.path).toBe("../sprites/character.png");
    });

    it("should handle paths with different extensions", () => {
      const jpegData: TextureComponentData = { path: "background.jpg" };
      const jpegTexture = new TextureComponent(jpegData);

      const gifData: TextureComponentData = { path: "animation.gif" };
      const gifTexture = new TextureComponent(gifData);

      expect(jpegTexture.path).toBe("../background.jpg");
      expect(gifTexture.path).toBe("../animation.gif");
    });

    it("should handle paths with subdirectories", () => {
      const data: TextureComponentData = { path: "textures/ui/button.png" };
      const texture = new TextureComponent(data);

      expect(texture.path).toBe("../textures/ui/button.png");
    });

    it("should throw error for empty string path", () => {
      const data: TextureComponentData = { path: "" };

      expect(() => new TextureComponent(data)).toThrow(
        "TextureComponent: 'path' must be a non-empty string.",
      );
    });
  });

  describe("static properties", () => {
    it("should have correct type identifier", () => {
      expect(TextureComponent._type).toBe("TextureComponent");
      expect(new TextureComponent({ path: "test.png" }).type).toBe("TextureComponent");
    });

    it("should have correct prefix", () => {
      expect(TextureComponent.prefix).toBe("TX");
    });
  });

  describe("load method", () => {
    it("should load texture using PIXI Assets", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      const loadedTexture = await texture.load();

      expect(Assets.load).toHaveBeenCalledWith("../test.png");
      expect(loadedTexture).toBe(mockTexture);
    });

    it("should store and return the loaded texture instance", async () => {
      const texture = new TextureComponent({ path: "sprite.png" });

      const loadedTexture = await texture.load();
      const storedInstance = texture.instance();

      expect(loadedTexture).toBe(mockTexture);
      expect(storedInstance).toBe(mockTexture);
      expect(loadedTexture).toBe(storedInstance);
    });

    it("should call Assets.load with the correct path", async () => {
      const texture = new TextureComponent({ path: "assets/player.png" });

      await texture.load();

      expect(Assets.load).toHaveBeenCalledWith("../assets/player.png");
      expect(Assets.load).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple load calls", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      const firstLoad = await texture.load();
      const secondLoad = await texture.load();

      expect(Assets.load).toHaveBeenCalledTimes(2);
      expect(firstLoad).toBe(mockTexture);
      expect(secondLoad).toBe(mockTexture);
    });

    it("should handle load errors", async () => {
      const texture = new TextureComponent({ path: "nonexistent.png" });
      const loadError = new Error("Texture not found");

      (Assets.load as ReturnType<typeof vi.fn>).mockRejectedValueOnce(loadError);

      await expect(texture.load()).rejects.toThrow("Texture not found");
    });

    it("should throw error for empty path during construction", () => {
      expect(() => new TextureComponent({ path: "" })).toThrow(
        "TextureComponent: 'path' must be a non-empty string.",
      );
    });
  });

  describe("instance method", () => {
    it("should return null before loading", () => {
      const texture = new TextureComponent({ path: "test.png" });

      const instance = texture.instance();

      expect(instance).toBeNull();
    });

    it("should return texture instance after loading", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      await texture.load();
      const instance = texture.instance();

      expect(instance).toBe(mockTexture);
    });

    it("should consistently return the same instance", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      await texture.load();
      const instance1 = texture.instance();
      const instance2 = texture.instance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockTexture);
    });
  });

  describe("jsonToGameObject static method", () => {
    it("should create texture component from JSON string", () => {
      const jsonData = JSON.stringify({ path: "character.png" });

      const texture = TextureComponent.jsonToGameObject(jsonData);

      expect(texture.path).toBe("../character.png");
      expect(texture).toBeInstanceOf(TextureComponent);
    });

    it("should create texture component from object", () => {
      const objectData = { path: "background.jpg" };

      const texture = TextureComponent.jsonToGameObject(objectData);

      expect(texture.path).toBe("../background.jpg");
      expect(texture).toBeInstanceOf(TextureComponent);
    });

    it("should handle complex path in JSON", () => {
      const jsonData = JSON.stringify({
        path: "textures/environments/forest/tree.png",
      });

      const texture = TextureComponent.jsonToGameObject(jsonData);

      expect(texture.path).toBe("../textures/environments/forest/tree.png");
    });

    it("should handle object with additional properties", () => {
      const objectData = {
        path: "sprite.png",
        extraProperty: "should be ignored",
      };

      const texture = TextureComponent.jsonToGameObject(objectData);

      expect(texture.path).toBe("../sprite.png");
    });

    it("should handle malformed JSON gracefully", () => {
      expect(() => {
        TextureComponent.jsonToGameObject("invalid json");
      }).toThrow();
    });

    it("should throw error for JSON with missing path property", () => {
      const objectData = { notPath: "value" };

      expect(() => TextureComponent.jsonToGameObject(objectData)).toThrow(
        "TextureComponent: 'path' must be a non-empty string.",
      );
    });

    it("should throw error for empty object", () => {
      expect(() => TextureComponent.jsonToGameObject({})).toThrow(
        "TextureComponent: 'path' must be a non-empty string.",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle paths with special characters", () => {
      const specialChars = "file with spaces & symbols!@#$%.png";
      const texture = new TextureComponent({ path: specialChars });

      expect(texture.path).toBe(`../${specialChars}`);
    });

    it("should handle very long paths", () => {
      const longPath = `${"a".repeat(1000)}.png`;
      const texture = new TextureComponent({ path: longPath });

      expect(texture.path).toBe(`../${longPath}`);
    });

    it("should handle paths with unicode characters", () => {
      const unicodePath = "測試/テスト/тест.png";
      const texture = new TextureComponent({ path: unicodePath });

      expect(texture.path).toBe(`../${unicodePath}`);
    });

    it("should handle paths that already start with '../'", () => {
      const texture = new TextureComponent({ path: "../already/prefixed.png" });

      expect(texture.path).toBe("../../already/prefixed.png");
    });

    it("should handle absolute-looking paths", () => {
      const texture = new TextureComponent({ path: "/absolute/path.png" });

      expect(texture.path).toBe("../absolute/path.png");
    });

    it("should preserve case sensitivity", () => {
      const texture = new TextureComponent({ path: "CamelCase/UPPERCASE/lowercase.PNG" });

      expect(texture.path).toBe("../CamelCase/UPPERCASE/lowercase.PNG");
    });

    it("should handle load with network error simulation", async () => {
      const texture = new TextureComponent({ path: "test.png" });
      const networkError = new Error("Network error");

      (Assets.load as ReturnType<typeof vi.fn>).mockRejectedValueOnce(networkError);

      await expect(texture.load()).rejects.toThrow("Network error");
      expect(texture.instance()).toBeNull();
    });

    it("should handle concurrent load calls", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      const [result1, result2, result3] = await Promise.all([
        texture.load(),
        texture.load(),
        texture.load(),
      ]);

      expect(result1).toBe(mockTexture);
      expect(result2).toBe(mockTexture);
      expect(result3).toBe(mockTexture);
      expect(Assets.load).toHaveBeenCalledTimes(3);
    });

    it("should handle load after previous load failure", async () => {
      const texture = new TextureComponent({ path: "test.png" });

      // First load fails
      (Assets.load as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("First load failed"),
      );
      await expect(texture.load()).rejects.toThrow("First load failed");

      // Second load succeeds
      (Assets.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTexture);
      const result = await texture.load();

      expect(result).toBe(mockTexture);
      expect(texture.instance()).toBe(mockTexture);
    });
  });

  describe("integration with other components", () => {
    it("should be compatible with component interface", () => {
      const texture = new TextureComponent({ path: "test.png" });

      expect(texture.type).toBe("TextureComponent");
      expect(typeof texture.load).toBe("function");
      expect(typeof texture.instance).toBe("function");
    });

    it("should work with jsonToGameObject factory method", () => {
      const data = { path: "factory-test.png" };
      const texture = TextureComponent.jsonToGameObject(data);

      expect(texture).toBeInstanceOf(TextureComponent);
      expect(texture.path).toBe("../factory-test.png");
      expect(texture.type).toBe("TextureComponent");
    });
  });
});
