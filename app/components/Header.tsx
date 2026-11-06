import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { site } from "../content";

const nav = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#awards", label: "Awards" },
  { href: "/gallery", label: "Gallery" },
  { href: "/writing", label: "Writing" },
  { href: "/press", label: "Press" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-serif text-base sm:text-lg">
          {site.name}
          <span className="gradient-text">.</span>
        </Link>

        <div className="flex items-center gap-4">
          <ul className="hidden gap-5 text-sm text-muted md:flex">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>

          <ThemeToggle />

          {/* Mobile menu (no JavaScript needed) */}
          <details className="relative md:hidden">
            <summary
              aria-label="Open menu"
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-line text-muted [&::-webkit-details-marker]:hidden"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <ul className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-card p-2 text-sm shadow-lg">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block rounded-lg px-3 py-2 text-muted hover:bg-accentsoft hover:text-foreground">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
