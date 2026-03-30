import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";
import Sidebar from '../components/layout/Sidebar';
import Modal from "../components/shared/Modal";
import { Menu } from "lucide-react";

const MainLayout = () => {
    const [modalState, setModalState] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isLoggedIn = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user")) || null;

    const navigate = useNavigate();
    const location = useLocation();

    const openModal = (contentOrOptions) => {
        if (contentOrOptions && typeof contentOrOptions === "object" && contentOrOptions.content !== undefined) {
            setModalState(contentOrOptions);
        } else {
            setModalState({ content: contentOrOptions });
        }
    };

    const closeModal = () => {
        setModalState(null);
        const path = location.pathname.replace(/\/tickets\/[^/]+$/, "");
        navigate(path + location.search, { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">

            {isLoggedIn && (
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-card-left border-b border-divider/30 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-accent-blue rounded-md" />
                            <span className="text-logo text-text-primary text-[15px]">Task Flow</span>
                        </div>
                    </div>
                </header>
            )}

            <div className="flex flex-1 overflow-hidden">
                {isLoggedIn && (
                    <Sidebar
                        user={user}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                )}
                <main className="flex-1 overflow-y-auto bg-background min-w-0">
                    <Outlet context={{ openModal, closeModal }} />
                </main>
            </div>

            {modalState && (
                <Modal
                    isOpen={true}
                    onClose={closeModal}
                    title={modalState.title}
                    width={modalState.width}
                >
                    {modalState.content}
                </Modal>
            )}
        </div>
    );
};

export default MainLayout;