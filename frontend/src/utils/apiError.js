const TYPE_MAP = {
  400: "validation",
  401: "auth",
  403: "forbidden",
  404: "notFound",
  409: "conflict",
  429: "rateLimit",
  500: "server",
};

const MESSAGES = {
  validation: "Please check your inputs and try again.",
  auth: "Your session has expired. Please log in again.",
  forbidden: "You don't have permission to perform this action.",
  notFound: "The requested resource was not found.",
  conflict: "A conflict occurred. This record may already exist.",
  rateLimit: "Too many requests. Please wait and try again.",
  server: "Something went wrong on our end. Please try again later.",
  network: "Network error. Please check your connection.",
  unknown: "An unexpected error occurred. Please try again.",
};

const TITLES = {
  validation: "Validation Error",
  auth: "Session Expired",
  forbidden: "Access Denied",
  notFound: "Not Found",
  conflict: "Conflict",
  rateLimit: "Too Many Requests",
  server: "Server Error",
  network: "Connection Error",
  unknown: "Error",
};

const RETRYABLE = new Set(["server", "network"]);

export function normalizeError(err) {
  if (err?.__normalized) return err;

  // Network error
  if (err?.request && !err?.response) {
    return _make("network", null, MESSAGES.network, null);
  }

  const status = err?.response?.status ?? err?.status ?? null;
  const data = err?.response?.data ?? null;
  const type = TYPE_MAP[status] ?? "unknown";

  if (data?.errors && Array.isArray(data.errors)) {
    const fields = {};
    data.errors.forEach((e) => {
      if (e.param) fields[e.param] = e.msg;
    });
    return _make(
      "validation",
      status,
      data.errors[0]?.msg ?? MESSAGES.validation,
      fields,
    );
  }

  const message = data?.error ?? MESSAGES[type] ?? MESSAGES.unknown;
  return _make(type, status, message, null);
}

export function throwNormalized(err) {
  throw normalizeError(err);
}

function _make(type, status, message, fields) {
  return {
    __normalized: true,
    type,
    status,
    message,
    fields,
    retryable: RETRYABLE.has(type),
  };
}

export function getTitle(type) {
  return TITLES[type] ?? TITLES.unknown;
}