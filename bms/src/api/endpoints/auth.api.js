import api from "../axios";
//talks or communicate to the network

// src/api/endpoints/auth.api.js
export const authApi = {
  login: (credentials) => api.post("/login", credentials),
  register: (payload) => api.post("/register", payload),
  logout: () => api.post("/logout"),
  refreshToken: () => api.post("/refresh-token"),
  getProfile: () => api.get("/me"),
  markOffline: () => api.post("/mark-offline"),
  heartbeat: () => api.post("/heartbeat"), // add this
};