import { Outlet } from 'react-router-dom';
import { useState } from "react";
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import Modal from "../components/shared/Modal";

const MainLayout = () => {
    const [modalContent, setModalContent] = useState(null);

    const openModal = (content) => { setModalContent(content) };
    const closeModal = () => { setModalContent(null) };

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = !!storedUser;
    const user = storedUser || null;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} />

            {/* Main content area */}
            <div className="flex-1 flex">
                {isLoggedIn && <Sidebar isLoggedIn={isLoggedIn} user={user} />}
                <main className="flex-1 p-6 bg-gray-100">
                    {user?.role === "ADMIN" && (
                        <div>Admin Controls / Widgets</div>
                    )}
                    {user?.role === "USER" && (
                        <div>User Content / Limited Widgets</div>
                    )}
                    <Outlet context={{ openModal, closeModal }} />
                </main>
            </div>

            <Footer />

            {/* Global Modal */}
            {modalContent && (
                <Modal isOpen={!!modalContent} onClose={closeModal}>
                    {modalContent}
                </Modal>
            )}
        </div>
    )
}

export default MainLayout
