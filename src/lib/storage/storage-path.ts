const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;
const SAFE_EXTENSION = /^[a-zA-Z0-9]+$/;

export function createObjectKey(
  folder: string,
  fileId: string,
  extension: string,
): string {
  const segments = folder.replace(/\\/g, "/").split("/");
  const isValidFolder =
    segments.length > 0 && segments.every((segment) => SAFE_PATH_SEGMENT.test(segment));

  if (!isValidFolder) {
    throw new Error("Invalid storage folder");
  }

  if (!SAFE_PATH_SEGMENT.test(fileId)) {
    throw new Error("Invalid storage file ID");
  }

  if (!SAFE_EXTENSION.test(extension)) {
    throw new Error("Invalid storage extension");
  }

  return `${segments.join("/")}/${fileId}.${extension.toLowerCase()}`;
}

export function validateObjectKey(storagePath: string): string {
  const normalizedPath = storagePath.replace(/\\/g, "/");
  const segments = normalizedPath.split("/");
  const isValidPath =
    segments.length >= 2 &&
    segments.every((segment) => /^[a-zA-Z0-9_.-]+$/.test(segment)) &&
    !segments.some((segment) => segment === "." || segment === "..");

  if (!isValidPath || normalizedPath.startsWith("/")) {
    throw new Error("Invalid storage path");
  }

  return normalizedPath;
}
