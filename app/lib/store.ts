import fs from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

// Where articles are stored:
//  - Production (Vercel): Neon Postgres, picked up automatically from DATABASE_URL / POSTGRES_URL.
//  - Local development: a JSON file at .data/posts.json (no setup needed).
//  - Anything else: "none" (the site still works; /admin shows setup steps).

export type PostStatus = "draft" | "published";

export type Post = {
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  html: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  canonicalUrl: string;
};

export type StorageMode = "neon" | "file" | "none";

const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export function storageMode(): StorageMode {
  if (dbUrl()) return "neon";
  if (process.env.NODE_ENV !== "production" || process.env.STORAGE === "file") return "file";
  return "none";
}

// ── File adapter (local development) ─────────────────────────
const dataFile = path.join(process.cwd(), ".data", "posts.json");

async function readFileStore(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8")) as Post[];
  } catch {
    return [];
  }
}

async function writeFileStore(posts: Post[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(posts, null, 2));
}

// ── Neon Postgres adapter (production) ───────────────────────
let ready: Promise<void> | null = null;
const sql = () => neon(dbUrl());

function ensureTable(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await sql()`
        create table if not exists posts (
          slug text primary key,
          title text not null,
          summary text not null default '',
          cover_image text not null default '',
          tags jsonb not null default '[]',
          html text not null default '',
          status text not null default 'draft',
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          published_at timestamptz,
          canonical_url text not null default ''
        )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

type Row = {
  slug: string;
  title: string;
  summary: string;
  cover_image: string;
  tags: unknown;
  html: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
  published_at: string | Date | null;
  canonical_url: string;
};

const iso = (v: string | Date) => new Date(v).toISOString();

function fromRow(r: Row): Post {
  return {
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    coverImage: r.cover_image,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    html: r.html,
    status: r.status === "published" ? "published" : "draft",
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    publishedAt: r.published_at ? iso(r.published_at) : null,
    canonicalUrl: r.canonical_url,
  };
}

// ── Public API used by pages and routes ──────────────────────
function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const da = a.publishedAt ?? a.updatedAt;
    const db = b.publishedAt ?? b.updatedAt;
    return da < db ? 1 : -1;
  });
}

/** Every post including drafts. Admin only. Throws if storage isn't set up. */
export async function listAllPosts(): Promise<Post[]> {
  const mode = storageMode();
  if (mode === "file") return sortPosts(await readFileStore());
  if (mode === "neon") {
    await ensureTable();
    const rows = (await sql()`select * from posts`) as Row[];
    return sortPosts(rows.map(fromRow));
  }
  throw new Error("Article storage is not configured.");
}

/** Published posts only, never throws (the public site must keep working). */
export async function listPublishedPosts(): Promise<Post[]> {
  try {
    const all = await listAllPosts();
    return all.filter((p) => p.status === "published");
  } catch (e) {
    console.error("listPublishedPosts failed:", e);
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const all = await listAllPosts();
    return all.find((p) => p.slug === slug) ?? null;
  } catch (e) {
    console.error("getPost failed:", e);
    return null;
  }
}

/** Create or update. If the slug changed, pass the old one as originalSlug. */
export async function savePost(post: Post, originalSlug?: string): Promise<void> {
  const mode = storageMode();
  if (mode === "file") {
    let posts = await readFileStore();
    if (originalSlug && originalSlug !== post.slug) posts = posts.filter((p) => p.slug !== originalSlug);
    const i = posts.findIndex((p) => p.slug === post.slug);
    if (i >= 0) posts[i] = post;
    else posts.push(post);
    await writeFileStore(posts);
    return;
  }
  if (mode === "neon") {
    await ensureTable();
    const q = sql();
    if (originalSlug && originalSlug !== post.slug) await q`delete from posts where slug = ${originalSlug}`;
    await q`
      insert into posts (slug, title, summary, cover_image, tags, html, status, created_at, updated_at, published_at, canonical_url)
      values (${post.slug}, ${post.title}, ${post.summary}, ${post.coverImage}, ${JSON.stringify(post.tags)}::jsonb,
              ${post.html}, ${post.status}, ${post.createdAt}, ${post.updatedAt}, ${post.publishedAt}, ${post.canonicalUrl})
      on conflict (slug) do update set
        title = excluded.title, summary = excluded.summary, cover_image = excluded.cover_image,
        tags = excluded.tags, html = excluded.html, status = excluded.status,
        updated_at = excluded.updated_at, published_at = excluded.published_at,
        canonical_url = excluded.canonical_url`;
    return;
  }
  throw new Error("Article storage is not configured.");
}

export async function deletePost(slug: string): Promise<void> {
  const mode = storageMode();
  if (mode === "file") {
    await writeFileStore((await readFileStore()).filter((p) => p.slug !== slug));
    return;
  }
  if (mode === "neon") {
    await ensureTable();
    await sql()`delete from posts where slug = ${slug}`;
    return;
  }
  throw new Error("Article storage is not configured.");
}

export function tagsOf(posts: Post[]): { tag: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
