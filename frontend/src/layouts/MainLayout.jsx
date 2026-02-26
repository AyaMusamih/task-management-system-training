import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
    // const [modalContent, setModalContent] = useState(null);

    // openModal = (content) => { setModalContent(content) };
    // closeModal = () => { setModalContent(null) };

    const isLoggedIn = true; //currently static
    const user = { username: "Ahmad", role: "admin" };
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} />

            {/* Main content area */}
            <div className="flex-1 flex">
                {isLoggedIn && <Sidebar isLoggedIn={isLoggedIn} user={user} />}
                <main className="flex-1 p-6 bg-gray-100">
                    <Outlet />
                    {/* <Outlet context={{ openModal, closeModal }} /> */}
                </main>
            </div>

            <Footer />

            {/* Global Modal
            {modalContent && (
                <Modal isOpen={!!modalContent} onClose={closeModal}>
                    {modalContent}
                </Modal>
            )} */}
        </div>
    )
}

export default MainLayout
