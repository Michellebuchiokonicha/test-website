import type { Metadata } from "next";
import SectionTitle from "../components/SectionTitle";
import GalleryGrid from "../components/GalleryGrid";
import { getGallery, galleryCategories } from "../lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Hall of fame, awards and memories.",
};

export default function GalleryPage() {
  const items = getGallery();
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <SectionTitle kicker="Gallery" as="h1">
        Hall of fame &amp; memories
      </SectionTitle>
      <p className="-mt-4 mb-10 max-w-2xl text-lg leading-relaxed text-muted">
        Moments from awards, stages, classrooms and communities I&apos;m proud to be part of.
      </p>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          Photos coming soon.
        </p>
      ) : (
        <GalleryGrid items={items} categories={[...galleryCategories]} />
      )}
    </main>
  );
}
