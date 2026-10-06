/**
 * @file relativeTime.js
 * Date and text metrics utilities for Google Reviews
 */

/**
 * Format timestamp or date string into humanized relative time
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "Recently";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return "Just now";
  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

/**
 * Format absolute date string for tooltip/accessible view
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function formatAbsoluteDate(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Calculate reading metrics for review text
 * @param {string} text
 * @returns {{ charCount: number, wordCount: number, readingTimeText: string, isLongReview: boolean }}
 */
export function calculateReadingMetrics(text = "") {
  const clean = String(text || "").trim();
  const charCount = clean.length;
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    charCount,
    wordCount,
    readingTimeText: `${minutes} min read`,
    isLongReview: charCount > 220,
  };
}

/**
 * Generate a clean Google-style avatar SVG data URI with user initials
 * @param {string} name
 * @returns {string}
 */
export function generateInitialsAvatar(name = "Customer") {
  const clean = String(name || "Customer").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  let initials = "C";

  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].substring(0, 2).toUpperCase();
  }

  // Curated Google Material color palette
  const colors = [
    { bg: "#1a73e8", fg: "#ffffff" }, // Blue
    { bg: "#e37400", fg: "#ffffff" }, // Orange
    { bg: "#137333", fg: "#ffffff" }, // Green
    { bg: "#a142f4", fg: "#ffffff" }, // Purple
    { bg: "#c5221f", fg: "#ffffff" }, // Red
    { bg: "#007b83", fg: "#ffffff" }, // Teal
    { bg: "#d93025", fg: "#ffffff" }, // Crimson
    { bg: "#f29900", fg: "#202124" }, // Amber
  ];

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><rect width="80" height="80" rx="40" fill="${color.bg}"/><text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="600" fill="${color.fg}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
