import sanitizeHtml from "sanitize-html";

// Article HTML comes from the editor, but is always cleaned again on the server
// before it is stored, so only a safe set of tags ever reaches visitors.
export function cleanHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "del", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
          target: attribs.href?.startsWith("/") || attribs.href?.startsWith("#") ? "_self" : "_blank",
        },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
    // allow root-relative image URLs such as /uploads/photo.jpg
    allowedSchemesAppliedToAttributes: ["href", "src"],
    exclusiveFilter: undefined,
  });
}
