import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn }) => {
    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            {isLoggedIn ?
                <>
                    <div className="flex gap-4">
                        <Link to="/" className="hover:underline font-bold text-lg">TaskManager</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/profile"
                            className="w-8 h-8 bg-white rounded-full text-blue-600 flex items-center justify-center font-bold"
                        >
                            U
                        </Link>
                    </div>
                </>
                :
                <>
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:underline font-bold text-lg">TaskManager</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="hover:underline ">Login</Link>
                        <Link to="/signup" className="hover:underline">Signup</Link>
                    </div>
                </>
            }
        </nav>
    );
}

export default Navbar
