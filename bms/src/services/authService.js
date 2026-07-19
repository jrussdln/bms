import { authApi } from "../api/endpoints/auth.api";
import { tokenUtils } from "../utils/auth/token";

export const authService = {
  async login(credentials) {
    const res = await authApi.login(credentials);
    const { token, user } = res.data;

    tokenUtils.setToken(token);
    tokenUtils.setUser(user);

    return user;
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      tokenUtils.clearAuth();
    }
  },

  getCurrentUser() {
    return tokenUtils.getUser();
  },

  isAuthenticated() {
    return !!tokenUtils.getToken();
  },
};