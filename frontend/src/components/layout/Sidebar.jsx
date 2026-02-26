import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

const Sidebar = ({ user }) => {

    const userLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "My Tasks", path: "/my-tasks" },
        { name: "Profile", path: "/profile" },
    ];

    const adminLinks = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "All Tickets", path: "/all-tickets" },
        { name: "Task Management", path: "/task-management" },
        { name: "Reports", path: "/reports" },
        { name: "Profile", path: "/profile" },
    ];

    const links = user.role === "admin" ? adminLinks : userLinks;

    return (
        <aside className="w-64 bg-white shadow-md p-5">

            <div className="mb-6 border-b pb-3">
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
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
                <button className="text-red-500 hover:underline cursor-pointer">
                    <Link to="/login" >Logout</Link>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;