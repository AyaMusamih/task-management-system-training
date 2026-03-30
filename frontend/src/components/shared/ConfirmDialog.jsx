import Button from "./Button";

const styles = {
    danger: {
        iconBg: "bg-red-500/10 text-red-500",
        button: "destructive",
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

const ConfirmDialog = ({
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
    variant = "danger",
    icon,
}) => {
    const current = styles[variant] || styles.danger;
    const loadingMap = {
        "Delete Ticket?": "Deleting...",
        "Confirm Logout": "Logging Out...",
        "Restore Ticket?": "Restoring...",
        "Confirm Your Identity": "Verifying...",
    };

    const loadingText = loadingMap[title] || confirmText;
    return (
        <div className="w-[400px] rounded-2xl bg-[#1A2332] text-white p-6 shadow-2xl border border-white/5">

            {/* Icon */}
            {icon && (
                <div className="mb-4">
                    <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${current.iconBg}`}>
                        {icon}
                    </div>
                </div>
            )}

            {/* Title */}
            <h2 className="text-dialog-title mb-4">
                {title}
            </h2>

            {/* Description */}
            <p className="text-dialog-description text-gray-400 mb-4 leading-relaxed">
                {description}
            </p>

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
                    className="flex-1 h-10 rounded-lg w-full !text-[14px] cursor-pointer"
                >
                    {loading ? loadingText : confirmText}
                </Button>

            </div>
        </div>
    );
};

export default ConfirmDialog;