import { useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const UserDashboard = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.success) {
            toast.success(location.state.success);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <div>
            UserDashboard
        </div>
    )
}

export default UserDashboard
