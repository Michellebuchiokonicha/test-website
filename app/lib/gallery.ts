import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

// The gallery builds itself from folders. To add a photo:
//   1. Drop it in public/gallery/<category>/  (categories below)
//   2. Push to GitHub. Vercel redeploys and it appears. Newest filename first.
// Name files like "2026-10-full-circle-award.jpg" and the caption is made from the name.
// To write a custom caption, add it to public/gallery/captions.json:
//   { "awards/2026-10-full-circle-award.jpg": "Receiving the Full Circle Award at Google Showcase" }

export const galleryCategories = [
  { slug: "hall-of-fame", label: "Hall of fame" },
  { slug: "awards", label: "Awards" },
  { slug: "memories", label: "Memories" },
] as const;

export type GalleryItem = {
  src: string;
  width: number;
  height: number;
  caption: string;
  category: string;
  categoryLabel: string;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const root = path.join(process.cwd(), "public", "gallery");

function prettyCaption(file: string): string {
  const base = file
    .replace(IMAGE_EXT, "")
    .replace(/^\d{4}([-_]\d{2}){0,2}[-_]?/, "") // strip leading date like 2026-10-
    .replace(/[-_]+/g, " ")
    .trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

export function getGallery(): GalleryItem[] {
  let captions: Record<string, string> = {};
  try {
    captions = JSON.parse(fs.readFileSync(path.join(root, "captions.json"), "utf8"));
  } catch {
    /* no custom captions yet */
  }

  const items: GalleryItem[] = [];
  for (const cat of galleryCategories) {
    const dir = path.join(root, cat.slug);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort().reverse();
    for (const file of files) {
      try {
        const { width, height } = imageSize(fs.readFileSync(path.join(dir, file)));
        if (!width || !height) continue;
        items.push({
          src: `/gallery/${cat.slug}/${file}`,
          width,
          height,
          caption: captions[`${cat.slug}/${file}`] ?? prettyCaption(file),
          category: cat.slug,
          categoryLabel: cat.label,
        });
      } catch {
        /* unreadable image: skip it rather than break the build */
      }
    }
  }
  return items;
}

export function awardImageExists(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}
