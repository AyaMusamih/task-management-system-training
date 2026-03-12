import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("accessToken")
    const user = JSON.parse(localStorage.getItem("user"))

    if (!token)
        return <Navigate to="/login" replace />
    if (role && role != user?.role)
        return <Navigate to="/" replace />

    return children;
}

export default ProtectedRoute
