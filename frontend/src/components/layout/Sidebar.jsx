import { useNavigate, NavLink } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import Button from "../shared/Button";

const Sidebar = ({ user }) => {
    const navigate = useNavigate();

    const userLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/user/dashboard" },
        { name: "My Tasks", path: "/my-tickets" },
        { name: "Profile", path: "/profile" },
    ];

    const adminLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "All Tickets", path: "/all-tickets" },
        { name: "Deleted Tickets", path: "/deleted-tickets" },
        { name: "Task Management", path: "/task-management" },
        { name: "Reports", path: "/reports" },
        { name: "Profile", path: "/profile" },
    ];

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const links = user?.role === "ADMIN" ? adminLinks : userLinks;

    return (
        <aside className="w-64 bg-white shadow-md p-5">

            <div className="mb-6 border-b pb-3">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>

            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md ${isActive
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                            }`
                        }
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-6 border-t pt-4">
                <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;