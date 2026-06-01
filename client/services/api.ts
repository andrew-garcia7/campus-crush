import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 30_000,
});

// Automatically attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cc_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});