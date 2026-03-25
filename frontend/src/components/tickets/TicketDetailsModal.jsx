import TicketIndicators from "./TicketIndicators";
import Button from "../shared/Button";

const TicketDetailsModal = ({ ticket }) => {
    if (!ticket) return null;

    return (
        <div className="w-100 p-4">

            <h2 className="text-2xl font-bold mb-4">
                {ticket.title}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">

                <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium">{ticket.status}</p>
                </div>

                <div>
                    <p className="text-gray-500">Priority</p>
                    <p className="font-medium">{ticket.priority}</p>
                </div>

                <div>
                    <p className="text-gray-500">Assignee</p>
                    <p className="font-medium">{ticket.assignee?.name || "Unassigned"}</p>
                </div>

                <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-medium">{ticket.createdBy?.name}</p>
                </div>

            </div>

            <div className="mb-6">
                <TicketIndicators permissions={ticket.permissions} />
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 font-medium">
                    {ticket.description || "No description"}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                    variant="primary"
                    size="sm"
                    disabled={!ticket.permissions?.canEdit}
                    className="flex-1"
                >
                    Edit Ticket
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!ticket.permissions?.canUpdateStatus}
                    className="flex-1"
                >
                    Update Status
                </Button>
            </div>

        </div>
    );
};

export default TicketDetailsModal;