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

export const createTicket = async (payload) => {
    try {
        const { data } = await axiosInstance.post("/tickets", payload);
        return data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};

export const updateTicket = async (id, payload) => {
    try {
        const { data } = await axiosInstance.patch(`/tickets/${id}`, payload);
        return data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};