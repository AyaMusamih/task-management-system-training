import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/auth.service";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import AuthLayout from "./AuthLayout";
import { ChevronLeft } from "lucide-react"

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validateEmail = (val) => {
        if (!val) return "Email is required";
        if (!/\S+@\S+\.\S{2,}/.test(val)) return "Invalid email";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            await forgotPassword(email);
            setEmailSent(true);
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

    const handleResend = async () => {
        setEmailSent(false);
        setSubmitted(false);
        setErrors({});
    };

    if (emailSent) {
        return (
            <AuthLayout>
                <div className="mb-6">
                    <h1 className="text-heading text-text-primary mb-1">Check your email</h1>
                    <p className="text-success-text text-text-secondary">
                        We have sent a password reset link to your email.
                        Please check your inbox.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link to="/login">
                        <Button
                            type="button"
                            size="lg"
                            className="primary-button w-full text-btn-text"
                        >
                            Back to Login
                        </Button>
                    </Link>

                    <p className="text-success-text text-white text-center">
                        Didn't receive the email?{" "}
                        <button
                            onClick={handleResend}
                            className="text-white font-bold underline cursor-pointer"
                        >
                            Resend link
                        </button>
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="mb-6">
                <Link to="/login">
                    <button
                        className="flex items-center gap-1 text-field-label text-text-hint hover:text-text-primary cursor-pointer mb-3"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <p>Back</p>
                    </button>
                </Link>

                <h1 className="text-heading text-text-primary mb-1">Forgot Password</h1>
                <p className="text-success-text text-text-secondary">
                    Enter your email and we will send you a link to reset your password
                </p>

                {errors.general && (
                    <div className="flex items-start gap-2 mt-4 px-4 py-4 rounded-xl text-error-text bg-[#ef444410] border border-[#ef444430] text-error-red">
                        {errors.general}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                        setSubmitted(false);
                    }}
                    disabled={loading}
                    error={errors.email}
                    success={email && !errors.email && submitted}
                    className="input-field"
                />

                <Button
                    type="submit"
                    size="lg"
                    loading={loading}
                    disabled={!email}
                    className="primary-button w-full mt-2 text-btn-text"
                >
                    {loading ? "Sending…" : "Reset Password"}
                </Button>

                <p className="text-success-text text-white text-center mt-[-10px]">
                    Make sure to check your spam folder!
                </p>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;