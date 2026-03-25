import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("accessToken")
    const user = JSON.parse(localStorage.getItem("user"))

    if (!token)
        return <Navigate to="/login" replace />
    if (role && role != user?.role) {
        const role = user?.role === "ADMIN" ? "admin" : "user";
        return <Navigate to={`/${role}/dashboard`} replace />
    }


    return children;
}

export default ProtectedRoute
