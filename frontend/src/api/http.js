// import axios from "axios";
// import store from "../app/store";
// import { clearAuth, setAccessToken } from "../features/auth/authSlice";

// const http = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true, // ✅ refresh cookie uchun shart
// });

// // ✅ Request: access token + x-lang
// http.interceptors.request.use((config) => {
//   const token = store.getState().auth.accessToken;
//   if (token) config.headers.Authorization = `Bearer ${token}`;

//   const lang = localStorage.getItem("lang") || "uz";
//   config.headers["x-lang"] = lang;

//   return config;
// });

// // ✅ Response: 401 -> refresh -> retry
// http.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;

//     if (error.response?.status === 401 && !original?._retry) {
//       original._retry = true;

//       try {
//         const r = await axios.post(
//           `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
//           {},
//           { withCredentials: true },
//         );

//         const newToken = r.data?.accessToken;
//         if (!newToken) throw new Error("NO_ACCESS_TOKEN");

//         store.dispatch(setAccessToken(newToken));
//         original.headers.Authorization = `Bearer ${newToken}`;
//         return http(original);
//       } catch (e) {
//         store.dispatch(clearAuth());
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default http;
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ✅ tokenni localStorage’dan o‘qiymiz (store import yo‘q)
function getToken() {
  return localStorage.getItem("accessToken");
}

function setToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

// ✅ Request interceptor
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem("lang") || "uz";
  config.headers["x-lang"] = lang;

  return config;
});

// ✅ Refresh queue (PRO: parallel 401 larni bitta refresh bilan hal qiladi)
let refreshingPromise = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      try {
        if (!refreshingPromise) {
          refreshingPromise = axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: { "x-lang": localStorage.getItem("lang") || "uz" },
            },
          );
        }

        const r = await refreshingPromise;
        refreshingPromise = null;

        const newToken = r.data?.accessToken;
        if (newToken) {
          setToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return http(original);
        }
      } catch (e) {
        refreshingPromise = null;
        setToken(null);
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
export { setToken as setAccessToken };
