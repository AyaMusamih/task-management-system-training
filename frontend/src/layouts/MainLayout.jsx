import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";
import Sidebar from '../components/layout/Sidebar';
import Modal from "../components/shared/Modal";

const MainLayout = () => {
    const [modalContent, setModalContent] = useState(null);
    const isLoggedIn = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const navigate = useNavigate();
    const location = useLocation();

    const openModal = (content) => setModalContent(content);
    const closeModal = () => {
        setModalContent(null);
        const path = location.pathname.replace(/\/tickets\/[^/]+$/, "");
        navigate(path + location.search, { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex flex-1 overflow-hidden">
                {isLoggedIn && <Sidebar user={user} />}
                <main className="flex-1 overflow-y-auto bg-background">
                    <Outlet context={{ openModal, closeModal }} />
                </main>
            </div>

            {modalContent && (
                <Modal isOpen={!!modalContent} onClose={closeModal}>
                    {modalContent}
                </Modal>
            )}
        </div>
    );
};

export default MainLayout;