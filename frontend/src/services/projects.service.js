import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

// GET Projects
export const fetchProjects = async (
    page = 1,
    limit = 20
) => {
    try {
        const response = await axiosInstance.get("/Projects", {
            params: { page, limit },
        });

        return response.data;
    } catch (err) {
        throwNormalized(err);
    }
};

// POST Project
export const createProject = async (projectData) => {
    try {
        const response = await axiosInstance.post(
            "/Projects",
            projectData
        );
        return response.data.data;
    } catch (err) {
        throwNormalized(err);
    }
};

// PATCH Project
export const updateProject = async (id, projectData) => {
    try {
        const response = await axiosInstance.patch(
            `/Projects/${id}`,
            projectData
        );
        return response.data.data;
    } catch (err) {
        throwNormalized(err);
    }
};

// DELETE Project
export const deleteProject = async (id) => {
    try {
        const response = await axiosInstance.delete(
            `/Projects/${id}`
        );
        return response.data.success;
    } catch (err) {
        throwNormalized(err);
    }
};