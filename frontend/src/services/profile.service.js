import axiosInstance from "../api/axiosInstance";

export const getProfile = async () => {
  try {
    const { data } = await axiosInstance.get("/profile");
    return data.data;
  } catch (error) {
    throw {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.response?.data?.error || "Something went wrong",
    };
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await axiosInstance.put("/profile", payload);
    return data.data;
  } catch (error) {
    throw {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.response?.data?.error || "Something went wrong",
    };
  }
};

// Change Password
export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  try {
    const response = await axiosInstance.put("/profile/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (err) {
    const data = err.response?.data;

    if (data?.errors) {
      const formatted = {};
      data.errors.forEach((e) => (formatted[e.param] = e.msg));
      throw { type: "validation", errors: formatted };
    } else if (data?.error) {
      const msg = data?.error;

      if (msg === "Invalid current password") {
        throw { type: "currentPassword", message: msg };
      } else {
        throw { type: "general", message: data.error };
      }
    } else {
      throw { type: "general", message: "Something went wrong. Please try again." };
    }
  }
};