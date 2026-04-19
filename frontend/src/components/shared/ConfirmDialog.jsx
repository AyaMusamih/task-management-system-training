import { useState } from "react";
import Button from "./Button";
import Input from "./Input";

const styles = {
    danger: {
        iconBg: "bg-red-500/10 text-red-500",
        button: "destructive",
    },
    permDanger: {
        iconBg: "bg-red-500/10 text-red-500",
        button: "destructive",
    },
    softDanger: {
        iconBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
        button: "primary",
    },
    warning: {
        iconBg: "bg-[#D97706]/10 text-[#D97706]",
        button: "primary",
    },
    info: {
        iconBg: "bg-blue-500/10 text-blue-400",
        button: "primary",
    },
    success: {
        iconBg: "bg-green-500/10 text-green-400",
        button: "primary",
    },
};

const messages = {
    permDanger: {
        warning: "This action is permanent. All data will be erased with no way to recover.",
        needsConfirm: true,
    },
    softDanger: {
        warning: "This action is reversible. The ticket moves to Trash and can be restored by any Admin.",
        needsConfirm: false,
    },
};

const ConfirmDialog = ({
    title,
    ticket,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
    variant = "danger",
    icon,
}) => {
    const [isChecked, setIsChecked] = useState(false)
    const currentMessage = messages[variant];
    const current = styles[variant] || styles.danger;
    const loadingMap = {
        "Delete ticket permanently?": "Deleting...",
        "Move ticket to trash?": "Moving...",
        "Confirm Logout": "Logging Out...",
        "Restore Ticket?": "Restoring...",
        "Confirm Your Identity": "Verifying...",
    };

    const loadingText = loadingMap[title] || confirmText;
    return (
        <div className={`w-[92vw] mx-auto rounded-2xl bg-[#1A2332] text-white p-6 shadow-2xl border border-white/5 ${variant === "permDanger" ? "max-w-[450px]" : "max-w-[400px]"}`}>
            <div className={`${variant === "permDanger" || variant === "softDanger" ? "flex gap-4 items-start" : ""}`}>

                {/* Icon */}
                {icon && (
                    <div className={variant === "permDanger" || variant === "softDanger" ? "" : "mb-4"}>
                        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${current.iconBg}`}>
                            {icon}
                        </div>
                    </div>
                )}

                {/* Title + Description */}
                <div>
                    <h2 className="text-dialog-title mb-3">
                        {title}
                    </h2>

                    <p
                        className={`text-delete-dialog-description mb-4 leading-relaxed ${variant === "permDanger" ? "!text-[#DC2626]" : "text-gray-400"
                            }`}>
                        {description}
                    </p>
                </div>

            </div>

            {ticket && (
                <div className="mb-4 px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2">

                    {/* Ticket ID */}
                    <span className="text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {ticket.id}
                    </span>

                    {/* Ticket Title */}
                    <span className="truncate max-w-[220px]">
                        {ticket.title}
                    </span>

                </div>
            )}

            {currentMessage?.warning && (
                <div className={`mb-4 p-3 rounded-lg border text-sm
        ${variant === "permDanger"
                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                        : "border-[#FBBF24]/20 bg-[#FBBF24]/10 text-[#FBBF24]"
                    }`}
                >
                    {currentMessage.warning}
                </div>
            )}

            {currentMessage?.needsConfirm && (
                <div className="flex items-start gap-2 mb-4 p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                    <Input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        danger
                        className="mt-1! w-4! h-4!"
                    />
                    <p className="text-sm text-gray-400">
                        I understand this action is permanent and cannot be reversed
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">

                {/* Cancel */}
                {onCancel && <Button
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 h-10 rounded-lg border border-white/10 hover:bg-white/5 w-full !text-[14px] cursor-pointer !text-text-secondary"
                >
                    {cancelText}
                </Button>}

                {/* Confirm */}
                <Button
                    variant={current.button}
                    onClick={onConfirm}
                    loading={loading}
                    disabled={loading || (currentMessage?.needsConfirm && !isChecked)}
                    className={`flex-1 h-10 rounded-lg w-full !text-[14px] cursor-pointer ${variant === "softDanger"
                        ? "!bg-[#D97706] hover:bg-[#D97706]/90!"
                        : ""}`}
                >
                    {loading ? loadingText : confirmText}
                </Button>

            </div>
        </div>
    );
};

export default ConfirmDialog;