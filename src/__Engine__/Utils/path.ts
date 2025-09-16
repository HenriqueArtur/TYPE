/**
 * Cross-platform path utilities that work in browser/renderer context.
 * Provides consistent path handling across Windows, macOS, and Linux.
 */

/**
 * Joins path segments using forward slashes (works cross-platform).
 * Normalizes path separators and handles multiple consecutive slashes.
 */
export function joinPath(...segments: string[]): string {
  if (segments.length === 0) return "";

  // Track if we started with an absolute path
  const firstSegmentNormalized = segments[0]?.replace(/\\/g, "/") || "";
  const isAbsolute = firstSegmentNormalized.startsWith("/");
  const isProtocol = firstSegmentNormalized.includes("://");

  // Filter empty segments and normalize
  const cleanSegments = segments
    .filter((segment) => segment && segment !== "")
    .map((segment) => segment.replace(/\\/g, "/")) // Convert backslashes to forward slashes
    .map((segment, index) => {
      // Don't remove trailing slashes from protocol segments (like "file://")
      if (index === 0 && segment.includes("://")) {
        return segment;
      }
      return segment.replace(/\/+$/, ""); // Remove trailing slashes for other segments
    })
    .filter((segment) => segment !== ""); // Filter again after removing trailing slashes

  if (cleanSegments.length === 0) return "";

  let result = cleanSegments.join("/");

  // Handle absolute paths
  if (isAbsolute && !result.startsWith("/") && !isProtocol) {
    result = `/${result}`;
  }

  // Clean up multiple consecutive slashes (but preserve protocol double slash)
  if (isProtocol) {
    // For protocols, preserve the :// part
    result = result.replace(/([^:])\/+/g, "$1/");
  } else {
    // For regular paths, clean up all multiple slashes
    result = result.replace(/\/+/g, "/");
  }

  return result;
}

/**
 * Normalizes a path by converting backslashes to forward slashes.
 * This ensures consistent path representation across platforms.
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}
