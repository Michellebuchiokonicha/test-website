import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { site } from "./content";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.title}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

// Runs before first paint so there's no light/dark flash.
// Order of precedence: the visitor's saved choice (header toggle) > their device setting > light.
// While they haven't chosen, the site follows the device if it switches between light and dark.
const themeScript = `(function(){try{
var r=document.documentElement,m=window.matchMedia('(prefers-color-scheme: dark)'),s=localStorage.getItem('theme');
function set(t){r.dataset.theme=t}
set(s==='dark'||s==='light'?s:(m.matches?'dark':'light'));
if(s!=='dark'&&s!=='light'){m.addEventListener('change',function(e){if(!localStorage.getItem('theme'))set(e.matches?'dark':'light')})}
}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
