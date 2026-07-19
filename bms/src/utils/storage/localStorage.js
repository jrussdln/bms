// src/utils/storage/localStorage.js

const PREFIX = "bms_";

function buildKey(key) {
  return `${PREFIX}${key}`;
}

/**
 * Get a value from localStorage, JSON-parsed.
 * Returns `fallback` if the key doesn't exist or parsing fails.
 */
export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(buildKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Store a value in localStorage (JSON-stringified).
 * Returns true on success, false on failure (quota exceeded, disabled, etc).
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a single key.
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(buildKey(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove all keys under this app's prefix (doesn't touch unrelated
 * localStorage entries from other apps on the same origin).
 */
export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a key exists.
 */
export function hasItem(key) {
  try {
    return localStorage.getItem(buildKey(key)) !== null;
  } catch {
    return false;
  }
}