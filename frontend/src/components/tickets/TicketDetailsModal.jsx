import { useState, useEffect, useCallback } from "react";
import { Trash2, CircleCheckBig, XCircle, MessageSquareText, SendHorizontal, MessageSquare, MessageSquareX } from "lucide-react";
import Button from "../shared/Button";
import ConfirmDialog from "../shared/ConfirmDialog";
import TicketDetailsWrapper from "./TicketDetailsWrapper";
import AdminTicketPanel, { AdminTicketPanelSkeleton } from "./AdminTicketPanel";
import UserTicketPanel from "./UserTicketPanel";
import { showToast } from "../../utils/showToast";
import { getTicketById, softDeleteTicket } from "../../services/tickets.service";
import { getUsers } from "../../services/user.service";
import { getSprints } from "../../services/sprints.service";
import TicketDetailsEmptyImg from "../../assets/images/TicketDetailsEmpty.png";
import TicketDetailsErrorImg from "../../assets/images/TicketDetailsError.png";
import { getTicketComments, getTicketAudit, addTicketComment } from "../../services/tickets.service";

// ─── Helpers 

const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
};

// ─── Skeletons

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

const CommentsPanelSkeleton = () => (
    <div className="flex-1 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-divider/20">
            <div className="h-5 w-44 skeleton rounded-md" />
        </div>
        <div className="px-6 pt-4 pb-3 flex flex-col gap-2">
            <div className="h-20 w-full skeleton rounded-xl" />
            <div className="flex justify-end">
                <div className="h-9 w-24 skeleton rounded-lg" />
            </div>
        </div>
        <div className="px-6 pb-6 flex flex-col gap-4 mt-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5 pt-1">
                        <div className="flex gap-2">
                            <div className="h-3 w-24 skeleton rounded-md" />
                            <div className="h-3 w-16 skeleton rounded-md" />
                        </div>
                        <div className="h-3 w-full skeleton rounded-md" />
                        <div className="h-3 w-4/5 skeleton rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─── Empty / Error states

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

const CommentsError = ({ onRetry, message }) => (
    <div className="flex flex-col items-center justify-center py-12 mt-6 gap-4">
        <MessageSquareX className="w-12 h-12 text-error-red/60" />

        <div className="text-center flex flex-col gap-1">
            <p className="text-md font-medium text-text-primary">
                Failed to load comments
            </p>

            <p className="text-sm text-text-secondary">
                {message || "Something went wrong. Please try again"}
            </p>
        </div>

        <button
            onClick={onRetry}
            className="px-7 py-2 cursor-pointer bg-accent-blue text-white text-sm rounded-lg hover:bg-accent-blue/80 transition"
        >
            Retry
        </button>
    </div>
);

// ─── Avatar 

const Avatar = ({ name = "", className = "" }) => {
    const initials = getInitials(name);
    return (
        <div className={`w-8 h-8 rounded-full bg-accent-blue/30 border border-accent-blue/40 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-accent-blue ${className}`}>
            {initials || "?"}
        </div>
    );
};

// ─── CommentsPanel 
const CommentsPanel = ({ ticketId, ticket, isAdmin = false }) => {
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const canComment = isAdmin || ticket?.assignee?.id === user?.id;

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const maxLength = 500;
    const isEmpty = !newComment.trim();
    const isTooLong = newComment.length > maxLength;

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getTicketComments(ticketId);
                setComments(res.data || []);
            } catch (err) {
                setError({
                    status: err?.status,
                    message: err?.message,
                });
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) fetchComments();
    }, [ticketId]);


    const handleAddComment = async () => {
        if (!newComment.trim()) {
            showToast({
                title: "Empty Comment",
                description: "Comment cannot be empty",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
            return;
        }
        setSubmitting(true);
        try {
            const res = await addTicketComment(ticketId, newComment.trim());
            setComments((prev) => [res.data, ...prev]);
            setNewComment("");
            showToast({
                title: "Comment Added",
                description: "Your comment was added successfully",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
        } catch (err) {
            const status = err?.status;

            let message = "Failed to process comment request";

            if (status === 403) {
                message = err?.message || "You are not allowed to comment on this ticket";
            } else if (status === 404) {
                message = err?.message || "Ticket not found";
            } else if (status === 400) {
                message =
                    err?.errors?.[0]?.msg ||
                    err?.message ||
                    "Invalid comment input";
            } else {
                message = err?.message || message;
            }

            showToast({
                title: "Failed to Add Comment",
                description: message,
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CommentsPanelSkeleton />;
    if (error) {
        return (
            <div className="flex-1 overflow-y-auto px-6 pb-6 flex items-center justify-center">
                <CommentsError
                    message={error?.message}
                    onRetry={() => {
                        setError(null);
                        setLoading(true);

                        getTicketComments(ticketId)
                            .then((res) => setComments(res.data || []))
                            .catch((err) =>
                                setError({
                                    status: err.status,
                                    message: err.message,
                                })
                            )
                            .finally(() => setLoading(false));
                    }}
                />
            </div>
        );
    }

    const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-divider/20">
                <h1 className="font-semibold text-text-primary text-xl flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5" />
                    Comments
                </h1>
            </div>

            {/* Add Comment */}
            <div className="px-6 pt-4 pb-3 flex flex-col gap-2">
                <div>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={canComment ? "Write a comment..." : "You can't comment on this ticket"}
                        disabled={!canComment}
                        rows={3}
                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59, 130, 246, 0.4) transparent" }}
                        className={`w-full text-text-primary bg-input-bg rounded-xl p-3 text-sm resize-none outline-none border transition-colors
                            ${isTooLong ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-accent-blue/40"}
                            disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto`}
                    />
                    <div className="flex justify-between items-center text-xs -mt-1 mr-3">
                        <span className="text-red-500">{isTooLong && "Comment is too long"}</span>
                        <span className={isTooLong ? "text-red-500" : "text-text-hint"}>
                            {newComment.length}/{maxLength}
                        </span>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleAddComment}
                        disabled={!canComment || submitting || isEmpty || isTooLong}
                        className="flex items-center cursor-pointer gap-2 px-5 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <SendHorizontal className="w-3.5 h-3.5" />
                                Comment
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Comments Feed */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4">
                {sortedComments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 mt-6 gap-4">
                        <MessageSquare className="w-12 h-12 text-accent-blue/30" />
                        <div className="text-center flex flex-col gap-1">
                            <p className="text-sm font-medium text-text-primary">No comments yet</p>
                            <p className="text-xs text-text-secondary">Be the first to leave a comment</p>
                        </div>
                    </div>
                )}

                {sortedComments.map((item) => {
                    const authorName = item.author?.name || "Unknown";
                    return (
                        <div key={`comment-${item.id}`} className="flex gap-3">
                            <Avatar name={authorName} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-text-primary">{authorName}</span>
                                    <span className="text-xs text-text-secondary">{getRelativeTime(item.createdAt)}</span>
                                </div>
                                <p className="text-sm text-text-primary/90 leading-relaxed break-words break-all whitespace-pre-wrap">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── TicketDetailsModal 

const TicketDetailsModal = ({ ticketId, closeModal, onRefresh }) => {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [allAssignees, setAllAssignees] = useState([]);
    const [allSprints, setAllSprints] = useState([]);

    const [audit, setAudit] = useState([]);
    const [auditLoading, setAuditLoading] = useState(true);
    const [auditError, setAuditError] = useState(null);

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

    const fetchAudit = useCallback(async () => {
        setAuditLoading(true);
        setAuditError(null);

        try {
            const res = await getTicketAudit(ticketId);
            setAudit(res.items || []);
        } catch (err) {
            setAuditError({
                status: err?.status,
                message: err?.message,
            });
            setAudit([]);
        } finally {
            setAuditLoading(false);
        }
    }, [ticketId]);

    useEffect(() => { fetchTicket(); }, [fetchTicket]);
    useEffect(() => { if (isAdmin) fetchAudit(); }, [fetchAudit, isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        getUsers(1, 100).then((res) => setAllAssignees(res.data?.users || [])).catch(() => { });
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        getSprints(1, 100).then((res) => setAllSprints(res.data?.items || [])).catch(() => { });
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
                {isAdmin
                    ? <AdminTicketPanelSkeleton />
                    : (
                        <div className="flex-1 overflow-y-auto px-6 py-6 border-r border-divider/20">
                            <TicketDetailsSkeleton />
                        </div>
                    )
                }
                <CommentsPanelSkeleton />
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
                    audit={audit}
                    auditLoading={auditLoading}
                    auditError={auditError}
                    onRetryAudit={fetchAudit}
                    onSaved={() => { fetchTicket(); fetchAudit(); onRefresh?.(); }}
                    onDelete={() => setShowConfirm(true)}
                    deleteLoading={deleteLoading}
                />
                <CommentsPanel
                    ticketId={ticket.id}
                    ticket={ticket}
                    isAdmin={true}
                />
            </>
        );

        return (
            <>
                <UserTicketPanel ticket={ticket} onStatusSuccess={fetchTicket} />
                <CommentsPanel
                    ticketId={ticket.id}
                    ticket={ticket}
                    isAdmin={false}
                />
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