import axiosInstance from "../api/axiosInstance";
import { throwNormalized } from "../utils/apiError";

export const getMyReports = async (params) => {
  try {
    const { data } = await axiosInstance.get("/reports/me", {
      params,
    });

    return data.data;
  } catch (err) {
    throwNormalized(err);
  }
};

export const getAdminReports = async (params) => {
  try {
    const { data } = await axiosInstance.get("/reports/admin", { params });
    return data.data;
  } catch (err) {
    throwNormalized(err);
  }
};

export const getAdminReportExport = async (params) => {
  try {
    const response = await axiosInstance.get("/reports/admin/export", {
      params,
      responseType: "blob",
    });

    const disposition = response.headers?.["content-disposition"];
    let filename = "admin-report.csv";
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    if (err?.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        err.response.data = json;
      } catch {
        // ignore parse failure, normalizeError will handle it
      }
    }
    throwNormalized(err);
  }
};
