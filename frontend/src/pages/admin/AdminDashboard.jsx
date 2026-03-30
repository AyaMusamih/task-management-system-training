import { useRef } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import DashboardView from "../../components/dashboard/DashboardView";
import TaskFormModal from "../../components/tickets/TaskFormModal";

const AdminDashboard = () => {
    // access openModal/closeModal from the MainLayout outlet context
    const { openModal, closeModal } = useOutletContext();
    const refreshRef = useRef(null);

    const handleCreateTicket = (assignees, currentSprint) => {
        openModal({
            title: "Create Task",
            content: (
                <TaskFormModal
                    mode="create"
                    assignees={assignees}
                    currentSprint={currentSprint}
                    onSuccess={() => {
                        closeModal();
                        refreshRef.current?.();
                    }}
                />
            ),
        });
    };

    const header = (
        <div>
            <h1
                className="font-inter font-medium text-[24px] text-text-primary"
                style={{ letterSpacing: "-0.45px" }}
            >
                Project Dashboard
            </h1>
            <p
                className="font-inter font-normal text-[15px] text-text-primary"
                style={{ letterSpacing: "0.5%" }}
            >
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
                onRegisterRefresh={(fn) => { refreshRef.current = fn; }}
                header={header}
            />
            <Outlet />
        </>
    );
};

export default AdminDashboard;