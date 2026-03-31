import { NavLink, useNavigate, Link } from "react-router-dom";
import {
    Layers,
    LayoutDashboard,
    FolderOpen,
    BarChart2,
    Settings,
    X,
    LogOut,
} from "lucide-react";

const SidebarContent = ({ links, initials, user, onClose, onLogoutClick }) => {

    return (
        <div className="flex flex-col h-full py-5 px-3">
            {/* Logo */}
            <div className="flex items-center justify-between px-2 mb-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="logo-icon bg-accent-blue rounded-lg shrink-0" />
                        <span className="text-logo text-text-primary">Task Flow</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-text-hint" />
                        <p className="text-hint text-text-hint">Project Alpha</p>
                    </div>
                </div>
                {/* <button
                    onClick={onClose}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-text-hint hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                    <X className="w-4 h-40" />
                </button> */}
            </div>

            <div className="border-b border-divider/30 mb-4 mt-[-16px]" />

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1">
                {links.map(({ name, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        onClick={onClose}
                        title={name}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-success-text transition-colors duration-150 group relative
              ${isActive
                                ? "bg-accent-blue/15 text-accent-blue"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="mt-4">
                <button
                    onClick={onLogoutClick}
                    title="Logout"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-text-secondary hover:text-error-red hover:bg-white/5 transition-colors duration-150 mb-2"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="text-field-label">Logout</span>
                </button>

                <div className="border-b border-divider/30 mb-2" />

                <Link to="/profile" className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center text-hint font-semibold text-white-btn shrink-0">
                        {initials}
                    </div>
                    <div className="text-left">
                        <p className="text-field-label text-text-primary leading-tight">{user?.name}</p>
                        <p className="text-hint text-text-hint capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

const Sidebar = ({ user, isOpen, onClose, onLogoutClick }) => {
    const navigate = useNavigate();

    const userLinks = [
        { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: FolderOpen },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    const adminLinks = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: FolderOpen },
        { name: "Reports", path: "/reports", icon: BarChart2 },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    const links = user?.role === "ADMIN" ? adminLinks : userLinks;

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-divider/30 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <SidebarContent
                    links={links}
                    initials={initials}
                    user={user}
                    onClose={onClose}
                    onLogoutClick={onLogoutClick}
                />
            </aside>

            <aside className="hidden lg:flex w-60 flex-col shrink-0 bg-background">
                <SidebarContent
                    links={links}
                    initials={initials}
                    user={user}
                    onClose={onClose}
                    onLogoutClick={onLogoutClick}
                />
            </aside>
        </>
    );
};

export default Sidebar;