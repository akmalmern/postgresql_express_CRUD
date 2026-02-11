// import axios from "axios";

// const http = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

// // ✅ tokenni localStorage’dan o‘qiymiz (store import yo‘q)
// function getToken() {
//   return localStorage.getItem("accessToken");
// }

// function setToken(token) {
//   if (token) localStorage.setItem("accessToken", token);
//   else localStorage.removeItem("accessToken");
// }

// // ✅ Request interceptor
// http.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;

//   const lang = localStorage.getItem("lang") || "uz";
//   config.headers["x-lang"] = lang;

//   return config;
// });

// // ✅ Refresh queue (PRO: parallel 401 larni bitta refresh bilan hal qiladi)
// let refreshingPromise = null;

// http.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config;

//     if (error?.response?.status === 401 && !original?._retry) {
//       original._retry = true;

//       try {
//         if (!refreshingPromise) {
//           refreshingPromise = axios.post(
//             `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
//             {},
//             {
//               withCredentials: true,
//               headers: { "x-lang": localStorage.getItem("lang") || "uz" },
//             },
//           );
//         }

//         const r = await refreshingPromise;
//         refreshingPromise = null;

//         const newToken = r.data?.accessToken;
//         if (newToken) {
//           setToken(newToken);
//           original.headers.Authorization = `Bearer ${newToken}`;
//           return http(original);
//         }
//       } catch (e) {
//         refreshingPromise = null;
//         setToken(null);
//         return Promise.reject(e);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default http;
// export { setToken as setAccessToken };
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

function getToken() {
  return localStorage.getItem("accessToken");
}

function setToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

function hasSession() {
  // ✅ login bo‘lganda qo‘yiladigan flag
  return localStorage.getItem("hasSession") === "1";
}

// ✅ Request interceptor
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem("lang") || "uz";
  config.headers["x-lang"] = lang;

  return config;
});

// ✅ Refresh queue
let refreshingPromise = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // ✅ refresh endpoint o‘zida bo‘lsa -> qayta refreshga urinmaymiz
    if (original?.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    // ✅ session bo‘lmasa -> refresh qilishga urinmaymiz (401 spam yo‘q)
    if (!hasSession()) {
      return Promise.reject(error);
    }

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

        // token kelmasa -> session tugadi
        localStorage.removeItem("hasSession");
        setToken(null);
        return Promise.reject(error);
      } catch (e) {
        refreshingPromise = null;
        localStorage.removeItem("hasSession");
        setToken(null);
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
export { setToken as setAccessToken };
