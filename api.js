// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log('[api] Request:', config.method?.toUpperCase(), config.url, 'Auth:', !!config.headers["Authorization"]);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Export helper if you want to manually set/remove token
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export default api;
