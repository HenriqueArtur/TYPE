import { describe, expect, it } from "vitest";
import { pathToFileURL } from "./pathToFileURL";

describe("pathToFileURL", () => {
  it("should return existing file:// URLs unchanged", () => {
    const fileUrl = "file:///path/to/file.js";
    expect(pathToFileURL(fileUrl)).toBe(fileUrl);
  });

  it("should convert Unix-like paths to file:// URLs", () => {
    const unixPath = "/home/user/project/file.js";
    expect(pathToFileURL(unixPath)).toBe("file:///home/user/project/file.js");
  });

  it("should convert Windows paths to file:// URLs", () => {
    const windowsPath = "C:/Users/user/project/file.js";
    expect(pathToFileURL(windowsPath)).toBe("file:///C:/Users/user/project/file.js");
  });

  it("should handle Windows paths with backslashes", () => {
    const windowsPath = "C:\\Users\\user\\project\\file.js";
    expect(pathToFileURL(windowsPath)).toBe("file:///C:/Users/user/project/file.js");
  });

  it("should handle relative-looking Windows paths", () => {
    const windowsPath = "D:\\project\\subfolder\\file.js";
    expect(pathToFileURL(windowsPath)).toBe("file:///D:/project/subfolder/file.js");
  });

  it("should handle network paths correctly", () => {
    const networkPath = "//server/share/file.js";
    expect(pathToFileURL(networkPath)).toBe("file:////server/share/file.js");
  });
});
