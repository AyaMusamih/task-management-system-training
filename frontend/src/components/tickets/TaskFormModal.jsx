import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Button from "../shared/Button";
import { createTicket, updateTicket } from "../../services/tickets.service";
import { getSprints } from "../../services/sprints.service";
import { toastSuccess, toastError } from "../../utils/toastHelpers";

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const PRIORITY_VALUES = { Low: "LOW", Medium: "MEDIUM", High: "HIGH", Critical: "CRITICAL" };

const STATUS_OPTIONS_CREATE = [
    { value: "SCOPED_BACKLOG", label: "Scoped Backlog" },
    { value: "SPRINT_BACKLOG", label: "Sprint Backlog" },
];

const STATUS_OPTIONS_EDIT = [
    { value: "SCOPED_BACKLOG", label: "Scoped Backlog" },
    { value: "SPRINT_BACKLOG", label: "Sprint Backlog" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
    { value: "TESTED", label: "Tested" },
    { value: "STAGED", label: "Staged" },
    { value: "DEPLOYED", label: "Deployed" },
];

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 10000;

const validate = (fields) => {
    const errors = {};

    if (!fields.title.trim()) {
        errors.title = "Title is required";
    } else if (fields.title.trim().length > TITLE_MAX) {
        errors.title = `Title cannot exceed ${TITLE_MAX} characters`;
    }

    if (fields.description.length > DESCRIPTION_MAX) {
        errors.description = `Description cannot exceed ${DESCRIPTION_MAX} characters`;
    }

    if (fields.deadline) {
        const selected = new Date(fields.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            errors.deadline = "Deadline must be in the future";
        }
    }

    return errors;
};

const FieldError = ({ message }) =>
    message ? (
        <p className="mt-1 text-hint text-error-red">{message}</p>
    ) : null;

const FieldLabel = ({ children, required = false }) => (
    <label className="block mb-1.5 text-text-primary font-inter font-bold text-[14px]">
        {children}
        {required && <span className="text-text-primary ml-0.5">*</span>}
    </label>
);

const StyledSelect = ({ value, onChange, options, placeholder, hasError, disabled }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => { if (!disabled) setOpen((v) => !v); }}
                className={`w-full h-11 px-4 flex items-center justify-between rounded-xl bg-[#808080]/20 border text-left transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    ${hasError
                        ? "border-error-red focus:border-error-red"
                        : open
                            ? "border-accent-blue"
                            : "border-[#808080]/40 hover:border-[#808080]/60"
                    }`}
            >
                <span className={`text-input ${selected ? "text-text-filled" : "text-[#FFFFFF80]"}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-hint transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && !disabled && (
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

const TaskFormModal = ({ mode = "create", ticket = null, assignees = [], onSuccess }) => {
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

    const [sprintOptions, setSprintOptions] = useState([]);
    const [sprintsLoading, setSprintsLoading] = useState(true);

    const isScopedBacklog = fields.status === "SCOPED_BACKLOG";

    useEffect(() => {
        const fetchSprints = async () => {
            setSprintsLoading(true);
            try {
                const res = await getSprints(1, 100);
                const all = res.data?.items || [];
                setSprintOptions(
                    all.map((s) => ({
                        value: s.id.toString(),
                        label: s.isActive ? `${s.name} (Active)` : s.name,
                    }))
                );
            } catch {
                setSprintOptions([]);
            } finally {
                setSprintsLoading(false);
            }
        };
        fetchSprints();
    }, []);

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

    useEffect(() => {
        if (isScopedBacklog) {
            setFields((prev) => ({ ...prev, sprintId: "" }));
        }
    }, [isScopedBacklog]);

    const set = (key, value) =>
        setFields((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        setSubmitted(true);
        const validationErrors = validate(fields);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toastError("Please fix the errors before submitting.", "Validation Error");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: fields.title.trim(),
                description: fields.description.trim() || undefined,
                assigneeId: fields.assigneeId || undefined,
                deadline: fields.deadline
                    ? new Date(`${fields.deadline}T23:59:59Z`).toISOString()
                    : undefined,
                priority: fields.priority || undefined,
                status: fields.status || undefined,
                sprintId: isScopedBacklog ? null : (fields.sprintId || undefined),
            };

            if (isEdit) {
                await updateTicket(ticket.id, payload);
                toastSuccess("Task Updated", "Task updated successfully.");
            } else {
                await createTicket(payload);
                toastSuccess("Task Created", "Task created successfully.");
            }

            onSuccess?.();
        } catch (err) {
            if (err?.type === "validation" && err?.fields) {
                setErrors(err.fields);
                toastError(err, "Validation Error");
            } else if (err?.type === "forbidden") {
                setErrors((prev) => ({ ...prev, status: err.message }));
                toastError(err, "Permission Error");
            } else {
                toastError(err, isEdit ? "Failed to Update Task" : "Failed to Create Task");
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

    const isFormValid =
        !!fields.title.trim() &&
        fields.title.trim().length <= TITLE_MAX &&
        fields.description.length <= DESCRIPTION_MAX;

    return (
        <div className="flex flex-col gap-4">

            {/* Title */}
            <div>
                <FieldLabel required>Title</FieldLabel>
                <input
                    type="text"
                    value={fields.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Enter task title"
                    className={`w-full h-11 px-4 rounded-xl bg-[#808080]/20 border text-input text-text-filled placeholder:text-[#FFFFFF80] placeholder:text-input outline-none transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                        ${errors.title
                            ? "border-error-red focus:border-error-red"
                            : "border-[#808080]/40 focus:border-accent-blue"
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
                        className={`w-full px-4 pt-3 pb-6 rounded-xl bg-[#808080]/20 border text-input text-text-filled placeholder:text-[#FFFFFF80] placeholder:text-input outline-none resize-none transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                            ${errors.description
                                ? "border-error-red focus:border-error-red"
                                : "border-[#808080]/40 focus:border-accent-blue"
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
                    <div className={`w-full h-11 px-4 flex items-center rounded-xl bg-[#808080]/20 border text-[#FFFFFF80] text-input shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                        ${errors.assigneeId ? "border-error-red" : "border-[#808080]/40"}`}>
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
                        className={`w-full h-11 px-4 rounded-xl bg-[#808080]/20 border text-input outline-none transition-colors cursor-pointer appearance-none shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
                            ${fields.deadline ? "text-text-filled" : "text-[#FFFFFF80]"}
                            ${errors.deadline
                                ? "border-error-red focus:border-error-red"
                                : "border-[#808080]/40 focus:border-accent-blue"
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
                    options={isEdit ? STATUS_OPTIONS_EDIT : STATUS_OPTIONS_CREATE}
                    placeholder="Select status"
                    hasError={!!errors.status}
                />
                <FieldError message={errors.status} />
            </div>

            {/* Sprint hidden when status is SCOPED_BACKLOG */}
            {!isScopedBacklog && (
                <div>
                    <FieldLabel>Sprint</FieldLabel>
                    {sprintsLoading ? (
                        <div className="w-full h-11 px-4 flex items-center rounded-xl bg-[#808080]/20 border border-[#808080]/40 text-[#FFFFFF80] text-input">
                            Loading sprints…
                        </div>
                    ) : sprintOptions.length === 0 ? (
                        <div className={`w-full h-11 px-4 flex items-center rounded-xl bg-[#808080]/20 border text-[#FFFFFF80] text-input shadow-[0_0_0_1px_rgba(255,255,255,0.05)] border-[#808080]/40`}>
                            No active or upcoming sprints available
                        </div>
                    ) : (
                        <StyledSelect
                            value={fields.sprintId}
                            onChange={(v) => set("sprintId", v)}
                            options={sprintOptions}
                            placeholder="Select sprint"
                            hasError={!!errors.sprintId}
                        />
                    )}
                    <FieldError message={errors.sprintId} />
                </div>
            )}

            {/* Submit */}
            <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                disabled={!isFormValid}
                disabledClassName="bg-accent-blue"
                className="w-full mt-2 !rounded-xl text-white font-poppins text-[15px] font-medium cursor-pointer"
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