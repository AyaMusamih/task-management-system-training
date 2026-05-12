import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

export const getUsers = async (page = 1, limit = 100) => {
  try {
    const { data } = await axiosInstance.get("/admin/users", {
      params: { page, limit },
    });
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};
