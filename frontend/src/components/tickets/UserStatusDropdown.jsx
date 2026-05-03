import { useState, useEffect, useRef } from "react";
import { ChevronDown, CircleCheckBig, XCircle } from "lucide-react";
import { showToast } from "../../utils/showToast";
import { updateTicketStatus } from "../../services/tickets.service";

const STATUS_OPTIONS = [
    { value: "SCOPED_BACKLOG", label: "Scoped Backlog" },
    { value: "SPRINT_BACKLOG", label: "Sprint Backlog" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
    { value: "TESTED", label: "Tested" },
    { value: "STAGED", label: "Staged" },
    { value: "DEPLOYED", label: "Deployed" },
];

const UserStatusDropdown = ({ status, canUpdate, ticketId, onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(status);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);


    const currentLabel = STATUS_OPTIONS.find((s) => s.value === current)?.label ?? current;

    const handleSelect = async (newStatus) => {
        if (newStatus === current || !canUpdate) return;
        setOpen(false);
        const old = current;
        setCurrent(newStatus);
        setLoading(true);
        try {
            await updateTicketStatus(ticketId, newStatus);
            showToast({
                title: "Status Updated",
                description: `Ticket moved to ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            onSuccess?.();
        } catch (err) {
            setCurrent(old);
            showToast({
                title: "Failed to Update Status",
                description: err.message || "Something went wrong",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { if (canUpdate && !loading) setOpen((v) => !v); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10 cursor-pointer
                ${!canUpdate || loading ? "opacity-50 cursor-not-allowed" : ""}
                text-[#9CA3AF]`}
            >
                <span>Status: </span>
                <span className="font-semibold text-text-primary" style={{ fontFamily: 'Inter' }}>{currentLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && canUpdate && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-40 shadow-xl max-h-48 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-input-bg [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => handleSelect(s.value)}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5 cursor-pointer
                                ${current === s.value ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserStatusDropdown;