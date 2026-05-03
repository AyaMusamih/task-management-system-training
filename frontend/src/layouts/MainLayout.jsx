import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import Sidebar from '../components/layout/Sidebar';
import Modal from "../components/shared/Modal";
import { Menu } from "lucide-react";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import { AlarmClock, TriangleAlert, BadgeInfo, LogOut, CircleCheckBig } from "lucide-react";
import { showToast } from "../utils/showToast";
import { logoutUser } from "../services/auth.service";
import ConnectionLostIcon from "../assets/images/ConnectionLostIcon.png";

const MainLayout = () => {
    const [modalState, setModalState] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [Refreshed, setRefreshed] = useState(false);
    const [connectionLost, setConnectionLost] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const isLoggedIn = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user")) || null;

    const handleLogoutConfirm = async () => {
        setLoading(true);
        const success = await logoutUser();

        if (success) {
            showToast({
                title: "Logout successfully!",
                description: "You’ve been logged out. Come back anytime!",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

            navigate("/login");
        }

        setShowLogoutConfirm(false);
        setLoading(false);
    };

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
    useEffect(() => {
        const handleSessionExpired = () => {
            setIsRefreshing(false);
            setSessionExpired(true);
        };

        const handleRefreshing = () => {
            setIsRefreshing(true);
        };

        const handleRefreshed = () => {
            setIsRefreshing(false);
            setRefreshed(true);
        }

        const handleConnectionLost = () => setConnectionLost(true);
        const handleConnectionRestored = () => setConnectionLost(false);

        window.addEventListener("sessionExpired", handleSessionExpired);
        window.addEventListener("sessionRefreshing", handleRefreshing);
        window.addEventListener("sessionRefreshed", handleRefreshed);
        window.addEventListener("connectionLost", handleConnectionLost);
        window.addEventListener("connectionRestored", handleConnectionRestored);

        return () => {
            window.removeEventListener("sessionExpired", handleSessionExpired);
            window.removeEventListener("sessionRefreshing", handleRefreshing);
            window.removeEventListener("sessionRefreshed", handleRefreshed);
            window.removeEventListener("connectionLost", handleConnectionLost);
            window.removeEventListener("connectionRestored", handleConnectionRestored);
        };
    }, []);

    useEffect(() => {
        if (Refreshed) {
            showToast({
                title: "Session Refreshed",
                description: "Your session was automatically renewed.",
                icon: <BadgeInfo className="w-4 h-4" />,
                type: "info",
            });

            setRefreshed(false);
        }
    }, [Refreshed]);

    const handleSessionConfirm = () => {
        setSessionExpired(false);

        const currentPath = window.location.pathname + window.location.search;

        localStorage.setItem("redirect_after_login", currentPath);

        window.location.replace("/login");
    };

    const handleRetryConnection = () => {
        setConnectionLost(false);
        window.__retryRequest?.();
    };

    const handleCancelConnection = () => {
        setConnectionLost(false);
        window.__cancelRequest?.();
    };

    useEffect(() => {
        if (sessionExpired) {
            showToast({
                title: "Session expired",
                description: "Please log in again to continue.",
                icon: <TriangleAlert className="w-4 h-4" />,
                type: "warning",
            });

            handleSessionConfirm();
        }
    }, [sessionExpired]);

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
                        onLogoutClick={() => setShowLogoutConfirm(true)}
                    />
                )}
                <main className="flex-1 overflow-y-auto bg-background min-w-0">
                    <Outlet context={{ openModal, closeModal }} />
                </main>
            </div>

            {(isRefreshing || sessionExpired) && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[70%] md:w-[50%] max-w-2xl z-51 flex flex-col gap-3 backdrop-blur-sm">

                    {isRefreshing && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-[#D97706]">
                            <div className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm sm:text-base">Refreshing your session...</span>
                        </div>
                    )}

                    {/* {sessionExpired && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-[#D97706]">

                            <div className="flex items-center gap-3 flex-1">
                                <TriangleAlert className="w-4 h-4 text-[#D97706]" />
                                <span className="text-sm sm:text-base">Your session has expired. Please log in again.</span>
                            </div>

                            <button
                                onClick={handleSessionConfirm}
                                className="mt-2 sm:mt-0 px-3 py-1.5 rounded-lg border border-[#D97706] hover:bg-[#D97706]/10 transition cursor-pointer text-sm sm:text-base"
                            >
                                Log in again
                            </button>

                        </div>
                    )} */}

                </div>
            )}

            {modalState && (
                <Modal
                    isOpen={true}
                    onClose={closeModal}
                    title={modalState.title}
                    transparent={modalState.transparent}
                >
                    {modalState.content}
                </Modal>
            )}

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowLogoutConfirm(false)}
                    />
                    <ConfirmDialog
                        title="Confirm Logout"
                        description="You'll be signed out of your account. Any unsaved changes will be lost."
                        confirmText="Logout"
                        cancelText="Stay logged in"
                        loading={loading}
                        variant="danger"
                        icon={<LogOut className="w-5 h-5" />}
                        onConfirm={handleLogoutConfirm}
                        onCancel={() => setShowLogoutConfirm(false)}
                    />
                </div>
            )}

            {sessionExpired && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-xs">
                    <ConfirmDialog
                        title="Session Expired"
                        description="Your session has timed out for security reasons. Please log in again to continue."
                        confirmText="Login again"
                        icon={<AlarmClock className="w-5 h-5" />}
                        variant="warning"
                        onConfirm={handleSessionConfirm}
                    />
                </div>
            )}
            {connectionLost && (
                <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/40 backdrop-blur-sm">
                    <ConfirmDialog
                        title="Connection lost"
                        description="Please check your internet connection and try again."
                        confirmText="Retry"
                        cancelText="Cancel"
                        icon={<img src={ConnectionLostIcon} alt="Connection Lost" className="w-7 h-7" />}
                        variant="warning"
                        onConfirm={handleRetryConnection}
                        onCancel={handleCancelConnection}
                    />
                </div>
            )}
        </div>
    );
};

export default MainLayout;