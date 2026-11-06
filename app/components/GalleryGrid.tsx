"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryItem } from "../lib/gallery";

export default function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: { slug: string; label: string }[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const present = categories.filter((c) => items.some((i) => i.category === c.slug));
  const current = open !== null ? visible[open] : null;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {[{ slug: "all", label: "All" }, ...present].map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => {
              setFilter(c.slug);
              setOpen(null);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === c.slug
                ? "gradient-bar border-transparent text-white"
                : "border-line text-muted hover:border-accent2 hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((item, i) => (
          <li key={item.src} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-2xl border border-line bg-card text-left"
            >
              <Image
                src={item.src}
                alt={item.caption || item.categoryLabel}
                width={item.width}
                height={item.height}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="h-auto w-full transition duration-300 group-hover:scale-[1.02]"
              />
              {item.caption && (
                <span className="block px-4 py-3 text-sm text-muted">{item.caption}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || "Photo"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            Close ✕
          </button>
          {visible.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              >
                →
              </button>
            </>
          )}
          <figure className="flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={current.src}
              alt={current.caption || current.categoryLabel}
              width={current.width}
              height={current.height}
              sizes="100vw"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
              priority
            />
            {current.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">{current.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
