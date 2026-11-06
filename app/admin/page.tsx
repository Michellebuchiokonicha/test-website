import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { adminConfigured, isAdmin } from "../lib/auth";
import { listAllPosts, storageMode } from "../lib/store";
import { uploadsConfigured } from "../lib/uploads";
import { formatDate } from "../lib/text";
import { DeleteButton, LoginForm, LogoutButton } from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function Setup({ steps, title }: { steps: React.ReactNode[]; title: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6">
      <h2 className="font-serif text-xl">{title}</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

export default async function AdminPage() {
  await connection();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">Admin</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Your articles</h1>
      <Body />
    </main>
  );
}

async function Body() {
  if (!adminConfigured()) {
    return (
      <Setup
        title="One-time setup: choose an admin password"
        steps={[
          <>In Vercel, open your project → Settings → Environment Variables.</>,
          <>
            Add <code>ADMIN_PASSWORD</code> with a long passphrase only you know, and <code>SESSION_SECRET</code> with
            any long random string.
          </>,
          <>Redeploy the project, then come back to this page and sign in.</>,
        ]}
      />
    );
  }

  if (!(await isAdmin())) return <LoginForm />;

  const mode = storageMode();
  if (mode === "none") {
    return (
      <>
        <div className="mt-6 flex justify-end">
          <LogoutButton />
        </div>
        <Setup
          title="One-time setup: connect article storage"
          steps={[
            <>In Vercel, open your project → Storage → Create Database → choose Neon (Postgres) → connect it to this project.</>,
            <>Back in Storage, create a Blob store and connect it too. This holds your article images.</>,
            <>Redeploy the project. Come back here and the editor will be ready.</>,
          ]}
        />
      </>
    );
  }

  let posts: Awaited<ReturnType<typeof listAllPosts>> = [];
  let loadError = "";
  try {
    posts = await listAllPosts();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load articles.";
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/editor"
          className="gradient-bar rounded-full px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          + New article
        </Link>
        <LogoutButton />
      </div>

      {!uploadsConfigured() && (
        <p className="mt-6 rounded-xl border border-accent px-4 py-3 text-sm text-accent">
          Image uploads aren&apos;t set up yet. In Vercel → Storage, create a Blob store and connect it to this project,
          then redeploy.
        </p>
      )}
      {mode === "file" && (
        <p className="mt-6 rounded-xl bg-accentsoft px-4 py-3 text-sm">
          Local development mode: articles are saved to a file on this computer, not to your live site.
        </p>
      )}
      {loadError && <p className="mt-6 text-sm text-accent">{loadError}</p>}

      {posts.length === 0 && !loadError ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          No articles yet. Press “New article” to write your first one.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <Link href={`/admin/editor?slug=${encodeURIComponent(p.slug)}`} className="block truncate font-medium hover:text-accent2">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  <span
                    className={`mr-2 rounded-full px-2 py-0.5 ${
                      p.status === "published" ? "bg-accent2 text-white" : "border border-line"
                    }`}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                  Updated {formatDate(p.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <Link href={`/admin/editor?slug=${encodeURIComponent(p.slug)}`} className="text-muted transition hover:text-foreground">
                  Edit
                </Link>
                <a href={`/writing/${p.slug}`} target="_blank" rel="noreferrer" className="text-muted transition hover:text-foreground">
                  {p.status === "published" ? "View" : "Preview"}
                </a>
                <DeleteButton slug={p.slug} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
