import axiosInstance from "../api/axiosInstance";

// Login user
export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post("/auth/login", { email, password });
        return response.data.data;
    } catch (err) {
        const data = err.response?.data;
        if (data?.errors) {
            const formatted = {};
            data.errors.forEach((e) => (formatted[e.param] = e.msg));
            throw { type: "validation", errors: formatted };
        } else if (data?.error) {
            throw { type: "general", message: data.error };
        } else {
            throw { type: "general", message: "Login failed. Please try again." };
        }
    }
};

// Signup
export const signupUser = async (form) => {
    try {
        const response = await axiosInstance.post("/auth/register", form);
        return response.data.data;
    } catch (err) {
        const data = err.response?.data;
        if (data?.errors) {
            const formatted = {};
            data.errors.forEach(e => formatted[e.param] = e.msg);
            throw { type: "validation", errors: formatted };
        } else if (data?.error) {
            throw { type: "general", message: data.error };
        } else {
            throw { type: "general", message: "Something went wrong" };
        }
    }
};

// Logout user
export const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
};