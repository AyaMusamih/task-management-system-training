import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

export const getTickets = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get("/tickets/getTickets", {
      params,
    });

    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const getTicketById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/tickets/${id}`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const createTicket = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/tickets", payload);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const updateTicket = async (id, payload) => {
  try {
    const { data } = await axiosInstance.patch(`/tickets/${id}`, payload);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const softDeleteTicket = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/tickets/${id}`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const permanentDeleteTicket = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/tickets/${id}/permanent`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const restoreTicket = async (id) => {
  try {
    const { data } = await axiosInstance.patch(`/tickets/${id}/restore`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const getDeletedTickets = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get("/tickets/getTickets", {
      params: { ...params, deletedOnly: true },
    });
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const deleteAllPermanent = async () => {
  try {
    const { data } = await axiosInstance.delete("/tickets/permanent");
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const updateTicketStatus = async (id, status) => {
  try {
    const { data } = await axiosInstance.patch(`/tickets/${id}/status`, {
      status,
    });
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const getTicketAudit = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/tickets/${id}/audit`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const getTicketComments = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/tickets/${id}/comments`);
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};

export const addTicketComment = async (id, content) => {
  try {
    const { data } = await axiosInstance.post(`/tickets/${id}/comments`, {
      content,
    });
    return data;
  } catch (error) {
    throwNormalized(error);
  }
};
