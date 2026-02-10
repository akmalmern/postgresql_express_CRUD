import axios from "axios";
import store from "../app/store";
import { clearAuth, setAccessToken } from "../features/auth/authSlice";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ refresh cookie uchun shart
});

// ✅ Request: access token + x-lang
http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem("lang") || "uz";
  config.headers["x-lang"] = lang;

  return config;
});

// ✅ Response: 401 -> refresh -> retry
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      try {
        const r = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = r.data?.accessToken;
        if (!newToken) throw new Error("NO_ACCESS_TOKEN");

        store.dispatch(setAccessToken(newToken));
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        store.dispatch(clearAuth());
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
