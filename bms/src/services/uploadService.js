import api from "../api/axios";
import { env } from "../config/env";

/**
 * Uploads a user's profile image to the backend.
 * Backend stores the file on local disk and returns the updated
 * user record (including the new strProfile filename).
 *
 * @param {number|string} userId
 * @param {File} file
 * @returns {Promise<object>} updated user data from the API
 */
export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post(`/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.user ?? res.data.data ?? res.data;
}

/**
 * Builds the full displayable URL for a stored profile image filename.
 * The storage symlink (public/storage) lives at the app root, not under
 * /api, so we strip a trailing /api from the axios base URL before
 * building the path.
 */
const API_ROOT = env.API_BASE_URL.replace(/\/api\/?$/, "");
const STORAGE_BASE = `${API_ROOT}/storage/avatars`;

export function getAvatarUrl(strProfileImage) {
  if (!strProfileImage) return null;
  return `${STORAGE_BASE}/${strProfileImage}`;
}