import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import GoogleIcon from "../../assets/images/GoogleIcon.png";
import AuthLayout from "./AuthLayout";
import { CircleAlert } from 'lucide-react';
import { toastSuccess } from "../../utils/toastHelpers";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);

    const validateForm = () => {
        const newErrors = {};
        if (!/\S+@\S+\.\S{2,}/.test(email)) newErrors.email = "Invalid email format";
        if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        return newErrors;
    };

    // restore lock from localStorage
    useEffect(() => {
        const lockUntil = localStorage.getItem("login_lock_until");

        if (lockUntil) {
            const diff = Math.ceil((Number(lockUntil) - Date.now()) / 1000);

            if (diff > 0) {
                setRetryAfter(diff);

                setErrors({
                    general: "Too many failed attempts. Please wait 2 minutes before trying again."
                });

            } else {
                localStorage.removeItem("login_lock_until");
            }
        }
    }, []);

    // countdown timer
    useEffect(() => {
        if (!retryAfter) return;

        const timer = setInterval(() => {
            setRetryAfter((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem("login_lock_until");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [retryAfter]);

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

            const { accessToken, user } = await loginUser(email, password);

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));

            setSuccess(true);

            setTimeout(() => {
                const redirectPath = localStorage.getItem("redirect_after_login");

                const isSafePath = redirectPath && redirectPath.startsWith("/");

                const targetPath =
                    isSafePath
                        ? redirectPath
                        : ("/projects");


                localStorage.removeItem("redirect_after_login");

                toastSuccess("Logged in successfully!", "Welcome back!");
                navigate(targetPath);
            }, 1500);

        } catch (err) {
            if (err?.type === "rateLimit" || err?.status === 429) {
                const cooldown = 2 * 60;
                setRetryAfter(cooldown);
                setErrors({ general: "Too many failed attempts. Please wait 2 minutes before trying again." });
                localStorage.setItem("login_lock_until", String(Date.now() + cooldown * 1000));
            } else if (err?.type === "validation" && err?.fields) {
                setErrors(err.fields);
            } else {
                setErrors({ general: err?.message ?? "Login failed. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const hasGeneralError = !!errors.general;

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
                        <CircleAlert className="error-icon" />
                        <div>
                            <div>{errors.general}</div>
                        </div>
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
                        setErrors((prev) => ({ ...prev, email: undefined, general: undefined, }));
                        setSubmitted(false);
                    }}
                    disabled={loading}
                    error={errors.email || (hasGeneralError ? " " : undefined)}
                    success={email && !errors.email && submitted && !errors.general}
                    className={`input-field ${hasGeneralError ? "border-red-500" : ""}`}
                />

                <Input
                    page="login"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined, general: undefined, }));
                        setSubmitted(false);
                    }}
                    disabled={loading}
                    error={errors.password || (hasGeneralError ? " " : undefined)}
                    success={password && !errors.password && submitted && !errors.general}
                    className={`input-field ${hasGeneralError ? "border-red-500" : ""}`}
                    helperText={
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-hint text-link cursor-pointer font-medium underline">
                                Forgot password?
                            </Link>
                        </div>
                    }
                />

                <Button
                    type="submit"
                    size="lg"
                    page="login"
                    loading={loading}
                    disabled={!email || !password || retryAfter > 0}
                    className="primary-button w-full mt-2 text-btn-text"
                    success={success}
                    error={errors && submitted && errors.general}
                >
                    {loading
                        ? "Logging in…"
                        : retryAfter > 0
                            ? `Try again in ${formatTime(retryAfter)}`
                            : success
                                ? "Login successfully!"
                                : "Login"}
                </Button>

            </form>
        </AuthLayout>
    );
};

export default Login;