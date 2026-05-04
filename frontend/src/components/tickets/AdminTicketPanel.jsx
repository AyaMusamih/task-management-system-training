import { useState } from "react";
import { CircleCheckBig, XCircle, Pencil, History, ArrowLeftRight, AlertCircle, UserPlus, MessageSquare, Ticket, Trash2, RotateCcw, GitBranch, Ban  } from "lucide-react";
import Button from "../shared/Button";
import FilterStyleDropdown from "./FilterStyleDropdown";
import { showToast } from "../../utils/showToast";
import { updateTicket, updateTicketStatus } from "../../services/tickets.service";

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

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
];

const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
};

const getStatusLabel = (value) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.label ?? value ?? "—";

const getActionMeta = (action, oldValue = {}, newValue = {}, allAssignees = [], allSprints = [], actorName = "Someone") => {
    const old = oldValue ?? {};
    const next = newValue ?? {};

    console.log("old", old);
    console.log("next", next);

    const getAssigneeName = (id) =>
        id ? (allAssignees.find((a) => a.id.toString() === id.toString())?.name ?? `#${id}`) : null;

    const getSprintName = (id) =>
        id ? (allSprints.find((s) => s.id.toString() === id.toString())?.name ?? `#${id}`) : null;

    switch (action) {
        case "TICKET_CREATED":
            return {
                multi: false,
                icon: <Ticket className="w-3.5 h-3.5" />,
                label: <><strong>{actorName}</strong> created this ticket</>,
            };

        case "TICKET_DELETED":
            return {
                multi: false,
                icon: <Trash2 className="w-3.5 h-3.5" />,
                label: <><strong>{actorName}</strong> deleted this ticket</>,
            };

        case "TICKET_RESTORED":
            return {
                multi: false,
                icon: <RotateCcw className="w-3.5 h-3.5" />,
                label: <><strong>{actorName}</strong> restored this ticket</>,
            };

        case "COMMENT_ADDED":
            return {
                multi: false,
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                label: (
                    <span className="flex flex-col gap-0.5">
                        <span><strong>{actorName}</strong> added a comment</span>
                        {next.content && (
                            <span className="text-text-hint italic truncate max-w-[220px]">
                                "{next.content}"
                            </span>
                        )}
                    </span>
                ),
            };

        case "STATUS_CHANGED":
            return {
                multi: false,
                icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
                label: (
                    <>
                        <strong>{actorName}</strong> changed status from{" "}
                        <span className="text-text-primary">{getStatusLabel(old.status)}</span>
                        {" to "}
                        <span className="text-text-primary font-semibold">{getStatusLabel(next.status)}</span>
                    </>
                ),
            };

        case "TICKET_UPDATED": {
            const changes = [];

            if (old.priority !== next.priority)
                changes.push({
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    label: (
                        <>
                            <strong>{actorName}</strong> changed priority to{" "}
                            <span className="text-text-primary font-semibold">
                                {next.priority ? next.priority.charAt(0) + next.priority.slice(1).toLowerCase() : "—"}
                            </span>
                        </>
                    ),
                });

            if (old.assigneeId !== next.assigneeId) {
                const newName = getAssigneeName(next.assigneeId);
                changes.push({
                    icon: <UserPlus className="w-3.5 h-3.5" />,
                    label: newName
                        ? <><strong>{actorName}</strong> assigned ticket to <span className="text-text-primary font-semibold">{newName}</span></>
                        : <><strong>{actorName}</strong> removed the assignee</>,
                });
            }

            if (old.sprintId !== next.sprintId) {
                const newSprintName = getSprintName(next.sprintId);
                changes.push({
                    icon: <GitBranch className="w-3.5 h-3.5" />,
                    label: newSprintName
                        ? <><strong>{actorName}</strong> moved to sprint <span className="text-text-primary font-semibold">{newSprintName}</span></>
                        : <><strong>{actorName}</strong> removed from sprint</>,
                });
            }

            if (old.title !== next.title)
                changes.push({
                    icon: <Pencil className="w-3.5 h-3.5" />,
                    label: <><strong>{actorName}</strong> updated the title</>,
                });

            if (old.description !== next.description)
                changes.push({
                    icon: <Pencil className="w-3.5 h-3.5" />,
                    label: <><strong>{actorName}</strong> updated the description</>,
                });

            if (old.deadline !== next.deadline)
                changes.push({
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    label: (
                        <>
                            <strong>{actorName}</strong> changed deadline to{" "}
                            <span className="text-text-primary font-semibold">
                                {next.deadline
                                    ? new Date(next.deadline).toLocaleDateString()
                                    : "—"}
                            </span>
                        </>
                    ),
                });

            if (changes.length === 0)
                return {
                    multi: false,
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    label: <><strong>{actorName}</strong> updated the ticket</>,
                };

            return { multi: true, changes };
        }

        default:
            return {
                multi: false,
                icon: <AlertCircle className="w-3.5 h-3.5" />,
                label: <><strong>{actorName}</strong> {action.replace(/_/g, " ").toLowerCase()}</>,
            };
    }
};

const ActivityRow = ({ icon, label, time }) => (
    <div className="flex items-start justify-between gap-3 text-sm py-0.5">
        <div className="flex items-start gap-2 text-text-secondary min-w-0">
            <span className="shrink-0 text-text-secondary mt-0.5">{icon}</span>
            <span className="leading-relaxed">{label}</span>
        </div>
        <span className="text-text-hint text-xs shrink-0 whitespace-nowrap mt-0.5">{time}</span>
    </div>
);

// ─── Skeletons
export const AdminTicketPanelSkeleton = () => (
    <div className="flex-1 px-6 py-6 border-r border-divider/20 flex flex-col gap-4">
        <div className="h-7 w-3/4 skeleton rounded-md" />
        <div className="flex gap-2 flex-wrap">
            <div className="h-7 w-24 skeleton rounded-full" />
            <div className="h-7 w-28 skeleton rounded-full" />
            <div className="h-7 w-32 skeleton rounded-full" />
            <div className="h-7 w-24 skeleton rounded-full" />
            <div className="h-7 w-24 skeleton rounded-full" />
        </div>
        <div className="flex flex-col gap-2 mt-1">
            <div className="h-5 w-28 skeleton rounded-md" />
            <div className="h-4 w-full skeleton rounded-md" />
            <div className="h-4 w-5/6 skeleton rounded-md" />
            <div className="h-4 w-4/6 skeleton rounded-md" />
        </div>
        <div className="border-t border-divider/20 mt-1" />
        <div className="flex flex-col gap-2">
            <div className="h-5 w-32 skeleton rounded-md" />
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-0.5">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-3.5 h-3.5 skeleton rounded-sm shrink-0" />
                        <div className="h-3.5 skeleton rounded-md" style={{ width: `${50 + (i % 3) * 15}%` }} />
                    </div>
                    <div className="h-3 w-10 skeleton rounded-md shrink-0" />
                </div>
            ))}
        </div>
        <div className="flex gap-2 pt-4 border-t border-divider/20 mt-auto">
            <div className="h-10 flex-1 skeleton rounded-lg" />
            <div className="h-10 w-20 skeleton rounded-lg" />
        </div>
    </div>
);

// ─── AdminTicketPanel 
const AdminTicketPanel = ({
    ticket,
    allAssignees,
    allSprints,
    audit = [],
    auditLoading = false,
    auditError,
    onRetryAudit,
    onSaved,
    onDelete,
    deleteLoading,
}) => {
    const [editTitle, setEditTitle] = useState(ticket.title || "");
    const [editDescription, setEditDescription] = useState(ticket.description || "");
    const [editPriority, setEditPriority] = useState(ticket.priority || "");
    const [editAssigneeId, setEditAssigneeId] = useState(ticket.assignee?.id?.toString() || "");
    const [editStatus, setEditStatus] = useState(ticket.status || "");
    const [editDeadline, setEditDeadline] = useState(
        ticket.deadline ? new Date(ticket.deadline).toISOString().split("T")[0] : ""
    );
    const [editSprintId, setEditSprintId] = useState(ticket.sprint?.id?.toString() || "");
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);

    const assigneeOptions = [
        { value: "", label: "Unassigned" },
        ...allAssignees.map((a) => ({ value: a.id.toString(), label: a.name })),
    ];

    const sprintOptions = [
        { value: "", label: "No Sprint" },
        ...allSprints.map((s) => ({ value: s.id.toString(), label: s.name })),
    ];

    const handleStatusChange = async (newStatus) => {
        if (newStatus === editStatus) return;
        setStatusSaving(true);
        try {
            await updateTicketStatus(ticket.id, newStatus);
            setEditStatus(newStatus);
            showToast({
                title: "Status Updated",
                description: "Status changed successfully",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            onSaved?.();
        } catch (err) {
            showToast({
                title: "Failed to Update Status",
                description: err.message || "Something went wrong",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setStatusSaving(false);
        }
    };

    const handleSave = async () => {
        if (!editDeadline) {
            showToast({
                title: "Deadline Required",
                description: "Please choose a deadline",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
            return;
        }
        setSaving(true);
        try {
            await updateTicket(ticket.id, {
                title: editTitle.trim() || undefined,
                description: editDescription.trim() || undefined,
                priority: editPriority || undefined,
                assigneeId: editAssigneeId || null,
                sprintId: editSprintId || null,
                deadline: editDeadline
                    ? new Date(`${editDeadline}T23:59:59Z`).toISOString()
                    : undefined,
            });
            showToast({
                title: "Ticket Updated",
                description: "Changes saved successfully",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            setIsTitleEditing(false);
            setIsDescriptionEditing(false);
            onSaved?.();
        } catch (err) {
            showToast({
                title: "Failed to Save",
                description: err.message || "Something went wrong",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-divider/20 flex flex-col gap-4
            [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">

            {/* Title */}
            <div className="flex items-start gap-2">
                {isTitleEditing ? (
                    <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-xl font-bold text-text-primary bg-input-bg border border-divider/50 rounded-lg px-3 py-1 outline-none focus:border-accent-blue"
                    />
                ) : (
                    <h2 className="flex-1 text-text-primary" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px' }}>
                        {editTitle}
                    </h2>
                )}
                <button
                    onClick={() => setIsTitleEditing((v) => !v)}
                    className="text-text-hint hover:text-text-primary transition-colors cursor-pointer mt-1 shrink-0"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </div>

            {/* Priority + Assignee + Deadline + Status + Sprint */}
            <div className="flex items-center gap-2 flex-wrap">
                <FilterStyleDropdown
                    staticLabel="Priority"
                    label="Priority"
                    options={PRIORITY_OPTIONS}
                    value={editPriority}
                    onChange={setEditPriority}
                />
                <FilterStyleDropdown
                    staticLabel="Assigned"
                    label="Assigned"
                    options={assigneeOptions}
                    value={editAssigneeId}
                    onChange={setEditAssigneeId}
                />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint bg-[#6B7280]/10 text-[#9CA3AF]">
                    <span>Deadline: </span>
                    <input
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="bg-transparent outline-none text-text-primary font-semibold text-hint cursor-pointer"
                        style={{ fontFamily: 'Inter' }}
                    />
                </div>
                <FilterStyleDropdown
                    staticLabel="Status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={editStatus}
                    onChange={handleStatusChange}
                    disabled={statusSaving}
                />
                <FilterStyleDropdown
                    staticLabel="Sprint"
                    label="Sprint"
                    options={sprintOptions}
                    value={editSprintId}
                    onChange={setEditSprintId}
                />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-text-primary" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px' }}>
                        Description
                    </h3>
                    <button
                        onClick={() => setIsDescriptionEditing((v) => !v)}
                        className="text-text-hint hover:text-text-primary transition-colors cursor-pointer"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
                {isDescriptionEditing ? (
                    <textarea
                        autoFocus
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={6}
                        className="w-full text-field-label text-text-secondary bg-input-bg border border-divider/50 rounded-lg px-3 py-2 outline-none focus:border-accent-blue resize-none"
                    />
                ) : (
                    <p className="whitespace-pre-wrap text-text-primary" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px' }}>
                        {editDescription || "No description"}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-divider/20" />

            {/* Activity Log */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-text-primary" />
                    <h3
                        className="text-text-primary"
                        style={{
                            fontFamily: "Poppins",
                            fontWeight: 600,
                            fontSize: "18px",
                        }}
                    >
                        Activity Log
                    </h3>
                </div>

                {auditLoading ? (
                    <div className="flex flex-col gap-1.5">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3 py-0.5"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-3.5 h-3.5 skeleton rounded-sm shrink-0" />
                                    <div
                                        className="h-3.5 skeleton rounded-md"
                                        style={{ width: `${50 + (i % 3) * 15}%` }}
                                    />
                                </div>
                                <div className="h-3 w-10 skeleton rounded-md shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : auditError ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <Ban className="w-9 h-9 text-error-red/60" />

                        <div className="text-center flex flex-col gap-0.5">
                            <p className="text-md font-medium text-text-primary">
                                Failed to load activity
                            </p>
                            <p className="text-sm text-text-secondary">
                                {auditError.message || "Something went wrong"}
                            </p>
                        </div>

                        <button
                            onClick={onRetryAudit}
                            className="px-6 py-1.5 cursor-pointer bg-accent-blue text-white text-sm rounded-lg hover:bg-accent-blue/80 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : audit.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <div className="w-9 h-9 rounded-full bg-text-primary/10 flex items-center justify-center">
                            <History className="w-4.5 h-4.5 text-accent-blue" />
                        </div>

                        <div className="text-center flex flex-col gap-0.5">
                            <p className="text-sm font-medium text-text-primary">
                                No activity yet
                            </p>
                            <p className="text-xs text-text-secondary">
                                Changes to this ticket will appear here
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {audit.map((log) => {
                            const actorName = log.user?.name || "Unknown";
                            const meta = getActionMeta(
                                log.action,
                                log.oldValue,
                                log.newValue,
                                allAssignees,
                                allSprints,
                                actorName
                            );
                            const time = getRelativeTime(log.createdAt);

                            if (meta.multi) {
                                return meta.changes.map((change, i) => (
                                    <ActivityRow
                                        key={`${log.id}-${i}`}
                                        icon={change.icon}
                                        label={change.label}
                                        time={time}
                                    />
                                ));
                            }

                            return (
                                <ActivityRow
                                    key={log.id}
                                    icon={meta.icon}
                                    label={meta.label}
                                    time={time}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex pt-4 border-t border-divider/20 mt-auto">
                <Button
                    variant="secondary"
                    size="md"
                    onClick={handleSave}
                    loading={saving}
                    className="flex-1 h-10 rounded-lg !text-[15px] cursor-pointer hover:bg-input-bg/60 hover:border-divider"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    onClick={onDelete}
                    disabled={deleteLoading}
                    className="h-10 rounded-lg !text-[15px] cursor-pointer !border-error-red !text-error-red hover:bg-error-red/10 hover:border-error-red"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default AdminTicketPanel;