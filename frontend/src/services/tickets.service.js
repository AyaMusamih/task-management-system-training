import axiosInstance from "../api/axiosInstance";

export const getTickets = async (params = {}) => {
    try {
        const { data } = await axiosInstance.get("/tickets/getTickets", {
            params,
        });

        return data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};