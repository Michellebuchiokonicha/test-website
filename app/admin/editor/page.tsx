import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdmin } from "../../lib/auth";
import { getPost, storageMode } from "../../lib/store";
import PostEditor, { type EditorPost } from "../PostEditor";

export const metadata: Metadata = {
  title: "Write",
  robots: { index: false, follow: false },
};

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  await connection();
  if (!(await isAdmin()) || storageMode() === "none") redirect("/admin");

  const { slug } = await searchParams;
  let initial: EditorPost | null = null;
  if (slug) {
    const p = await getPost(slug);
    if (!p) redirect("/admin");
    initial = {
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      coverImage: p.coverImage,
      tags: p.tags,
      html: p.html,
      status: p.status,
      publishedAt: p.publishedAt,
      canonicalUrl: p.canonicalUrl,
    };
  }

  // key forces a fresh editor when switching between articles
  return <PostEditor key={slug ?? "new"} initial={initial} />;
}
