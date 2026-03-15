const PRIORITY_STYLES = {
    CRITICAL: "bg-red-600/15 text-red-500 border border-red-600/40",
    HIGH: "bg-orange-500/15 text-orange-500 border border-orange-500/40",
    MEDIUM: "bg-yellow-500/15 text-yellow-500 border border-yellow-500/40",
    LOW: "bg-slate-500/15 text-slate-400 border border-slate-500/40",
};

const STATUS_STYLES = {
    TODO: "bg-[#60A5FA26] text-[#60A5FA] border border-[#60A5FA]/40",
    IN_PROGRESS: "bg-[#F59E0B26] text-[#F59E0B] border border-[#F59E0B]/40",
    DONE: "bg-[#22C55E26] text-[#22C55E] border border-[#22C55E]/40",
    TESTED: "bg-[#06B6D426] text-[#06B6D4] border border-[#06B6D4]/40",
    STAGED: "bg-[#F9731626] text-[#F97316] border border-[#F97316]/40",
    DEPLOYED: "bg-[#16A34A26] text-[#16A34A] border border-[#16A34A]/40",
    SCOPED_BACKLOG: "bg-[#6B7280]/20 text-[#6B7280] border border-[#6B7280]/40",
    SPRINT_BACKLOG: "bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40",
};

const STATUS_LABELS = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
    TESTED: "Tested",
    STAGED: "Staged",
    DEPLOYED: "Deployed",
    SCOPED_BACKLOG: "Scoped Backlog",
    SPRINT_BACKLOG: "Sprint Backlog",
};

const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
    "bg-[#A78BFA]",
    "bg-[#60A5FA]",
    "bg-[#22C55E]",
    "bg-[#F59E0B]",
    "bg-[#F97316]",
    "bg-[#06B6D4]",
    "bg-[#DC2626]",
    "bg-[#16A34A]",
];

const getAvatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const Chip = ({ label, className }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-hint font-medium whitespace-nowrap ${className}`}>
        {label}
    </span>
);

const TicketsTable = ({ tickets, showAssignee = true, showContext = false, onRowClick }) => {

    const handleRowClick = (ticket) => {
        if (onRowClick) onRowClick(ticket);
    };

    const getContext = (ticket) => {
        if (ticket.sprint) return "Sprint";
        if (ticket.status === "SCOPED_BACKLOG") return "Scoped";
        return "—";
    };

    return (
        <table className="w-full rounded-[10px] overflow-hidden ">
            <thead className="bg-input-bg">
                <tr>
                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[28%]">Task Name</th>
                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[30%]">Description</th>
                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">Priority</th>
                    {showAssignee && (
                        <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">Assignee</th>
                    )}
                    {showContext && (
                        <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[10%]">Context</th>
                    )}
                    <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[14%]">Status</th>
                </tr>
            </thead>
            <tbody>
                {tickets.map((ticket) => (
                    <tr
                        key={ticket.id}
                        onClick={() => handleRowClick(ticket)}
                        className="border-b border-divider/20 hover:bg-white/[0.02] cursor-pointer transition-colors duration-100"
                    >
                        <td className="py-3 px-4">
                            <span className="text-field-label text-text-primary font-medium">
                                {ticket.title}
                            </span>
                        </td>
                        <td className="py-3 px-4">
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
                        {showAssignee && (
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
                        )}
                        {showContext && (
                            <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-hint border border-divider/40 text-text-secondary bg-white/5">
                                    {getContext(ticket)}
                                </span>
                            </td>
                        )}
                        <td className="py-3 px-4">
                            {ticket.status ? (
                                <Chip
                                    label={STATUS_LABELS[ticket.status] || ticket.status}
                                    className={STATUS_STYLES[ticket.status] || "bg-slate-700/50 text-slate-300"}
                                />
                            ) : <span className="text-text-hint text-hint">—</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TicketsTable;