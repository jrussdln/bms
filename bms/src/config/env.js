export const env = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Budget Management System",
  APP_ENV: import.meta.env.VITE_APP_ENV || "development",
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
  PUSHER_APP_KEY: import.meta.env.VITE_PUSHER_APP_KEY || "abc3d4cf12fa4bb9529b",
  PUSHER_APP_CLUSTER: import.meta.env.VITE_PUSHER_APP_CLUSTER || "ap1",
};