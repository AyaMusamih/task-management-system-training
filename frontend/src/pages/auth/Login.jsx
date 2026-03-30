import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import GoogleIcon from "../../assets/images/GoogleIcon.png";
import AuthLayout from "./AuthLayout";
import { CircleAlert } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!/\S+@\S+\.\S{2,}/.test(email)) newErrors.email = "Invalid email format";
        if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            const { accessToken, user, refreshToken } = await loginUser(email, password);

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            setSuccess(true);

            setTimeout(() => {
                if (user?.role === "ADMIN") {
                    navigate("/admin/dashboard", {
                        state: {
                            toast: {
                                title: "Logged in successfully!",
                                description: "Welcome back!",
                                icon: "success",
                                type: "success",
                            }
                        }
                    });
                } else if (user?.role === "USER") {
                    navigate("/user/dashboard", {
                        state: {
                            toast: {
                                title: "Logged in successfully!",
                                description: "Welcome back!",
                                icon: "success",
                                type: "success",
                            }
                        }
                    });
                }
            }, 1500);

        } catch (err) {
            if (err.type === "validation") setErrors(err.errors);
            else setErrors({ general: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout type="login">
            <div className="mb-6">
                <h1 className="text-heading text-text-primary mb-1">Welcome back</h1>

                <p className="text-subtitle text-text-secondary">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-link font-medium underline">
                        Sign up
                    </Link>
                </p>


                {errors.general && (
                    <div className="flex items-start gap-2 mt-4 px-4 py-4 rounded-xl text-error-text bg-[#ef444410] border border-[#ef444430] text-error-red">
                        < CircleAlert className="error-icon" />{errors.general}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                        setSubmitted(false)
                    }}
                    disabled={loading}
                    error={errors.email}
                    success={email && !errors.email && submitted && !errors.general}
                    className="input-field"
                />

                <Input
                    page="login"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                        setSubmitted(false)
                    }}
                    disabled={loading}
                    error={errors.password}
                    success={password && !errors.password && submitted && !errors.general}
                    className="input-field"
                    helperText={
                        <div className="flex justify-end">
                            <span className="text-hint text-link cursor-pointer font-medium underline">
                                Forgot password?
                            </span>
                        </div>
                    }
                />

                <Button
                    type="submit"
                    size="lg"
                    page="login"
                    loading={loading}
                    disabled={!email || !password}
                    className="primary-button w-full mt-2 text-btn-text"
                    success={success}
                    error={errors && submitted && errors.general}
                >
                    {loading ? "Logging in…" : success ? "Login successfully!" : "Login"}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-divider" />
                    <span className="text-[20px] text-text-primary">Or</span>
                    <div className="flex-1 h-px bg-divider" />
                </div>

                {/* Google Button */}
                <Button
                    variant="secondary"
                    type="button"
                    className="google-button w-full flex items-center justify-center gap-3 text-google-btn bg-input-bg"
                    disabled={loading}
                    onClick={() => console.log("Google login")}
                >
                    <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
                    Continue with Google
                </Button>
            </form>
        </AuthLayout>
    );
}

export default Login;