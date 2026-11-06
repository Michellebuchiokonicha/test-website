"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { slugify } from "../lib/text";

export type EditorPost = {
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  html: string;
  status: "draft" | "published";
  publishedAt: string | null;
  canonicalUrl: string;
};

const EMPTY: EditorPost = {
  slug: "",
  title: "",
  summary: "",
  coverImage: "",
  tags: [],
  html: "",
  status: "draft",
  publishedAt: null,
  canonicalUrl: "",
};

// Resize big photos in the browser before uploading (keeps uploads small and fast).
async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const maxSide = 2000;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" && file.size < 3 * 1024 * 1024 ? "image/png" : "image/webp";
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, type, 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + (type === "image/png" ? ".png" : ".webp"), { type });
}

async function uploadImage(file: File): Promise<string> {
  const prepared = await prepareImage(file);
  const form = new FormData();
  form.append("file", prepared);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

function ToolbarButton({
  label,
  active,
  onClick,
  disabled,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition disabled:opacity-40 ${
        active ? "bg-accent2 text-white" : "text-muted hover:bg-accentsoft hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, busy }: { editor: Editor | null; onImage: () => void; busy: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      h4: e?.isActive("heading", { level: 4 }) ?? false,
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      strike: e?.isActive("strike") ?? false,
      code: e?.isActive("code") ?? false,
      link: e?.isActive("link") ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      codeBlock: e?.isActive("codeBlock") ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  });
  if (!editor || !s) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove the link)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const Divider = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />;

  return (
    <div className="sticky top-[57px] z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-line bg-card/95 px-2 py-1.5 backdrop-blur">
      <ToolbarButton label="Heading 2" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <ToolbarButton label="Heading 4" active={s.h4} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        H4
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Bold (Ctrl/Cmd+B)" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </ToolbarButton>
      <ToolbarButton label="Italic (Ctrl/Cmd+I)" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </ToolbarButton>
      <ToolbarButton label="Underline (Ctrl/Cmd+U)" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={s.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        {"</>"}
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Link" active={s.link} onClick={setLink}>
        Link
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={onImage} disabled={busy}>
        {busy ? "Uploading…" : "Image"}
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Bulleted list" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </ToolbarButton>
      <ToolbarButton label="Quote" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ ”
      </ToolbarButton>
      <ToolbarButton label="Code block" active={s.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {"{ }"}
      </ToolbarButton>
      <ToolbarButton label="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Undo" disabled={!s.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!s.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
}

export default function PostEditor({ initial }: { initial: EditorPost | null }) {
  const start = initial ?? EMPTY;
  const isNew = !initial;

  const [title, setTitle] = useState(start.title);
  const [slug, setSlug] = useState(start.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [summary, setSummary] = useState(start.summary);
  const [cover, setCover] = useState(start.coverImage);
  const [tags, setTags] = useState<string[]>(start.tags);
  const [tagInput, setTagInput] = useState("");
  const [canonical, setCanonical] = useState(start.canonicalUrl);
  const [publishDate, setPublishDate] = useState(start.publishedAt ? start.publishedAt.slice(0, 10) : "");
  const [status, setStatus] = useState<"draft" | "published">(start.status);
  const [savedSlug, setSavedSlug] = useState<string | undefined>(initial?.slug);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [words, setWords] = useState(0);

  const htmlRef = useRef(start.html);
  const editorRef = useRef<Editor | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Grow the title box to fit its text (also on first load, so long titles are never clipped)
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [title]);

  const insertImageFile = useCallback(async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file);
      const alt = window.prompt("Describe this image for people using screen readers (alt text)", "") ?? "";
      editorRef.current?.chain().focus().setImage({ src: url, alt }).run();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      ImageExt.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Tell your story…" }),
    ],
    content: start.html,
    editorProps: {
      attributes: { class: "prose-lite min-h-[420px] px-5 py-5 focus:outline-none sm:px-8" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        files.forEach((f) => void insertImageFile(f));
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach((f) => void insertImageFile(f));
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      htmlRef.current = e.getHTML();
      setWords(e.getText().trim().split(/\s+/).filter(Boolean).length);
      setDirty(true);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    if (editor) setWords(editor.getText().trim().split(/\s+/).filter(Boolean).length);
  }, [editor]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const touch = () => setDirty(true);

  function addTag(raw: string) {
    const t = slugify(raw);
    if (!t) return;
    setTags((prev) => (prev.includes(t) || prev.length >= 5 ? prev : [...prev, t]));
    setTagInput("");
    touch();
  }

  async function save(target: "draft" | "published") {
    setBusy(true);
    setMessage(null);
    const body = {
      originalSlug: savedSlug,
      slug: slug || slugify(title),
      title,
      summary,
      coverImage: cover,
      tags,
      html: htmlRef.current,
      status: target,
      publishedAt: target === "published" && publishDate ? new Date(publishDate + "T12:00:00").toISOString() : undefined,
      canonicalUrl: canonical,
    };
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setSlug(data.slug);
      setSavedSlug(data.slug);
      setStatus(target);
      setDirty(false);
      window.history.replaceState(null, "", `/admin/editor?slug=${encodeURIComponent(data.slug)}`);
      setMessage({
        type: "ok",
        text: target === "published" ? "Published. It's live on your site now." : "Saved as a draft. Only you can see it.",
      });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  // Ctrl/Cmd + S keeps the current status
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current(status);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [status]);

  async function pickCover(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      setCover(await uploadImage(file));
      touch();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-accent2";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">
          ← All articles
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              status === "published" ? "bg-accent2 text-white" : "border border-line text-muted"
            }`}
          >
            {status === "published" ? "Published" : "Draft"}
            {dirty ? " · unsaved changes" : ""}
          </span>
          {savedSlug && (
            <a
              href={`/writing/${savedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition hover:border-accent2 hover:text-foreground"
            >
              {status === "published" ? "View live ↗" : "Preview ↗"}
            </a>
          )}
          {status === "published" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => save("draft")}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition hover:border-accent2 hover:text-foreground disabled:opacity-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => save("published")}
                className="gradient-bar rounded-full px-5 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Update"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => save("draft")}
                className="rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-accent2 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => save("published")}
                className="gradient-bar rounded-full px-5 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Publish
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-accentsoft text-foreground" : "border border-accent text-accent"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Cover image */}
      <div className="mb-6">
        {cover ? (
          <div className="relative overflow-hidden rounded-2xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Cover" className="aspect-[2/1] w-full object-cover" />
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => {
                  setCover("");
                  touch();
                }}
                className="rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center rounded-2xl border border-dashed border-line px-4 py-8 text-sm text-muted transition hover:border-accent2 hover:text-foreground"
          >
            {uploading ? "Uploading…" : "+ Add a cover image (wide images, about 2:1, work best)"}
          </button>
        )}
        <input
          ref={coverInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            void pickCover(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <label className="sr-only" htmlFor="title">
        Title
      </label>
      <textarea
        id="title"
        ref={titleRef}
        rows={1}
        value={title}
        placeholder="Article title"
        onChange={(e) => {
          setTitle(e.target.value);
          if (!slugTouched) setSlug(slugify(e.target.value));
          touch();
        }}
        className="w-full resize-none overflow-hidden bg-transparent font-serif text-4xl leading-tight outline-none placeholder:text-muted/60 sm:text-5xl"
      />

      <label className="sr-only" htmlFor="summary">
        Short summary
      </label>
      <textarea
        id="summary"
        rows={2}
        value={summary}
        maxLength={400}
        placeholder="One or two sentences shown in the article list and link previews"
        onChange={(e) => {
          setSummary(e.target.value);
          touch();
        }}
        className="mt-3 w-full resize-none bg-transparent text-lg leading-relaxed text-muted outline-none placeholder:text-muted/60"
      />

      <div className="mt-6 rounded-2xl border border-line bg-card">
        <Toolbar editor={editor} busy={uploading} onImage={() => fileInput.current?.click()} />
        <EditorContent editor={editor} />
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void insertImageFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {words} words · {Math.max(1, Math.round(words / 220))} min read · You can paste or drag images straight into the
        article · Ctrl/Cmd+S saves
      </p>

      {/* Details */}
      <section className="mt-10 grid gap-5 rounded-2xl border border-line bg-card p-6">
        <h2 className="font-serif text-xl">Details</h2>

        <div>
          <label htmlFor="tags" className="mb-1.5 block text-sm text-muted">
            Tags (up to 5, press Enter or comma)
          </label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line px-3 py-2">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-accentsoft px-2.5 py-1 text-xs text-accent">
                {t}
                <button
                  type="button"
                  aria-label={`Remove tag ${t}`}
                  onClick={() => {
                    setTags(tags.filter((x) => x !== t));
                    touch();
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                } else if (e.key === "Backspace" && !tagInput && tags.length) {
                  setTags(tags.slice(0, -1));
                  touch();
                }
              }}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length >= 5 ? "" : "e.g. agents, edge-ai"}
              disabled={tags.length >= 5}
              className="min-w-32 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm text-muted">
            Article URL
          </label>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="shrink-0">/writing/</span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
                touch();
              }}
              className={inputCls}
              placeholder="auto-generated-from-title"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1.5 block text-sm text-muted">
              Publish date (optional, defaults to today)
            </label>
            <input
              id="date"
              type="date"
              value={publishDate}
              onChange={(e) => {
                setPublishDate(e.target.value);
                touch();
              }}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="canonical" className="mb-1.5 block text-sm text-muted">
              Originally published at (optional)
            </label>
            <input
              id="canonical"
              type="url"
              value={canonical}
              onChange={(e) => {
                setCanonical(e.target.value);
                touch();
              }}
              placeholder="https://dev.to/…"
              className={inputCls}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
