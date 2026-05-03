import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Bell,
    Trash2,
    RotateCcw,
    TriangleAlert,
} from "lucide-react";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Loading from "../../components/common-ui/Loading";
import Error from "../../components/common-ui/Error";
import Empty from "../../components/common-ui/Empty";
import { showToast } from "../../utils/showToast";
import { CircleCheckBig, XCircle } from "lucide-react";
import ErrorIcon from "../../assets/images/ErrorIcon_trash.png";
import EmptyIcon from "../../assets/images/EmptyIcon_trash.png";
import { getDeletedTickets, restoreTicket, permanentDeleteTicket, deleteAllPermanent } from "../../services/tickets.service";
import { getSprints } from "../../services/sprints.service";
import { getUsers } from "../../services/user.service";


const PRIORITY_STYLES = {
    CRITICAL: "bg-red-600/15 text-red-500 border border-red-600/40",
    HIGH: "bg-orange-500/15 text-orange-500 border border-orange-500/40",
    MEDIUM: "bg-yellow-500/15 text-yellow-500 border border-yellow-500/40",
    LOW: "bg-slate-500/15 text-slate-400 border border-slate-500/40",
};

const AVATAR_COLORS = [
    "bg-[#A78BFA]", "bg-[#60A5FA]", "bg-[#22C55E]",
    "bg-[#F59E0B]", "bg-[#F97316]", "bg-[#06B6D4]",
    "bg-[#DC2626]", "bg-[#16A34A]",
];

const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const getAvatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
};

const Chip = ({ label, className }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-hint font-medium whitespace-nowrap ${className}`}>
        {label}
    </span>
);


const FilterDropdown = ({ label, options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10 cursor-pointer
                    ${value ? "text-accent-blue" : "text-[#9CA3AF]"}`}
            >
                <span>{label}</span>
                {value && <span className="text-hint opacity-70">: {value}</span>}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-36 shadow-xl max-h-48 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-input-bg [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <button
                        onClick={() => { onChange(null); setOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-hint text-text-hint hover:bg-white/5 cursor-pointer"
                    >
                        All
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value ?? opt}
                            onClick={() => { onChange(opt.value ?? opt); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5 cursor-pointer
                                ${value === (opt.label ?? opt) ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {opt.label ?? (opt.charAt(0) + opt.slice(1).toLowerCase())}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const DeletedTickets = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activePriority = searchParams.get("priority") || null;
    const activeAssignee = searchParams.get("assignee") || null;
    const searchQuery = searchParams.get("search") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const activeSprintFilter = searchParams.get("sprint") || null;

    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [allAssignees, setAllAssignees] = useState([]);
    const [allSprints, setAllSprints] = useState([]);

    const refreshSprints = useCallback(() => {
        getSprints(1, 100)
            .then((res) => setAllSprints(res.data?.items || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        refreshSprints();
    }, [refreshSprints]);

    useEffect(() => {
        getUsers(1, 100)
            .then((res) => setAllAssignees(res.data?.users || []))
            .catch(() => { });
    }, []);

    const [restoreTarget, setRestoreTarget] = useState(null);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteAll, setShowDeleteAll] = useState(false);
    const [deleteAllLoading, setDeleteAllLoading] = useState(false);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, limit: 20 };
            if (activePriority) params.priority = activePriority;
            if (activeAssignee) params.assignee = activeAssignee;
            if (searchQuery) params.search = searchQuery;
            if (activeSprintFilter) params.sprintId = activeSprintFilter;

            const res = await getDeletedTickets(params);
            setTickets(res.items || []);
            setPagination(res.paginationMeta || null);
        } catch (err) {
            setError(err?.error || err?.message || "Failed to load trash");
        } finally {
            setLoading(false);
        }
    }, [currentPage, activePriority, activeAssignee, searchQuery, activeSprintFilter]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete("page");
        setSearchParams(next);
    };

    const handlePageChange = (page) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page);
        setSearchParams(next);
    };

    const handleRestoreConfirm = async () => {
        if (!restoreTarget) return;
        setRestoreLoading(true);
        try {
            await restoreTicket(restoreTarget.id);
            showToast({
                title: "Ticket Restored",
                description: `Ticket "${restoreTarget.title}" has been restored successfully.`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            setRestoreTarget(null);
            fetchTickets();
        } catch (err) {
            showToast({
                title: "Failed to Restore",
                description: err.message || "Something went wrong",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setRestoreLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await permanentDeleteTicket(deleteTarget.id);
            showToast({
                title: "Deleted Permanently",
                description: `Ticket "${deleteTarget.title}" has been permanently deleted.`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            setDeleteTarget(null);
            fetchTickets();
        } catch (err) {
            let message = "Something went wrong";
            const status = err.status;
            if (status === 403) {
                message = err.message || "Admin access only";
            } else if (status === 400) {
                message = err.message || "Ticket is not deleted";
            } else if (status === 401) {
                message = err.message || "Token expired";
            } else if (status === 404) {
                message = err.message || "Ticket not found";
            } else {
                message = err?.message || "Something went wrong";
            }
            showToast({
                title: "Failed to Delete Permanently",
                description: message,
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        setDeleteAllLoading(true);
        try {
            await deleteAllPermanent();
            showToast({
                title: "Trash Emptied",
                description: "All deleted tickets have been permanently removed.",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            setShowDeleteAll(false);
            fetchTickets();
        } catch (err) {
            showToast({
                title: "Failed to Empty Trash",
                description: err?.message || "Something went wrong",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setDeleteAllLoading(false);
        }
    };

    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    return (
        <div className="flex flex-col h-full bg-card-left">

            {/* Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 lg:px-[16px] lg:pr-[32px] pt-4 sm:pt-[16px] pb-3">
                <div className="flex-1 min-w-0">
                    <h1 className="font-inter font-medium text-[24px] text-text-primary" style={{ letterSpacing: "-0.45px" }}>
                        Trash
                    </h1>
                    <p className="font-inter font-normal text-[15px] text-text-primary">
                        Items in trash will be permanently deleted after 30 days.
                        <br />
                        You can restore them to their original location.
                    </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button className="relative w-9 h-9 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 transition-colors cursor-pointer">
                        <Bell className="w-4 h-4 text-text-primary" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mx-3 sm:mx-[16px] mt-[32px] mb-[25px] rounded-[10px] bg-background py-[7px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-[10px] gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterDropdown
                            label="Assignee"
                            options={allAssignees.map((a) => ({ value: String(a.id), label: a.name }))}
                            value={activeAssignee
                                ? allAssignees.find((a) => String(a.id) === String(activeAssignee))?.name ?? null
                                : null}
                            onChange={(v) => setParam("assignee", v)}
                        />
                        <FilterDropdown
                            label="Priority"
                            options={PRIORITY_OPTIONS}
                            value={activePriority}
                            onChange={(v) => setParam("priority", v)}
                        />
                        <FilterDropdown
                            label="Date"
                            options={[]}
                            value={null}
                            onChange={() => { }}
                        />
                        <FilterDropdown
                            label="Sprint"
                            options={allSprints.map((s) => ({ value: String(s.id), label: s.name }))}
                            value={activeSprintFilter
                                ? allSprints.find((s) => String(s.id) === activeSprintFilter)?.name ?? null
                                : null}
                            onChange={(v) => setParam("sprint", v)}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card-left border border-divider/50 rounded-lg w-full sm:w-[280px] lg:w-[442px]">
                        <Search className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setParam("search", e.target.value || null)}
                            className="bg-transparent outline-none text-hint text-[#6B7280] placeholder:text-[#6B7280] w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="mx-3 sm:mx-[16px] my-[7px] bg-background rounded-[10px] flex flex-col flex-1 min-h-0">
                <div className="flex-1 pt-4 pb-0 min-h-0">

                    <div className="flex items-center justify-between px-4 sm:px-[16px] mb-6">
                        <h2 className="font-poppins font-semibold text-[18px] sm:text-[20px] text-text-primary">
                            Deleted Tickets
                        </h2>
                        {tickets.length > 0 && (
                            <button
                                onClick={() => setShowDeleteAll(true)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] border-2 border-error-red text-white-btn hover:bg-error-red/10 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Delete All</span>
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto px-4">
                        <table className="w-full rounded-[8px] overflow-hidden min-w-[540px]">
                            <thead className="bg-input-bg">
                                <tr>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[22%]">Task Name</th>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[30%] hidden lg:table-cell">Description</th>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">Priority</th>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">Assignee</th>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[14%]">Deleted Date</th>
                                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[10%]">Restore</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <Loading variant="skeleton" rows={8} />
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <Error
                                                title="Failed to load trash"
                                                description="We encountered a technical glitch while retrieving your deleted tasks. Please try again."
                                                icon={ErrorIcon}
                                                onRetry={fetchTickets}
                                            />
                                        </td>
                                    </tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <Empty
                                                title="Trash is empty"
                                                description="Deleted tickets will appear here before they are permanently purged from the engine."
                                                icon={EmptyIcon}
                                                onRetry={() => navigate("/admin/dashboard")}
                                                retryLabel="Go To Dashboard"
                                                showRetryIcon={false}
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b border-divider/20 hover:bg-white/[0.02] transition-colors duration-100"
                                        >
                                            <td className="py-3 px-4">
                                                <span className="text-field-label text-text-primary font-medium">
                                                    {ticket.title}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span className="text-field-label text-text-secondary truncate block max-w-xs">
                                                    {ticket.description || "—"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {ticket.priority ? (
                                                    <Chip
                                                        label={ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                                                        className={PRIORITY_STYLES[ticket.priority] || "bg-slate-700/50 text-slate-300"}
                                                    />
                                                ) : <span className="text-text-hint text-hint">—</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                {ticket.assignee ? (
                                                    <div
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-hint font-semibold text-white-btn ${getAvatarColor(ticket.assignee.name)}`}
                                                        title={ticket.assignee.name}
                                                    >
                                                        {getInitials(ticket.assignee.name)}
                                                    </div>
                                                ) : (
                                                    <span className="text-text-hint text-hint">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-hint text-text-secondary">
                                                    {formatDate(ticket.deletedAt)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setRestoreTarget(ticket)}
                                                        title="Restore ticket"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-divider/40 text-text-hint hover:text-accent-blue hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-colors cursor-pointer"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(ticket)}
                                                        title="Delete permanently"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-divider/40 text-text-hint hover:text-error-red hover:border-error-red/40 hover:bg-error-red/10 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                    <span className="text-hint text-text-hint hidden sm:inline">
                        {loading ? "Loading..." : error ? "—" : `Showing ${tickets.length} of ${total} tasks`}
                    </span>
                    <span className="text-hint text-text-hint sm:hidden">
                        {!loading && !error && `${tickets.length} / ${total}`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loading || !!error}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading || !!error}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {restoreTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setRestoreTarget(null)}
                    />
                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<RotateCcw className="w-5 h-5" />}
                            title="Restore Ticket?"
                            description={`[${restoreTarget.id}] "${restoreTarget.title}" will be restored to Sprint Backlog and become visible to assigned users.`}
                            confirmText="Restore Ticket"
                            cancelText="Cancel"
                            variant="info"
                            loading={restoreLoading}
                            onConfirm={handleRestoreConfirm}
                            onCancel={() => setRestoreTarget(null)}
                        />
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    />
                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<TriangleAlert className="w-5 h-5" />}
                            ticket={{
                                id: `${deleteTarget.id}`,
                                title: `${deleteTarget.title}`,
                            }}
                            title="Delete ticket permanently?"
                            description="This action cannot be undone"
                            confirmText="Delete permanently"
                            variant="permDanger"
                            loading={deleteLoading}
                            onConfirm={handlePermanentDelete}
                            onCancel={() => setDeleteTarget(null)}
                        />
                    </div>
                </div>
            )}

            {showDeleteAll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDeleteAll(false)}
                    />
                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<Trash2 className="w-5 h-5" />}
                            title="Delete ticket permanently?"
                            description="All tickets in trash will be permanently deleted. This action cannot be undone."
                            confirmText="Delete All"
                            cancelText="Cancel"
                            variant="permDanger"
                            loading={deleteAllLoading}
                            onConfirm={handleDeleteAll}
                            onCancel={() => setShowDeleteAll(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default DeletedTickets;