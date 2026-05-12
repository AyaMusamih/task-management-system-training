import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

export const getProfile = async () => {
  try {
    const { data } = await axiosInstance.get("/profile");
    return data.data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await axiosInstance.put("/profile", payload);
    return data.data;
  } catch (error) {
    throwNormalized(error);
  }
};

// Change Password
export const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  try {
    const response = await axiosInstance.put("/profile/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (err) {
    throwNormalized(err);
  }
};
