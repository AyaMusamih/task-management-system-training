import { useState, useEffect, useCallback } from "react";
import { Trash2, CircleCheckBig, XCircle } from "lucide-react";
import Button from "../shared/Button";
import ConfirmDialog from "../shared/ConfirmDialog";
import TicketDetailsWrapper from "./TicketDetailsWrapper";
import AdminTicketPanel from "./AdminTicketPanel";
import UserTicketPanel from "./UserTicketPanel";
import { showToast } from "../../utils/showToast";
import { getTicketById, softDeleteTicket } from "../../services/tickets.service";
import { getUsers } from "../../services/user.service";
import { getSprints } from "../../services/sprints.service";
import TicketDetailsEmptyImg from "../../assets/images/TicketDetailsEmpty.png";
import TicketDetailsErrorImg from "../../assets/images/TicketDetailsError.png";

const TicketDetailsSkeleton = () => (
    <div className="w-full p-4 flex flex-col gap-4">
        <div className="h-7 w-3/4 skeleton rounded-md" />
        <div className="flex gap-2">
            <div className="h-7 w-28 skeleton rounded-md" />
            <div className="h-5 w-32 skeleton rounded-md" />
            <div className="h-5 w-32 skeleton rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5">
            <div className="h-4 w-16 skeleton rounded-md" />
            <div className="h-4 w-28 skeleton rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
            <div className="h-5 w-24 skeleton rounded-md" />
            <div className="h-4 w-full skeleton rounded-md" />
            <div className="h-4 w-5/6 skeleton rounded-md" />
            <div className="h-4 w-4/6 skeleton rounded-md" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-divider/20 mt-auto">
            <div className="h-10 flex-1 skeleton rounded-md" />
            <div className="h-10 flex-1 skeleton rounded-md" />
        </div>
    </div>
);

const TicketNotFound = ({ onClose }) => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <img src={TicketDetailsEmptyImg} alt="Not found" className="w-40 mb-6" />
        <p className="text-lg font-semibold text-text-primary mb-2">Ticket not available!</p>
        <p className="text-text-secondary mb-6">This ticket no longer exists or you don't have access</p>
        <Button onClick={onClose} className="px-8 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition cursor-pointer">
            Go Back
        </Button>
    </div>
);

const TicketError = ({ onRetry, onClose }) => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <img src={TicketDetailsErrorImg} alt="Error" className="w-40 mb-6" />
        <p className="text-lg font-semibold text-error-red mb-2">Failed to load ticket!</p>
        <p className="text-text-secondary mb-6">Something went wrong. Please try again</p>
        <div className="flex gap-3">
            <Button onClick={onRetry} className="px-8 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition cursor-pointer">
                Retry
            </Button>
            <Button onClick={onClose} variant="ghost" className="px-8 rounded-lg cursor-pointer">
                Close
            </Button>
        </div>
    </div>
);

// Comments panel (shared) 
const CommentsPanel = () => (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
            Comments and activity
        </h3>
    </div>
);

const TicketDetailsModal = ({ ticketId, closeModal, onRefresh }) => {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [allAssignees, setAllAssignees] = useState([]);
    const [allSprints, setAllSprints] = useState([]);

    const user = JSON.parse(localStorage.getItem("user")) || null;
    const isAdmin = user?.role === "ADMIN";

    const fetchTicket = useCallback(async () => {
        setLoading(true);
        setError(false);
        setNotFound(false);
        try {
            const res = await getTicketById(ticketId);
            setTicket(res.items?.[0] ?? null);
        } catch (err) {
            if (err?.cancelled) return;
            if (err.status === 404 || err.status === 403) setNotFound(true);
            else setError(true);
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => { fetchTicket(); }, [fetchTicket]);

    useEffect(() => {
        if (!isAdmin) return;
        getUsers(1, 100)
            .then((res) => setAllAssignees(res.data?.users || []))
            .catch(() => { });
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        getSprints(1, 100)
            .then((res) => setAllSprints(res.data?.items || []))
            .catch(() => { });
    }, [isAdmin]);

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await softDeleteTicket(ticket.id);
            showToast({
                title: "Moved to Trash",
                description: `Ticket "${ticket.title}" has been moved to trash successfully.`,
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
            setShowConfirm(false);
            closeModal?.();
            onRefresh?.();
        } catch (err) {
            let message = "Something went wrong";
            const status = err.status;

            if (status === 403) message = err.message || "Admin access only";
            else if (status === 400) message = err.message || "Ticket already deleted";
            else if (status === 401) message = err.message || "Token expired";
            else if (status === 404) message = err.message || "Ticket not found";
            else message = err.message;

            showToast({
                title: "Failed to Delete Ticket",
                description: message,
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) return (
            <>
                <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-divider/20">
                    <TicketDetailsSkeleton />
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6" />
            </>
        );

        if (notFound) return (
            <div className="flex-1 flex items-center justify-center">
                <TicketNotFound onClose={closeModal} />
            </div>
        );

        if (error) return (
            <div className="flex-1 flex items-center justify-center">
                <TicketError onRetry={fetchTicket} onClose={closeModal} />
            </div>
        );

        if (isAdmin) return (
            <>
                <AdminTicketPanel
                    ticket={ticket}
                    allAssignees={allAssignees}
                    allSprints={allSprints}
                    onSaved={() => { fetchTicket(); onRefresh?.(); }}
                    onDelete={() => setShowConfirm(true)}
                    deleteLoading={deleteLoading}
                />
                <CommentsPanel />
            </>
        );

        return (
            <>
                <UserTicketPanel ticket={ticket} onStatusSuccess={fetchTicket} />
                <CommentsPanel />
            </>
        );
    };

    return (
        <>
            <TicketDetailsWrapper isOpen={true} onClose={closeModal}>
                {renderContent()}
            </TicketDetailsWrapper>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<Trash2 className="w-5 h-5" />}
                            ticket={{ id: `${ticket.id}`, title: `${ticket.title}` }}
                            title="Move ticket to trash?"
                            description="This ticket will be hidden from all views"
                            confirmText="Move to trash"
                            variant="softDanger"
                            loading={deleteLoading}
                            onConfirm={handleDelete}
                            onCancel={() => setShowConfirm(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketDetailsModal;