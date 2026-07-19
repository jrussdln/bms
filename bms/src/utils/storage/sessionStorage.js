// src/utils/storage/sessionStorage.js

const PREFIX = "bms_";

function buildKey(key) {
  return `${PREFIX}${key}`;
}

export function getItem(key, fallback = null) {
  try {
    const raw = sessionStorage.getItem(buildKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    sessionStorage.setItem(buildKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    sessionStorage.removeItem(buildKey(key));
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
    return true;
  } catch {
    return false;
  }
}

export function hasItem(key) {
  try {
    return sessionStorage.getItem(buildKey(key)) !== null;
  } catch {
    return false;
  }
}