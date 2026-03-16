import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import {
    Layers,
    LayoutDashboard,
    FolderOpen,
    Ticket,
    BarChart2,
    Settings,
} from "lucide-react";

const Sidebar = ({ user }) => {
    const navigate = useNavigate();

    const userLinks = [
        { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: FolderOpen },
        { name: "Tickets", path: "/my-tickets", icon: Ticket },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    const adminLinks = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: FolderOpen },
        { name: "Tickets", path: "/all-tickets", icon: Ticket },
        { name: "Reports", path: "/reports", icon: BarChart2 },
        { name: "Settings", path: "/settings", icon: Settings },
    ];

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const links = user?.role === "ADMIN" ? adminLinks : userLinks;

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <aside className="w-60 flex flex-col border-r border-divider/30 py-5 px-3 shrink-0">

            {/* Logo */}
            <div className="flex flex-col gap-1 px-2 mb-8">
                <div className="flex items-center gap-2">
                    <div className="logo-icon bg-accent-blue rounded-lg" />
                    <span className="text-logo text-text-primary">Task Flow</span>
                </div>
                <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-text-hint" />
                    <p className="text-hint text-text-hint">Project Alpha</p>
                </div>
            </div>

            <div className="border-b border-divider/30 mb-4 mt-[-16px]" />

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1">
                {links.map(({ name, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-success-text transition-colors duration-150
                            ${isActive
                                ? "bg-accent-blue/15 text-accent-blue"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        {name}
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="mt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-text-secondary hover:text-error-red hover:bg-white/5 transition-colors duration-150 mb-2"
                >
                    <span className="text-field-label">Logout</span>
                </button>

                <div className="border-b border-divider/30 mb-2" />

                <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center text-hint font-semibold text-white-btn shrink-0">
                        {initials}
                    </div>
                    <div className="text-left">
                        <p className="text-field-label text-text-primary leading-tight">{user?.name}</p>
                        <p className="text-hint text-text-hint capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;