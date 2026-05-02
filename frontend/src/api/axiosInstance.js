import axios from "axios";
import { logoutUser } from "../services/auth.service";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");
    const message = error.response?.data?.error;

    if (
      error.response?.status === 401 &&
      message !== "Invalid current password" &&
      !isAuthRoute
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

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

      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionRefreshing"));
        }

        const response = await refreshClient.post("/auth/refresh");
        console.log(response.data.data + "\n Refresh Error!");

        const newToken = response.data.data;

        localStorage.setItem("accessToken", newToken);

        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionRefreshed"));
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        await logoutUser();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sessionExpired"));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response && error.request) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("connectionLost"));
      }
      return new Promise((resolve, reject) => {
        window.__retryRequest = () =>
          axiosInstance(originalRequest).then(resolve).catch(reject);
        window.__cancelRequest = () => reject(error);
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
