import { isAdmin } from "../../../lib/auth";
import { cleanHtml } from "../../../lib/sanitize";
import { deletePost, getPost, savePost, type Post } from "../../../lib/store";
import { RESERVED_SLUGS, slugify } from "../../../lib/text";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function safeUrl(v: unknown): string {
  const s = str(v, 2000);
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const title = str(body.title, 200);
  if (!title) return Response.json({ error: "Add a title first." }, { status: 400 });

  const slug = str(body.slug, 100) || slugify(title);
  if (!SLUG_RE.test(slug) || RESERVED_SLUGS.includes(slug)) {
    return Response.json({ error: "That URL slug isn't allowed. Use lowercase letters, numbers and dashes." }, { status: 400 });
  }

  const originalSlug = str(body.originalSlug, 100) || undefined;
  const existing = await getPost(slug);
  if (existing && slug !== originalSlug) {
    return Response.json({ error: "An article with that URL already exists." }, { status: 409 });
  }
  const original = originalSlug ? await getPost(originalSlug) : null;

  const status = body.status === "published" ? "published" : "draft";
  const now = new Date().toISOString();

  let publishedAt: string | null = original?.publishedAt ?? null;
  if (status === "published") {
    const requested = typeof body.publishedAt === "string" ? new Date(body.publishedAt) : null;
    if (requested && !Number.isNaN(requested.getTime())) publishedAt = requested.toISOString();
    else if (!publishedAt) publishedAt = now;
  }

  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.map((t) => slugify(String(t))).filter(Boolean))].slice(0, 5)
    : [];

  const post: Post = {
    slug,
    title,
    summary: str(body.summary, 400),
    coverImage: safeUrl(body.coverImage),
    tags,
    html: cleanHtml(typeof body.html === "string" ? body.html.slice(0, 500_000) : ""),
    status,
    createdAt: original?.createdAt ?? now,
    updatedAt: now,
    publishedAt,
    canonicalUrl: safeUrl(body.canonicalUrl),
  };

  try {
    await savePost(post, originalSlug);
  } catch (e) {
    console.error(e);
    return Response.json({ error: e instanceof Error ? e.message : "Could not save." }, { status: 500 });
  }
  return Response.json({ ok: true, slug, status });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!SLUG_RE.test(slug)) return Response.json({ error: "Bad request" }, { status: 400 });
  try {
    await deletePost(slug);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not delete." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
