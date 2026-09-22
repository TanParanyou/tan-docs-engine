/**
 * Utility functions for tan-docs-engine
 */

/**
 * Combines conditional CSS class names into a single clean string
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ").trim();
}

/**
 * Format numbers with locale comma separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("th-TH").format(num);
}

/**
 * Generate a URL-friendly slug from string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}
