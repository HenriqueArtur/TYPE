/**
 * Converts a file path to a proper file:// URL for dynamic imports.
 * Works cross-platform and in browser/renderer context.
 */
export function pathToFileURL(filePath: string): string {
  if (filePath.startsWith("file://")) {
    return filePath;
  }

  // Normalize path separators for Windows
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Ensure we have proper file:// URL format
  if (normalizedPath.startsWith("/")) {
    // Unix-like path (macOS, Linux)
    return `file://${normalizedPath}`;
  } else {
    // Windows path (e.g., C:/path/to/file)
    return `file:///${normalizedPath}`;
  }
}
