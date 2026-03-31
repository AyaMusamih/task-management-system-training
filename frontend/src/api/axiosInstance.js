import axios from "axios";
import { logoutUser } from "../services/auth.service";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url.includes("/auth/");

    // if (originalRequest._retry) {
    //   return Promise.reject(error);
    // }

    if (error.response?.status === 401 && !isAuthRoute) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        await logoutUser(refreshToken);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionExpired"));
        }

        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionRefreshing"));
        }

        const response = await refreshClient.post("/auth/refresh", {
          refreshToken,
        });

        const newToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionRefreshed"));
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await logoutUser(refreshToken);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionExpired"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// import axios from "axios";
// import { logoutUser } from "../services/auth.service";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3000",
//   headers: { "Content-Type": "application/json" },
// });

// const refreshClient = axios.create({
//   baseURL: "http://localhost:3000",
//   headers: { "Content-Type": "application/json" },
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   console.log("[AXIOS] Processing queue:", failedQueue.length, "requests");
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     console.log("[AXIOS REQUEST] ", config.method.toUpperCase(), config.url, "Token:", !!token);
//     return config;
//   },
//   (error) => {
//     console.log("[AXIOS REQUEST ERROR]", error);
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   (response) => {
//     console.log("[AXIOS RESPONSE] ", response.status, response.config.url);
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     const isAuthRoute = originalRequest.url.includes("/auth/");

//     console.log("[AXIOS RESPONSE ERROR]", error.response?.status, error.response?.data, originalRequest.url);

//     if (error.response?.status === 401 && !isAuthRoute) {
//       if (originalRequest._retry) {
//         console.log("[AXIOS] Request already retried, failing:", originalRequest.url);
//         return Promise.reject(error);
//       }

//       console.log("[AXIOS] 401 detected, starting refresh for:", originalRequest.url);
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem("refreshToken");
//       console.log("[AXIOS] Current refreshToken:", refreshToken);

//       if (!refreshToken) {
//         console.log("[AXIOS] No refresh token, logging out...");
//         await logoutUser(refreshToken);
//         if (typeof window !== "undefined") window.dispatchEvent(new Event("sessionExpired"));
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         console.log("[AXIOS] Refresh in progress, queueing request:", originalRequest.url);
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             console.log("[AXIOS] Retrying queued request:", originalRequest.url);
//             return axiosInstance(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         if (typeof window !== "undefined") window.dispatchEvent(new Event("sessionRefreshing"));
//         console.log("[AXIOS] Sending refresh request...");

//         const response = await refreshClient.post("/auth/refresh", { refreshToken });
//         const newToken = response.data.data.accessToken;
//         const newRefreshToken = response.data.data.refreshToken;

//         console.log("[AXIOS] Refresh successful. New accessToken:", newToken);

//         localStorage.setItem("accessToken", newToken);
//         localStorage.setItem("refreshToken", newRefreshToken);
//         axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

//         processQueue(null, newToken);
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;

//         if (typeof window !== "undefined") window.dispatchEvent(new Event("sessionRefreshed"));
//         console.log("[AXIOS] Retrying original request after refresh:", originalRequest.url);

//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.log("[AXIOS] Refresh failed:", refreshError.response?.data || refreshError);
//         processQueue(refreshError, null);
//         await logoutUser(refreshToken);
//         if (typeof window !== "undefined") window.dispatchEvent(new Event("sessionExpired"));
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;