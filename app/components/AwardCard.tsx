import Image from "next/image";
import type { Award } from "../content";
import { awardImageExists } from "../lib/gallery";

export default function AwardCard({ a }: { a: Award }) {
  const hasImage = awardImageExists(a.image);
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-[4/3] bg-accentsoft">
        {hasImage ? (
          <Image
            src={a.image}
            alt={`${a.title}, ${a.org} ${a.year}`}
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
            Photo goes here
            <br />
            (public{a.image})
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          {a.org} · {a.year}
        </p>
        <h3 className="mt-2 font-serif text-xl">{a.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{a.description}</p>
      </div>
    </article>
  );
}
