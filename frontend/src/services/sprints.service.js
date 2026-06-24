import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

// Get sprints, optionally scoped to a single project via projectId
export const getSprints = async (page = 1, limit = 100, projectId) => {
  try {
    const params = { page, limit };
    if (projectId != null) params.projectId = projectId;

    const { data } = await axiosInstance.get("/sprints", { params });
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const createSprint = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/sprints/create", payload);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const updateSprint = async (id, payload) => {
  try {
    const { data } = await axiosInstance.patch(
      `/sprints/update/${id}`,
      payload,
    );
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const deleteSprint = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/sprints/${id}`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};
