import { useEffect, useState } from 'react'
import { useParams, useOutletContext, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getTickets } from "../../services/tickets.service";
import Loading from "../../components/common-ui/Loading";
import Empty from "../../components/common-ui/Empty";
import Error from "../../components/common-ui/Error";
import TicketsTable from "../../components/tickets/TicketsTable";
import TicketDetailsModal from "../../components/tickets/TicketDetailsModal";

const AdminDashboard = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.success) {
            toast.success(location.state.success);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const { openModal, closeModal } = useOutletContext();
    const { id } = useParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchTickets = async () => {

            try {

                const res = await getTickets();
                setTickets(res.items || res);

            } catch (err) {

                setError(err.message || "Failed to load tickets");

            } finally {

                setLoading(false);

            }

        };

        fetchTickets();

    }, []);

    useEffect(() => {
        if (id && tickets.length) {
            const ticket = tickets.find(t => String(t.id) === String(id));
            if (ticket) openModal(<TicketDetailsModal ticket={ticket} />);
        }
    }, [id, tickets]);

    const handleTicketClick = (ticket) => {
        openModal(<TicketDetailsModal ticket={ticket} />);
    };

    if (loading) return <Loading variant="skeleton" rows={8} />;
    if (error) return <Error message={error} onRetry={() => window.location.reload()} icon="/assets/images/ErrorIcon.png" />;
    if (!tickets.length) return <Empty title="No tickets" description="No items in your dashboard" icon="/assets/images/EmptyIcon.png" />;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <TicketsTable tickets={tickets} basePath="/admin/dashboard" onRowClick={handleTicketClick} />
        </div>
    );
}

export default AdminDashboard
