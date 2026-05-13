import { useState } from "react";
import { ChevronDown, Info, AlertCircle } from "lucide-react";
import { updateTicketStatus } from "../../services/tickets.service";
import { showToast } from "../../utils/showToast";
import { CircleCheckBig, XCircle } from "lucide-react";

const STATUS_OPTIONS = [
    { key: "SCOPED_BACKLOG", label: "Scoped Backlog", color: "#bec4cf" },
    { key: "SPRINT_BACKLOG", label: "Sprint Backlog", color: "#A78BFA" },
    { key: "TODO", label: "To Do", color: "#60A5FA" },
    { key: "IN_PROGRESS", label: "In Progress", color: "#F59E0B" },
    { key: "DONE", label: "Done", color: "#22C55E" },
    { key: "TESTED", label: "Tested", color: "#06B6D4" },
    { key: "STAGED", label: "Staged", color: "#F97316" },
    { key: "DEPLOYED", label: "Deployed", color: "#16A34A" },
];

const StatusControl = ({
    ticketId,
    initialStatus,
    canUpdate,
    onSuccess,
}) => {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem("user")) || null;
    const current = STATUS_OPTIONS.find((s) => s.key === status);

    const getAllowedStatuses = () => {
        if (user?.role === "ADMIN") return STATUS_OPTIONS;

        const map = {
            TODO: ["IN_PROGRESS", "DONE"],
            IN_PROGRESS: ["DONE"],
        };

        const allowed = map[status] || [];

        return STATUS_OPTIONS.filter(s => allowed.includes(s.key));
    };

    const handleSelect = async (newStatus) => {
        console.log("newStatus:", newStatus, "| current status:", status);

        setOpen(false);
        setError(null);

        const oldStatus = status;
        setStatus(newStatus);

        try {
            setLoading(true);

            const res = await updateTicketStatus(ticketId, newStatus);
            const label = STATUS_OPTIONS.find(s => s.key === newStatus)?.label;
            setStatus(res.data.status);

            showToast({
                title: "Status Updated",
                description: `Ticket moved to ${label} successfully`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

            onSuccess?.();

        } catch (err) {
            let message = "Something went wrong";

            if (err.status === 403) {
                message = "You can update status only if you are assigned to this ticket";
            } else if (err.status === 409) {
                message = "Invalid status transition. Follow the workflow order.";
            } else {
                message = err.message;
            }

            setError(message);

            showToast({
                title: "Failed to Update Status",
                description: message,
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });

            setStatus(oldStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1A2332] rounded-2xl p-4 w-full">

            {/* Label */}
            <p className="text-sm text-text-hint mb-2">Status</p>

            {/* Select */}
            <div className="relative">

                <div
                    onClick={() => {
                        if (!canUpdate || loading) return;
                        setOpen((v) => !v);
                    }}
                    className={`
                        flex items-center justify-between px-4 py-3 rounded-lg border transition-all bg-[#131920]
                        ${error ? "border-error-red" : "border-white/10 hover:border-white/20 "}
                        ${!canUpdate || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        bg-[#1A2332]
                    `}
                >
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: current?.color }} />
                        <span className="text-sm "
                            style={{ color: current?.color }}>
                            {current?.label}
                        </span>
                    </div>

                    <ChevronDown className="w-4 h-4 text-text-hint" />
                </div>

                {/* Dropdown */}
                {open && canUpdate && (
                    <div className="absolute mt-2 w-full bg-[#1A2332] border border-white/10 rounded-lg shadowlg z-50">

                        {getAllowedStatuses().map((s) => (
                            <div
                                key={s.key}
                                onClick={() => handleSelect(s.key)}
                                style={{ color: s.color }}
                                className="px-4 py-2 text-sm text-text-primary hover:bg-white/5 cursor-pointer transition hover:rounded-t-lg"
                            >
                                {s.label}
                            </div>
                        ))}

                    </div>
                )}
            </div>

            {/* Helper (not assigned) */}
            {!canUpdate && !error && (
                <div className="flex items-center justify-start gap-2 mt-2 text-permissions bg-accent-blue/10 border border-accent-blue/30 text-[13px] px-2 py-2 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span>
                        You can update status only if you are assigned to this ticket.
                    </span>
                </div>
            )}

            {/* Error (409 / 403) */}
            {error && (
                <div className="flex items-center gap-2 mt-3 text-error-red bg-error-red/10 border border-error-red/30 px-3 py-2 rounded-lg text-[13px]">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

        </div>
    );
};

export default StatusControl;