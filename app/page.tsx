import Image from "next/image";
import Link from "next/link";
import {
  site,
  badges,
  stats,
  about,
  skills,
  projects,
  experience,
  awards,
  talks,
  articles,
  community,
  type Project,
} from "./content";
import SectionTitle from "./components/SectionTitle";
import { formatDate } from "./lib/text";
import AwardCard from "./components/AwardCard";
import { getGallery } from "./lib/gallery";
import { listPublishedPosts } from "./lib/store";
import { connection } from "next/server";

function ProjectCard({ p }: { p: Project }) {
  return (
    <div
      className={`rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-accent2 ${
        p.todo ? "border-dashed border-line" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-xl">{p.name}</h3>
        {p.period && <span className="shrink-0 text-xs text-muted">{p.period}</span>}
      </div>
      <p className="mt-1 text-sm text-accent2">{p.role}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <li key={t} className="rounded-full bg-accentsoft px-2.5 py-1 text-xs text-accent">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Home() {
  await connection();
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const gallery = getGallery().slice(0, 6);
  const latestPosts = (await listPublishedPosts()).slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <ul className="mb-6 flex flex-wrap gap-2">
          {badges.map((b) => (
            <li key={b} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {b}
            </li>
          ))}
        </ul>
        <h1 className="font-serif text-5xl leading-[1.05] sm:text-7xl">
          Hi, I&apos;m <span className="gradient-text">{site.shortName}</span>.
        </h1>
        <p className="mt-2 font-serif text-2xl text-muted sm:text-3xl">{site.title}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">{site.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="gradient-bar rounded-full px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Get in touch
          </a>
          <a
            href={site.cvUrl}
            className="rounded-full border border-line px-6 py-3 text-sm font-medium transition hover:border-accent2"
          >
            Download CV
          </a>
          <a
            href="#work"
            className="rounded-full px-6 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            See my work →
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="font-serif text-3xl sm:text-4xl">{s.value}</dt>
              <dd className="mt-1 text-sm text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="About">A bit about me</SectionTitle>
        <div className="grid gap-10 md:grid-cols-[1fr_260px]">
          <div className="space-y-5 text-lg leading-relaxed">
            {about.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          {/* TODO: put your photo at public/headshot.jpg and swap this block for next/image */}
          <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-line bg-card p-4 text-center text-sm text-muted">
            Your photo goes here
            <br />
            (public/headshot.jpg)
          </div>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {skills.map((g) => (
            <div key={g.group}>
              <h3 className="font-serif text-lg">{g.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="Work">Projects &amp; experience</SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          {featured.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>

        {more.length > 0 && (
          <>
            <h3 className="mb-5 mt-14 font-serif text-xl text-muted">More work</h3>
            <div className="grid gap-5 md:grid-cols-2">
              {more.map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
            </div>
          </>
        )}

        <h3 className="mb-6 mt-16 font-serif text-xl text-muted">Experience</h3>
        <ol className="space-y-8 border-l border-line pl-6">
          {experience.map((j) => (
            <li key={j.org + j.period} className="relative">
              <span className="gradient-bar absolute -left-[31px] top-2 h-2.5 w-2.5 rounded-full" />
              <p className="text-xs uppercase tracking-widest text-muted">{j.period}</p>
              <h4 className="mt-1 font-serif text-lg">
                {j.role} <span className="text-muted">· {j.org}</span>
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                {j.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Awards */}
      <section id="awards" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="Awards">Recognition</SectionTitle>
        <div className="grid gap-5 md:grid-cols-2">
          {awards.map((a) => (
            <AwardCard key={a.title} a={a} />
          ))}
        </div>
      </section>

      {/* Gallery preview (only when there are photos) */}
      {gallery.length > 0 && (
        <section id="gallery" className="scroll-mt-20 border-t border-line py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Gallery</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Hall of fame &amp; memories</h2>
            </div>
            <Link href="/gallery" className="shrink-0 text-sm text-muted transition hover:text-foreground">
              See all →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((g) => (
              <li key={g.src} className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                <Link href="/gallery" aria-label={g.caption || "Open gallery"}>
                  <Image
                    src={g.src}
                    alt={g.caption || g.categoryLabel}
                    fill
                    sizes="(min-width:640px) 33vw, 50vw"
                    className="object-cover transition duration-300 hover:scale-105"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Speaking & writing */}
      <section id="speaking" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="Speaking & writing">Talks, articles &amp; press</SectionTitle>
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-serif text-xl">Talks</h3>
            <ul className="space-y-4">
              {talks.map((t, i) => (
                <li key={i} className="border-b border-line pb-4">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-muted">
                    {t.event} · {t.date}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl">Latest writing</h3>
            <ul className="space-y-4">
              {latestPosts.map((p) => (
                <li key={p.slug} className="border-b border-line pb-4">
                  <Link href={`/writing/${p.slug}`} className="font-medium transition hover:text-accent2">
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted">On this site · {formatDate(p.publishedAt)}</p>
                </li>
              ))}
              {articles.slice(0, 3 - latestPosts.length).map((a, i) => (
                <li key={i} className="border-b border-line pb-4">
                  <a href={a.href} target="_blank" rel="noreferrer" className="font-medium transition hover:text-accent2">
                    {a.title}
                  </a>
                  <p className="text-sm text-muted">{a.platform}</p>
                </li>
              ))}
            </ul>
            <Link href="/writing" className="mt-4 inline-block text-sm text-accent2">
              All articles →
            </Link>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-xl">Papers &amp; press</h3>
            <p className="text-sm leading-relaxed text-muted">
              One published research paper and two under review, plus features, interviews and conversations about
              my work.
            </p>
            <Link href="/press" className="mt-4 inline-block text-sm text-accent2">
              Papers, features &amp; conversations →
            </Link>
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="Community">Giving back</SectionTitle>
        <div className="rounded-3xl bg-card p-8 ring-1 ring-line sm:p-12">
          <div className="gradient-bar mb-6 h-1.5 w-16 rounded-full" />
          <h3 className="font-serif text-2xl sm:text-3xl">{community.headline}</h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">{community.body}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {community.roles.map((r) => (
              <li key={r} className="rounded-full bg-accentsoft px-3 py-1.5 text-sm text-accent">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 border-t border-line py-20">
        <SectionTitle kicker="Contact">Let&apos;s talk</SectionTitle>
        <p className="max-w-xl text-lg leading-relaxed">
          Hiring, inviting me to speak, or want to collaborate? Email is the best way to reach me.
        </p>
        <a
          href={`mailto:${site.email}`}
          className="mt-6 inline-block break-all font-serif text-2xl underline decoration-accent2 underline-offset-8 sm:text-3xl"
        >
          {site.email}
        </a>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="transition hover:text-foreground">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
