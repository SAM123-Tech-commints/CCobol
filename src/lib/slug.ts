/** URL-safe id for heading anchors (used by Markdown + the search index). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_>#]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}
