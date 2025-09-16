import { describe, expect, it } from "vitest";
import { joinPath, normalizePath } from "./path";

describe("joinPath", () => {
  it("should join simple path segments", () => {
    expect(joinPath("a", "b", "c")).toBe("a/b/c");
  });

  it("should handle empty segments", () => {
    expect(joinPath("a", "", "b")).toBe("a/b");
    expect(joinPath("", "a", "b")).toBe("a/b");
    expect(joinPath("a", "b", "")).toBe("a/b");
  });

  it("should normalize backslashes to forward slashes", () => {
    expect(joinPath("a\\b", "c\\d")).toBe("a/b/c/d");
    expect(joinPath("C:\\Users", "Documents", "file.txt")).toBe("C:/Users/Documents/file.txt");
  });

  it("should handle multiple consecutive slashes", () => {
    expect(joinPath("a//b", "c///d")).toBe("a/b/c/d");
    expect(joinPath("a/", "/b")).toBe("a/b");
  });

  it("should preserve leading slashes for absolute paths", () => {
    expect(joinPath("/home", "user", "docs")).toBe("/home/user/docs");
    expect(joinPath("/", "home", "user")).toBe("/home/user");
  });

  it("should handle Windows drive letters", () => {
    expect(joinPath("C:", "Program Files", "App")).toBe("C:/Program Files/App");
    expect(joinPath("D:\\", "Projects", "MyApp")).toBe("D:/Projects/MyApp");
  });

  it("should handle protocol prefixes correctly", () => {
    expect(joinPath("file://", "path", "to", "file")).toBe("file://path/to/file");
  });

  it("should return empty string for no segments", () => {
    expect(joinPath()).toBe("");
    expect(joinPath("", "", "")).toBe("");
  });

  it("should handle single segment", () => {
    expect(joinPath("single")).toBe("single");
    expect(joinPath("/single")).toBe("/single");
  });
});

describe("normalizePath", () => {
  it("should convert backslashes to forward slashes", () => {
    expect(normalizePath("C:\\Users\\Documents\\file.txt")).toBe("C:/Users/Documents/file.txt");
    expect(normalizePath("path\\to\\file")).toBe("path/to/file");
  });

  it("should leave forward slashes unchanged", () => {
    expect(normalizePath("path/to/file")).toBe("path/to/file");
    expect(normalizePath("/home/user/docs")).toBe("/home/user/docs");
  });

  it("should handle mixed separators", () => {
    expect(normalizePath("C:\\Users/Documents\\file.txt")).toBe("C:/Users/Documents/file.txt");
  });

  it("should handle empty string", () => {
    expect(normalizePath("")).toBe("");
  });
});
