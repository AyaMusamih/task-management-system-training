import UserStatusDropdown from "./UserStatusDropdown";

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

const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    return new Date(deadline).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
};

const UserTicketPanel = ({ ticket, onStatusSuccess }) => {
    const canUpdate = ticket?.permissions?.canUpdateStatus;

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-divider/20 flex flex-col gap-4
    [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">

            <h2 className="text-text-primary" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px' }}>
                {ticket.title}
            </h2>

            <div className="flex items-center gap-3 flex-wrap">
                <UserStatusDropdown
                    status={ticket.status}
                    canUpdate={canUpdate}
                    ticketId={ticket.id}
                    onSuccess={onStatusSuccess}
                    statusOptions={STATUS_OPTIONS}
                />
                <span className="text-hint text-text-secondary">
                    Priority: <span className="font-semibold text-text-primary" style={{ fontFamily: 'Inter' }}>
                        {ticket.priority?.charAt(0) + ticket.priority?.slice(1).toLowerCase()}
                    </span>
                </span>
                <span className="text-hint text-text-secondary">
                    Assigned: <span className="font-semibold text-text-primary" style={{ fontFamily: 'Inter' }}>
                        {ticket.assignee?.name || "Unassigned"}
                    </span>
                </span>
                {ticket.sprint && (
                    <span className="text-hint text-text-secondary">
                        Sprint: <span className="font-semibold text-text-primary" style={{ fontFamily: 'Inter' }}>{ticket.sprint.name}</span>
                    </span>
                )}
            </div>
            <span className="text-hint text-text-secondary">
                Deadline: <span className="font-semibold text-text-primary" style={{ fontFamily: 'Inter' }}>
                    {formatDeadline(ticket.deadline)}
                </span>
            </span>

            <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-text-primary" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px' }}>Description</h3>
                <p className="whitespace-pre-wrap text-text-primary" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px' }}>
                    {ticket.description || "No description"}
                </p>
            </div>
        </div>
    );
};

export default UserTicketPanel;