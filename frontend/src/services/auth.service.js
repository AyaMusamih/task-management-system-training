import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 429) {
      throw {
        type: "rateLimit",
        status: 429,
        message: data?.error ?? "Too many attempts.",
      };
    }

    throwNormalized(err);
  }
};

// Signup
export const signupUser = async (form) => {
  try {
    const response = await axiosInstance.post("/auth/register", form);
    return response.data.data;
  } catch (err) {
    throwNormalized(err);
  }
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (err) {
    throwNormalized(err);
  }
};

// Reset Password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (err) {
    throwNormalized(err);
  }
};

//Logout
export const logoutUser = async () => {
  try {
    await axiosInstance.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
      },
    );
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return true;
  } catch (err) {
    console.error("Logout failed:", err);
    return false;
  }
};
