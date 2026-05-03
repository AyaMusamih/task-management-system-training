import { useState } from "react";
import { CircleCheckBig, XCircle, Trash2, Pencil } from "lucide-react";
import Button from "../shared/Button";
import FilterStyleDropdown from "./FilterStyleDropdown";
import { showToast } from "../../utils/showToast";
import { updateTicket } from "../../services/tickets.service";

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

const AdminTicketPanel = ({ ticket, allAssignees, allSprints, onSaved, onDelete, deleteLoading }) => {
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

    const assigneeOptions = [
        { value: "", label: "Unassigned" },
        ...allAssignees.map((a) => ({ value: a.id.toString(), label: a.name })),
    ];

    const sprintOptions = [
        { value: "", label: "No Sprint" },
        ...allSprints.map((s) => ({ value: s.id.toString(), label: s.name })),
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTicket(ticket.id, {
                title: editTitle.trim() || undefined,
                description: editDescription.trim() || undefined,
                priority: editPriority || undefined,
                assigneeId: editAssigneeId || undefined,
                sprintId: editSprintId || null,
                status: editStatus || undefined,
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

            {/* Priority + Assignee */}
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
                    onChange={setEditStatus}
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
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-text-primary" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px' }}>Description</h3>
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

            {/* Actions */}
            <div className="flex pt-4 border-t border-divider/20">
                <Button variant="secondary" size="md" onClick={handleSave} loading={saving}
                    className="flex-1 h-10 rounded-lg !text-[15px] cursor-pointer hover:bg-input-bg/60 hover:border-divider">
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="secondary" size="md" onClick={onDelete} disabled={deleteLoading}
                    className="h-10 rounded-lg !text-[15px] cursor-pointer !border-error-red !text-error-red hover:bg-error-red/10 hover:border-error-red">
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default AdminTicketPanel;