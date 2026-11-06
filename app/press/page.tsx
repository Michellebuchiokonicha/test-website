import type { Metadata } from "next";
import SectionTitle from "../components/SectionTitle";
import { press, type PressItem } from "../content";

export const metadata: Metadata = {
  title: "Press & papers",
  description: "Research papers, magazine features, interviews and conversations.",
};

const groups: { title: string; types: PressItem["type"][] }[] = [
  { title: "Research papers", types: ["Paper"] },
  { title: "Magazine & press features", types: ["Feature", "Mention"] },
  { title: "Interviews, podcasts & talks", types: ["Interview", "Podcast", "Talk"] },
];

export default function PressPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <SectionTitle kicker="Press & papers" as="h1">
        Papers, features &amp; conversations
      </SectionTitle>
      <p className="-mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Where my research has been published and where my work has been featured or discussed.
      </p>

      {groups.map((g) => {
        const items = press.filter((p) => g.types.includes(p.type));
        if (items.length === 0) return null;
        return (
          <section key={g.title} className="mt-14">
            <h2 className="mb-6 font-serif text-2xl">{g.title}</h2>
            <ul className="divide-y divide-line border-y border-line">
              {items.map((p, i) => (
                <li key={i}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="block font-medium transition group-hover:text-accent2">{p.title}</span>
                      <span className="block text-sm text-muted">{p.outlet}</span>
                    </span>
                    <span className="shrink-0 text-sm text-muted">
                      {p.type}
                      {p.date ? ` · ${p.date}` : ""} ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
