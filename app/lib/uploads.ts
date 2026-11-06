import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { storageMode } from "./store";

// Images for articles:
//  - Production: Vercel Blob (BLOB_READ_WRITE_TOKEN is added when you connect a Blob store).
//  - Local development: saved into public/uploads/.

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function uploadsConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || storageMode() === "file";
}

export async function saveImage(file: File): Promise<string> {
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("Use a JPG, PNG, WebP, GIF or AVIF image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is too large (4 MB max).");

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`posts/${base}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  }

  if (storageMode() === "file") {
    const name = `${Date.now()}-${base}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  }

  throw new Error("Image storage is not configured. Connect a Vercel Blob store to this project.");
}
