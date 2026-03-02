import { Link } from "react-router-dom";

const Profile = () => {
    return (
        <div className="flex justify-between">
            Profile
            <Link to='/profile/password' className="hover:underline text-blue-600">Change Your Password</Link>
        </div >
    )
}

export default Profile
