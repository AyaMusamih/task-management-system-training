import Loading from "../../common-ui/Loading";

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

const SPRINT_CHIP_STYLE = "bg-[#4B4F55] text-white-btn border border-white/10";

const Chip = ({ label, className }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-hint font-medium whitespace-nowrap ${className}`}>
        {label}
    </span>
);

export default function UserTicketsTable({
    tickets,
    title = "My recent tickets",
    isLoading = false,
    error,
    onRetry }) {
    return (
        <div className="bg-card-bg rounded-lg p-4">
            <h2 className="font-poppins font-light text-[18px] sm:text-[18px] text-text-primary mb-4">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full rounded-[8px] overflow-hidden min-w-[540px]">
                    <thead className="bg-input-bg">
                        <tr>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium">Title</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium">Priority</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium">Status</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium">Sprint</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium">Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5}>
                                    <Loading variant="skeleton" rows={5} />
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-b border-divider/50">
                                    <td className="py-3 px-4 text-field-label text-text-primary">{ticket.title}</td>
                                    <td className="py-3 px-4">
                                        <Chip
                                            label={ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                                            className={PRIORITY_STYLES[ticket.priority] || "bg-slate-700/50 text-slate-300"}
                                        />
                                    </td>
                                    <td className="py-3">
                                        <Chip
                                            label={STATUS_LABELS[ticket.status] || ticket.status}
                                            className={`shrink-0 ${STATUS_STYLES[ticket.status] || "bg-slate-700/50 text-slate-300"}`}
                                        />
                                    </td>
                                    <td className="py-2 px-2">
                                        {ticket.sprint ? (
                                            <Chip
                                                label={ticket.sprint.name}
                                                className={SPRINT_CHIP_STYLE}
                                            />
                                        ) : (
                                            <span className="text-text-hint text-hint">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-7">
                                        <span className={`text-sm ${ticket.isOverdue ? "text-error-red" : "text-text-secondary"}`}>
                                            {ticket.deadline}{ticket.isOverdue && " — Overdue"}
                                        </span>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}