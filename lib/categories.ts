// Single source of truth for product categories. Add a category here and it
// appears in the navbar, footer, shop side-nav, home showcase, and labels —
// no other file needs editing. `slug` must match products.category in the DB.

export type Category = { slug: string; label: string };

export const CATEGORIES: Category[] = [
  { slug: "atasan", label: "Atasan" },
  { slug: "bawahan", label: "Bawahan" },
  { slug: "dress", label: "Dress" },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
