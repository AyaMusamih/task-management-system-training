import { CircleCheckBig, XCircle, ShieldAlert, BadgeInfo } from "lucide-react";
import { showToast } from "./showToast";
import { getTitle } from "./apiError";

export function toastSuccess(title, description) {
    showToast({
        title,
        description,
        icon: <CircleCheckBig className="w-4 h-4" />,
        type: "success",
    });
}

export function toastError(err, fallbackTitle) {
    if (typeof err === "string") {
        showToast({
            title: fallbackTitle ?? "Error",
            description: err,
            icon: <XCircle className="w-4 h-4" />,
            type: "error",
        });
        return;
    }

    const title = fallbackTitle ?? getTitle(err?.type);
    showToast({
        title,
        description: err?.message ?? "An unexpected error occurred.",
        icon: <XCircle className="w-4 h-4" />,
        type: "error",
    });
}

export function toastWarning(err, fallbackTitle) {
    if (typeof err === "string") {
        showToast({
            title: fallbackTitle ?? "Warning",
            description: err,
            icon: <ShieldAlert className="w-4 h-4" />,
            type: "warning",
        });
        return;
    }

    const title = fallbackTitle ?? getTitle(err?.type);
    showToast({
        title,
        description: err?.message ?? "Something needs your attention.",
        icon: <ShieldAlert className="w-4 h-4" />,
        type: "warning",
    });
}

export function toastInfo(title, description) {
    showToast({
        title,
        description,
        icon: <BadgeInfo className="w-4 h-4" />,
        type: "info",
    });
}