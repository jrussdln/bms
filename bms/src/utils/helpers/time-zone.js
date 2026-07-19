/**
 * utils/time-zone.js
 *
 * Helpers for converting between the browser's native <input type="datetime-local">
 * format ("YYYY-MM-DDTHH:mm", always local time, no timezone info) and the
 * various shapes a Laravel/MySQL backend tends to send or expect
 * ("YYYY-MM-DD HH:mm:ss", or full ISO strings in UTC).
 */

/**
 * Converts a DB datetime value (space-separated "YYYY-MM-DD HH:mm:ss",
 * or an ISO string) into the format a datetime-local input requires:
 * "YYYY-MM-DDTHH:mm".
 *
 * Returns "" if the value is missing/invalid, so it's safe to drop straight
 * into a controlled input's value prop.
 */
export function toDatetimeLocalValue(value) {
  if (!value) return "";

  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";

  return normalized.slice(0, 16);
}

/**
 * Returns the current local date/time in the format a datetime-local input
 * requires: "YYYY-MM-DDTHH:mm".
 *
 * Uses the timezone offset trick rather than toISOString() directly, since
 * toISOString() always returns UTC and would show the wrong time to the user.
 */
export function getCurrentDatetimeLocal() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now - offsetMs).toISOString().slice(0, 16);
}

/**
 * Converts a datetime-local input's value ("YYYY-MM-DDTHH:mm") into the
 * "YYYY-MM-DD HH:mm:ss" format most Laravel `date_format`/`datetime` columns
 * expect on submit. Appends ":00" for seconds since the input doesn't collect
 * them.
 *
 * Returns "" if the value is missing/invalid.
 */
export function fromDatetimeLocalValue(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return `${value.replace("T", " ")}:00`;
}