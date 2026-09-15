import { promises as fs } from "fs";
import path from "path";

// Stored under data/ (not public/) so a single persistent volume mounted at
// /app/data covers both the JSON data files and every uploaded photo.
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(
  file: File | null | undefined
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Formato de imagen no soportado. Usá JPG, PNG o WEBP.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede pesar más de 5MB.");
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
