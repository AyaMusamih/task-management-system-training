import axiosInstance from "../api/axiosInstance";

export const getSprints = async (page = 1, limit = 100) => {
  try {
    const { data } = await axiosInstance.get("/sprints", {
      params: { page, limit },
    });
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const createSprint = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/sprints/create", payload);
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const updateSprint = async (id, payload) => {
  try {
    const { data } = await axiosInstance.patch(`/sprints/update/${id}`, payload);
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const deleteSprint = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/sprints/${id}`);
    return data;
  } catch (error) {
    throw {
      status: error?.response?.status,
      message: error?.response?.data?.error || "Something went wrong",
    };
  }
};