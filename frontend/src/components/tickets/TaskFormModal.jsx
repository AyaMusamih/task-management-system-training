import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../shared/Button";
import { createTicket, updateTicket } from "../../services/tickets.service";

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const PRIORITY_VALUES = { Low: "LOW", Medium: "MEDIUM", High: "HIGH", Critical: "CRITICAL" };

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

const DESCRIPTION_MAX = 200;

const validate = (fields) => {
    const errors = {};

    if (!fields.title.trim()) {
        errors.title = "Title is required";
    } else if (fields.title.trim().length < 5) {
        errors.title = "Title must be at least 5 characters";
    } else if (fields.title.trim().length > 100) {
        errors.title = "Title cannot exceed 100 characters";
    }

    if (!fields.description.trim()) {
        errors.description = "Description is required";
    } else if (fields.description.length > DESCRIPTION_MAX) {
        errors.description = `Description cannot exceed ${DESCRIPTION_MAX} characters`;
    }

    if (!fields.assigneeId) {
        errors.assigneeId = "Please select an assignee";
    }

    if (!fields.deadline) {
        errors.deadline = "Deadline is required";
    } else {
        const selected = new Date(fields.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            errors.deadline = "Deadline must be in the future";
        }
    }

    if (!fields.priority) {
        errors.priority = "Please select a priority";
    }

    if (!fields.status) {
        errors.status = "Please select a status";
    }

    return errors;
};

const FieldError = ({ message }) =>
    message ? (
        <p className="mt-1 text-hint text-error-red">{message}</p>
    ) : null;

const FieldLabel = ({ children, required = true }) => (
    <label className="block text-field-label text-text-secondary mb-1.5">
        {children}
        {required && <span className="text-error-red ml-0.5">*</span>}
    </label>
);

const StyledSelect = ({ value, onChange, options, placeholder, hasError }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`w-full h-11 px-4 flex items-center justify-between rounded-xl bg-info-bg border text-left transition-colors cursor-pointer
                    ${hasError
                        ? "border-error-red focus:border-error-red"
                        : open
                            ? "border-accent-blue"
                            : "border-divider/50 hover:border-divider"
                    }`}
            >
                <span className={`text-field-label ${selected ? "text-text-filled" : "text-text-placeholder"}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-hint transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 right-0 z-[100] bg-background border border-divider/50 rounded-xl py-1.5 shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-field-label transition-colors hover:bg-white/5 cursor-pointer
                                    ${value === opt.value ? "text-accent-blue" : "text-text-secondary"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const TaskFormModal = ({ mode = "create", ticket = null, assignees = [], currentSprint = null, onSuccess }) => {
    const isEdit = mode === "edit";

    const [fields, setFields] = useState({
        title: "",
        description: "",
        assigneeId: "",
        deadline: "",
        priority: "",
        status: "",
        sprintId: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isEdit && ticket) {
            setFields({
                title: ticket.title || "",
                description: ticket.description || "",
                assigneeId: ticket.assignee?.id?.toString() || "",
                deadline: ticket.deadline
                    ? new Date(ticket.deadline).toISOString().split("T")[0]
                    : "",
                priority: ticket.priority || "",
                status: ticket.status || "",
                sprintId: ticket.sprint?.id?.toString() || "",
            });
        }
    }, [isEdit, ticket]);

    useEffect(() => {
        if (submitted) {
            setErrors(validate(fields));
        }
    }, [fields, submitted]);

    const set = (key, value) =>
        setFields((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        setSubmitted(true);
        const validationErrors = validate(fields);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fix the errors");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: fields.title.trim(),
                description: fields.description.trim(),
                assigneeId: fields.assigneeId,
                deadline: new Date(`${fields.deadline}T23:59:59Z`).toISOString(),
                priority: fields.priority,
                status: fields.status,
                sprintId: fields.sprintId || null,
            };

            if (isEdit) {
                await updateTicket(ticket.id, payload);
                toast.success("Task updated successfully");
            } else {
                await createTicket(payload);
                toast.success("Task created successfully");
            }

            onSuccess?.();
        } catch (err) {
            const apiErrors = err?.errors;
            if (apiErrors && Array.isArray(apiErrors)) {
                const mapped = {};
                apiErrors.forEach((e) => { mapped[e.param] = e.msg; });
                setErrors(mapped);
                toast.error("Please fix the errors");
            } else if (err?.error === "You can update status only if assigned to this ticket") {
                setErrors((prev) => ({ ...prev, status: "You can update status only if assigned to this ticket" }));
                toast.error("Please fix the errors");
            } else {
                const msg = isEdit
                    ? "Failed to update task. Please try again"
                    : "Failed to create task. Please try again";
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const assigneeOptions = assignees.map((a) => ({
        value: a.id?.toString(),
        label: a.name,
    }));

    const descLen = fields.description.length;

    return (
        <div className="flex flex-col gap-4">

            {/* Title */}
            <div>
                <FieldLabel>Title</FieldLabel>
                <input
                    type="text"
                    value={fields.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Enter task title"
                    className={`w-full h-11 px-4 rounded-xl bg-info-bg border text-field-label text-text-filled placeholder:text-text-placeholder outline-none transition-colors
                        ${errors.title
                            ? "border-error-red focus:border-error-red"
                            : "border-divider/50 focus:border-accent-blue"
                        }`}
                />
                <FieldError message={errors.title} />
            </div>

            {/* Description */}
            <div>
                <FieldLabel>Description</FieldLabel>
                <div className="relative">
                    <textarea
                        value={fields.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Enter task description"
                        rows={4}
                        maxLength={DESCRIPTION_MAX + 50}
                        className={`w-full px-4 pt-3 pb-6 rounded-xl bg-info-bg border text-field-label text-text-filled placeholder:text-text-placeholder outline-none resize-none transition-colors
                            ${errors.description
                                ? "border-error-red focus:border-error-red"
                                : "border-divider/50 focus:border-accent-blue"
                            }`}
                    />
                    <span className={`absolute bottom-2 right-3 text-hint ${descLen > DESCRIPTION_MAX ? "text-error-red" : "text-text-hint"}`}>
                        {descLen}/{DESCRIPTION_MAX}
                    </span>
                </div>
                <FieldError message={errors.description} />
            </div>

            {/* Assignee */}
            <div>
                <FieldLabel>Assignee</FieldLabel>
                {assigneeOptions.length > 0 ? (
                    <StyledSelect
                        value={fields.assigneeId}
                        onChange={(v) => set("assigneeId", v)}
                        options={assigneeOptions}
                        placeholder="Select assignee"
                        hasError={!!errors.assigneeId}
                    />
                ) : (
                    <div className={`w-full h-11 px-4 flex items-center rounded-xl bg-info-bg border text-text-hint text-field-label
                        ${errors.assigneeId ? "border-error-red" : "border-divider/50"}`}>
                        No assignees available
                    </div>
                )}
                <FieldError message={errors.assigneeId} />
            </div>

            {/* Deadline */}
            <div>
                <FieldLabel>Deadline</FieldLabel>
                <div className="relative">
                    <input
                        type="date"
                        value={fields.deadline}
                        onChange={(e) => set("deadline", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full h-11 px-4 rounded-xl bg-info-bg border text-field-label outline-none transition-colors cursor-pointer appearance-none
                            ${fields.deadline ? "text-text-filled" : "text-text-placeholder"}
                            ${errors.deadline
                                ? "border-error-red focus:border-error-red"
                                : "border-divider/50 focus:border-accent-blue"
                            }`}
                    />
                </div>
                <FieldError message={errors.deadline} />
            </div>

            {/* Priority */}
            <div>
                <FieldLabel>Priority</FieldLabel>
                <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((label) => {
                        const val = PRIORITY_VALUES[label];
                        const isActive = fields.priority === val;
                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => set("priority", val)}
                                className={`px-4 py-1.5 rounded-full text-hint font-medium border transition-colors duration-150 cursor-pointer
                                    ${isActive
                                        ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
                                        : "border-divider/50 text-text-secondary hover:border-divider hover:text-text-primary bg-transparent"
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                <FieldError message={errors.priority} />
            </div>

            {/* Status */}
            <div>
                <FieldLabel>Status</FieldLabel>
                <StyledSelect
                    value={fields.status}
                    onChange={(v) => set("status", v)}
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    hasError={!!errors.status}
                />
                <FieldError message={errors.status} />
            </div>

            {/* Sprint */}
            {(() => {
                const sprintToShow = isEdit
                    ? (ticket?.sprint || currentSprint)
                    : currentSprint;

                if (!sprintToShow) return null;

                return (
                    <div>
                        <FieldLabel required={false}>Sprint</FieldLabel>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => set("sprintId", fields.sprintId ? "" : sprintToShow.id.toString())}
                                className={`px-4 py-1.5 rounded-full text-hint font-medium border transition-colors duration-150 cursor-pointer
                        ${fields.sprintId
                                        ? "border-accent-blue bg-accent-blue/15 text-accent-blue"
                                        : "border-divider/50 text-text-secondary hover:border-divider hover:text-text-primary bg-transparent"
                                    }`}
                            >
                                {sprintToShow.name}
                            </button>
                        </div>
                    </div>
                );
            })()}

            {/* Submit */}
            <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                className="w-full mt-2 !rounded-xl bg-accent-blue text-white font-poppins text-[15px] font-medium"
            >
                {loading
                    ? isEdit ? "Updating…" : "Creating…"
                    : isEdit ? "Update Task" : "Create task"
                }
            </Button>
        </div>
    );
};

export default TaskFormModal;