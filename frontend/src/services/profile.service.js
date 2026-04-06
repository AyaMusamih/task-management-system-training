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