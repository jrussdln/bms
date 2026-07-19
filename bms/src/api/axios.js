import axios from "axios";
import { axiosConfig } from "../config/axiosConfig";
import { tokenUtils } from "../utils/auth/token";
import { ROUTES } from "../constants/routes";

const api = axios.create(axiosConfig);

// attach token to every outgoing request
api.interceptors.request.use((config) => {
  const token = tokenUtils.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auto-logout if token is invalid/expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.clearAuth();
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  },
);

export default api;
