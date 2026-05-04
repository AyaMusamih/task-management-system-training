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

export const getTicketById = async (id) => {
    try {
        const { data } = await axiosInstance.get(`/tickets/${id}`);
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
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

export const softDeleteTicket = async (id) => {
    try {
        const { data } = await axiosInstance.delete(`/tickets/${id}`);
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
    }
};

export const permanentDeleteTicket = async (id) => {
    try {
        const { data } = await axiosInstance.delete(`/tickets/${id}/permanent`);
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
    }
};

export const restoreTicket = async (id) => {
    try {
        const { data } = await axiosInstance.patch(`/tickets/${id}/restore`);
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
    }
};

export const getDeletedTickets = async (params = {}) => {
    try {
        const { data } = await axiosInstance.get("/tickets/getTickets", {
            params: { ...params, deletedOnly: true },
        });
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
    }
};

export const deleteAllPermanent = async () => {
    try {
        const { data } = await axiosInstance.delete("/tickets/permanent");
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Something went wrong",
        };
    }
};

export const updateTicketStatus = async (id, status) => {
    try {
        const { data } = await axiosInstance.patch(`/tickets/${id}/status`, {
            status,
        });
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Something went wrong",
        };
    }
};

export const getTicketAudit = async (id) => {
    try {
        const { data } = await axiosInstance.get(`/tickets/${id}/audit`);
        return data;
    } catch (error) {
        throw {
            status: error?.response?.status,
            message:
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to fetch audit",
        };
    }
};
