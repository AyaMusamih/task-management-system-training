import TicketIndicators from "./TicketIndicators";
import { useNavigate } from "react-router-dom";

const TicketsTable = ({ tickets, basePath }) => {
    const navigate = useNavigate();

    const handleRowClick = (ticketId) => {
        navigate(`${basePath}/tickets/${ticketId}`);
    };

    return (
        <table className="w-full border">
            <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="p-3">Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Indicators</th>
                </tr>
            </thead>
            <tbody>
                {tickets.map((ticket) => (
                    <tr
                        key={ticket.id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(ticket.id)}
                    >
                        <td className="p-3">{ticket.title}</td>
                        <td className="p-3">{ticket.status}</td>
                        <td className="p-3">{ticket.priority}</td>
                        <td className="p-3">
                            <TicketIndicators permissions={ticket.permissions} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TicketsTable;