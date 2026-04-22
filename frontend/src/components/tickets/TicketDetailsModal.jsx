import TicketIndicators from "./TicketIndicators";
import Button from "../shared/Button";
import ConfirmDialog from "../shared/ConfirmDialog";
import { useState } from "react";
import { showToast } from "../../utils/showToast";
import { CircleCheckBig, XCircle, Trash2 } from "lucide-react";
import { softDeleteTicket } from "../../services/tickets.service";
import StatusControl from "../tickets/StatusControl";
import TaskFormModal from "./TaskFormModal";

const TicketDetailsModal = ({ ticket, openModal, closeModal, onRefresh, assignees = [] }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!ticket) return null;

    const user = JSON.parse(localStorage.getItem("user")) || null;
    const isAdmin = user?.role === "ADMIN";
    const canUpdate = ticket.permissions?.canUpdateStatus;

    const handleEditClick = () => {
        if (!openModal) return;
        openModal({
            title: "Edit Task",
            content: (
                <TaskFormModal
                    mode="edit"
                    ticket={ticket}
                    assignees={assignees}
                    onSuccess={() => {
                        closeModal?.();
                        onRefresh?.();
                    }}
                />
            ),
        });
    };

    const handleDelete = async () => {
        try {
            setLoading(true);

            const res = await softDeleteTicket(ticket.id);

            showToast({
                title: "Moved to Trash",
                description:
                    res.message || `Ticket "${ticket.title}" moved to trash`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

            setShowConfirm(false);
            closeModal?.();
            onRefresh?.();

        } catch (err) {
            let message = "Something went wrong";
            const status = err.status;

            if (status === 403) {
                message = err.message || "Admin access only";
            } else if (status === 400) {
                message = err.message || "Ticket already deleted";
            } else if (status === 401) {
                message = err.message || "Token expired";
            } else if (status === 404) {
                message = err.message || "Ticket not found";
            } else {
                message = err.message;
            }

            showToast({
                title: "Failed to Delete Ticket",
                description: message,
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });

        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    return (
        <div className="w-full p-4">

            <h2 className="text-2xl font-bold mb-4 text-text-primary">
                {ticket.title}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">

                <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium text-text-primary">{ticket.status}</p>
                </div>

                <div>
                    <p className="text-gray-500">Priority</p>
                    <p className="font-medium text-text-primary">{ticket.priority}</p>
                </div>

                <div>
                    <p className="text-gray-500">Assignee</p>
                    <p className="font-medium text-text-primary">{ticket.assignee?.name || "Unassigned"}</p>
                </div>

                <div>
                    <p className="text-gray-500">Created By</p>
                    <p className="font-medium text-text-primary">{ticket.createdBy?.name}</p>
                </div>
                <div>
                    <p className="text-gray-500">Deadline</p>
                    <p className="font-medium text-text-primary">{ticket.deadline ? new Date(ticket.deadline).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : "No deadline"}</p>
                </div>

            </div>
            <div className="mb-4 m-auto">
                <StatusControl
                    ticketId={ticket.id}
                    initialStatus={ticket.status}
                    canUpdate={canUpdate}
                    onSuccess={onRefresh}
                />
            </div>

            <div className="mb-6">
                <TicketIndicators permissions={ticket.permissions} />
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-gray-500">Description</h3>
                <p className="text-gray-600 font-medium text-text-primary">
                    {ticket.description || "No description"}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">

                <Button
                    variant="primary"
                    size="md"
                    disabled={!ticket.permissions?.canEdit}
                    onClick={handleEditClick}
                    className="flex-1 w-full h-10 rounded-lg !text-[15px] cursor-pointer"


                >
                    Edit Task
                </Button>

                {isAdmin && (
                    <Button
                        variant="destructive"
                        size="md"
                        disabled={loading}
                        className="w-full h-10 rounded-lg !text-[15px] cursor-pointer"
                        onClick={handleDeleteClick}
                    >
                        Delete
                    </Button>
                )}

            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowConfirm(false)}
                    />

                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<Trash2 className="w-5 h-5" />}
                            ticket={{
                                id: `${ticket.id}`,
                                title: `${ticket.title}`
                            }}
                            title="Move ticket to trash?"
                            description="This ticket will be hidden from all views"
                            confirmText="Move to trash"
                            variant="softDanger"
                            loading={loading}
                            onConfirm={handleDelete}
                            onCancel={() => setShowConfirm(false)}
                        />
                    </div>

                </div>
            )}

        </div>
    );

}
export default TicketDetailsModal;