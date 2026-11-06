import Image from "next/image";
import Link from "next/link";
import type { Post } from "../lib/store";
import { formatDate, readingTime } from "../lib/text";

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="space-y-10">
      {posts.map((p) => (
        <li key={p.slug}>
          <article className="grid gap-5 sm:grid-cols-[200px_1fr]">
            {p.coverImage && (
              <Link href={`/writing/${p.slug}`} className="relative block aspect-[2/1] overflow-hidden rounded-2xl border border-line sm:aspect-[4/3]">
                <Image src={p.coverImage} alt="" fill sizes="(min-width:640px) 200px, 100vw" className="object-cover" />
              </Link>
            )}
            <div className={p.coverImage ? "" : "sm:col-span-2"}>
              <p className="text-xs uppercase tracking-widest text-muted">
                {formatDate(p.publishedAt)} · {readingTime(p.html)}
              </p>
              <Link href={`/writing/${p.slug}`} className="mt-1 block font-serif text-2xl transition hover:text-accent2">
                {p.title}
              </Link>
              {p.summary && <p className="mt-2 leading-relaxed text-muted">{p.summary}</p>}
              {p.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li key={t}>
                      <Link href={`/writing/tag/${t}`} className="text-xs text-accent hover:underline">
                        #{t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
