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

export const getAdminReports = async (params) => {
  try {
    const { data } = await axiosInstance.get("/reports/admin", { params });
    return data.data;
  } catch (err) {
    const res = err.response;
    const data = res?.data;

    if (!res) {
      throw {
        type: "network",
        message: "Network error. Please check your connection.",
        status: null,
      };
    }
    if (res?.status === 403) {
      throw {
        type: "forbidden",
        message: "You don't have permission to view this data",
      };
    }
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
    if (data?.error) {
      throw { type: "server", message: data.error, status: res?.status };
    }
    throw {
      type: "server",
      message: "Something went wrong while fetching reports",
      status: res?.status,
    };
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
    const res = err.response;

    if (!res)
      throw {
        type: "network",
        message: "Network error. Please check your connection.",
      };
    if (res?.status === 403)
      throw {
        type: "forbidden",
        message: "You don't have permission to export",
      };

    if (res?.data instanceof Blob) {
      try {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw {
          type: "server",
          message: json?.error || "Failed to export report",
          status: res?.status,
        };
      } catch {
        // JSON parse failed, fall through to generic error
      }
    }

    throw {
      type: "server",
      message: "Failed to export report",
      status: res?.status,
    };
  }
};
