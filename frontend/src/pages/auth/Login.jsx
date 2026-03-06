import { useState } from "react";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import GoogleIcon from "../../assets/images/GoogleIcon.png";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AuthLayout from "./AuthLayout";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.post("/auth/login", {
                email,
                password,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);
            navigate("/dashboard");

        } catch (err) {
            setError(
                err.response?.data?.error || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>

            <h1 className="text-heading text-text-primary mb-1">
                Welcome back
            </h1>

            <p className="text-subtitle text-text-secondary mb-8">
                Don't have an account?{" "}
                <Link to="/signup" className="text-link font-medium underline">
                    Sign up
                </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

                <Input
                    label="Email*"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    error={!!error}
                />

                <Input
                    label="Password*"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    error={!!error}
                    helperText={error}
                />

                <div className="flex justify-end">
                    <span className="font-inter text-hint text-link cursor-pointer underline">
                        Forgot password?
                    </span>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={loading}
                    disabled={!email || !password || loading}
                >
                    Login
                </Button>

            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-divider" />
                </div>
                <div className="relative flex justify-center">
                    <span className="px-3 bg-card-left text-divider-text text-text-primary">
                        Or
                    </span>
                </div>
            </div>

            {/* Google Button */}
            <Button
                variant="ghost"
                size="lg"
                type="button"
                className="w-full flex items-center justify-center gap-3 text-google-btn"
                disabled={loading}
                onClick={() => console.log("Google login")}
            >
                <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
                Continue with Google
            </Button>

        </AuthLayout>
    );
}