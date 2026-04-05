import axiosInstance from "../api/axiosInstance";

export const getUsers = async (page = 1, limit = 100) => {
  try {
    const { data } = await axiosInstance.get("/admin/users", {
      params: { page, limit },
    });
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};