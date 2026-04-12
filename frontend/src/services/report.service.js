import axiosInstance from "../api/axiosInstance";

export const getMyReports = async (params) => {
    try {
        const { data } = await axiosInstance.get("/reports/me", {
            params,
        });

        return data.data;
    } catch (err) {
        const res = err.response;
        const data = res?.data;

        // Network error
        if (!res) {
            throw {
                type: "network",
                message: "Network error. Please check your connection.",
                status: null,
            };
        }
        
        //Forbidden error
        if (res?.status === 403) {
            throw {
                type: "forbidden",
                message: "You don't have permission to view this data",
            };
        }

        // Validation errors 
        if (Array.isArray(data?.errors)) {
            const formatted = {};

            data.errors.forEach((e) => {
                formatted[e.param] = e.msg;
            });

            throw {
                type: "validation",
                message: data.errors[0]?.msg || "Invalid input",
                errors: formatted,
                status: res?.status,
            };
        }

        // generic backend error
        if (data?.error) {
            throw {
                type: "server",
                message: data.error,
                status: res?.status,
            };
        }

        // fallback
        throw {
            type: "server",
            message: "Something went wrong while fetching reports",
            status: res?.status,
        };
    }
};