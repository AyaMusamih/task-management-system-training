import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import AuthLayout from "./AuthLayout";
import { CircleCheck } from "lucide-react";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(password)) {
            newErrors.password = "Password must contain uppercase, lowercase, number and special character";
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
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

        if (!token) {
            setErrors({ general: "Invalid or missing reset token. Please request a new link." });
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            if (err.type === "validation") {
                setErrors(err.errors);
            } else {
                setErrors({ general: err.message || "Something went wrong. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout>
                <div className="mb-6 flex items-center gap-3">
                    <CircleCheck className="w-8 h-8 text-success-green shrink-0" />
                    <h1 className="text-heading text-text-primary">Password changed!</h1>
                </div>

                <p className="text-success-text text-text-secondary mb-6">
                    Your password has been changed successfully. You can now log in using your new password.
                </p>

                <div className="flex flex-col gap-4">
                    <Link to="/login">
                        <Button
                            type="button"
                            size="lg"
                            className="primary-button w-full text-btn-text !bg-success-green hover:!bg-success-dark"
                        >
                            Log in now
                        </Button>
                    </Link>

                    <p className="text-success-text text-white text-center">
                        Didn't request this change?{" "}
                        <a href="mailto:support@taskflow.io" className="text-white font-medium underline">
                            Contact support immediately
                        </a>
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="mb-6">
                <h1 className="text-heading text-text-primary mb-1">Change Password</h1>
                <p className="text-success-text text-text-secondary">
                    Please enter a new secure password to protect your account!
                </p>

                {errors.general && (
                    <div className="flex items-start gap-2 mt-4 px-4 py-4 rounded-xl text-error-text bg-[#ef444410] border border-[#ef444430] text-error-red">
                        {errors.general}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                        setSubmitted(false);
                    }}
                    disabled={loading}
                    error={errors.password || (errors.confirmPassword === "Passwords do not match" ? " " : undefined)}
                    success={password && !errors.password && submitted}
                        helperText={errors.confirmPassword === "Passwords do not match" ? undefined : "Must be at least 8 characters and include letters and numbers"}
                    className="input-field"
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        setSubmitted(false);
                    }}
                    disabled={loading}
                    error={errors.confirmPassword}
                    success={confirmPassword && !errors.confirmPassword && submitted}
                    helperText="Must match the new password"
                    className="input-field"
                />

                <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!password || !confirmPassword}
                    className="primary-button w-full mt-2 text-btn-text"
                >
                    {loading ? "Updating…" : "Update Password"}
                </Button>

                <p className="text-subtitle text-white text-center">
                    For your security, do not share your password with anyone
                </p>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;