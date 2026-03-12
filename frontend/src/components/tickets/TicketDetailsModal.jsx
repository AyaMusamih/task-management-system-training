const TicketDetailsModal = ({ ticket }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{ticket.title}</h2>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>ID:</strong> {ticket.id}</p>
            <p><strong>Assignee:</strong> {ticket.assignee?.name || "Unassigned"}</p>
            <p><strong>Description:</strong> {ticket.description || "No description"}</p>
        </div>
    );
};

export default TicketDetailsModal;