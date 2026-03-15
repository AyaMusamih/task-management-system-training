import { Outlet } from "react-router-dom";
import DashboardView from "../../components/dashboard/DashboardView";

const AdminDashboard = () => {
    const handleCreateTicket = () => {
        console.log("create ticket");
    };

    return (
        <>
            <DashboardView
                isAdmin={true}
                basePath="/admin/dashboard"
                onCreateTicket={handleCreateTicket}
            />
            <Outlet />
        </>
    );
};

export default AdminDashboard;