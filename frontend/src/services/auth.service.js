import axiosInstance from "../api/axiosInstance";

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  } catch (err) {
    const data = err.response?.data;
    const status = err.response?.status;

    if (data?.errors) {
      const formatted = {};
      data.errors.forEach((e) => (formatted[e.param] = e.msg));
      throw { type: "validation", errors: formatted };
    }
    throw {
      type: "general",
      message: data?.error || "Login failed. Please try again.",
      status: status
    };
  }
};

// Signup
export const signupUser = async (form) => {
  try {
    const response = await axiosInstance.post("/auth/register", form);
    return response.data.data;
  } catch (err) {
    const data = err.response?.data;
    if (data?.errors) {
      const formatted = {};
      data.errors.forEach((e) => (formatted[e.param] = e.msg));
      throw { type: "validation", errors: formatted };
    } else if (data?.error) {
      throw { type: "general", message: data.error };
    } else {
      throw { type: "general", message: "Something went wrong" };
    }
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
    const data = err.response?.data;
    if (data?.errors) {
      const formatted = {};
      data.errors.forEach((e) => (formatted[e.param] = e.msg));
      throw { type: "validation", errors: formatted };
    } else if (data?.error) {
      throw { type: "general", message: data.error };
    } else {
      throw {
        type: "general",
        message: "Something went wrong. Please try again.",
      };
    }
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
    const data = err.response?.data;
    if (data?.errors) {
      const formatted = {};
      data.errors.forEach((e) => (formatted[e.param] = e.msg));
      throw { type: "validation", errors: formatted };
    } else if (data?.error) {
      throw { type: "general", message: data.error };
    } else {
      throw {
        type: "general",
        message: "Something went wrong. Please try again.",
      };
    }
  }
};

//Logout
export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout", {}, {
      withCredentials: true
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return true;
  } catch (err) {
    console.error("Logout failed:", err);
    return false;
  }
};
