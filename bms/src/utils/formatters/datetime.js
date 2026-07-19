// utils/datetime.js

/**
 * Formats a date string/Date into a short PH-locale date (e.g. "Jul 11, 2026").
 * Returns a fallback string if the date is missing/invalid.
 */
export function formatDate(date, fallback = "—") {
  if (!date) return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
/**
 * Formats a date string/Date into a short PH-locale date + time
 * (e.g. "Jul 11, 2026, 2:30 PM").
 * Returns a fallback string if the date is missing/invalid.
 */
export function formatDateTime(date, fallback = "—") {
  if (!date) return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
export function formatRelativeTime(dateString) {
  if (!dateString) return "—";

  const then = new Date(dateString);
  const now = new Date();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} mo${diffMonth === 1 ? "" : "s"} ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} yr${diffYear === 1 ? "" : "s"} ago`;
}