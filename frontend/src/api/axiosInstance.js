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

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !isAuthRoute) {
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

        // if (typeof window !== "undefined") {
        //   window.dispatchEvent(new Event("sessionRefreshed"));
        // }

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