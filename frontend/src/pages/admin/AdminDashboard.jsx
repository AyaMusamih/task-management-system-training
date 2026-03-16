import { Outlet } from "react-router-dom";
import DashboardView from "../../components/dashboard/Dashboardview";

const AdminDashboard = () => {
    const handleCreateTicket = () => {
        console.log("create ticket");
    };

    const header = (
        <div>
            <h1 className="font-poppins font-semibold text-[24px] text-text-primary leading-tight">Project Dashboard</h1>
            <p className="text-success-text text-[#64748B] mt-1">
                Manage and track tasks across your project lifecycle.
            </p>
        </div>
    );

    return (
        <>
            <DashboardView
                isAdmin={true}
                basePath="/admin/dashboard"
                onCreateTicket={handleCreateTicket}
                header={header}
            />
            <Outlet />
        </>
    );
};

export default AdminDashboard;