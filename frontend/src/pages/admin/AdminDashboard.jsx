import { Outlet } from "react-router-dom";
import DashboardView from "../../components/dashboard/Dashboardview";

const AdminDashboard = () => {
    const handleCreateTicket = () => {
        console.log("create ticket");
    };

    const header = (
        <div>
            <h1 className="font-inter font-medium text-[24px] text-text-primary" style={{ letterSpacing: "-0.45px" }}>Project Dashboard</h1>
            <p className="font-inter font-normal text-[18px] text-text-primary" style={{ letterSpacing: "0.5%" }}>
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