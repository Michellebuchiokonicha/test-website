import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isAdmin } from "../../lib/auth";
import { getPost, listPublishedPosts } from "../../lib/store";
import { formatDate, readingTime } from "../../lib/text";
import { site } from "../../content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.status !== "published") return { robots: { index: false } };
  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const isDraft = post.status !== "published";
  if (isDraft && !(await isAdmin())) notFound();

  const all = isDraft ? [] : await listPublishedPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const newer = i > 0 ? all[i - 1] : null;
  const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: site.name },
    image: post.coverImage || undefined,
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
      {isDraft && (
        <p className="mb-8 rounded-xl border border-accent px-4 py-3 text-sm text-accent">
          Draft preview. Only you can see this.{" "}
          <Link href={`/admin/editor?slug=${post.slug}`} className="underline">
            Back to the editor
          </Link>
        </p>
      )}
      <Link href="/writing" className="text-sm text-muted transition hover:text-foreground">
        ← All articles
      </Link>

      <p className="mt-8 text-xs uppercase tracking-widest text-muted">
        {formatDate(post.publishedAt ?? post.updatedAt)} · {readingTime(post.html)}
      </p>
      <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
      {post.summary && <p className="mt-4 text-xl leading-relaxed text-muted">{post.summary}</p>}
      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li key={t}>
              <Link href={`/writing/tag/${t}`} className="rounded-full bg-accentsoft px-2.5 py-1 text-xs text-accent hover:opacity-80">
                #{t}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {post.coverImage && (
        <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl border border-line">
          <Image src={post.coverImage} alt="" fill sizes="(min-width:768px) 672px, 100vw" className="object-cover" priority />
        </div>
      )}

      <article className="prose-lite mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

      {post.canonicalUrl && (
        <p className="mt-10 text-sm text-muted">
          Originally published at{" "}
          <a href={post.canonicalUrl} target="_blank" rel="noreferrer" className="text-accent2 underline underline-offset-4">
            {new URL(post.canonicalUrl, site.url).hostname}
          </a>
          .
        </p>
      )}

      <div className="mt-14 border-t border-line pt-8">
        <p className="text-sm text-muted">
          Written by <span className="text-foreground">{site.name}</span>. Questions or thoughts?{" "}
          <a href={`mailto:${site.email}`} className="text-accent2 underline underline-offset-4">
            Email me
          </a>
          .
        </p>
        {(newer || older) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {older && (
              <Link href={`/writing/${older.slug}`} className="rounded-2xl border border-line bg-card p-4 transition hover:border-accent2">
                <span className="text-xs uppercase tracking-widest text-muted">Previous</span>
                <span className="mt-1 block font-serif text-lg">{older.title}</span>
              </Link>
            )}
            {newer && (
              <Link href={`/writing/${newer.slug}`} className="rounded-2xl border border-line bg-card p-4 transition hover:border-accent2 sm:col-start-2 sm:text-right">
                <span className="text-xs uppercase tracking-widest text-muted">Next</span>
                <span className="mt-1 block font-serif text-lg">{newer.title}</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {!isDraft && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </main>
  );
}
